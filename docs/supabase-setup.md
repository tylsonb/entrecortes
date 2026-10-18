# Puesta en marcha de Supabase y administración

## Estado de la implementación

El frontend y la migración están implementados. La migración `clp_quotes_and_price_admin` ya fue aplicada al proyecto Supabase `entrecortes` (`ymihnpvuqbkjhnaamrwy`) el 18-10-2026, después de comprobar que el esquema público estaba vacío. Se creó la pertenencia de administración para la cuenta `marmin.torrealba1@gmail.com`. La conexión y el número de WhatsApp están configurados en `.env.local` para desarrollo local; no publicar ese archivo.

La tabla `services` contiene los ocho servicios y tarifas aprobados. El panel ya puede administrarlos. El catálogo, respaldo del código y seed comparten UUID, nombres y precios. La cuenta debe iniciar sesión con la contraseña creada en Supabase Auth.

## Configuración del frontend

Copiar `.env.example` a `.env.local` y completar:

- `VITE_SUPABASE_URL`: URL del proyecto confirmado.
- `VITE_SUPABASE_ANON_KEY`: clave publishable de Supabase, o clave anon heredada. El nombre se conserva por compatibilidad; no usar claves secretas ni service_role.
- `VITE_WHATSAPP_NUMBER`: número real internacional, con código de país.
- Dirección y horarios opcionales, si el taller los ha confirmado.

Los precios actuales están aprobados y las cotizaciones nuevas registran `is_demo = false`; las cotizaciones históricas conservan `NULL` mientras su origen monetario sea desconocido. La moneda es CLP fija; `VITE_CURRENCY_SYMBOL` ya no cambia el formato. Reiniciar Vite tras modificar variables. Sin configuración válida se muestra el catálogo de respaldo y el panel explica que no está disponible.

## Migración y datos

La migración en `supabase/migrations/` crea o amplía `services`, `quotes` y `admin_users`, habilita RLS, limita columnas editables y añade la versión de cada precio. Antes de aplicarla, inventariar tablas, columnas, tipos, políticas y grants reales. Si difieren del esquema del MVP, adaptar la migración antes de ejecutarla.

La migración conserva importes históricos y no atribuye CLP a filas antiguas de moneda desconocida. Las restricciones `NOT VALID` exigen el contrato para nuevas escrituras sin reinterpretar registros anteriores. El catálogo público considera inválidos los precios fraccionarios: corregir las tarifas existentes con valores comerciales aprobados antes de publicar.

La migración ya está aplicada en el proyecto indicado. Para otro entorno o una futura rama, primero inspeccionar el esquema. Con la CLI autenticada y el destino confirmado:

```powershell
npx.cmd --yes supabase link --project-ref REF_CONFIRMADA
npx.cmd --yes supabase db push --linked --dry-run --skip-vault
npx.cmd --yes supabase db push --linked --skip-vault
```

La revisión previa es necesaria porque esta migración sustituye las políticas y grants de las tres tablas del taller. No aplicar a una base compartida sin revisar sus consumidores existentes.

`supabase/seed.approved.sql` contiene las tarifas aprobadas y no se ejecuta automáticamente. Sus UUID coinciden con `src/data/initialServices.js`. `ON CONFLICT (id) DO NOTHING` garantiza que repetir el seed nunca sobrescriba los precios del panel. Si la tabla existente usa otros UUID, conservarlos y ajustar el respaldo en código de forma explícita.

## Acceso de administración

1. En Supabase Auth, habilitar correo/contraseña y desactivar el registro público.
2. Crear la cuenta del responsable desde Auth Users mediante una herramienta administrativa confiable. Establecer una contraseña privada o usar una invitación con el flujo de recuperación configurado por el operador.
3. Para otras cuentas, copiar su UUID de Auth y autorizarlo desde el SQL Editor administrativo. La cuenta indicada ya quedó autorizada:

```sql
insert into public.admin_users(user_id)
values ('UUID_REAL_DE_AUTH')
on conflict do nothing;
```

4. Entrar a la web en `#/admin` e iniciar sesión. La cuenta podrá leer el catálogo y modificar exclusivamente precios.
5. Para revocar el permiso:

```sql
delete from public.admin_users where user_id = 'UUID_REAL_DE_AUTH';
```

La revocación bloquea nuevas escrituras mediante RLS incluso si la sesión sigue abierta. Ningún usuario de la API puede concederse esta pertenencia. Recuperar la contraseña desde las herramientas confiables de Auth; el panel no implementa registro ni recuperación por correo. Si se usan correos de invitación/recuperación, configurar SMTP y las URL de retorno antes de entregarlos al usuario.

## Funcionamiento de las tarifas

- Supabase contiene el precio vigente. Guardar en el panel lo publica para nuevas cargas del catálogo.
- `initialServices.js` contiene el respaldo del código. Guardar desde el panel no lo modifica.
- Restaurar pide confirmación y copia el precio del respaldo a Supabase para un solo servicio.
- Los cambios concurrentes se detectan por `price_version`; revisar el nuevo importe antes de reintentar.
- El carrito abierto conserva su precio estimado. La cotización guardada conserva su instantánea.
- Sin conexión, la web utiliza el respaldo identificado como referencia; el panel no permite cambios offline.

## Cotizaciones y permisos

WhatsApp abre con el mensaje completo y el cliente confirma su envío dentro de WhatsApp. Guardar una solicitud no demuestra que el mensaje se haya enviado o entregado.

Antes de abrir el chat se intenta conservar una copia local por hasta 7 días y con un máximo de 20 solicitudes. La copia se elimina tras confirmar la inserción remota. Se depura al acceder al almacenamiento; no existe sincronización automática ni envío posterior en segundo plano.

La API pública puede leer servicios activos e insertar solicitudes `pending`. No puede leer cotizaciones. Los administradores de precios tampoco pueden leerlas desde el panel. El taller puede consultarlas en el dashboard administrativo de Supabase.

## Verificación reproducible

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
npm.cmd install --prefix artifacts/sql-check --no-save --package-lock=false @electric-sql/pglite@0.5.10
node tests/database/schema.mjs
```

La última prueba usa PostgreSQL aislado, no se conecta a servicios externos y comprueba migración nueva y heredada, RLS, grants por columna, validación de importes, conflictos, revocación y seed idempotente.

El proyecto, las tarifas, WhatsApp y la cuenta del taller están configurados. Antes de publicar, desplegar el frontend con variables equivalentes en el proveedor de hosting y probar inicio de sesión con la cuenta autorizada. No incluir contraseñas, sesiones ni claves privadas en el repositorio.
