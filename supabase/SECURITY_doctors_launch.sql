-- ============================================================
-- TESSY — Segurança antes de médicos reais (LGPD / PII)
--
-- Rode no Supabase SQL Editor ANTES de convidar médicos.
-- Idempotente. Execute DEPOIS de fix_rls_advisor.sql, se usado.
-- ============================================================

BEGIN;

-- ── 1) Perfis: só o próprio usuário lê WhatsApp/CRM ──
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis visíveis por todos" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Block direct lead updates" ON public.leads;
CREATE POLICY "Block direct lead updates"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS "Block direct lead deletes" ON public.leads;
CREATE POLICY "Block direct lead deletes"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (false);

-- ── 2) Impede médico virar empresa via UPDATE direto ──
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Alteração de tipo de perfil não permitida.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- ── 3) RPCs de publicação: só conta empresa ──
CREATE OR REPLACE FUNCTION public.assert_empresa_user(p_uid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_uid IS NULL THEN
    RAISE EXCEPTION 'Faça login novamente para publicar.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'empresa'
  ) THEN
    RAISE EXCEPTION 'Apenas contas empresa podem publicar anúncios.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_empresa_user(uuid) FROM PUBLIC;

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
  PERFORM public.assert_empresa_user(v_uid);

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
  PERFORM public.assert_empresa_user(v_uid);

  INSERT INTO public.events (
    title, description, date, time, location, category,
    max_participants, registered_count, company_id, company_name,
    company_whatsapp, website, image_url
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

CREATE OR REPLACE FUNCTION public.publish_company_course(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_date date;
BEGIN
  PERFORM public.assert_empresa_user(v_uid);

  v_date := NULLIF(payload->>'date', '')::date;

  INSERT INTO public.courses (
    title, description, category, modality, duration, instructor, price,
    company_id, company_name, company_whatsapp, website,
    date, time, location, image_url
  ) VALUES (
    payload->>'title',
    NULLIF(payload->>'description', ''),
    NULLIF(payload->>'category', ''),
    COALESCE(NULLIF(payload->>'modality', ''), 'online'),
    NULLIF(payload->>'duration', ''),
    NULLIF(payload->>'instructor', ''),
    NULLIF(payload->>'price', ''),
    v_uid,
    payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''),
    NULLIF(payload->>'website', ''),
    v_date,
    NULLIF(payload->>'time', '')::time,
    NULLIF(payload->>'location', ''),
    NULLIF(payload->>'image_url', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_product(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_company_event(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_company_course(jsonb) TO authenticated;

-- ── 4) Exclusão de conta: perfil + auth + imagens do usuário ──
DROP POLICY IF EXISTS "Usuário deleta próprio perfil" ON public.profiles;
CREATE POLICY "Usuário deleta próprio perfil"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'opportunity-images'
    AND (storage.foldername(name))[1] = uid::text;

  DELETE FROM public.profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verificação rápida:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'SELECT';
