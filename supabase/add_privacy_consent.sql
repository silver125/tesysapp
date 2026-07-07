-- Registra aceite da Política de Privacidade no cadastro (LGPD).
-- Idempotente — rode no Supabase SQL Editor.

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT;

NOTIFY pgrst, 'reload schema';

COMMIT;
