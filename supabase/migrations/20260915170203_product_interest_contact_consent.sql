-- Product interest is the doctor's explicit consent; company acceptance completes it.
-- Legacy leads are deliberately not backfilled.
ALTER TABLE public.leads ADD COLUMN contact_consent_at timestamptz;
ALTER TABLE public.leads ADD COLUMN contact_consent_version text;

CREATE TABLE private.lead_contact_consents (
  lead_id uuid PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  whatsapp text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  version text NOT NULL CHECK (version = 'product-contact-v1')
);
ALTER TABLE private.lead_contact_consents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.lead_contact_consents FROM PUBLIC, anon, authenticated;

-- Clients may submit legacy interests, but cannot forge approvals, consent or points.
REVOKE INSERT, UPDATE ON public.leads FROM PUBLIC, anon, authenticated;
GRANT INSERT (id,company_id,doctor_id,company_name,doctor_name,doctor_specialty,item_type,item_id,item_name,intent,message,created_at) ON public.leads TO authenticated;

CREATE OR REPLACE FUNCTION private.company_can_read_lead_doctor_profile(p_doctor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.leads WHERE doctor_id = p_doctor_id
    AND company_id = auth.uid() AND connection_status = 'approved');
$$;

CREATE FUNCTION private.register_product_contact(p_product_id uuid, p_consent_version text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  d public.profiles; p public.products; l public.leads;
  v_intent text; v_created boolean := false; v_points integer := 0; v_phone text;
BEGIN
  SELECT * INTO d FROM public.profiles WHERE id=auth.uid() AND role='medico';
  IF d.id IS NULL THEN RAISE EXCEPTION 'Entre com seu perfil médico.'; END IF;
  IF p_consent_version IS DISTINCT FROM 'product-contact-v1' THEN RAISE EXCEPTION 'Confirme a autorização de contato.'; END IF;
  v_phone := regexp_replace(coalesce(d.whatsapp,''), '[^0-9]', '', 'g');
  IF length(v_phone) NOT BETWEEN 10 AND 15 THEN RAISE EXCEPTION 'Cadastre um WhatsApp válido no perfil.'; END IF;
  SELECT * INTO p FROM public.products WHERE id=p_product_id;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Produto não disponível. Atualize a página.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=p.company_id AND role='empresa') THEN RAISE EXCEPTION 'Empresa não disponível.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(d.id::text || p_product_id::text,0));
  v_intent := CASE WHEN p.listing_type='partnership' THEN 'instagram_partnership' ELSE 'sample_request' END;
  SELECT * INTO l FROM public.leads WHERE doctor_id=d.id AND company_id=p.company_id
    AND item_type='product' AND item_id=p.id AND intent=v_intent FOR UPDATE;
  IF l.id IS NULL THEN
    INSERT INTO public.leads(company_id,doctor_id,company_name,doctor_name,doctor_specialty,item_type,item_id,item_name,intent)
    VALUES (p.company_id,d.id,p.company_name,d.name,d.specialty,'product',p.id,p.name,v_intent) ON CONFLICT DO NOTHING RETURNING * INTO l;
    v_created := FOUND;
    IF NOT v_created THEN
      SELECT * INTO l FROM public.leads WHERE doctor_id=d.id AND company_id=p.company_id
        AND item_type='product' AND item_id=p.id AND intent=v_intent FOR UPDATE;
      IF l.id IS NULL THEN RAISE EXCEPTION 'Não foi possível registrar interesse. Tente novamente.'; END IF;
    END IF;
  END IF;
  -- Retrying an interest must never silently upgrade a legacy consent.
  IF v_created THEN
    INSERT INTO private.lead_contact_consents(lead_id,doctor_id,company_id,whatsapp,version)
    VALUES(l.id,d.id,p.company_id,v_phone,p_consent_version);
    UPDATE public.leads SET contact_consent_at=now(),contact_consent_version=p_consent_version
    WHERE id=l.id RETURNING * INTO l;
  END IF;
  IF NOT l.interest_points_awarded THEN
    UPDATE public.leads SET interest_points_awarded=true WHERE id=l.id RETURNING * INTO l;
    UPDATE public.profiles SET points=points+10 WHERE id=d.id;
    v_points := 10;
  END IF;
  RETURN jsonb_build_object('lead',to_jsonb(l),'created',v_created,'pointsAwarded',v_points);
