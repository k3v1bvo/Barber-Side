# Documentación Técnica y de Arquitectura: BarberWeb (CRM & POS)

## 1. Visión General y Propuesta de Valor
**BarberWeb** es una plataforma integral de nivel empresarial diseñada específicamente para la gestión operativa y comercial de barberías modernas. Nuestro software fusiona un **CRM (Customer Relationship Management)**, un sistema de reservas en tiempo real y un **Punto de Venta (POS) / Tienda en línea**, centralizando toda la operativa en un ecosistema digital unificado.

El desarrollo ha sido enfocado bajo los más altos estándares de la industria tecnológica actual, priorizando la seguridad de la información, el rendimiento del servidor y una experiencia de usuario (UX) intuitiva.

---

## 2. Infraestructura y Seguridad (Arquitectura Cloud)

Nuestro equipo de ingeniería ha estructurado BarberWeb para ser seguro, escalable y eficiente:

*   **Autenticación y Autorización (RBAC):** Implementamos un control de acceso basado en roles (Administrador, Barbero, Recepcionista, Cliente) gestionado mediante *Middlewares* de servidor. Nadie puede acceder a información que no le corresponde.
*   **Seguridad de Datos a Nivel de Fila (RLS):** Utilizando **Supabase (PostgreSQL)**, configuramos *Row Level Security*. Esto significa que la base de datos bloquea cualquier intento de acceso no autorizado desde su núcleo. Un barbero o un cliente jamás podrá interceptar datos financieros o información de otros clientes.
*   **Optimización de Almacenamiento (Cloud-Ready):** A diferencia de sistemas anticuados que saturan servidores guardando imágenes localmente, nuestro sistema está diseñado para leer recursos estáticos mediante URLs (links). Esto reduce los costos de hosting a $0 en almacenamiento de imágenes, asegurando que la plataforma responda de forma ultra-rápida.
*   **Migración de Datos Garantizada:** Ofrecemos el servicio completo de **Migración de Base de Datos**. Tomaremos todos los registros históricos que la barbería mantenga actualmente en hojas de cálculo (Excel) y los importaremos de manera estructurada a nuestra arquitectura SQL, asegurando una transición sin pérdida de información.

---

## 3. Capacidades del Sistema (Módulos Implementados)

### A. Sistema de Lealtad ("Loyalty Circle" y Recompensas)
*   **Seguimiento de Visitas:** El sistema cuantifica automáticamente el número de asistencias de cada cliente.
*   **Progresión de Recompensas:** Panel visual donde el cliente y el administrador pueden ver el progreso hacia un beneficio (Ej: *5 visitas = 50% de descuento / 10 visitas = Corte Gratis*). Esta retención gamificada incentiva el retorno continuo del cliente.

### B. Módulo de Clientes (Portal de Usuario)
*   **Reserva Inteligente:** Agendamiento 24/7 de citas eligiendo servicio, especialista y fecha/hora, evitando cruces de horarios.
*   **Historial y Fidelidad:** Visualización de su "Loyalty Circle" y citas pasadas.
*   **Tienda Online (E-commerce):** Catálogo de productos con carrito de compras y opciones de recojo en local.

### C. Módulo Administrativo (Dashboard & Analytics)
*   **Business Intelligence:** Gráficos en tiempo real de ventas diarias, ticket promedio y servicios más demandados.
*   **Control de Inventario (Stock Control):** Alertas automáticas cuando un producto llega a su nivel mínimo de stock.
*   **Productividad de Barberos:** Reporte de rendimiento económico por especialista.
*   **Gestión del Portafolio:** Galería de trabajos administrable mediante URLs, optimizando la carga.

### D. Módulo de Recepción y Barberos
*   **Recepción y Walk-in:** Gestión rápida del flujo diario, capacidad de registrar clientes de paso ("Walk-ins") y cobrar rápidamente.
*   **Control de Asistencia:** Reloj checador, estados (presente, atrasado, ausente, finalizado), cierre automático a las **22:00** y panel admin con edición manual.
*   **Agenda por barbero:** `/agenda/[id]` con pestañas de calendario, disponibilidad y configuración de horario/bloqueos.

### E. Calendarios y agenda (2026)
*   **Agenda general** (`/agenda`): vista multi-barbero para admin y recepción.
*   **API** `GET /api/citas/agenda` con filtros y actualización periódica.
*   **Tablas:** `barbero_horario_semanal`, `barbero_bloqueos` (vacaciones, días libres).
*   **Cliente:** `/calendario` para ver disponibilidad propia.

### F. Sistema de notificaciones (2026)
*   **Motor central:** `lib/notifications/dispatch.ts` — un solo punto para in-app y email.
*   **Eventos:** reserva nueva/cancelada/reprogramada, venta, cita completada, cambio de horario, asistencia, recordatorios, alertas de sistema.
*   **Email:** plantillas HTML vía **Resend** (`lib/notifications/templates.ts`).
*   **In-app:** tabla `notificaciones` (categoría, metadata), campana con Realtime, página `/notificaciones` y tabla `notificacion_preferencias`.
*   **APIs:** `/api/notificaciones/dispatch`, `recordatorios` (cron), `preferencias`.

### G. Panel administrativo (UX 2026)
*   KPIs enlazados a módulos, acciones rápidas (agenda, recepción, POS, asistencia).
*   Sidebar agrupado: Operación / Catálogo / Administración.
*   Navbar en dashboard: migas de pan (sin duplicar todo el menú lateral).

---

## 4. Hitos a Desarrollar (Fases Posteriores)

1.  **Pasarelas de pago online** (Stripe/MercadoPago) — fuera de alcance actual.
2.  **WhatsApp** para recordatorios — hoy: email + cron `/api/notificaciones/recordatorios`.
3.  **Descuento automático Loyalty** en checkout al alcanzar meta de visitas.
4.  **Fusión de clientes por carnet** con base histórica Excel.
5.  **UI de reprogramación** de citas (backend `reserva_reprogramada` ya preparado).

---

## 5. Stack Tecnológico Principal
*   **Frontend:** React con Next.js (App Router), optimizado para SEO y velocidad.
*   **Styling:** Tailwind CSS (Estética moderna, Premium Dark Mode).
*   **Base de Datos & Backend:** Supabase (PostgreSQL), brindando fiabilidad bancaria y actualizaciones en tiempo real.
*   **Correo transaccional:** Resend.
*   **Repositorio:** [github.com/k3v1bvo/BarberSite](https://github.com/k3v1bvo/BarberSite)

---

## 6. Migraciones SQL

| Archivo | Propósito |
|---------|-----------|
| `supabase_PENDIENTE_EJECUTAR.sql` | Asistencia, calendario, índices, trigger `profiles`, config |
| `supabase_notificaciones.sql` | Categoría/metadata en notificaciones, preferencias usuario |

Estado y checklist: ver **`AVANCE_PROYECTO.md`** en la raíz del repositorio.
