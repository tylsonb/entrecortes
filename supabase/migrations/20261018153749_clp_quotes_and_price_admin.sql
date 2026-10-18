-- SPEC-002. Compatible con el esquema MVP documentado; no convierte importes históricos.
create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('reparacion', 'ajuste', 'modificacion')),
  base_price numeric(10,2) not null,
  estimated_time text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.services add column if not exists price_version bigint not null default 0;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  is_express boolean not null default false,
  express_surcharge numeric(10,2) not null default 0,
  total_estimated numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','contacted','completed','cancelled')),
  created_at timestamptz not null default now()
);
-- Sin backfill: la moneda de filas históricas permanece desconocida.
alter table public.quotes add column if not exists currency text;
alter table public.quotes alter column currency set default 'CLP';
-- NULL identifica el origen comercial desconocido de cotizaciones históricas.
alter table public.quotes add column if not exists is_demo boolean;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function app_private.valid_clp_quote(
  quote_items jsonb, quote_subtotal numeric, quote_express boolean,
  quote_surcharge numeric, quote_total numeric
) returns boolean language plpgsql immutable set search_path = '' as $$
declare
  item jsonb;
  amount numeric;
  quantity numeric;
  computed numeric := 0;
  expected_surcharge numeric;
begin
  if quote_items is null or jsonb_typeof(quote_items) <> 'array'
    or jsonb_array_length(quote_items) = 0 or quote_express is null then return false; end if;
  for item in select value from jsonb_array_elements(quote_items) loop
    if jsonb_typeof(item) <> 'object'
      or jsonb_typeof(item->'id') is distinct from 'string'
      or jsonb_typeof(item->'name') is distinct from 'string'
      or length(trim(item->>'name')) = 0
      or (item->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or (item->>'category') is null
      or (item->>'category') not in ('reparacion','ajuste','modificacion')
      or jsonb_typeof(item->'price') is distinct from 'number'
      or jsonb_typeof(item->'quantity') is distinct from 'number' then return false; end if;
    amount := (item->>'price')::numeric;
    quantity := (item->>'quantity')::numeric;
    if amount < 0 or amount > 99999999 or amount <> trunc(amount)
      or quantity < 1 or quantity > 9007199254740991 or quantity <> trunc(quantity) then return false; end if;
    computed := computed + amount * quantity;
  end loop;
  expected_surcharge := case when quote_express then round(computed * 0.30) else 0 end;
  return coalesce(quote_subtotal = computed and quote_surcharge = expected_surcharge
    and quote_total = computed + expected_surcharge and quote_total between 0 and 99999999, false);
exception when others then
  return false;
end;
$$;
revoke all on function app_private.valid_clp_quote(jsonb,numeric,boolean,numeric,numeric) from public;
grant execute on function app_private.valid_clp_quote(jsonb,numeric,boolean,numeric,numeric) to anon, authenticated;

alter table public.services add constraint services_clp_price_check
  check (base_price >= 0 and base_price <= 99999999 and base_price = trunc(base_price)) not valid;
alter table public.services add constraint services_price_version_check check (price_version >= 0) not valid;
alter table public.quotes add constraint quotes_demo_source_check check (is_demo is not null) not valid;
alter table public.quotes add constraint quotes_clp_currency_check
  check (currency is not null and currency = 'CLP') not valid;
alter table public.quotes add constraint quotes_nonempty_name_check
  check (client_name is not null and length(trim(client_name)) > 0) not valid;
alter table public.quotes add constraint quotes_clp_totals_check
  check (app_private.valid_clp_quote(items, subtotal, is_express, express_surcharge, total_estimated)) not valid;
-- NOT VALID permite conservar filas antiguas y exige el contrato para cada nueva escritura.

create or replace function app_private.increment_price_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.price_version := old.price_version + 1;
  return new;
end;
$$;
revoke all on function app_private.increment_price_version() from public;
create trigger increment_price_version before update of base_price on public.services
  for each row execute function app_private.increment_price_version();

alter table public.services enable row level security;
alter table public.quotes enable row level security;
alter table public.admin_users enable row level security;

-- Se reemplazan políticas de estas tres tablas para evitar permisos heredados permisivos.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('services','quotes','admin_users')
  loop execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename); end loop;
end $$;

revoke all on public.services, public.quotes, public.admin_users from public, anon, authenticated;
-- REVOKE de tabla no elimina grants previos por columna.
do $$
declare col record;
begin
  for col in select table_name, column_name from information_schema.columns
    where table_schema = 'public' and table_name in ('services','quotes','admin_users')
  loop
    execute format('revoke select (%I), insert (%I), update (%I), references (%I) on public.%I from public, anon, authenticated',
      col.column_name, col.column_name, col.column_name, col.column_name, col.table_name);
  end loop;
end $$;

grant select on public.services to anon, authenticated;
grant update (base_price) on public.services to authenticated;
grant select on public.admin_users to authenticated;
grant insert (id, client_name, client_phone, items, subtotal, is_express, express_surcharge, total_estimated, currency, is_demo, status)
  on public.quotes to anon, authenticated;

create policy services_public_read on public.services for select to anon, authenticated using (is_active = true);
create policy admin_own_membership on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
create policy services_admin_read on public.services for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy services_admin_price_update on public.services for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy quotes_public_insert on public.quotes for insert to anon, authenticated
  with check (status = 'pending' and currency = 'CLP' and is_demo is not null);

-- service_role se reserva para mantenimiento fuera del navegador.
grant all on public.services, public.quotes, public.admin_users to service_role;
