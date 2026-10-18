# SPEC-002: WhatsApp, precios CLP, Supabase y administración de tarifas

> **Estado:** Implementación local y migración Supabase verificadas; conexión/WhatsApp configurados en desarrollo. Faltan probar el inicio de sesión real y publicar el frontend.  
> **Fecha:** 2026-10-17  
> **Base:** [MVP](../001-mvp/spec-mvp.md) y [constitución](../../docs/constitution.md).  
> **Plan y tareas:** [plan.md](plan.md) · [tasks.md](tasks.md).

## 1. Objetivo y revisión del estado actual

El cliente debe elegir servicios con precios en pesos chilenos, calcular su presupuesto y abrir directamente el WhatsApp del taller con la cotización completa. Supabase suministrará el catálogo y almacenará las solicitudes, manteniendo la cotización local cuando no haya conexión.

| Área | Evidencia actual | Trabajo pendiente |
| --- | --- | --- |
| Landing y cotizador | Componentes, filtros, búsqueda, cantidades, nombre y exprés implementados | Conservar el cotizador integrado y conectar sus estados remotos |
| Moneda | `formatCurrency` usa `toFixed(2)`; precios de ejemplo entre 4 y 30 | Tarifas expresadas en CLP y formato chileno sin decimales |
| WhatsApp | `sendQuote` abre `wa.me` si hay teléfono | Integrar guardado y respaldo; probar el flujo completo |
| Catálogo | `useServices` filtra únicamente `initialServices` | Cliente Supabase, consulta y timeout con fallback |
| Persistencia | No existe servicio de guardado ni respaldo de solicitudes | Inserción en `quotes` y copia temporal local |
| Pruebas | 14 casos definidos para comportamiento local | Casos de integración remota, CLP y envío por WhatsApp |
| Documentación | Las rutas reales del MVP usan el sufijo `-mvp`; varios encabezados citan rutas inexistentes | Alinear referencias y criterios de cierre con el cotizador integrado |

Esta ampliación concreta RF-01 y RF-04 a RF-07 del MVP. Los ejemplos monetarios anteriores dejan de definir tarifas. El panel del cotizador integrado reemplaza el criterio antiguo de construir un modal independiente. La administración de tarifas amplía expresamente NO4 del MVP; el resto de la gestión administrativa queda fuera de alcance.

## 2. Alcance y decisiones

- El CTA principal será **Enviar cotización por WhatsApp**. Copiar el presupuesto permanece como alternativa.
- «Directamente a WhatsApp» significa abrir el chat del taller con el mensaje completo, sin copiar y pegar. El cliente pulsa Enviar dentro de WhatsApp. La web no afirmará que el taller recibió el mensaje.
- Se utilizará el enlace oficial `https://wa.me/<numero>?text=<mensaje_codificado>`. El envío automático mediante WhatsApp Business Platform no forma parte de esta entrega.
- Moneda única: CLP. Se mantienen el recargo exprés del 30%, los precios estimados y la confirmación final del taller.
- Supabase gestionará catálogo y cotizaciones mediante el cliente oficial y RLS. El taller contará con un panel privado para ajustar precios.
- No se agregan cuentas de clientes, pagos, agenda, seguimiento, fotos adjuntas ni gestión de pedidos. El panel se limita a la administración de tarifas.

## 3. Requisitos funcionales (EARS)

### Moneda y precios

- **CLP-01:** El sistema DEBE almacenar y calcular importes como pesos chilenos enteros, sin conversión de divisas ni centavos.
- **CLP-02:** CUANDO se muestre un importe, el sistema DEBE usar formato `es-CL`, moneda `CLP` y cero decimales. El catálogo y el cotizador indicarán «Precios en pesos chilenos (CLP)»; el mensaje identificará su total como CLP.
- **CLP-03:** CUANDO se active exprés, el sistema DEBE calcular `subtotal = suma(precio × cantidad)`, `recargo = Math.round(subtotal × 0.30)` y `total = subtotal + recargo`. El redondeo ocurre una vez sobre el recargo total.
- **CLP-04:** El catálogo remoto y el respaldo local DEBEN partir de la misma tabla de tarifas CLP aprobada por el taller. Las cotizaciones y etiquetas públicas indicarán que los valores son «desde».

