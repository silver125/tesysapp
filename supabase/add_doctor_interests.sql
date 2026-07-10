-- =============================================
-- TESSY — Interesses do onboarding médico
--
-- Objetivo:
-- - Persistir interesses escolhidos no primeiro acesso.
-- - Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS doctor_interests TEXT[] DEFAULT '{}';

NOTIFY pgrst, 'reload schema';
