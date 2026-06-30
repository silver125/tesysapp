-- =============================================
-- TESSY — Publicação de produtos, parcerias e eventos
--
-- Corrige bloqueio ao publicar com checkboxes marcados:
-- - RPC confiável grava flags de compliance no servidor
-- - Parcerias não exigem declaração Anvisa de produto
-- - image_url em events/products quando ausente
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

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE OR REPLACE FUNCTION public.validate_product_compliance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(NEW.listing_type, 'product') = 'partnership' THEN
    NEW.anvisa_regularized := TRUE;
    NEW.commercially_available := TRUE;
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.anvisa_regularized, FALSE) IS NOT TRUE
     OR COALESCE(NEW.commercially_available, FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'Confirme a regularizacao vigente na Anvisa e a disponibilidade comercial do produto.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_validate_compliance ON public.products;

CREATE TRIGGER products_validate_compliance
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_compliance();

CREATE OR REPLACE FUNCTION public.publish_company_product(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_listing_type text := COALESCE(NULLIF(payload->>'listing_type', ''), 'product');
  v_anvisa boolean := CASE
    WHEN payload ? 'anvisa_regularized' IS NOT TRUE THEN FALSE
    WHEN jsonb_typeof(payload->'anvisa_regularized') = 'boolean' THEN (payload->'anvisa_regularized')::boolean
    WHEN lower(payload->>'anvisa_regularized') IN ('true', 't', 'yes', '1') THEN TRUE
    ELSE FALSE
  END;
  v_commercial boolean := CASE
    WHEN payload ? 'commercially_available' IS NOT TRUE THEN FALSE
    WHEN jsonb_typeof(payload->'commercially_available') = 'boolean' THEN (payload->'commercially_available')::boolean
    WHEN lower(payload->>'commercially_available') IN ('true', 't', 'yes', '1') THEN TRUE
    ELSE FALSE
  END;
  v_compliance_confirmed boolean := CASE
    WHEN payload ? 'compliance_confirmed' IS NOT TRUE THEN FALSE
    WHEN jsonb_typeof(payload->'compliance_confirmed') = 'boolean' THEN (payload->'compliance_confirmed')::boolean
    WHEN lower(payload->>'compliance_confirmed') IN ('true', 't', 'yes', '1') THEN TRUE
    ELSE FALSE
  END;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Faça login novamente para publicar.';
  END IF;

  IF v_compliance_confirmed OR v_listing_type = 'partnership' THEN
    v_anvisa := TRUE;
    v_commercial := TRUE;
  END IF;

  IF v_listing_type <> 'partnership' THEN
    IF NOT v_anvisa OR NOT v_commercial THEN
      RAISE EXCEPTION 'Confirme a regularizacao vigente na Anvisa e a disponibilidade comercial do produto.';
    END IF;
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
    CASE WHEN v_listing_type = 'partnership' THEN TRUE ELSE v_anvisa END,
    CASE WHEN v_listing_type = 'partnership' THEN TRUE ELSE v_commercial END,
    v_listing_type
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_company_event(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Faça login novamente para publicar.';
  END IF;

  INSERT INTO public.events (
    title,
    description,
    date,
    time,
    location,
    category,
    max_participants,
    registered_count,
    company_id,
    company_name,
    company_whatsapp,
    website,
    image_url
  ) VALUES (
    payload->>'title',
    NULLIF(payload->>'description', ''),
    payload->>'date',
    NULLIF(payload->>'time', ''),
    NULLIF(payload->>'location', ''),
    NULLIF(payload->>'category', ''),
    COALESCE(NULLIF(payload->>'max_participants', '')::integer, 100),
    0,
    v_uid,
    payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''),
    NULLIF(payload->>'website', ''),
    NULLIF(payload->>'image_url', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_product(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_company_event(jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