### Administración de precios y valores predeterminados

- **ADM-01:** CUANDO se acceda a `#/admin`, el sistema DEBE mostrar inicio de sesión por correo y contraseña mediante Supabase Auth, o el panel si la sesión pertenece a un administrador autorizado. No habrá registro público de administradores.
- **ADM-02:** El panel DEBE listar servicios con nombre, categoría, precio vigente y precio predeterminado del código. Permitirá editar y guardar cada precio por separado, y cerrar sesión.
- **ADM-03:** CUANDO se guarde un precio, el sistema DEBE validar un entero CLP entre 0 y 99.999.999, confirmar la escritura en Supabase y mostrar éxito o error junto al servicio. No aceptará campos vacíos, negativos, fracciones ni importes fuera de rango.
- **ADM-04:** MIENTRAS se guarda, el sistema DEBE desactivar el guardado de esa fila. SI falla la red o expira la sesión, conservará la edición en memoria; no anunciará éxito ni guardará cambios administrativos offline.
- **ADM-05:** Las tarifas vigentes de Supabase DEBEN tener prioridad sobre los valores predeterminados en código. Estos inicializarán el catálogo y servirán de respaldo ante errores; desplegar o repetir el seed no sobrescribirá precios ajustados.
- **ADM-06:** CUANDO se elija «Restaurar precio predeterminado», el sistema DEBE mostrar el importe y pedir confirmación antes de guardarlo en Supabase para ese servicio. Sin un predeterminado con el mismo UUID, no ofrecerá esa acción.
- **ADM-07:** Guardar desde el panel DEBE modificar Supabase, sin reescribir archivos fuente. Cambiar la base predeterminada requiere editar `initialServices.js` y desplegar. El panel explicará que el respaldo puede diferir de las tarifas vigentes.
- **ADM-08:** DESPUÉS de guardar, las nuevas cargas del catálogo público DEBEN mostrar la tarifa vigente. Carritos abiertos y cotizaciones existentes conservarán sus importes; no habrá actualización silenciosa ni Realtime en esta entrega.
- **ADM-09:** SI otro administrador modifica la tarifa después de cargarla, el sistema DEBE detectar el conflicto, mostrar el precio vigente y pedir revisar la edición antes de volver a guardar.
- **ADM-10:** La autorización DEBE comprobarse en Supabase mediante RLS. Visitantes y usuarios autenticados sin permiso no podrán modificar precios mediante llamadas directas a la API. Crear o revocar administradores se hará mediante acceso de mantenimiento confiable, fuera del panel.
- **ADM-11:** El panel DEBE ofrecer estados de sesión pendiente, carga, vacío, error, guardado y acceso denegado, con etiquetas visibles, mensajes accesibles y controles operables por teclado y en móvil. Sin configuración Supabase, indicará administración no disponible y permitirá volver a la web.

### Catálogo Supabase

- **CAT-01:** CUANDO la página se inicialice con configuración válida, el sistema DEBE consultar los servicios activos de Supabase y exponer carga, datos y error mediante el hook.
- **CAT-02:** SI faltan credenciales, la configuración es inválida, falla la consulta o supera 3 segundos, el sistema DEBE cargar el catálogo local y permitir cotizar. Una respuesta tardía no reemplazará el fallback.
- **CAT-03:** CUANDO la consulta remota termine correctamente sin servicios activos, el sistema DEBE mostrar el estado vacío y mantener el contacto disponible; no reactivará servicios mediante fallback.
- **CAT-04:** CUANDO el usuario filtre por categoría o búsqueda, el sistema DEBE filtrar en memoria el catálogo seleccionado, conservando la búsqueda insensible a tildes y mayúsculas.
- **CAT-05:** SI una respuesta contiene registros incompatibles con el contrato —categoría desconocida, precio negativo o fraccionario, o campos obligatorios ausentes—, el sistema DEBE tratarla como error de catálogo y usar el respaldo completo.

### Cotización y WhatsApp

