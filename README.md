# Entre Cortes y Agujas

Landing del taller de costura: React, Vite y Tailwind CSS 4. Incluye portada con antes/después, servicios filtrables, galería, proceso del taller, cotizador CLP, contacto configurable y panel privado de precios.

## Desarrollo

Usar Node.js 24 y npm. Las versiones exactas están en `package.json` y `package-lock.json`.

```sh
npm ci
npm run dev
```

## Verificación

```sh
npm test
npm run build
npm run lint
npm run preview
```

`npm test` ejecuta Vitest una vez; `npm run test:watch` lo mantiene en modo interactivo. Las pruebas de React usan jsdom, React Testing Library y limpieza del DOM tras cada caso. Las comprobaciones de estilos y diseño responsivo se realizan en navegador.

## Base visual

Se aplican las guías de `frontend-design` y `ui-ux-pro-max`: composición adaptable alineada a la izquierda, espacio generoso y una única familia tipográfica. Work Sans se sirve localmente con pesos 400 y 600; no depende de Google Fonts en tiempo de ejecución.

Los colores semánticos están definidos en `tailwind.config.js`: `canvas`, `surface`, `ink`, `muted`, `accent` y `border`. Se conservan las paletas nativas `stone`, `amber`, `neutral` y `emerald`. Todos los estilos de presentación se expresan con utilidades; `src/index.css` contiene únicamente las directivas base de Tailwind.

Tailwind se integra mediante `@tailwindcss/postcss`, con `@config` explícito y búsqueda limitada al HTML y al código de `src/`. Se eligió la versión 4 para evitar las dependencias vulnerables detectadas al instalar Tailwind 3. ESLint 10 reemplaza la versión 9 sin soporte.

La dirección visual se apoya en el antes/después de un pantalón convertido en falda, usando las imágenes de `fotos/`. El verde `forest` se toma de esa prenda y `linen` separa las secciones. Se evitan testimonios, métricas inventadas, degradados y animaciones decorativas. Los servicios se muestran en una cuadrícula ligera, sin sombras ni tarjetas repetidas con fondo.

```text
Navegación                 Mi presupuesto
Propuesta y acciones       Antes / Después
Servicios: filtros, búsqueda y precios
Galería de prendas
El taller                  Cómo trabajamos
Cotizador local            Cantidades, exprés y total
Contacto                   Pie de página
```

Las copias JPEG optimizadas en `public/images/` conservan el contenido y la orientación de los originales. Las imágenes de la galería se cargan de forma diferida.

## Contacto y presupuesto

Copiar `.env.example` a `.env.local` y completar los datos reales del taller. `VITE_WHATSAPP_NUMBER` debe contener el número con código de país. `VITE_BUSINESS_ADDRESS` y `VITE_BUSINESS_HOURS` son opcionales. Reiniciar Vite después de cambiar las variables. Nunca introducir una clave `service_role` en el frontend.

Mientras no haya un WhatsApp configurado, el visitante puede preparar y copiar el presupuesto. Si el navegador deniega el portapapeles, se ofrece un texto seleccionable. No se muestran teléfonos, direcciones ni horarios ficticios. Los precios aprobados se muestran en pesos chilenos con la etiqueta «Desde» en el catálogo, el cotizador y el mensaje de WhatsApp.

El catálogo consulta Supabase con un límite de 3 segundos y mantiene filtros en memoria y respaldo local. El cotizador usa CLP, abre WhatsApp sin esperar a la red y guarda solicitudes con respaldo temporal. El panel en `#/admin` usa Supabase Auth y permite editar y restaurar precios con control de versiones. La migración y las instrucciones están en [Puesta en marcha de Supabase](docs/supabase-setup.md).

## Documentación activa

- [Constitución](docs/constitution.md)
- [Especificación](specs/001-mvp/spec-mvp.md)
- [Plan técnico](specs/001-mvp/plan-mvp.md)
- [Tareas](specs/001-mvp/tasks-mvp.md)

La ampliación visual está documentada en la especificación activa. El estado de las tareas indica qué módulos ya están verificados y qué integraciones siguen pendientes. Las capturas y resultados de la revisión local se guardan en `artifacts/`, excluido del repositorio.

## Implementación: WhatsApp, CLP y Supabase

La revisión del estado actual y el alcance solicitado se documentan en [SPEC-002](specs/002-ampliacion/spec.md), con su [plan técnico](specs/002-ampliacion/plan.md) y [lista de tareas](specs/002-ampliacion/tasks.md). Incluye precios en pesos chilenos sin decimales, apertura de WhatsApp con cotización completa, catálogo remoto y persistencia con respaldo local. La implementación local está verificada; quedan por confirmar el proyecto remoto, las tarifas y el número real del taller antes de publicar.

La ampliación incluye un panel privado de tarifas en `#/admin`, con Supabase Auth, edición CLP y restauración por servicio. Los cambios se guardarán en Supabase y prevalecerán sobre el respaldo de `initialServices.js`; los despliegues no restablecerán precios ajustados. El panel está implementado; requiere configurar Supabase y autorizar la cuenta del taller.
