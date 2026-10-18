# Plan técnico — SPEC-002

> **Estado:** Implementado y verificado localmente; activación remota pendiente.  
> **Contrato funcional:** [spec.md](spec.md).  
> **Base de arquitectura:** [plan del MVP](../001-mvp/plan-mvp.md).

## 1. Moneda y catálogo

- Mantener React, hooks, Tailwind y el cliente Supabase instalado, sin nuevas dependencias de estado.
- Centralizar CLP y `es-CL` en el servicio monetario; `formatCurrency(amount)` utilizará `Intl.NumberFormat` con cero decimales. Retirar el parámetro genérico de símbolo de consumidores y de `.env.example`; documentar que `VITE_CURRENCY_SYMBOL` deja de controlar esta entrega.
- Calcular importes enteros y compartir la tasa exprés entre cálculo, texto del cotizador y mensaje para evitar discrepancias.
- Respaldo y seed usan los ocho precios CLP y nombres aprobados por el taller, con UUID estables compartidos.
- `supabaseClient.js` exportará cliente singleton o `null` si la configuración falta o es inválida, sin excepciones durante la importación. Mantener las variables públicas existentes `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Encapsular lectura en `catalogService.js`. Consultar campos explícitos y `is_active = true`; validar la respuesta, normalizar descripción nula a cadena vacía y ordenar por nombre.
- Ampliar `useServices` con `loading`, `error` y `source: 'remote' | 'local'`, conservando sus filtros y acciones. Cancelar solicitudes al desmontar y a los 3 segundos; conectar estados con `ServicesGrid` desde `App`.

## 2. Persistencia y flujo de WhatsApp

- Crear `quotePersistenceService.js` para transformar la instantánea en el payload SQL y ejecutar `insert` sin `.select()`. Devolver `{ status: 'saved' | 'failed', error }`, con timeout de 3 segundos.
- Crear `quoteStorageService.js` para leer, agregar, eliminar y depurar registros en la clave versionada `entre-cortes:pending-quotes:v1`. Validar contenido, capturar errores de acceso/JSON/cuota y aplicar 7 días de retención y límite de 20.
- `useQuoter.sendQuote` validará, capturará un UUID y la instantánea, intentará respaldo local y abrirá el enlace durante el mismo evento de clic. Después esperará la inserción remota; el bloqueo inmediato mediante referencia y el estado visual evitarán dobles clics.
- El formulario pedirá `client_phone` de forma opcional; se recortará y persistirá en `quotes.client_phone` o como `NULL` si queda vacío. El UUID seguirá en la instantánea y base de datos para identificar la cotización, pero nunca aparecerá en el mensaje WhatsApp. El payload contendrá `id`, `client_name`, `client_phone`, `items`, `subtotal`, `is_express`, `express_surcharge`, `total_estimated`, `currency: 'CLP'` y `status: 'pending'`. La app no cambia ese estado automáticamente: abrir WhatsApp no confirma el envío ni la respuesta del taller. `items` conserva `{ id, name, category, price, quantity }`. `client_phone` seguirá opcional y nulo.
- La apertura y la persistencia usarán exactamente la misma instantánea. No vaciar el carrito automáticamente; conservar enlace y texto de esa solicitud para recuperación hasta que el usuario edite el presupuesto.
- No inferir entrega desde el guardado ni desde `window.open`. Usar `noopener,noreferrer`, mensaje codificado y número normalizado con formato internacional válido (8–15 dígitos, primero distinto de cero).
- La recuperación explícita abre el enlace existente sin insertar otra fila. No agregar reenvío automático de copias locales: un timeout puede ocurrir después de que el servidor haya insertado.

## 3. Esquema, RLS y migración

- Antes de ejecutar cambios, inspeccionar tablas, restricciones, grants y políticas del proyecto confirmado. La documentación SQL del MVP es una propuesta, no evidencia del estado remoto.
- Mantener las tablas `services` y `quotes` y las categorías actuales. Documentar el cambio en el plan del MVP antes de aplicarlo.
- Conservar tipos `NUMERIC(10,2)` si ya existen, agregando restricciones de no negatividad e integralidad para precios y totales CLP. Esto evita conversiones destructivas de tipos.
- Agregar `currency` obligatoria y restringida a `CLP`, y `is_demo` obligatoria para registros nuevos. Las cotizaciones históricas conservarán ambos campos desconocidos (`NULL`) hasta que se clasifiquen con evidencia. Si existen cotizaciones históricas sin moneda conocida, conservarlas y definir una migración compatible; no etiquetar importes antiguos como CLP ni multiplicarlos automáticamente.
- Validar en base de datos nombre no vacío, lista de ítems no vacía, cantidades enteras positivas, precios enteros no negativos, subtotal igual a la suma de líneas y total consistente con el recargo del 30% redondeado. Estas validaciones no convierten el precio enviado por el navegador en tarifa certificada.
- Aplicar RLS y privilegios mínimos a `anon`: `SELECT` de servicios activos y `INSERT` de cotizaciones con estado `pending`; sin lectura pública de cotizaciones, actualización o borrado. Revisar políticas existentes para que una política permisiva anterior no invalide la restricción.
- Preparar migraciones mediante la CLI instalada y su ayuda; verificar en entorno de desarrollo antes de aplicar al proyecto objetivo. No ejecutar seeds de precios de prueba en producción.

## 4. Panel privado de tarifas

- Reutilizar el diseño, tipografía y componentes básicos existentes. Añadir vista cargada de forma diferida para `#/admin`, con enlace discreto «Administración» en el pie. Escuchar `hashchange` sin incorporar un router y conservar las anclas públicas.
- Crear `useAdminSession` para iniciar sesión con `signInWithPassword`, observar `onAuthStateChange`, comprobar autorización y cerrar sesión. No mostrar el formulario de precios mientras se resuelve la sesión. Crear cuentas mediante herramientas confiables de Supabase; desactivar registro público. Documentar recuperación de acceso mediante el operador del proyecto.
- Crear `public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade)`. Activar RLS: `authenticated` solo puede consultar su propia fila (`user_id = auth.uid()`), sin INSERT, UPDATE ni DELETE desde la API. Altas y revocaciones requieren acceso administrativo confiable; no usar `user_metadata` ni una lista de correos en JavaScript como autorización.
- Conceder SELECT sobre servicios a `authenticated`: activos para cualquier usuario y todos para miembros de `admin_users`. Conceder UPDATE únicamente de `base_price`, revocando grants amplios previos. La política UPDATE comprobará pertenencia a `admin_users` en USING y WITH CHECK. No conceder INSERT ni DELETE de servicios al panel.
- Mantener a los usuarios autenticados que vuelven a la landing los mismos permisos de inserción de cotizaciones `pending` que al visitante. No conceder al administrador de tarifas lectura ni edición de cotizaciones.
- Agregar `services.price_version bigint not null default 0` con incremento mediante trigger al actualizar `base_price`. El cliente no podrá escribir la versión. `updateServicePrice({ id, basePrice, expectedVersion })` filtrará por UUID y versión y devolverá `{ status: 'saved' | 'conflict' | 'error', service }` mediante las filas retornadas. Cero filas exige volver a leer y verificar permisos: conflicto si sigue autorizado y la versión cambió; acceso denegado si perdió autorización. No repetir una escritura automáticamente tras timeout.
- `AdminPricesPanel` recibirá datos y callbacks; `useAdminPrices` administrará carga, ediciones por fila y estados. Mostrar precio vigente, predeterminado, campo entero CLP, Guardar y Restaurar. Validar al salir del campo y al enviar; anunciar resultado con región de estado y asociar errores a su campo.
- Guardar solo contra Supabase; sin cliente válido o sin conexión no habilitar escrituras locales. Ante sesión perdida, conservar temporalmente las ediciones en memoria para reautenticar. Al cerrar sesión explícitamente, limpiar datos administrativos.
- Restaurar usa el valor de `initialServices.js` identificado por UUID, muestra confirmación y ejecuta el mismo servicio de actualización con control de versión.
- Preparar seed idempotente que inserte servicios faltantes y no actualice los existentes. Los cambios del panel nunca alterarán el archivo de respaldo. Actualizar ese archivo será una modificación de código revisada y desplegada.
- Después de guardar no refrescar silenciosamente carritos en otras sesiones. Al volver del panel a la landing, consultar nuevamente el catálogo; conservar precios de ítems ya seleccionados como estimación.