- **COT-01:** CUANDO se solicite enviar, el sistema DEBE validar nombre no vacío tras recortar espacios, al menos un ítem, cantidades enteras positivas y precios CLP válidos. El teléfono del cliente será opcional; si se informa, se guardará sin validación restrictiva. Un fallo mostrará un error accesible y no abrirá WhatsApp ni guardará una solicitud.
- **COT-02:** CUANDO la cotización sea válida y exista un teléfono internacional válido, el sistema DEBE capturar una instantánea con identificador UUID, nombre, ítems, cantidades, precios, subtotal, exprés, recargo, total y moneda CLP y marca de tarifa demostrativa.
- **COT-03:** CUANDO se pulse el CTA válido, el sistema DEBE abrir WhatsApp durante el gesto del usuario, sin esperar a la red. El mensaje incluirá nombre del taller y cliente, referencia, servicios y cantidades, importes por línea, subtotal, recargo si corresponde, total CLP y aviso de estimación.
- **COT-04:** El sistema DEBE iniciar el guardado de esa misma instantánea en `quotes` con estado `pending` y `client_phone` (o `NULL` si no se indicó), sin necesitar permisos públicos de lectura de cotizaciones. Guardado y apertura de chat son resultados independientes. El estado `pending` significa solicitud recibida pendiente de atención; la app no cambia el estado al abrir WhatsApp ni al enviarse el mensaje.
- **COT-05:** ANTES de abrir WhatsApp, el sistema DEBE intentar conservar la instantánea en `localStorage`. SI el guardado remoto se confirma, eliminará esa copia; SI falla o supera 3 segundos, la conservará y registrará un diagnóstico sin nombre ni contenido de la cotización.
- **COT-06:** SI `localStorage` no está disponible o contiene datos dañados, el sistema DEBE continuar con WhatsApp y el intento remoto, sin bloquear la página ni afirmar que existe una copia local.
- **COT-07:** MIENTRAS el guardado esté en curso, el sistema DEBE impedir dobles envíos desde el CTA. Una edición posterior del carrito no modificará la solicitud ya iniciada.
- **COT-08:** DESPUÉS del intento de apertura, el sistema DEBE ofrecer un enlace explícito para abrir la misma cotización y la opción de copiar, sin crear otro registro al usar esos enlaces. No dependerá del valor retornado por `window.open` para afirmar que el chat abrió.
- **COT-09:** SI falta un teléfono válido, el sistema DEBE mantener disponible la copia del presupuesto y omitir enlaces de WhatsApp inválidos. Copiar por sí solo no creará una solicitud remota.

### Datos y acceso

- **DAT-01:** El acceso público DEBE poder leer únicamente servicios activos e insertar cotizaciones `pending` válidas; no podrá leer, actualizar o eliminar cotizaciones ni modificar el catálogo.
- **DAT-02:** El frontend DEBE utilizar exclusivamente una clave pública. No incluirá claves secretas ni `service_role`.
- **DAT-03:** Las cotizaciones DEBEN conservar los precios de su instantánea aunque el catálogo cambie. Son estimaciones proporcionadas por el cliente, no comprobantes de pago ni tarifas certificadas por el servidor.
- **DAT-04:** Las copias temporales locales expirarán a los 7 días y se limitarán a las últimas 20 solicitudes. Esta entrega no implementa sincronización automática ni historial público.

## 4. Criterios de aceptación

Los importes siguientes son fixtures de pruebas, no tarifas comerciales propuestas.

