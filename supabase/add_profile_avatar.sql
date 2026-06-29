-- =============================================
-- TESSY — Foto de perfil (médico e empresa)
-- Idempotente: pode rodar várias vezes.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

NOTIFY pgrst, 'reload schema';

COMMIT;