## 5. Verificación y documentación

- Unitarias: CLP sin decimales, separador de miles, recargo y redondeo; mensaje codificado con tildes, referencia y totales; almacenamiento corrupto, denegado, lleno y expirado.
- Hooks e integración: lectura remota, configuración ausente, datos inválidos, vacío, timeout y respuesta tardía; envío estándar/exprés, validación, doble clic y conservación de instantánea.
- Verificar que WhatsApp se abre antes de resolver la promesa remota, que fallo remoto conserva la copia y que éxito la elimina. Probar sin teléfono y con portapapeles denegado.
- En Supabase de desarrollo comprobar permisos con la clave pública y una inserción de prueba identificable. Registrar evidencia y limpiar solo datos de prueba mediante acceso administrativo.
- Probar acceso anónimo y autenticado sin privilegios, revocación de permisos, actualización limitada a precio, restauración cancelada/confirmada, conflicto entre dos sesiones y persistencia de tarifas tras repetir el seed.
- Ejecutar `npm test`, `npm run build` y `npm run lint`, más revisión de navegador a 375, 768 y 1280 px.
- Corregir referencias documentales a los nombres reales del MVP; alinear T-12/T-15 con el panel integrado y enlazar esta ampliación. Marcar tareas solo tras verificar sus criterios.

## 6. Secuencia de entrega

1. Implementar CLP y tests; sincronizar la tabla comercial aprobada con el respaldo y seed.
2. Implementar cliente, catálogo y fallback; verificar el esquema remoto antes de crear migraciones.
3. Implementar almacenamiento temporal, persistencia y CTA con sus pruebas.
4. Implementar acceso administrativo, edición y restauración de tarifas con control de versiones y seed idempotente.
5. Validar RLS y flujo real con datos de prueba; completar tarifas, teléfono y cuenta administradora antes de publicar.

La migración fue probada en PostgreSQL local mediante PGlite y aplicada al proyecto Supabase `entrecortes` (`ymihnpvuqbkjhnaamrwy`). El usuario administrativo indicado quedó autorizado. La revisión visual usa una API de prueba local, sin contactar al taller por WhatsApp. El catálogo remoto contiene los ocho servicios aprobados y comparte UUID, nombres y precios con `initialServices.js` y el seed.
