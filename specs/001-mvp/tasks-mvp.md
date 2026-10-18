# Desglose de Tareas de Implementación (MVP)

> **Especificación Base:** `@specs/001-mvp/spec.md`  
> **Plan Técnico:** `@specs/001-mvp/plan.md`  
> **Constitución:** `@docs/constitution.md`  
> **Ubicación en el repositorio:** `specs/001-mvp/tasks.md`  
> **Regla:** Tareas atómicas de 20 a 30 minutos. Cada tarea se considera completa cuando su criterio de éxito se verifica en una sola frase.

---

## Fase 1: Setup y Configuración Base
- [x] **T-01:** Inicializar proyecto con Vite + React y configurar dependencias básicas (`@supabase/supabase-js`, `vitest`, `@testing-library/react`).
  * *Hecho cuando:* El servidor local corre con `npm run dev` y la suite de Vitest se ejecuta con `npm test`.
  * *Cubre:* Infraestructura inicial.
- [x] **T-02:** Configurar Tailwind CSS con paleta artesanal/tierra (`stone`, `amber`, `neutral`) y directivas base en `src/index.css`.
  * *Hecho cuando:* Las clases de utilidad de Tailwind compilan correctamente y aplican estilos en pantalla.
  * *Cubre:* Principio V de la Constitución.
- [x] **T-03:** Crear archivo `.env.example` y cliente singleton `src/services/supabaseClient.js`.
  * *Hecho cuando:* El cliente de Supabase se inicializa sin errores leyendo variables de entorno con fallback seguro.
  * *Verificado el 2026-10-18:* `.env.example` documenta URL y clave pública; el singleton admite claves publishable/anon válidas y devuelve `null` con configuración ausente, inválida o secreta.
  * *Cubre:* ADR-01 del Plan Técnico.

---

## Fase 2: Lógica de Negocio y Tests Unitarios (TDD Primero)
- [x] **T-04:** Crear archivo de datos estáticos de respaldo `src/data/initialServices.js` con servicios clasificados en reparaciones, ajustes y modificaciones.
  * *Hecho cuando:* El archivo exporta un array de mínimo 8 servicios con id, nombre, categoría, precio y tiempo estimado.
  * *Cubre:* RF-01, Principio V.
- [x] **T-05:** Implementar tests unitarios para `src/services/quoterService.js` en `tests/unit/quoterService.test.js`.
  * *Hecho cuando:* Los tests fallan inicialmente esperando la implementación de `calculateTotals` y `formatCurrency`.
  * *Cubre:* Principio IV de la Constitución.
- [x] **T-06:** Implementar la lógica pura de `src/services/quoterService.js` hasta que todos los tests de T-05 pasen en verde.
  * *Hecho cuando:* `npm test` valida correctamente sumatorias, recargos del 30% y formato monetario.
  * *Cubre:* RF-03, RF-04.
- [x] **T-07:** Implementar tests y lógica para `src/services/whatsappFormatter.js` en `tests/unit/whatsappFormatter.test.js`.
  * *Hecho cuando:* Se valida que la función retorne un enlace codificado conteniendo el desglose detallado del pedido para WhatsApp.
  * *Cubre:* RF-06.

---

## Fase 3: Custom Hooks y Estado
- [x] **T-08:** Crear custom hook `src/hooks/useServices.js` para consultar Supabase con fallback a `initialServices.js` y filtrado por categoría.
  * *Hecho cuando:* El hook expone `{ services, loading, activeCategory, setActiveCategory, error }` y filtra en memoria.
  * *Verificado el 2026-10-18:* El hook expone carga/error, filtra por categoría y búsqueda, conserva catálogo remoto vacío y usa los ocho servicios locales ante fallo/timeout; ignora respuestas de solicitudes canceladas. La tabla remota consultada en modo lectura tiene los campos usados por el servicio de catálogo.
  * *Cubre:* RF-01, RF-02, RF-07.
- [x] **T-09:** Crear custom hook `src/hooks/useQuoter.js` para administrar el estado del cotizador (items agregados, cantidades, switch exprés y totales calculados).
  * *Hecho cuando:* El hook permite añadir, incrementar, decrementar y vaciar items, recalculando totales reactivamente.
  * *Cubre:* RF-03, RF-04.

---

