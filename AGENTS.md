# AGENTS.md — Contexto Operativo del Agente

> **Propósito:** Documento de entrada principal para asistentes de IA (Claude Codex, Cursor, Copilot).
> Define la arquitectura, comandos y reglas de ejecución para la web de servicios de costura, reparación y modificación de prendas.

---

## 1. Visión General del Proyecto
* **Nombre del Proyecto:** `[Entre Cortes y Agujas]` (Plantilla Web Taller de Costura y Modistería)
* **Descripción:** Landing page interactiva de una sola página (Single Page) para taller de costura, reparación y modificación de prendas de vestir. Incluye catálogo filtrable, cotizador en tiempo real con opción de servicio exprés y envío directo de presupuesto por WhatsApp, respaldado con Supabase.
* **Stack Tecnológico:**
  * **Frontend:** JavaScript (ESNext), React (v18+), Vite, Tailwind CSS (v3/v4).
  * **Backend / BaaS:** Supabase (`@supabase/supabase-js`) para PostgreSQL y persistencia de cotizaciones y catálogo.
  * **Testing:** Vitest + React Testing Library (RTL).
  * **Gestor de paquetes:** `npm`.

---

## 2. Estructura del Repositorio
```text
/
├── public/                 # Recursos estáticos (favicon, imágenes de muestra)
├── src/
│   ├── assets/             # Íconos y gráficos locales
│   ├── components/         # Componentes UI presentacionales (Tailwind CSS)
│   │   ├── Navbar.jsx          # Barra de navegación fija con scroll suave
│   │   ├── Hero.jsx            # Portada principal con llamado a la acción (CTA)
│   │   ├── CategoryTabs.jsx    # Selector de categorías (Reparaciones / Ajustes / Modificaciones)
│   │   ├── ServiceCard.jsx     # Tarjeta individual de servicio con precio base
│   │   ├── ServicesGrid.jsx    # Cuadrícula filtrable de servicios
│   │   ├── QuoterModal.jsx     # Modal / Drawer interactivo del cotizador
│   │   ├── ExpressToggle.jsx   # Interruptor para recargo de servicio exprés (24-48 hrs)
│   │   ├── AboutSection.jsx    # Sección del taller / artesanía / experiencia
│   │   ├── ContactSection.jsx  # Horarios, mapa/dirección y botón directo a WhatsApp
│   │   └── Footer.jsx          # Pie de página y créditos legales
│   ├── hooks/              # Custom hooks con estado y lógica desacoplada
│   │   ├── useServices.js      # Consulta y filtrado de servicios desde Supabase / fallback local
│   │   └── useQuoter.js        # Gestión del carrito de cotización, cálculo y recargo
│   ├── services/           # Lógica pura de negocio y clientes externos
│   │   ├── supabaseClient.js   # Inicialización y cliente de Supabase
│   │   ├── quoterService.js    # Funciones puras de cálculo de precios y recargos
│   │   └── whatsappFormatter.js# Constructor de mensaje URI codificado para WhatsApp
│   ├── data/               # Datos de respaldo (fallback estático si falla conexión)
│   │   └── initialServices.js  # Catálogo inicial de ejemplo
│   ├── App.jsx             # Ensamblador de la Landing Page
│   ├── index.css           # Directivas base de Tailwind CSS
│   └── main.jsx            # Punto de entrada de React / Vite
├── tests/                  # Pruebas unitarias y de integración
│   ├── unit/               # Tests de quoterService y whatsappFormatter (Vitest)
│   └── integration/        # Tests de componentes y flujos de usuario (RTL)
├── docs/
│   └── constitution.md     # Principios innegociables del proyecto (@docs/constitution.md)
├── specs/
│   └── 001-mvp/            # Especificación activa del MVP
│       ├── spec.md         # Requisitos funcionales en notación EARS y criterios de aceptación
│       ├── plan.md         # Plan técnico, modelo de datos Supabase y contratos
│       └── tasks.md        # Tareas atómicas de 20-30 min con checkboxes
├── .env.example            # Variables de entorno para Supabase y WhatsApp
├── index.html              # Plantilla HTML con metadatos SEO
├── vite.config.js          # Configuración de Vite y Vitest
├── tailwind.config.js      # Configuración de temas y colores cálidos/artesanales
├── package.json            # Dependencias y scripts de npm
└── AGENTS.md               # Este archivo de contexto operativo
```

---

## 3. Comandos Principales
* **Instalación:** `npm install`
* **Desarrollo local:** `npm run dev`
* **Compilación (Build):** `npm run build`
* **Previsualizar Build:** `npm run preview`
* **Ejecutar Tests:** `npm test` (o `npx vitest run`)
* **Tests en modo interactivo:** `npm run test:watch`
* **Linter:** `npm run lint`

---

## 4. Estilo y Convenciones
* **Idioma:**
  * **Código fuente:** Nombres de variables, funciones, hooks, componentes, tests y mensajes de commit en **inglés**.
  * **Capa de Usuario y Documentación:** Textos visibles en pantalla (UI), specs, comentarios explicativos y tareas en **español**.
* **Nomenclatura:**
  * Componentes React: `PascalCase.jsx` (ej. `QuoterModal.jsx`).
  * Custom hooks: `camelCase.js` con prefijo `use` (ej. `useQuoter.js`).
  * Servicios y utilidades: `camelCase.js` (ej. `whatsappFormatter.js`).
* **Estilos con Tailwind CSS:**
  * Uso prioritario de la paleta cálida y artesanal: tonos `stone`, `amber`, `emerald` y `neutral`.
  * Diseño estrictamente responsivo: Mobile-first (`sm:`, `md:`, `lg:`).
  * Cero estilos inline (`style={{...}}`) y cero archivos CSS aislados salvo directivas en `index.css`.
* **Variables de Entorno (`.env`):**
  * `VITE_SUPABASE_URL=[URL_DE_TU_PROYECTO_SUPABASE]`
  * `VITE_SUPABASE_ANON_KEY=[TU_LLAVE_ANONIMA_PUBLICA]`
  * `VITE_WHATSAPP_NUMBER=[NUMERO_WHATSAPP_CON_CODIGO_PAIS]` (ej. `5491112345678`)
  * `VITE_CURRENCY_SYMBOL=[SIMBOLO_MONEDA]` (ej. `$`, `€`, `S/.`, `CLP`)

---

## 5. Reglas de Gobernanza
1. **La Constitución es Mandatoria:** Las normas innegociables de arquitectura están en `@docs/constitution.md`.
2. **La Spec es la Fuente de Verdad:** Todo cambio de funcionalidad o interfaz debe responder a una spec activa en `@specs/001-mvp/spec.md`.
3. **Módulos Protegidos:** NO alterar el esquema de base de datos de Supabase sin actualizar previamente `specs/001-mvp/plan.md`. Queda prohibido instalar librerías pesadas de estado global (Redux, MobX, Zustand) en este MVP.
4. **Degradación Elegante:** La aplicación nunca debe quedar en blanco si Supabase no está disponible; siempre debe existir un fallback local para permitir al cliente cotizar y comunicarse por WhatsApp.

---

## 6. Verificación Obligatoria (Definition of Done)
Antes de dar cualquier tarea por completada o fusionar código, el agente DEBE:
- [ ] Ejecutar `npm test` y comprobar que todos los tests unitarios y de componentes pasen en verde.
- [ ] Ejecutar `npm run build` y asegurar cero errores de transpilación o sintaxis en Vite.
- [ ] Verificar que no existan advertencias de linter (`npm run lint`).
- [ ] Marcar la tarea correspondiente con `[x]` en `@specs/001-mvp/tasks.md`.
