-- =============================================
-- TESSY — Onboarding de primeiro acesso
--
-- Objetivo:
-- - Marcar quando médico/empresa concluiu o pop-up inicial.
-- - Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- - Não altera dados existentes.
-- =============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
