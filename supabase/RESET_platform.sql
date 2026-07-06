-- ============================================================
-- TESSY — RESET COMPLETO DA PLATAFORMA
--
-- APAGA TUDO: anúncios, leads, representantes, locais,
-- imagens no storage e TODAS as contas (auth + perfis).
--
-- IRREVERSÍVEL. Rode só em ambiente de teste / homologação.
-- SQL Editor: https://supabase.com/dashboard/project/yuwqqyxnmkgomqjornlm/sql/new
-- ============================================================

BEGIN;

-- Imagens (produtos, eventos, workshops, avatares)
DELETE FROM storage.objects
WHERE bucket_id = 'opportunity-images';

-- Conteúdo publicado e interações
TRUNCATE TABLE public.leads RESTART IDENTITY CASCADE;

DO $$
BEGIN
  IF to_regclass('public.representatives') IS NOT NULL THEN
    TRUNCATE TABLE public.representatives RESTART IDENTITY CASCADE;
  END IF;
  IF to_regclass('public.locations') IS NOT NULL THEN
    TRUNCATE TABLE public.locations RESTART IDENTITY CASCADE;
  END IF;
END $$;

TRUNCATE TABLE public.events RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.courses RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;

-- Contas de login (cascata com perfis já truncados)
DELETE FROM auth.users;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Confirmação
SELECT
  (SELECT count(*) FROM auth.users) AS auth_users,
  (SELECT count(*) FROM public.profiles) AS profiles,
  (SELECT count(*) FROM public.products) AS products,
  (SELECT count(*) FROM public.events) AS events,
  (SELECT count(*) FROM public.courses) AS courses,
  (SELECT count(*) FROM public.leads) AS leads;
