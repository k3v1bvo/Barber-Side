# Avance del proyecto BarberSite / BarberWeb

**Repositorio:** [github.com/k3v1bvo/BarberSite](https://github.com/k3v1bvo/BarberSite)  
**Última actualización:** Mayo 2026  
**App:** `barber-pro-web/` (Next.js 16 + Supabase)

---

## Estado general

| Área | Estado | Notas |
|------|--------|--------|
| Landing + tienda + reservas | ✅ Operativo | Carrusel portafolio, redes sociales, WhatsApp flotante |
| Roles (admin, barbero, recepción, cliente) | ✅ | Middleware + layouts por rol |
| Agenda general + por barbero | ✅ | `/agenda`, `/agenda/[id]`, calendario cliente |
| Control de asistencia | ✅ | Cierre auto 22:00, panel admin |
| Notificaciones in-app + email | ✅ | Dispatch centralizado, preferencias, historial |
| Panel admin rediseñado | ✅ | Sin menús duplicados, acciones rápidas |
| SQL Supabase (pendiente + notificaciones) | ✅ Ejecutado por cliente | Ver scripts en raíz |
| Pasarelas de pago online | ⏸ Fuera de alcance | Stripe/MercadoPago pendiente |
| WhatsApp automático | ⏸ Fuera de alcance | Recordatorios por email + cron |
| Fusión clientes por carnet | 📋 Pendiente | Ver `CambiosMejoras.txt` #6 |

---

## Módulos implementados (detalle)

### Calendarios
- **Agenda general** (`/agenda`): admin y recepción ven todos los barberos.
- **Agenda individual** (`/agenda/[id]`): barbero — citas, disponibilidad, horarios y bloqueos.
- **Calendario cliente** (`/calendario`): vista autenticada para clientes.
- API `GET /api/citas/agenda`, polling ~30s, colores por barbero.
- Tablas: `barbero_horario_semanal`, `barbero_bloqueos`.

### Asistencia
- Widget entrada/salida (barberos/recepción).
- Regla **22:00** (America/La_Paz): cierre automático; después solo admin edita.
- Panel `/admin/asistencia`: filtros, edición, CSV, alertas turnos abiertos.
- APIs: `auto-cerrar`, listado, PATCH admin.

### Notificaciones
- Motor: `lib/notifications/dispatch.ts`
- Eventos: reserva nueva/cancelada/reprogramada, venta, horario, asistencia, recordatorio, sistema.
- Emails HTML (Resend): confirmación, cancelación, recordatorios, pedidos.
- UI: campana con realtime, `/notificaciones` + preferencias.
- Cron: `GET /api/notificaciones/recordatorios?secret=CRON_SECRET`
- SQL: `supabase_notificaciones.sql` + sección 10 de `supabase_PENDIENTE_EJECUTAR.sql`

### Admin
- Panel reorganizado: KPIs clicables, acciones rápidas, alertas unificadas.
- Sidebar por secciones (Operación / Catálogo / Administración).
- Búsqueda global básica: `/admin/buscar`.

---

## Scripts SQL (orden recomendado)

1. `supabase_PENDIENTE_EJECUTAR.sql` — asistencia, calendario, índices, trigger registro, config.
2. `supabase_notificaciones.sql` — categoría, metadata, preferencias (o sección 10 del archivo anterior).
3. Realtime: activar tabla `notificaciones` en Supabase → Publications.

---

## Variables de entorno (`barber-pro-web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # recomendado para notificaciones servidor
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=
RESEND_FROM_EMAIL=Barber Pro <onboarding@resend.dev>
ADMIN_NOTIFICATION_EMAIL=
CRON_SECRET=

NEXT_PUBLIC_CONTACT_PHONE=59171234567
NEXT_PUBLIC_SOCIAL_WHATSAPP=
NEXT_PUBLIC_SOCIAL_FACEBOOK=
NEXT_PUBLIC_SOCIAL_TIKTOK=
NEXT_PUBLIC_SOCIAL_INSTAGRAM=
```

Copia desde `barber-pro-web/.env.example`.

---

## Comandos útiles

```bash
cd barber-pro-web
npm install
npm run dev      # http://localhost:3000
npm run build    # verificar producción
```

---

## Próximos pasos sugeridos

1. Dominio verificado en Resend + cron de recordatorios en Vercel.
2. Integrar bloqueos en API de disponibilidad de citas.
3. UI de reprogramación de citas (ya existe evento `reserva_reprogramada`).
4. Carnet de cliente y cruce con base histórica (Excel).
5. Deploy en Vercel con variables de entorno de producción.

---

Documentación relacionada: [README.md](./README.md) · [BarberWeb_Documentacion_Tecnica.md](./BarberWeb_Documentacion_Tecnica.md) · [CambiosMejoras.txt](./CambiosMejoras.txt)
