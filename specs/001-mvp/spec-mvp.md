# Spec de MVP: Web de Servicios de Costura, Reparación y Modificación

> **Identificador:** `SPEC-001`  
> **Nombre de la Feature:** MVP Landing Page con Catálogo y Cotizador para Taller de Costura  
> **Versión:** `1.0.0` | **Estado:** Aprobado  
> **Ubicación en el repositorio:** `specs/001-mvp/spec.md`  
> **Alcance General:** Landing page de una sola página orientada a la conversión, que incluye catálogo filtrable de servicios, cotizador interactivo en tiempo real con opción estándar y exprés, guardado de cotizaciones en Supabase y derivación de pedidos prellenados a WhatsApp.

---

## 0. Resumen Ejecutivo (El Dibujo Más Barato)

### Ampliación de presentación solicitada

La entrega visual debe ser una landing completa, minimalista y funcional: navegación por anclas, portada con comparación antes/después de las fotografías locales, catálogo filtrable, galería de trabajos, explicación del proceso y cotizador local visible en la página. La base visual aislada de T-01/T-02 no constituye la landing.

El cotizador en esta entrega se presenta como sección integrada, con cantidades, recargo exprés del 30%, nombre del cliente y copia del presupuesto. El botón de WhatsApp solo aparece cuando existe un número real configurado. La copia sirve como alternativa mientras se definen los datos de contacto. Las direcciones, teléfonos, horarios, testimonios y años de experiencia no se inventan. Las tarifas locales son de referencia y se identifican como tales. La persistencia remota y el catálogo remoto siguen pendientes de sus tareas; esta entrega usa el catálogo local sin depender de credenciales.

Las imágenes se optimizan a partir de los originales, conservando su contenido. La navegación móvil debe poder abrirse/cerrarse con teclado y la comparación antes/después debe ofrecer botones, sin depender de arrastrar.

* **Hoy (Estado Actual):** Los clientes que necesitan arreglar o modificar prendas deben desplazarse físicamente al taller o intercambiar múltiples mensajes desordenados por chat preguntando precios aproximados sin claridad de costos ni tiempos.
* **Después (Estado Deseado):** El cliente entra a la web desde su móvil u ordenador, consulta las tarifas base organizadas por categorías (Reparaciones, Ajustes, Modificaciones), calcula su presupuesto estimado al instante (con opción normal o urgente) y presiona un botón para enviar su pedido estructurado a WhatsApp, quedando la solicitud registrada en Supabase.

---

## 1. La Historia del Usuario
* **ANTES:** `[NOMBRE_CLIENTE_EJEMPLO]` tiene un evento en 48 horas y necesita ajustar el dobladillo de un pantalón y cambiar la cremallera de una chaqueta. Envía mensajes por redes sociales a varios talleres sin saber si realizan trabajos urgentes ni cuánto le costará, perdiendo horas esperando respuesta.
* **DESPUÉS:** `[NOMBRE_CLIENTE_EJEMPLO]` ingresa a la web de `[NOMBRE_NEGOCIO]`, filtra la sección "Ajustes", selecciona "Dobladillo de pantalón", agrega "Cambio de cremallera" en "Reparaciones", activa la casilla "Servicio Exprés (24-48 hrs)" y ve de inmediato su presupuesto estimado con recargo transparente. Hace clic en "Enviar Cotización por WhatsApp", se abre la conversación con el taller con todos los datos detallados y el taller recibe la solicitud lista para agendar.

---

## 2. Objetivos y No-Objetivos

### Objetivos
* **O1:** Presentar un catálogo visual y claro categorizado en **Reparaciones**, **Ajustes** y **Modificaciones** con precios base y tiempos estimados.
* **O2:** Proveer un cotizador interactivo que permita sumar múltiples prendas/servicios y calcular subtotales en tiempo real.
* **O3:** Ofrecer un selector de urgencia ("Servicio Exprés 24-48 hrs") que aplique un recargo configurable (por defecto +30%) con desglose visible.
* **O4:** Enviar el pedido listo a WhatsApp mediante un enlace URI codificado con el detalle de prendas, tipo de servicio y monto estimado.
* **O5:** Registrar cada cotización generada en la base de datos de Supabase para histórico y seguimiento del taller.

### No-Objetivos (Fuera de Alcance del MVP)
* **NO1:** No incluye pasarela de pagos en línea (tarjetas, pasarelas) en esta fase; el pago se acuerda al entregar la prenda en el taller.
* **NO2:** No incluye registro ni login de usuarios para clientes; el proceso es completamente abierto y sin fricción.
* **NO3:** No incluye sistema de rastreo en tiempo real del estado de la costura (etapas de confección) dentro de la web.
* **NO4:** No incluye panel administrativo complejo; la gestión de datos se realiza directamente desde el panel de Supabase.

---

## 3. Requisitos Funcionales (Notación EARS)

