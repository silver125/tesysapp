-- =============================================
-- FIX RLS ADVISOR — Tessy
-- Execute no SQL Editor do Supabase.
--
-- Objetivo:
-- 1. Habilitar Row Level Security nas tabelas sinalizadas pelo Advisor.
-- 2. Evitar tabelas públicas sem RLS.
-- 3. Manter leitura pública apenas para tabelas de vitrine do app.
--
-- Seguro para rodar mais de uma vez.
-- =============================================

-- Tabelas usadas pela vitrine pública do app.
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

-- Tabelas sinalizadas pelo Supabase Advisor.
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

-- Remove policies públicas genéricas que podem ter sido criadas no MVP.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.applications;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports;

-- Se existir outra tabela pública criada no MVP, mantenha RLS ligada aqui também.
-- ALTER TABLE IF EXISTS public.<nome_da_tabela> ENABLE ROW LEVEL SECURITY;

-- Policies de leitura pública para conteúdo que deve aparecer no marketplace.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    CREATE POLICY "Public profiles are readable"
      ON public.profiles
      FOR SELECT
      USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.events') IS NOT NULL THEN
    CREATE POLICY "Public events are readable"
      ON public.events
      FOR SELECT
      USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    CREATE POLICY "Public products are readable"
      ON public.products
      FOR SELECT
      USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.courses') IS NOT NULL THEN
    CREATE POLICY "Public courses are readable"
      ON public.courses
      FOR SELECT
      USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Policies de escrita para donos dos registros, quando a tabela tem company_id.
DO $$
BEGIN
  IF to_regclass('public.events') IS NOT NULL THEN
    CREATE POLICY "Companies manage own events"
      ON public.events
      FOR ALL
      USING (auth.uid() = company_id)
      WITH CHECK (auth.uid() = company_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    CREATE POLICY "Companies manage own products"
      ON public.products
      FOR ALL
      USING (auth.uid() = company_id)
      WITH CHECK (auth.uid() = company_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.courses') IS NOT NULL THEN
    CREATE POLICY "Companies manage own courses"
      ON public.courses
      FOR ALL
      USING (auth.uid() = company_id)
      WITH CHECK (auth.uid() = company_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Perfis: cada usuário cria e edita somente o próprio perfil.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    CREATE POLICY "Users create own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    CREATE POLICY "Users update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tabelas antigas/sinalizadas:
-- Por padrão, ficam fechadas após habilitar RLS. Isso remove exposição pública
-- acidental. Se alguma delas ainda for usada pelo app, crie policies específicas.

-- Applications: leitura do próprio usuário, se a coluna user_id existir.
DO $$
BEGIN
  IF to_regclass('public.applications') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'user_id'
     ) THEN
    CREATE POLICY "Users read own applications"
      ON public.applications
      FOR SELECT
      USING (auth.uid()::text = user_id::text);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Opportunities: leitura pública somente se houver coluna status e status='published'.
DO $$
BEGIN
  IF to_regclass('public.opportunities') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'status'
     ) THEN
    CREATE POLICY "Published opportunities are readable"
      ON public.opportunities
      FOR SELECT
      USING (status = 'published');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Reviews: leitura pública somente se houver coluna is_public=true.
DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_public'
     ) THEN
    CREATE POLICY "Public reviews are readable"
      ON public.reviews
      FOR SELECT
      USING (is_public = true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Reports: relatórios devem ficar privados por padrão. Se a tabela tiver
-- reporter_id ou user_id, o usuário autenticado enxerga somente os próprios.
DO $$
BEGIN
  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'reporter_id'
     ) THEN
    CREATE POLICY "Users read own reports by reporter"
      ON public.reports
      FOR SELECT
      USING (auth.uid()::text = reporter_id::text);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'user_id'
     ) THEN
    CREATE POLICY "Users read own reports by user"
      ON public.reports
      FOR SELECT
      USING (auth.uid()::text = user_id::text);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
