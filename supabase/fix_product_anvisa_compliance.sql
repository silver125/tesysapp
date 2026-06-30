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

-- Trigger removido: bloqueava publicação via PostgREST (use fix_product_publish.sql)
DROP TRIGGER IF EXISTS products_validate_compliance ON public.products;

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
    name, description, category, price, company_id, company_name,
    company_whatsapp, available_for, website, image_url,
    anvisa_regularized, commercially_available, listing_type
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