* **RF-01 (Ubicuo / Sistema):** El sistema debe cargar el catálogo de servicios desde la tabla `services` de Supabase al inicializar la página, o utilizar el catálogo estático de respaldo (`initialServices.js`) en caso de desconexión.
* **RF-02 (Evento):** **CUANDO** el usuario selecciona una pestaña de categoría (*Reparaciones*, *Ajustes*, *Modificaciones* o *Todos*), el sistema debe filtrar las tarjetas de servicio visibles en menos de 100 ms.
* **RF-03 (Evento):** **CUANDO** el usuario hace clic en "Agregar a Cotización" en una tarjeta de servicio, el sistema debe añadir el ítem al cotizador interactivo y actualizar el subtotal en pantalla.
* **RF-04 (Estado):** **MIENTRAS** la opción "Servicio Exprés (24-48 hrs)" esté activada, el sistema debe aplicar un recargo del `[PORCENTAJE_RECARGO_EXPRES]%` (ej. 30%) sobre el total acumulado y mostrar el desglose en el resumen.
* **RF-05 (Evento):** **CUANDO** el usuario hace clic en "Enviar por WhatsApp", el sistema debe validar que exista al menos un servicio seleccionado y que el nombre del cliente no esté vacío.
* **RF-06 (Evento):** **CUANDO** los datos son válidos, el sistema debe registrar la cotización en la tabla `quotes` de Supabase con estado `'pending'` y abrir inmediatamente la aplicación de WhatsApp con el mensaje prellenado codificado con `encodeURIComponent`.
* **RF-07 (Comportamiento No Deseado):** **SI** la petición de inserción en Supabase falla por problemas de red, **ENTONCES** el sistema debe registrar el incidente en consola, almacenar la cotización temporalmente en `localStorage` y proceder a abrir WhatsApp sin bloquear la experiencia del usuario.
* **RF-08 (Opcional):** **DONDE** el usuario ingrese texto en el campo de búsqueda rápida, el sistema debe filtrar los servicios por coincidencia de nombre o descripción.

---

## 4. Criterios de Aceptación (Verificables)

### Escenario 1: Cotización estándar exitosa con derivación a WhatsApp
* **Dado que (Given):** El usuario está en la landing y el catálogo muestra los servicios cargados.
* **Cuando (When):** Selecciona "Dobladillo de Pantalón" ($8.00) y "Cambio de Cremallera" ($12.00), ingresa su nombre "María" y presiona "Enviar Cotización por WhatsApp".
* **Entonces (Then):** El sistema guarda el registro en Supabase con total $20.00, `is_express: false`, y abre WhatsApp con el mensaje estructurado indicando el nombre de María, los dos servicios y el total de $20.00.

### Escenario 2: Cotización con servicio exprés aplicado
* **Dado que (Given):** El usuario tiene en su cotizador servicios con subtotal de $50.00.
* **Cuando (When):** Activa el interruptor "Servicio Exprés (24-48 hrs)" con recargo del 30%.
* **Entonces (Then):** El sistema muestra el recargo de $15.00, actualiza el total estimado a $65.00 y en el mensaje de WhatsApp añade la etiqueta indicativa de servicio urgente.

### Escenario 3: Resiliencia ante caída de Supabase (Degradación Elegante)
* **Dado que (Given):** La conexión a Supabase se interrumpe o las credenciales no son válidas.
* **Cuando (When):** El usuario navega por la página y genera una cotización.
* **Entonces (Then):** El catálogo se carga desde `initialServices.js`, la cotización se calcula correctamente, se guarda copia en `localStorage` y la redirección a WhatsApp se ejecuta sin pantallas de error fatales.

---

## 5. Restricciones Técnicas
* [ ] **Cero dependencias de estado global pesadas:** Usar únicamente React Hooks (`useState`, `useMemo`, `useCallback`) y Context API nativa si se requiere.
* [ ] **Diseño Responsivo:** Compatibilidad probada en pantallas móviles (375px), tablets (768px) y escritorio (1280px+).
* [ ] **Seguridad en Supabase:** La clave pública anon solo debe tener permisos `SELECT` sobre `services` e `INSERT` sobre `quotes` mediante políticas RLS (Row Level Security).
* [ ] **Accesibilidad Web:** Botones con `aria-label`, contraste de texto superior a 4.5:1 con la paleta de Tailwind y navegación semántica.

---

## 6. Pseudo-Código de la Lógica Central
```text
FUNCION calculateQuote(items, isExpress, expressRate = 0.30)
  subtotal = SUMA(item.price * item.quantity PARA CADA item EN items)
  expressSurcharge = SI isExpress ENTONCES subtotal * expressRate SINO 0
  totalEstimated = subtotal + expressSurcharge
  RETORNAR { subtotal, expressSurcharge, totalEstimated }
FIN FUNCION

FUNCION buildWhatsAppMessage(clientName, items, isExpress, calculation, phone)
  mensaje = "¡Hola [NOMBRE_NEGOCIO]! Mi nombre es " + clientName + ".\n"
  mensaje += "Deseo cotizar los siguientes servicios para mis prendas:\n\n"
  PARA CADA item EN items:
    mensaje += "• " + item.quantity + "x " + item.name + " (" + item.category + ") - " + FORMAT_MONEY(item.price * item.quantity) + "\n"
  SI isExpress:
    mensaje += "\n⚡ Servicio Exprés activado (+30%): " + FORMAT_MONEY(calculation.expressSurcharge) + "\n"
  mensaje += "\nTotal Estimado: " + FORMAT_MONEY(calculation.totalEstimated) + "\n"
  mensaje += "\n¿Podrían indicarme cuándo puedo acercar las prendas al taller?"
  
  url = URL_BASE_WHATSAPP + "?phone=" + phone + "&text=" + ENCODE_URI(mensaje)
  RETORNAR url
FIN FUNCION
```

## Ampliación activa: SPEC-002

La [especificación de WhatsApp, CLP y Supabase](../002-ampliacion/spec.md) concreta los pendientes de catálogo y persistencia, establece precios en pesos chilenos sin decimales y define el envío al chat del taller. Sus requisitos sustituyen los ejemplos monetarios y el criterio de modal del MVP por el cotizador integrado existente. La implementación permanece pendiente; las tarifas comerciales requieren confirmación.

### Administración de tarifas incluida en SPEC-002

Por solicitud del taller, [SPEC-002](../002-ampliacion/spec.md) amplía NO4 con un panel privado limitado a editar precios CLP y restaurar valores predeterminados. Los clientes siguen sin necesitar cuenta. Los precios vigentes residen en Supabase; el código conserva una base de respaldo que no se sobrescribe desde el panel.
