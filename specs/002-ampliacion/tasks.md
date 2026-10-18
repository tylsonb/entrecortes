# Tareas — SPEC-002

> **Especificación:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md).  
> Cada tarea de desarrollo se cerrará con evidencia; los datos comerciales pueden obtenerse en paralelo.

- [x] **A-01:** Añadir pruebas de formato CLP, cálculo entero y redondeo exprés. Hecho cuando cubren los ejemplos monetarios de la spec.
- [x] **A-02:** Implementar formato CLP y conectar todos los importes de catálogo, cotizador y mensaje. Hecho cuando no aparecen decimales ni símbolos configurables inconsistentes.
- [x] **A-03:** Recibir y registrar las ocho tarifas comerciales. Hecho cuando las ocho tarifas aprobadas y nombres están sincronizados en Supabase, código y seed; WhatsApp está configurado en `.env.local`.
- [x] **A-04:** Actualizar respaldo CLP y preparar seed con UUID estables. Hecho cuando las ocho tarifas CLP aprobadas y nombres públicos coinciden con el respaldo y el seed aprobado.
- [x] **A-05:** Implementar cliente Supabase opcional y configuración documentada. Hecho cuando la ausencia o invalidez de credenciales no bloquea la aplicación.
- [x] **A-06:** Inspeccionar esquema y políticas del proyecto objetivo. Hecho cuando existe un inventario y se decide la migración compatible a partir de los datos reales.
- [x] **A-07:** Preparar migración de tablas, moneda, restricciones y RLS conforme al plan. Hecho cuando aplica correctamente en desarrollo sin reinterpretar datos históricos.
- [x] **A-08:** Implementar servicio y hook del catálogo remoto. Hecho cuando consulta activos, cancela a los 3 segundos y conserva filtros locales.
- [x] **A-09:** Conectar y probar carga, vacío, error y fallback en la landing. Hecho cuando ninguno impide el contacto y los fallos permiten cotizar con respaldo.
- [x] **A-10:** Implementar y probar almacenamiento temporal. Hecho cuando soporta datos corruptos, acceso denegado, expiración y límite de registros.
- [x] **A-11:** Implementar y probar inserción de instantáneas en `quotes`. Hecho cuando inserta `pending` con CLP sin necesitar lectura pública.
- [x] **A-12:** Integrar CTA, validación, instantánea y prevención de doble clic. Hecho cuando WhatsApp abre sin esperar a Supabase y guarda el mismo presupuesto.
- [x] **A-13:** Añadir enlace de recuperación, estados de persistencia y copia alternativa. Hecho cuando los fallos no bloquean el contacto ni provocan nuevas inserciones al reabrir el enlace.
- [x] **A-14:** Completar integración estándar, exprés, timeout, almacenamiento fallido y teléfono ausente. Hecho cuando pasan los escenarios de SPEC-002.
- [ ] **A-15:** Verificar permisos reales de Supabase en desarrollo. Hecho cuando acceso permitido y denegaciones coinciden con DAT-01.
- [x] **A-16:** Alinear referencias del MVP y criterios de panel integrado. Hecho cuando documentos y tareas describen la implementación efectiva.
- [x] **A-17:** Ejecutar tests, build, lint y revisión responsiva. Hecho cuando se registran resultados satisfactorios y no quedan regresiones.
- [ ] **A-18:** Verificar configuración de publicación. Hecho cuando tarifas aprobadas, número real y Supabase configurado funcionan en el entorno destino.

## Panel de administración de tarifas

- [x] **A-19:** Preparar autorización de administradores y versión de precios en migración. Hecho cuando grants, RLS y trigger restringen escritura a tarifas y detectan versiones antiguas.
- [x] **A-20:** Implementar inicio y cierre de sesión en `#/admin`. Hecho cuando sesiones pendientes, acceso denegado y ausencia de configuración tienen estados claros.
- [x] **A-21:** Implementar listado y edición por servicio. Hecho cuando valida enteros CLP y confirma cada escritura sin perder la edición ante error.
- [x] **A-22:** Implementar restauración individual con confirmación. Hecho cuando usa el respaldo por UUID y cancelar no modifica la base.
- [x] **A-23:** Implementar conflicto de versiones y seed idempotente. Hecho cuando ediciones concurrentes y redespliegues no sobrescriben tarifas silenciosamente.
- [x] **A-24:** Probar autorización y flujo administrativo. Hecho cuando visitantes y usuarios sin permiso no editan por API, y administradores solo cambian precios.
- [x] **A-25:** Documentar alta/revocación de administradores, recuperación de acceso y mantenimiento del respaldo. Hecho cuando un operador puede configurar el panel sin secretos en el frontend.
- [x] **A-26:** Verificar formulario móvil, teclado, errores y estados; ejecutar tests, build y lint. Hecho cuando pasan los criterios administrativos de SPEC-002.


- [x] **A-27:** Solicitar teléfono de contacto opcional, guardarlo en `quotes.client_phone`, y retirar el UUID del mensaje WhatsApp. Hecho cuando las pruebas confirman mensaje sin referencia, teléfono opcional y `NULL` cuando se omite.

## Pendientes de proyecto y datos comerciales

- **A-18** sigue pendiente: falta publicar el frontend al entorno de destino. **A-15** queda pendiente de probar inicio de sesión y permisos de escritura con la cuenta real; su autorización ya está registrada en Supabase. El proyecto `entrecortes` quedó confirmado, inspeccionado y migrado.
- La revisión A-26 también confirmó que el foco por teclado llega al botón de guardado habilitado y que la navegación no desborda la vista.
