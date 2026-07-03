-- ============================================================
-- TESSY — EXECUTE ESTE ARQUIVO INTEIRO UMA VEZ (corrige publicação de produtos)
-- ============================================================

BEGIN;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS anvisa_regularized BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS commercially_available BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'product';

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS available_for TEXT;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE public.products
  ALTER COLUMN anvisa_regularized SET DEFAULT TRUE;

ALTER TABLE public.products
  ALTER COLUMN commercially_available SET DEFAULT TRUE;

-- Remove TODOS os triggers de validação em products (nomes legados variam)
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.products'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.products', t.tgname);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.validate_product_compliance() CASCADE;
DROP FUNCTION IF EXISTS public.products_validate_compliance() CASCADE;
DROP FUNCTION IF EXISTS public.check_product_compliance() CASCADE;

CREATE OR REPLACE FUNCTION public.tessy_publish_product(payload jsonb)
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

CREATE OR REPLACE FUNCTION public.publish_company_product(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.tessy_publish_product(payload);
END;
$$;

GRANT EXECUTE ON FUNCTION public.tessy_publish_product(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_company_product(jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