1. **Cotización estándar:** con servicios de $8.000 y $12.000, el total mostrado, persistido y incluido en WhatsApp es $20.000 CLP, sin decimales y con `is_express: false`.
2. **Exprés:** con subtotal $50.000, el recargo es $15.000 y el total $65.000. Con subtotal $1.005, el recargo es $302 y el total $1.307.
3. **Catálogo remoto:** con configuración válida aparecen únicamente servicios activos. Se pueden filtrar y añadir al cotizador con sus precios CLP.
4. **Fallo o timeout:** al fallar Supabase, el catálogo local aparece a más tardar tras 3 segundos; cotizar y abrir WhatsApp siguen disponibles. La copia local sobrevive a recargar la página.
5. **Catálogo vacío:** una respuesta válida vacía muestra el estado vacío, sin añadir servicios de respaldo.
6. **Persistencia exitosa:** una solicitud válida inserta una sola fila `pending` con moneda CLP y elimina su copia local después de la confirmación. No necesita leer esa fila.
7. **Degradación del navegador:** si fallan almacenamiento o portapapeles, sigue existiendo enlace a WhatsApp y texto seleccionable. Un fallo de almacenamiento no se comunica como guardado exitoso.
8. **Validación y repetición:** nombre vacío o carrito vacío no provocan efectos externos; el doble clic mientras se guarda no duplica la solicitud ni abre dos ventanas.
9. **RLS:** la clave pública puede leer activos e insertar una cotización válida, pero no consultar cotizaciones, modificar catálogo, cambiar estados o eliminar datos.
10. **Presentación:** el mensaje omite el UUID, incluye el teléfono opcional tanto en WhatsApp como en `client_phone` y guarda `NULL` si se deja vacío. Las cotizaciones se crean como `pending` y no cambian de estado automáticamente. A 375, 768 y 1280 px los importes, estados y CTA son legibles, operables por teclado y no generan desbordamiento.

11. **Acceso administrativo:** la cuenta autorizada puede iniciar y cerrar sesión; un usuario ajeno no puede actualizar precios ni concederse permisos mediante la API.
12. **Edición:** cambiar un fixture de $8.000 a $9.000 confirma el guardado; una nueva carga pública usa $9.000 y el respaldo del código sigue en $8.000.
13. **Restauración:** cancelar no modifica datos; confirmar restaura el valor del código únicamente para el servicio elegido.
14. **Despliegue y fallback:** repetir el seed no reemplaza los $9.000 guardados. Ante fallo remoto se muestran $8.000 de respaldo, identificados como tarifa de referencia.
15. **Concurrencia y errores:** dos sesiones no sobrescriben cambios silenciosamente; fallo de red o expiración de sesión no produce éxito falso.
16. **Permisos por columna:** el administrador de precios no puede modificar identificadores, nombres, categorías, actividad o cotizaciones mediante los permisos concedidos al panel.

## 5. Datos necesarios para publicar

La tabla comercial aprobada y configurada para el proyecto del taller es:

| Servicio | Precio CLP |
| --- | --- |
| Dobladillo (basta o ruedo) | $5.000 |
| Cambio de cremallera (cierre o zipper) | $6.000 |
| Ajuste de cintura | $6.000 |
| Reparación de costuras | $5.000 |
| Ajuste de mangas | $5.000 |
| Cambio de botones | $5.000 |
| Transformación de prenda | $5.000 |
| Modificación de vestido | $5.000 |

Las tarifas están aprobadas por el taller y el usuario administrador ya está autorizado en el proyecto Supabase `entrecortes`. La app agrega «Desde» a los importes públicos porque el costo final puede variar según la prenda.

## 6. Fuentes técnicas

- [WhatsApp: enlaces con mensaje prellenado](https://faq.whatsapp.com/5913398998672934).
- [Supabase: inserción de registros](https://supabase.com/docs/reference/javascript/insert).
- [Supabase: cancelación y timeout](https://supabase.com/docs/reference/javascript/using-modifiers-abortsignal).
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

- [Supabase: autenticación por contraseña](https://supabase.com/docs/guides/auth/passwords).
- [Supabase: permisos por columna](https://supabase.com/docs/guides/database/postgres/column-level-security).

## 7. Entrega local

El respaldo y el catálogo remoto contienen las tarifas aprobadas; `defaultPricesApproved = true` hace que las nuevas cotizaciones no se marquen como demostrativas. Los importes públicos del catálogo, cotizador y mensaje de WhatsApp se presentan como «Desde». Las filas nuevas de `quotes` guardarán `is_demo = false`; filas históricas tendrán origen desconocido (`NULL`) y no se reinterpretarán. La migración y pruebas SQL conservan las cotizaciones históricas. Véase [puesta en marcha](../../docs/supabase-setup.md) y [tareas](tasks.md) para los pendientes remotos.
