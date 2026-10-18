# Plan Técnico: Web de Servicios de Costura (MVP)

> **Especificación Base:** `@specs/001-mvp/spec.md`  
> **Constitución Aplicada:** `@docs/constitution.md`  
> **Estado:** Aprobado  
> **Ubicación en el repositorio:** `specs/001-mvp/plan.md`  
> **Propósito:** Definir el diseño de arquitectura, estructuras de datos en Supabase, contratos de interfaz y estrategia de testing antes de la implementación de código.

---

## 1. Estructura de Módulos y Responsabilidades
```text
src/
├── components/             # Capa de Presentación (React + Tailwind)
│   ├── Navbar.jsx          # Navegación y anclas (#inicio, #servicios, #cotizador, #contacto)
│   ├── Hero.jsx            # Encabezado principal, valor de propuesta y botón de acción
│   ├── CategoryTabs.jsx    # Botones de filtro por categoría de costura
│   ├── ServiceCard.jsx     # Tarjeta de servicio con botón 'Agregar'
│   ├── ServicesGrid.jsx    # Contenedor responsivo de tarjetas
│   ├── QuoterModal.jsx     # Panel emergente/lateral con el resumen de prendas añadidas
│   ├── ExpressToggle.jsx   # Switch interactivo de servicio urgente
│   ├── AboutSection.jsx    # Historia del taller, acabados y experiencia
│   ├── ContactSection.jsx  # Mapa simulado/dirección, horarios y botón WhatsApp
│   └── Footer.jsx          # Información de contacto y derechos reservados
├── hooks/                  # Custom Hooks (Lógica y Estado)
│   ├── useServices.js      # Obtención y filtrado de servicios (Supabase + fallback)
│   └── useQuoter.js        # Estado del cotizador: items, cantidades, toggle exprés y totales
├── services/               # Lógica Pura y Conexiones Externas
│   ├── supabaseClient.js   # Cliente Supabase singleton
│   ├── quoterService.js    # Funciones puras: sumatorias, recargos y formato de moneda
│   └── whatsappFormatter.js# Generación y codificación URI del mensaje de WhatsApp
└── data/
    └── initialServices.js  # 8-10 servicios base de costura para fallback offline
```

---

## 2. Modelo de Datos y Esquema de Supabase (PostgreSQL)

### 2.1. Tabla: `services` (Catálogo de Servicios)
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reparacion', 'ajuste', 'modificacion')),
  base_price NUMERIC(10, 2) NOT NULL,
  estimated_time TEXT NOT NULL, -- ej. '24-48 hrs', '2-3 días'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS (Lectura pública)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public services read" ON services FOR SELECT USING (is_active = true);
```

### 2.2. Tabla: `quotes` (Registro de Cotizaciones)
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  items JSONB NOT NULL, -- Array de { id, name, price, quantity, category }
  subtotal NUMERIC(10, 2) NOT NULL,
  is_express BOOLEAN DEFAULT false,
  express_surcharge NUMERIC(10, 2) DEFAULT 0,
  total_estimated NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS (Inserción pública anónima)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous quotes insert" ON quotes FOR INSERT WITH CHECK (true);
```

---

## 3. Contratos de Interfaz (Firmas Técnicas)

### 3.1. `src/services/quoterService.js`
```javascript
// Calcula los totales a partir de una lista de prendas y el flag de urgencia
export function calculateTotals(items, isExpress, expressRate = 0.30) {
  // items: Array<{ id: string, name: string, price: number, quantity: number }>
  // returns: { subtotal: number, expressSurcharge: number, totalEstimated: number }
}

// Formatea números a moneda local
export function formatCurrency(amount, currencySymbol = '$') {
  // returns: string, ej. "$ 25.00"
}
```

### 3.2. `src/services/whatsappFormatter.js`
```javascript
// Construye el enlace de WhatsApp completamente codificado en formato URI
export function generateWhatsAppLink({
  phoneNumber,
  businessName,
  clientName,
  items,
  isExpress,
  totals,
  currencySymbol
}) {
  // returns: string (URL formateada para redirigir al chat de WhatsApp con el texto)
}
```

---

## 4. Decisiones Técnicas y ADRs (Architecture Decision Records)

### Entrega de presentación ampliada

El alcance visual solicitado se entrega como landing completa con cotizador integrado en una sección `#cotizador`, antes/después controlado por botones y fotografías locales optimizadas. La presentación recibe datos y callbacks; los hooks administran el estado y los servicios puros calculan y formatean el presupuesto. `buildQuoteMessage(quote)` devuelve el texto sin codificar para copiar, y `generateWhatsAppLink(quote)` reutiliza ese texto codificado.

Esta entrega utiliza el catálogo local y no realiza consultas ni inserciones remotas. La integración Supabase de T-03, T-08 y T-14 sigue pendiente. El teléfono, la dirección y los horarios se leen de variables públicas opcionales; sin teléfono no se muestra un enlace de WhatsApp y se permite copiar el presupuesto. Si el portapapeles falla, se ofrece texto seleccionable. No hay cambios de esquema de base de datos.

* **ADR-01: Uso de Supabase sin Backend Custom:** Para acelerar el MVP y cumplir con el *Principio I de la Constitución*, conectamos directamente el frontend con Supabase usando Row Level Security (RLS). Esto evita mantener un servidor Express/Node adicional.
* **ADR-02: Single Page con Navegación por Hash:** Se descarta `react-router-dom` para el MVP; toda la experiencia vive en una sola página con scroll fluido (`#servicios`, `#cotizador`, `#contacto`). Esto reduce el peso del bundle y mejora la conversión en dispositivos móviles.
* **ADR-03: Resiliencia con Fallback Estático:** `useServices.js` intenta leer desde Supabase con un timeout de 3 segundos; si falla o no hay conexión a internet, consume inmediatamente `initialServices.js`, garantizando disponibilidad permanente (*Principio V*).

---

## 5. Estrategia de Pruebas

* **Pruebas Unitarias (Vitest):**
  * `tests/unit/quoterService.test.js`: Validar cálculo de subtotal con cantidades múltiples, cálculo exacto de recargo del 30% y redondeo monetario.
  * `tests/unit/whatsappFormatter.test.js`: Validar que la cadena de texto incluya todos los campos, los emojis y caracteres especiales (tildes, saltos de línea) mediante `encodeURIComponent`.
* **Pruebas de Componentes e Integración (Vitest + RTL):**
  * `tests/integration/QuoterModal.test.jsx`: Simular la adición de dos prendas, activación del switch exprés y verificación de que el botón de WhatsApp genere el enlace esperado.

## Plan de ampliación: SPEC-002

El [plan técnico de la ampliación](../002-ampliacion/plan.md) define el cliente, consulta con timeout, instantánea de cotización, respaldo local y envío a WhatsApp con importes CLP. Antes de modificar el esquema se inspeccionará el proyecto objetivo. Los cambios previstos incluyen moneda CLP para nuevas cotizaciones, restricciones de importes enteros, validación de totales y permisos públicos mínimos; los registros históricos no se convertirán ni se etiquetarán sin conocer su moneda. No se ha ejecutado ninguna migración al documentar este plan.

### Ampliación del esquema para administración de tarifas

El [plan de SPEC-002](../002-ampliacion/plan.md) incorpora Supabase Auth, `admin_users` con autorizaciones mantenidas fuera del cliente y `services.price_version` para detectar conflictos. Las políticas permitirán a administradores autorizados actualizar únicamente `base_price`, además de consultar el catálogo. El seed conservará precios existentes. Estos cambios están documentados antes de su implementación; no se ha modificado el esquema remoto.
