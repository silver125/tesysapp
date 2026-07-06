-- ============================================================
-- TESSY — Logos públicos de empresas (sem expor WhatsApp/CRM)
--
-- Permite que médicos vejam avatar_url das empresas nos cards
-- de representante, sem reabrir leitura total de profiles.
--
-- Rode no Supabase SQL Editor (idempotente).
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_company_branding(company_ids uuid[])
RETURNS TABLE (id uuid, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, NULLIF(trim(p.avatar_url), '') AS avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(company_ids)
    AND coalesce(p.role, '') = 'empresa';
$$;

REVOKE ALL ON FUNCTION public.get_company_branding(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_branding(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_branding(uuid[]) TO anon;

NOTIFY pgrst, 'reload schema';

COMMIT;