## Fase 4: Componentes de Interfaz de Usuario (UI)
- [ ] **T-10:** Crear componentes de navegación y cabecera: `src/components/Navbar.jsx` y `src/components/Hero.jsx`.
  * *Hecho cuando:* La barra superior muestra enlaces ancla con scroll suave y el Hero presenta la propuesta de valor con botón de acción al cotizador.
  * *Cubre:* Presentación inicial.
- [x] **T-11:** Crear componentes de catálogo: `src/components/CategoryTabs.jsx`, `src/components/ServiceCard.jsx` y `src/components/ServicesGrid.jsx`.
  * *Hecho cuando:* El catálogo renderiza las tarjetas de servicio según la categoría activa con botón para agregar a la cotización.
  * *Cubre:* RF-02, RF-03.
- [ ] **T-12:** Crear componentes del cotizador: `src/components/ExpressToggle.jsx` y `src/components/QuoterModal.jsx`.
  * *Hecho cuando:* El modal muestra la lista de prendas elegidas, el switch de urgencia (+30%), el input de nombre del cliente y el botón de envío a WhatsApp.
  * *Cubre:* RF-04, RF-05, RF-06.
- [ ] **T-13:** Crear secciones complementarias: `src/components/AboutSection.jsx`, `src/components/ContactSection.jsx` y `src/components/Footer.jsx`.
  * *Hecho cuando:* Se visualiza la información del taller, ubicación, horarios de atención y footer.
  * *Cubre:* Información de contacto y confianza.

---

## Fase 5: Integración, Persistencia en Supabase y Verificación Final
- [ ] **T-14:** Ensamblar todos los componentes en `src/App.jsx` y conectar el botón de WhatsApp con la inserción asíncrona en la tabla `quotes` de Supabase.
  * *Hecho cuando:* Al hacer clic en enviar, se guarda el registro en Supabase (o se captura error con gracia) y se abre WhatsApp en una pestaña nueva.
  * *Cubre:* RF-05, RF-06, RF-07.
- [ ] **T-15:** Crear prueba de integración con React Testing Library en `tests/integration/QuoterFlow.test.jsx`.
  * *Hecho cuando:* El test simula agregar una prenda, abrir cotizador y verificar el botón de WhatsApp exitosamente.
  * *Cubre:* Escenario 1 y 2 de Criterios de Aceptación.
- [ ] **T-16:** Ejecución completa de suite de pruebas (`npm test`), verificación de build de producción (`npm run build`) y revisión de linter (`npm run lint`).
  * *Hecho cuando:* Todos los tests pasan al 100%, la compilación no arroja errores ni advertencias y la interfaz es completamente responsiva.
  * *Cubre:* Definition of Done global.

## Ampliación visual solicitada

- [x] **T-17:** Sustituir la pantalla de título por una landing completa con navegación, portada antes/después, catálogo filtrable, galería, proceso del taller, cotizador local y contacto configurable.
  * *Hecho cuando:* Se recorren las secciones y se prueba la comparación, el filtrado y la cotización exprés en Chrome a 375, 768 y 1280 px, sin desbordamiento, con 14 pruebas en verde, build correcto y linter sin advertencias.
  * *Cubre:* Ampliación de presentación documentada en `spec-mvp.md`.
  * *Pendiente de integración (T-14 y publicación):* T-03 y T-08 ya están implementadas. La persistencia de cotizaciones y los datos de contacto de publicación conservan sus propios criterios; la navegación y secciones de T-10/T-13 tienen presentación adelantada, pero no se cierran sus criterios originales con datos faltantes. El cotizador integrado corresponde a la ampliación; no se marca como terminado el modal de T-12.

## Especificación de ampliación

- [x] **T-18:** Revisar los pendientes y documentar WhatsApp, moneda CLP e integración Supabase en [SPEC-002](../002-ampliacion/spec.md), con [plan](../002-ampliacion/plan.md) y [tareas](../002-ampliacion/tasks.md).
  * *Verificado el 2026-10-17:* 14 pruebas correctas, build correcto y lint sin advertencias. Esta tarea cierra únicamente la documentación; la implementación y sus pruebas nuevas quedan pendientes.

- [x] **T-19:** Ampliar SPEC-002, plan y tareas con administración privada de tarifas y precios predeterminados en código.
  * *Verificado el 2026-10-17:* 14 pruebas correctas, build correcto y lint sin advertencias. Solo documentación; desarrollo del panel pendiente en A-19 a A-26.
