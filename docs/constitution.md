# Constitución del Proyecto

> **Ubicación en el repositorio:** `docs/constitution.md`  
> **Estado:** Inmutable / Activo  
> **Propósito:** Establecer los 6 principios innegociables que rigen la arquitectura técnica, la calidad del código frontend y la gobernanza para agentes de IA en la web de servicios de costura.

---

### Principio I: Simplicidad del Stack y Frugalidad Técnica
* **Regla:** Mantener la arquitectura frontend lo más directa y liviana posible.
* **Directriz:** Se utiliza React nativo con custom hooks para la gestión del estado local del cotizador y la selección de prendas. Para el backend, se emplea exclusivamente el cliente oficial `@supabase/supabase-js` para persistencia en PostgreSQL sin añadir servidores intermedios en esta fase. Queda prohibido instalar librerías de UI complejas o frameworks CSS externos que compitan con Tailwind CSS.

### Principio II: La Especificación Manda (Source-of-Truth)
* **Regla:** Ningún componente, endpoint o función se construye sin una especificación previa aprobada.
* **Directriz:** El comportamiento esperado, la notación EARS y los criterios de aceptación están formalizados en `specs/001-mvp/spec.md`. Si durante el desarrollo se descubre un caso límite de negocio (ej. prendas complejas o cálculos de descuento por volumen), primero se documenta en la spec y solo después se genera el código.

### Principio III: Separación Estricta entre Presentación, Lógica y Datos
* **Regla:** Desacoplamiento total entre componentes visuales, cálculos matemáticos y llamadas a la base de datos.
* **Directriz:**
  * Los componentes (`src/components/`) son puramente presentacionales; reciben datos vía props y emiten eventos.
  * La lógica de cálculo de presupuestos, recargos por urgencia y formateo de mensajes para WhatsApp vive aislada en funciones puras testeables dentro de `src/services/`.
  * La interacción con Supabase se encapsula en `src/services/supabaseClient.js` y hooks dedicados.

### Principio IV: Pruebas Primero (TDD) y Resiliencia en Errores
* **Regla:** Calidad demostrable mediante tests automatizados antes de dar por cerrada cualquier tarea.
* **Directriz:** Es obligatorio escribir tests unitarios (con Vitest) para la lógica de cálculo del cotizador (`quoterService`) y el formateador de WhatsApp (`whatsappFormatter`). Toda funcionalidad de UI debe probarse ante tres estados:
  1. Estado de carga (*loading state*).
  2. Estado vacío o sin resultados (*empty state*).
  3. Estado de error o degradación elegante cuando Supabase no responde (*error/fallback state*).

### Principio V: Disponibilidad Operativa y Degradación Elegante
* **Regla:** El cliente nunca debe perder la capacidad de cotizar o contactar al taller.
* **Directriz:** Si la conexión con Supabase falla, se agota el tiempo de espera o las credenciales no están configuradas, el sistema debe cargar automáticamente el catálogo estático en memoria (`initialServices.js`), permitir la cotización en local y generar el enlace de WhatsApp sin arrojar pantallas de error bloqueantes.

### Principio VI: Convenciones de Código e Idioma
* **Regla:** Claridad y consistencia terminológica en todo el repositorio.
* **Directriz:**
  * **Código fuente (Inglés):** Nombres de componentes, variables, funciones, hooks, tablas de base de datos, pruebas y commits se escriben estrictamente en inglés.
  * **Interfaz de Usuario y Documentación (Español):** Textos en pantalla dirigidos al cliente, especificaciones (`specs/`), manuales y comentarios se redactan en español neutro y profesional.
