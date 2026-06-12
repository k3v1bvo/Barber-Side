-- Supabase SQL Script para Anticipo QR + Verificación de Pago

-- 1. Actualizar la restricción (CHECK) de la columna 'estado' para soportar 'pendiente_pago'
-- (Como no es un ENUM, sino un texto con CHECK, debemos eliminar el constraint anterior y crear uno nuevo)
ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS citas_estado_check;

ALTER TABLE public.citas ADD CONSTRAINT citas_estado_check 
CHECK (estado = ANY (ARRAY['pendiente_pago'::text, 'pendiente'::text, 'confirmado'::text, 'en_proceso'::text, 'completado'::text, 'cancelado'::text, 'no_presento'::text]));

-- 2. Agregar nuevas columnas a la tabla 'citas'
ALTER TABLE public.citas
ADD COLUMN IF NOT EXISTS anticipo_monto numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_verificado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS anticipo_verificado_por uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS anticipo_verificado_at timestamptz;

-- Nota: Puedes correr esto en el SQL Editor de Supabase.
