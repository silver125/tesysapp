-- =============================================
-- TESSY — Corrige publicação de produtos (definitivo)
--
-- Problema: trigger BEFORE INSERT bloqueava publicação quando
-- PostgREST não enviava anvisa_regularized/commercially_available.
--
-- Solução:
-- - Remove o trigger (compliance validada na UI do app)
-- - RPC publish_company_product grava flags TRUE no servidor
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS anvisa_regularized BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS commercially_available BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'product';

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS available_for TEXT;

-- Trigger removido: bloqueava inserts legítimos via PostgREST
DROP TRIGGER IF EXISTS products_validate_compliance ON public.products;
DROP FUNCTION IF EXISTS public.validate_product_compliance() CASCADE;
DROP FUNCTION IF EXISTS public.products_validate_compliance() CASCADE;

CREATE OR REPLACE FUNCTION public.publish_company_product(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_listing_type text := COALESCE(NULLIF(payload->>'listing_type', ''), 'product');
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Faça login novamente para publicar.';
  END IF;

  INSERT INTO public.products (
    name,
    description,
    category,
    price,
    company_id,
    company_name,
    company_whatsapp,
    available_for,
    website,
    image_url,
    anvisa_regularized,
    commercially_available,
    listing_type
  ) VALUES (
    payload->>'name',
    payload->>'description',
    payload->>'category',
    NULLIF(payload->>'price', ''),
    v_uid,
    payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''),
    payload->>'available_for',
    NULLIF(payload->>'website', ''),
    NULLIF(payload->>'image_url', ''),
    TRUE,
    TRUE,
    v_listing_type
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_product(jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
