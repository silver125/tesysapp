-- =============================================
-- TESSY — Correção simples dos 5 alertas do Supabase Advisor
-- Cole TUDO no Supabase > SQL Editor e clique em Run.
--
-- Este script evita blocos complexos com information_schema.
-- Ele faz o essencial para o Advisor:
-- 1. Liga RLS nas tabelas públicas sinalizadas.
-- 2. Remove a policy pública antiga de leitura total, se existir.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.applications') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.applications';
  END IF;

  IF to_regclass('public.opportunities') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities';
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews';
  END IF;

  IF to_regclass('public.reports') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('applications', 'opportunities', 'reviews', 'reports')
ORDER BY tablename;
