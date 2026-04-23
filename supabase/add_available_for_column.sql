-- =============================================
-- Migration: adiciona coluna `available_for` em products
-- Execute este SQL no SQL Editor do Supabase.
-- =============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS available_for TEXT;

-- (Opcional) força o PostgREST a recarregar o schema cache imediatamente
NOTIFY pgrst, 'reload schema';
