# BarberSite / BarberWeb — CRM & POS para barberías

Plataforma integral para gestión de citas, personal, inventario, tienda y notificaciones. Diseño **Amber & Zinc** (modo oscuro), roles múltiples y backend en **Supabase**.

**Repositorio oficial:** [https://github.com/k3v1bvo/BarberSite](https://github.com/k3v1bvo/BarberSite)

---

## Estructura del repo

```
BarberWeb/
├── barber-pro-web/          # App Next.js (código principal)
├── scripts/                 # Migración Excel → Supabase (Python)
├── supabase_PENDIENTE_EJECUTAR.sql
├── supabase_notificaciones.sql
├── AVANCE_PROYECTO.md       # Estado actual y checklist
├── BarberWeb_Documentacion_Tecnica.md
├── Propuesta_Tecnica_BarberWeb.md
└── CambiosMejoras.txt
```

---

## Características principales

| Módulo | Descripción |
|--------|-------------|
| **Clientes** | Reservas, lealtad, tienda, calendario personal |
| **Barberos** | Agenda propia, walk-in, asistencia |
| **Recepción** | Flujo del día, agenda general, POS |
| **Admin** | KPIs, usuarios, inventario, pedidos, reportes, asistencia |
| **Agenda** | Vista general + por barbero (semana/día) |
| **Asistencia** | Entrada/salida, cierre automático 22:00 |
| **Notificaciones** | In-app (realtime), email (Resend), preferencias |
| **Landing** | Portafolio, redes, WhatsApp |

---

## Inicio rápido

```bash
git clone https://github.com/k3v1bvo/BarberSite.git
cd BarberSite/barber-pro-web
npm install
cp .env.example .env.local   # completar credenciales
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Supabase

Ejecuta en el SQL Editor (en orden):

1. `supabase_PENDIENTE_EJECUTAR.sql`
2. `supabase_notificaciones.sql` (si la sección 10 del anterior no se aplicó)

Activa **Realtime** en la tabla `notificaciones` para la campana en vivo.

Detalle de variables y avance: **[AVANCE_PROYECTO.md](./AVANCE_PROYECTO.md)**.

---

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Email:** Resend
- **Iconos:** Lucide React

---

## Seguridad

- Middleware por rol (`/admin`, `/agenda`, `/barbero`, etc.)
- RLS en Supabase
- `.env.local` nunca se sube a Git (ver `.gitignore`)

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| **[MANUAL_DE_USO.md](./MANUAL_DE_USO.md)** | **Guía oficial de usuario por rol (entrega)** |
| [AVANCE_PROYECTO.md](./AVANCE_PROYECTO.md) | Estado, SQL, env, pendientes |
| [BarberWeb_Documentacion_Tecnica.md](./BarberWeb_Documentacion_Tecnica.md) | Arquitectura y módulos |
| [Propuesta_Tecnica_BarberWeb.md](./Propuesta_Tecnica_BarberWeb.md) | Propuesta comercial y uso |
| [CambiosMejoras.txt](./CambiosMejoras.txt) | Backlog original vs hecho |
| [scripts/LEEME_MIGRACION.md](./scripts/LEEME_MIGRACION.md) | Migración de clientes Excel |

---

Desarrollo: **k3v1bvo Studios** · BarberSite Pro
