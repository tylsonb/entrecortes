import { PGlite } from '../../artifacts/sql-check/node_modules/@electric-sql/pglite/dist/index.js'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const root = new URL('../../', import.meta.url)
const migrationName = (await readdir(new URL('supabase/migrations/', root))).find((name) => name.endsWith('_clp_quotes_and_price_admin.sql'))
const migration = await readFile(new URL('supabase/migrations/' + migrationName, root), 'utf8')
const seed = await readFile(new URL('supabase/seed.approved.sql', root), 'utf8')
const adminId = '11111111-1111-4111-8111-111111111111'
const otherId = '22222222-2222-4222-8222-222222222222'
const serviceId = '00000000-0000-4000-8000-000000000001'
const setup = `
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`
const results = []
async function withRole(db, role, uid, task) {
  await db.exec('begin')
  try {
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [uid || ''])
    await db.exec('set local role ' + role)
    return await task()
  } finally { await db.exec('rollback') }
}
async function denied(db, role, uid, sql, params = [], code = '42501') {
  await withRole(db, role, uid, async () => {
    await assert.rejects(db.query(sql, params), (error) => error.code === code)
  })
}
const db = new PGlite()
await db.exec(setup)
await db.exec(migration)
results.push('Migration applies to a fresh PostgreSQL database')
await db.exec(seed)
await db.query('insert into auth.users(id) values ($1),($2)', [adminId, otherId])
await db.query('insert into public.admin_users values ($1)', [adminId])
await db.query("insert into services(id,name,category,base_price,estimated_time,is_active) values ('33333333-3333-4333-8333-333333333333','Oculto','ajuste',1000,'2 días',false)")
await withRole(db, 'anon', null, async () => {
  assert.equal((await db.query('select * from services')).rows.length, 8)
})
await withRole(db, 'authenticated', otherId, async () => {
  assert.equal((await db.query('select * from admin_users')).rows.length, 0)
  assert.equal((await db.query('update services set base_price=9000 where id=$1 returning id', [serviceId])).rows.length, 0)
})
results.push('Visitors only see active services; non-admin authenticated users cannot update prices')
await withRole(db, 'authenticated', adminId, async () => {
  assert.equal((await db.query('select * from services')).rows.length, 9)
  const changed = await db.query('update services set base_price=9000 where id=$1 and price_version=0 returning base_price,price_version', [serviceId])
  assert.equal(Number(changed.rows[0].base_price), 9000)
  assert.equal(Number(changed.rows[0].price_version), 1)
  assert.equal((await db.query('update services set base_price=9500 where id=$1 and price_version=0 returning id', [serviceId])).rows.length, 0)
})
results.push('Administrators can update prices, version increments and stale updates affect zero rows')
await denied(db, 'anon', null, 'update services set base_price=9000 where id=$1', [serviceId])
await denied(db, 'authenticated', adminId, "update services set name='Changed' where id=$1", [serviceId])
await denied(db, 'authenticated', adminId, 'update services set price_version=99 where id=$1', [serviceId])
await denied(db, 'authenticated', otherId, 'insert into admin_users values ($1)', [otherId])
await denied(db, 'authenticated', adminId, 'delete from services where id=$1', [serviceId])
await denied(db, 'authenticated', adminId, 'update services set base_price=1.5 where id=$1', [serviceId], '23514')
results.push('Column permissions, membership protection and CLP constraints reject unauthorized writes')
const quoteSql = 'insert into quotes(client_name,items,subtotal,is_express,express_surcharge,total_estimated,currency,is_demo,status) values ($1,$2,8000,false,0,8000,$3,true,$4)'
const items = JSON.stringify([{ id: serviceId, name: 'Dobladillo', category: 'ajuste', price: 8000, quantity: 1 }])
await withRole(db, 'anon', null, async () => {
  await db.query(quoteSql, ['Ana', items, 'CLP', 'pending'])
})
await withRole(db, 'authenticated', adminId, async () => {
  await db.query(quoteSql, ['Ana', items, 'CLP', 'pending'])
})
await denied(db, 'anon', null, 'select * from quotes')
await denied(db, 'authenticated', adminId, 'select * from quotes')
await denied(db, 'anon', null, quoteSql, ['Ana', items, 'CLP', 'completed'])
await denied(db, 'anon', null, quoteSql, [' ', items, 'CLP', 'pending'], '23514')
await denied(db, 'anon', null, quoteSql, ['Ana', '[]', 'CLP', 'pending'], '23514')
await denied(db, 'anon', null, quoteSql, ['Ana', items.replace('"quantity":1', '"quantity":2'), 'CLP', 'pending'], '23514')
results.push('Valid anonymous/authenticated quotes insert without SELECT; invalid names, items, totals and states are rejected')
await db.query('update services set base_price=9100 where id=$1', [serviceId])
await db.exec(seed)
assert.equal(Number((await db.query('select base_price from services where id=$1', [serviceId])).rows[0].base_price), 9100)
results.push('Re-running the seed preserves adjusted prices')
await db.query('delete from admin_users where user_id=$1', [adminId])
await withRole(db, 'authenticated', adminId, async () => {
  assert.equal((await db.query('update services set base_price=9200 where id=$1 returning id', [serviceId])).rows.length, 0)
})
results.push('Revoked administrator loses write access immediately')
await db.close()

const legacy = new PGlite()
await legacy.exec(setup)
await legacy.exec(`
create table public.services(id uuid primary key, name text not null, category text not null, base_price numeric(10,2) not null, estimated_time text not null, description text, is_active boolean default true, created_at timestamptz default now());
create table public.quotes(id uuid primary key default gen_random_uuid(), client_name text not null, client_phone text, items jsonb not null, subtotal numeric(10,2) not null, is_express boolean default false, express_surcharge numeric(10,2) default 0, total_estimated numeric(10,2) not null, status text default 'pending', created_at timestamptz default now());
insert into quotes(client_name,items,subtotal,total_estimated) values ('Histórico','[]',8.50,8.50);
`)
await legacy.exec(migration)
const historic = (await legacy.query('select currency,total_estimated from quotes')).rows[0]
assert.equal(historic.currency, null)
assert.equal(Number(historic.total_estimated), 8.5)
results.push('Legacy amounts are preserved without relabeling unknown currency')
await legacy.close()
await writeFile(new URL('artifacts/sql-check-results.json', root), JSON.stringify({ engine: 'PGlite PostgreSQL; local Supabase role/auth.uid shim', results }, null, 2))
console.log(JSON.stringify(results, null, 2))
