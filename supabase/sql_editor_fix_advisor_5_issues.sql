-- =============================================
-- TESSY — Corrigir 5 alertas críticos do Supabase Advisor
-- Cole este arquivo inteiro no Supabase > SQL Editor > Run.
--
-- Corrige:
-- - public.applications com policy pública mas RLS desligado
-- - public.applications com RLS desligado
-- - public.opportunities com RLS desligado
-- - public.reviews com RLS desligado
-- - public.reports com RLS desligado, se existir
--
-- Importante:
-- O app atual usa profiles/events/products/courses.
-- applications/opportunities/reviews/reports ficam fechadas por padrão
-- após RLS, exceto pelas policies específicas abaixo.
-- =============================================

BEGIN;

-- 1) Liga RLS nas tabelas do Advisor.
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

-- 2) Remove policy pública genérica criada no MVP, quando existir.
DO $$
BEGIN
  IF to_regclass('public.applications') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.applications;
  END IF;

  IF to_regclass('public.opportunities') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities;
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
  END IF;

  IF to_regclass('public.reports') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports;
  END IF;
END $$;

-- 3) Applications: usuário autenticado acessa apenas registros próprios.
-- Suporta schema com user_id, doctor_id ou applicant_id.
DO $$
BEGIN
  IF to_regclass('public.applications') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'applications'
         AND column_name = 'user_id'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own applications by user_id" ON public.applications;
    CREATE POLICY "Users can read own applications by user_id"
      ON public.applications
      FOR SELECT
      USING (auth.uid()::text = user_id::text);
  END IF;

  IF to_regclass('public.applications') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'applications'
         AND column_name = 'doctor_id'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own applications by doctor_id" ON public.applications;
    CREATE POLICY "Users can read own applications by doctor_id"
      ON public.applications
      FOR SELECT
      USING (auth.uid()::text = doctor_id::text);
  END IF;

  IF to_regclass('public.applications') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'applications'
         AND column_name = 'applicant_id'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own applications by applicant_id" ON public.applications;
    CREATE POLICY "Users can read own applications by applicant_id"
      ON public.applications
      FOR SELECT
      USING (auth.uid()::text = applicant_id::text);
  END IF;
END $$;

-- 4) Opportunities: abre leitura pública somente para registros publicados.
-- Se não houver status/is_published/published, fica fechado por padrão.
DO $$
BEGIN
  IF to_regclass('public.opportunities') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'opportunities'
         AND column_name = 'status'
     ) THEN
    DROP POLICY IF EXISTS "Published opportunities are public" ON public.opportunities;
    CREATE POLICY "Published opportunities are public"
      ON public.opportunities
      FOR SELECT
      USING (status = 'published');
  END IF;

  IF to_regclass('public.opportunities') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'opportunities'
         AND column_name = 'is_published'
     ) THEN
    DROP POLICY IF EXISTS "Published opportunities by is_published are public" ON public.opportunities;
    CREATE POLICY "Published opportunities by is_published are public"
      ON public.opportunities
      FOR SELECT
      USING (is_published = true);
  END IF;

  IF to_regclass('public.opportunities') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'opportunities'
         AND column_name = 'published'
     ) THEN
    DROP POLICY IF EXISTS "Published opportunities by published are public" ON public.opportunities;
    CREATE POLICY "Published opportunities by published are public"
      ON public.opportunities
      FOR SELECT
      USING (published = true);
  END IF;
END $$;

-- 5) Reviews: abre leitura pública somente para reviews marcados como públicos.
-- Se não houver is_public/published/status, fica fechado por padrão.
DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reviews'
         AND column_name = 'is_public'
     ) THEN
    DROP POLICY IF EXISTS "Public reviews are readable" ON public.reviews;
    CREATE POLICY "Public reviews are readable"
      ON public.reviews
      FOR SELECT
      USING (is_public = true);
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reviews'
         AND column_name = 'published'
     ) THEN
    DROP POLICY IF EXISTS "Published reviews are readable" ON public.reviews;
    CREATE POLICY "Published reviews are readable"
      ON public.reviews
      FOR SELECT
      USING (published = true);
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reviews'
         AND column_name = 'status'
     ) THEN
    DROP POLICY IF EXISTS "Approved reviews are readable" ON public.reviews;
    CREATE POLICY "Approved reviews are readable"
      ON public.reviews
      FOR SELECT
      USING (status = 'approved');
  END IF;
END $$;

-- 6) Reports: relatórios ficam privados; usuário acessa somente os próprios.
-- Suporta reporter_id, user_id ou created_by.
DO $$
BEGIN
  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reports'
         AND column_name = 'reporter_id'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own reports by reporter_id" ON public.reports;
    CREATE POLICY "Users can read own reports by reporter_id"
      ON public.reports
      FOR SELECT
      USING (auth.uid()::text = reporter_id::text);
  END IF;

  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reports'
         AND column_name = 'user_id'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own reports by user_id" ON public.reports;
    CREATE POLICY "Users can read own reports by user_id"
      ON public.reports
      FOR SELECT
      USING (auth.uid()::text = user_id::text);
  END IF;

  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reports'
         AND column_name = 'created_by'
     ) THEN
    DROP POLICY IF EXISTS "Users can read own reports by created_by" ON public.reports;
    CREATE POLICY "Users can read own reports by created_by"
      ON public.reports
      FOR SELECT
      USING (auth.uid()::text = created_by::text);
  END IF;
END $$;

-- 7) Recarrega cache da API do Supabase.
NOTIFY pgrst, 'reload schema';

COMMIT;

-- 8) Conferência: todas abaixo devem aparecer com rls_enabled = true.
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('applications', 'opportunities', 'reviews', 'reports')
ORDER BY tablename;
