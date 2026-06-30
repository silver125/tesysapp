-- Patch: RPC aceita compliance_confirmed=true quando o usuário marcou os checkboxes na UI.
-- Rode no Supabase SQL Editor (idempotente).

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
    CASE WHEN v_listing_type = 'partnership' THEN TRUE ELSE v_anvisa END,
    CASE WHEN v_listing_type = 'partnership' THEN TRUE ELSE v_commercial END,
    v_listing_type
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_product(jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
