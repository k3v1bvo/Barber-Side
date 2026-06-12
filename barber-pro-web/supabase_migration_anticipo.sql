-- ============================================================
-- Migración: Sistema de Anticipo QR para Reservas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Actualizar el constraint de estado en la tabla citas para permitir 'pendiente_pago'
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
ALTER TABLE citas ADD CONSTRAINT citas_estado_check 
  CHECK (estado = ANY (ARRAY['pendiente'::text, 'confirmado'::text, 'en_proceso'::text, 'completado'::text, 'cancelado'::text, 'no_presento'::text, 'pendiente_pago'::text]));

-- 2. Nuevas columnas en la tabla citas
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS anticipo_monto numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS anticipo_verificado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS anticipo_verificado_por uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS anticipo_verificado_at timestamptz;

-- 3. Índice para buscar citas pendientes de pago rápidamente
CREATE INDEX IF NOT EXISTS idx_citas_estado_anticipo
  ON citas (estado, anticipo_verificado)
  WHERE estado = 'pendiente_pago';
