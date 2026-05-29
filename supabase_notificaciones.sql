-- =============================================================================
-- BARBER PRO — Sistema de notificaciones (ejecutar en Supabase SQL Editor)
-- =============================================================================

-- Columnas extra en notificaciones
ALTER TABLE public.notificaciones
  ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'sistema',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notificaciones_user_created
  ON public.notificaciones (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_rol_created
  ON public.notificaciones (rol_destino, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_categoria
  ON public.notificaciones (categoria);

-- Preferencias por usuario
CREATE TABLE IF NOT EXISTS public.notificacion_preferencias (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_reservas BOOLEAN NOT NULL DEFAULT true,
  email_ventas BOOLEAN NOT NULL DEFAULT true,
  email_recordatorios BOOLEAN NOT NULL DEFAULT true,
  email_alertas BOOLEAN NOT NULL DEFAULT true,
  push_reservas BOOLEAN NOT NULL DEFAULT true,
  push_ventas BOOLEAN NOT NULL DEFAULT true,
  push_recordatorios BOOLEAN NOT NULL DEFAULT true,
  push_alertas BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notificacion_preferencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve sus preferencias" ON public.notificacion_preferencias;
CREATE POLICY "Usuario ve sus preferencias"
  ON public.notificacion_preferencias FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuario actualiza sus preferencias" ON public.notificacion_preferencias;
CREATE POLICY "Usuario actualiza sus preferencias"
  ON public.notificacion_preferencias FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuario inserta sus preferencias" ON public.notificacion_preferencias;
CREATE POLICY "Usuario inserta sus preferencias"
  ON public.notificacion_preferencias FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admin puede leer preferencias (opcional, soporte)
DROP POLICY IF EXISTS "Admin ve preferencias" ON public.notificacion_preferencias;
CREATE POLICY "Admin ve preferencias"
  ON public.notificacion_preferencias FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Realtime (habilitar en Dashboard > Database > Replication si no aparece)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;

COMMENT ON TABLE public.notificacion_preferencias IS 'Preferencias de email e in-app por usuario';