END;
$$;
CREATE FUNCTION public.register_product_interest(p_product_id uuid,p_consent_version text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT private.register_product_contact(p_product_id,p_consent_version);
$$;

CREATE FUNCTION private.accept_product_contact(p_lead_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE l public.leads; c private.lead_contact_consents;
BEGIN
  SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND company_id=auth.uid() FOR UPDATE;
  IF l.id IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='empresa') THEN
    RAISE EXCEPTION 'Contato não encontrado ou sem permissão.';
  END IF;
  SELECT * INTO c FROM private.lead_contact_consents WHERE lead_id=l.id AND doctor_id=l.doctor_id AND company_id=l.company_id;
  IF c.lead_id IS NULL THEN RAISE EXCEPTION 'Este interesse ainda precisa da autorização do médico.'; END IF;
  IF l.connection_status IS DISTINCT FROM 'approved' THEN
    UPDATE public.leads SET connection_status='approved',connection_approved_at=now(),
      doctor_whatsapp=c.whatsapp WHERE id=l.id RETURNING * INTO l;
    UPDATE public.profiles SET points=points+50 WHERE id=l.doctor_id;
  END IF;
  RETURN to_jsonb(l);
END;
$$;
CREATE FUNCTION public.accept_product_interest(p_lead_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT private.accept_product_contact(p_lead_id);
$$;

-- Preserve the legacy invitation flow, with locking and strict transition checks.
CREATE OR REPLACE FUNCTION public.approve_lead_connection(p_lead_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE l public.leads; v_phone text;
BEGIN
  SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND doctor_id=auth.uid() FOR UPDATE;
  IF l.id IS NULL THEN RAISE EXCEPTION 'Contato não encontrado ou sem permissão.'; END IF;
  IF l.connection_status='approved' THEN RETURN; END IF;
  IF l.connection_status IS DISTINCT FROM 'requested' THEN RAISE EXCEPTION 'A empresa ainda não solicitou a conexão.'; END IF;
  SELECT regexp_replace(coalesce(whatsapp,''),'[^0-9]','','g') INTO v_phone
    FROM public.profiles WHERE id=auth.uid() AND role='medico';
  IF v_phone IS NULL OR length(v_phone) NOT BETWEEN 10 AND 15 THEN RAISE EXCEPTION 'Cadastre um WhatsApp válido no perfil.'; END IF;
  UPDATE public.leads SET connection_status='approved',connection_approved_at=now(),doctor_whatsapp=v_phone WHERE id=l.id;
  UPDATE public.profiles SET points=points+50 WHERE id=l.doctor_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.request_lead_connection(p_lead_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE l public.leads;
BEGIN
  SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND company_id=auth.uid() FOR UPDATE;
  IF l.id IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='empresa') THEN
    RAISE EXCEPTION 'Contato não encontrado ou sem permissão.';
  END IF;
  IF l.contact_consent_at IS NOT NULL THEN
    PERFORM private.accept_product_contact(l.id);
  ELSIF l.connection_status IS DISTINCT FROM 'approved' THEN
    UPDATE public.leads SET connection_status='requested',connection_requested_at=coalesce(connection_requested_at,now()) WHERE id=l.id;
  END IF;
END;
$$;
CREATE OR REPLACE FUNCTION public.award_doctor_interest_points(p_lead_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE l public.leads;
BEGIN
  SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND doctor_id=auth.uid() FOR UPDATE;
  IF l.id IS NULL THEN RAISE EXCEPTION 'Contato não encontrado ou sem permissão.'; END IF;
  IF l.interest_points_awarded THEN RETURN 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='medico') THEN RETURN 0; END IF;
  UPDATE public.leads SET interest_points_awarded=true WHERE id=l.id;
  UPDATE public.profiles SET points=points+10 WHERE id=l.doctor_id;
  RETURN 10;
END;
$$;
REVOKE ALL ON FUNCTION private.register_product_contact(uuid,text),private.accept_product_contact(uuid),
  public.register_product_interest(uuid,text),public.accept_product_interest(uuid),
  public.approve_lead_connection(uuid),public.request_lead_connection(uuid),public.award_doctor_interest_points(uuid) FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.register_product_contact(uuid,text),private.accept_product_contact(uuid),
  public.register_product_interest(uuid,text),public.accept_product_interest(uuid),
  public.approve_lead_connection(uuid),public.request_lead_connection(uuid),public.award_doctor_interest_points(uuid) TO authenticated;
NOTIFY pgrst,'reload schema';
