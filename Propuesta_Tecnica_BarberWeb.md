# Documento Técnico y Propuesta Comercial: BarberSite Pro

## 1. Resumen Ejecutivo
**BarberSite Pro** es una plataforma integral de gestión de barberías diseñada para modernizar, agilizar y profesionalizar la atención al cliente. La aplicación unifica la reserva de citas en línea, la gestión de asistencia del personal, un punto de venta (POS) para servicios y productos, y un sistema de notificaciones en tiempo real, todo bajo una interfaz estética y de alto rendimiento.

El objetivo principal de esta herramienta no es solo tener "una página web", sino dotar al negocio de un **Software as a Service (SaaS)** privado que controle las operaciones diarias, retenga clientes a través de programas de lealtad y optimice los ingresos del negocio.

---

## 2. Lógica de Negocio

El sistema está construido en base a **roles de usuario**, garantizando que cada miembro del equipo y cliente tenga acceso únicamente a las herramientas que necesita.

### 👥 Roles y Flujos de Trabajo
1. **Cliente:**
   - Puede explorar la landing page, el portafolio y la tienda.
   - Para agendar una cita o comprar en la tienda, debe registrarse/iniciar sesión.
   - En su panel, puede ver su historial de citas y sus **puntos de lealtad**.

2. **Barbero:**
   - Accede a su panel para revisar su **agenda diaria**.
   - Cuenta con un **reloj checador** (widget de asistencia) para marcar su hora de entrada y salida, permitiendo a la administración calcular sus horas trabajadas.
   - Recibe notificaciones instantáneas cuando un cliente agenda una cita con él.

3. **Recepcionista:**
   - Controla el flujo del local. Puede ver la agenda de **todos los barberos** filtrada por día, semana o mes.
   - Es la encargada de cambiar el estado de las citas (Pendiente ➔ En Proceso ➔ Completada).
   - Realiza el **cobro** final, registrando propinas y métodos de pago, lo que alimenta las estadísticas de ingresos.

4. **Administrador:**
   - Control total sobre el sistema. Acceso a reportes financieros, métricas de rendimiento, gestión del inventario de la tienda y administración del personal.

---

## 3. Guía de Uso (Cómo usar la App)

### 📌 Para el Cliente (Reservas)
1. Ingresa a la página principal y hace clic en **"Reservar Cita"**.
2. El sistema le pedirá iniciar sesión (asegurando datos reales).
3. Selecciona la **fecha y hora**, luego elige a su **barbero favorito**.
4. Escoge el **servicio** (ej. Corte Clásico). Si el cliente tiene puntos de lealtad, el sistema le aplicará automáticamente su descuento promocional.
5. Confirma la reserva.

### 📌 Para el Barbero (Asistencia y Citas)
1. Al llegar al local, el barbero inicia sesión.
2. En su panel (Dashboard), hace clic en **"Marcar Entrada"** en el Widget de Asistencia. (El administrador recibe una notificación automática).
3. Revisa su lista de citas del día. 
4. Al finalizar su jornada, hace clic en **"Marcar Salida"**.

### 📌 Para Recepción / Administración (Cobros)
1. El cliente llega a su cita. Recepción la marca como "En proceso".
2. Al terminar el corte, Recepción hace clic en **"Finalizar Cita"**.
3. Aparece una ventana para ingresar el **Método de Pago** (Efectivo, Tarjeta, QR) y la **Propina** del barbero.
4. Al guardar, el cliente suma puntos de lealtad y el barbero recibe una notificación de que su comisión ha sido registrada.

---

## 4. Arquitectura y Seguridad

### 🛡️ Privacidad de Datos y Propiedad Intelectual
Esta plataforma ha sido desarrollada con los más altos estándares de privacidad:

- **Propiedad Absoluta:** La base de datos, el código fuente y todos los registros generados son de uso **exclusivo, personal y profesional** del cliente (la Barbería).
- **No Comercialización de Datos:** Garantizamos por escrito que **ningún dato** (correos de clientes, teléfonos, estadísticas financieras) será vendido, distribuido ni utilizado por terceros bajo ninguna circunstancia.
- **Autoría:** Diseño y desarrollo intelectual propiedad de **k3v1bvo Studios**. Se otorgan las licencias de uso exclusivas para la operación del negocio.

### 🔒 Infraestructura Técnica
- **Autenticación (Auth):** El inicio de sesión utiliza tokens cifrados de sesión gestionados por Supabase Auth, previniendo accesos no autorizados.
- **Seguridad a Nivel de Fila (RLS):** La base de datos cuenta con políticas estrictas (Row Level Security). Un cliente *jamás* podrá ver los datos de otro cliente ni la agenda de la administración, mitigando riesgos de fugas de información.
- **Protección de Rutas (Middleware):** El código intercepta cada clic en la aplicación; si un usuario intenta ingresar por URL a una zona administrativa sin tener el rango, es redirigido automáticamente a la página de inicio de sesión.
- **Nube:** La plataforma está alojada en servidores de alto rendimiento (Vercel) asegurando un `Uptime` constante del 99.9%, sin caídas de servidor local.

---

**k3v1bvo Studios** | *Innovación y tecnología al servicio de tu negocio.*

---

## 5. Estado de implementación (Mayo 2026)

| Funcionalidad | Estado |
|---------------|--------|
| Landing, tienda, reservas | ✅ |
| Agenda general y por barbero | ✅ |
| Control de asistencia (22:00) | ✅ |
| Notificaciones in-app + email | ✅ |
| Panel admin optimizado | ✅ |
| Búsqueda admin | ✅ Básica |
| Redes sociales / WhatsApp | ✅ |
| SQL Supabase (migraciones) | ✅ Aplicado en proyecto cliente |
| Pagos online / WhatsApp auto | ⏸ Planificado |
| Carnet / merge clientes | 📋 Pendiente |

**Repositorio:** [BarberSite](https://github.com/k3v1bvo/BarberSite)  
**Documentación de avance:** `AVANCE_PROYECTO.md`
