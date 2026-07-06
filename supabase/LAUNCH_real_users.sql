-- ============================================================
-- TESSY — LAUNCH: preparação para usuários reais
--
-- Execute UMA VEZ no Supabase SQL Editor (produção):
-- https://supabase.com/dashboard/project/_/sql/new
--
-- Idempotente: seguro rodar de novo após deploys parciais.
-- NÃO apaga dados. Para reset total use RESET_platform.sql.
--
-- Depois deste arquivo, rode também (obrigatório antes de médicos reais):
--   supabase/SECURITY_doctors_launch.sql
-- ============================================================

BEGIN;

-- ── 1. Colunas de perfil esperadas pelo app ───────────────────────────────
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_connection_only BOOLEAN NOT NULL DEFAULT TRUE;

-- Policies mínimas de perfil (cadastro e edição)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário cria próprio perfil" ON public.profiles;
CREATE POLICY "Usuário cria próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users create own profile" ON public.profiles;
CREATE POLICY "Users create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 2. Tabela leads (interesses médico → empresa) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT,
  doctor_whatsapp TEXT,
  connection_status TEXT NOT NULL DEFAULT 'none',
  connection_requested_at TIMESTAMPTZ,
  connection_approved_at TIMESTAMPTZ,
  item_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT NOT NULL,
  intent TEXT NOT NULL,
  message TEXT,
  interest_points_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_connection_status_check'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_connection_status_check
      CHECK (connection_status IN ('none', 'requested', 'approved'));
  END IF;
END $$;

-- Remove duplicados antigos antes do índice único
WITH ranked AS (
  SELECT
    ctid,
    row_number() OVER (
      PARTITION BY company_id, doctor_id, item_type,
        COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::uuid), intent
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.leads
)
DELETE FROM public.leads l
USING ranked r
WHERE l.ctid = r.ctid AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS leads_unique_connection_idx
  ON public.leads (
    company_id, doctor_id, item_type,
    COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::uuid),
    intent
  );

DROP POLICY IF EXISTS "Doctors create own leads" ON public.leads;
CREATE POLICY "Doctors create own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors read own leads" ON public.leads;
CREATE POLICY "Doctors read own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Companies read own leads" ON public.leads;
CREATE POLICY "Companies read own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = company_id);

DROP POLICY IF EXISTS "Doctors delete own event leads" ON public.leads;
CREATE POLICY "Doctors delete own event leads"
  ON public.leads FOR DELETE
  USING (
    auth.uid() = doctor_id
    AND item_type = 'event'
    AND intent = 'event_interest'
  );

CREATE INDEX IF NOT EXISTS leads_company_created_idx
  ON public.leads (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_doctor_created_idx
  ON public.leads (doctor_id, created_at DESC);

-- ── 3. Conexões WhatsApp médico/empresa (RPC) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.request_lead_connection(p_lead_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_company_id UUID;
BEGIN
  SELECT company_id INTO lead_company_id
  FROM public.leads WHERE id = p_lead_id LIMIT 1;

  IF lead_company_id IS NULL THEN
    RAISE EXCEPTION 'Lead não encontrado.';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> lead_company_id THEN
    RAISE EXCEPTION 'Sem permissão para solicitar conexão.';
  END IF;

  UPDATE public.leads
  SET connection_status = CASE
        WHEN connection_status = 'approved' THEN 'approved'
        ELSE 'requested'
      END,
      connection_requested_at = COALESCE(connection_requested_at, NOW())
  WHERE id = p_lead_id AND company_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_lead_connection(p_lead_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_doctor_id UUID;
  profile_whatsapp TEXT;
BEGIN
  SELECT doctor_id INTO lead_doctor_id
  FROM public.leads WHERE id = p_lead_id LIMIT 1;

  IF lead_doctor_id IS NULL THEN
    RAISE EXCEPTION 'Lead não encontrado.';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> lead_doctor_id THEN
    RAISE EXCEPTION 'Sem permissão para aprovar conexão.';
  END IF;

  SELECT whatsapp INTO profile_whatsapp
  FROM public.profiles WHERE id = auth.uid() LIMIT 1;

  UPDATE public.leads
  SET connection_status = 'approved',
      connection_approved_at = NOW(),
      doctor_whatsapp = NULLIF(profile_whatsapp, '')
  WHERE id = p_lead_id AND doctor_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_lead_connection(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_lead_connection(UUID) TO authenticated;

-- ── 4. Representantes comerciais ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'Empresa',
  name TEXT NOT NULL,
  specialty TEXT,
  region TEXT,
  city TEXT,
  state TEXT,
  whatsapp TEXT,
  email TEXT,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Representatives readable by authenticated" ON public.representatives;
CREATE POLICY "Representatives readable by authenticated"
  ON public.representatives FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Companies create own representatives" ON public.representatives;
CREATE POLICY "Companies create own representatives"
  ON public.representatives FOR INSERT WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies update own representatives" ON public.representatives;
CREATE POLICY "Companies update own representatives"
  ON public.representatives FOR UPDATE
  USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies delete own representatives" ON public.representatives;
CREATE POLICY "Companies delete own representatives"
  ON public.representatives FOR DELETE USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS representatives_company_created_idx
  ON public.representatives (company_id, created_at DESC);

-- ── 5. Locais de atendimento / distribuição ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ponto_venda',
  address TEXT,
  city TEXT,
  state TEXT,
  whatsapp TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_type_check;
ALTER TABLE public.locations
  ADD CONSTRAINT locations_type_check
  CHECK (type IN (
    'coworking', 'sala_reuniao', 'consultorio', 'clinica', 'hospital',
    'ponto_venda', 'distribuidor', 'farmacia', 'loja', 'outro'
  ));

DROP POLICY IF EXISTS "Locais visíveis por todos" ON public.locations;
CREATE POLICY "Locais visíveis por todos"
  ON public.locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Empresa cria próprio local" ON public.locations;
CREATE POLICY "Empresa cria próprio local"
  ON public.locations FOR INSERT WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Empresa atualiza próprio local" ON public.locations;
CREATE POLICY "Empresa atualiza próprio local"
  ON public.locations FOR UPDATE USING (auth.uid() = company_id);

DROP POLICY IF EXISTS "Empresa deleta próprio local" ON public.locations;
CREATE POLICY "Empresa deleta próprio local"
  ON public.locations FOR DELETE USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS locations_company_idx ON public.locations (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS locations_city_idx ON public.locations (city);

-- ── 6. Privacidade de perfis (CRM/WhatsApp) ───────────────────────────────
DROP POLICY IF EXISTS "Perfis visíveis por todos" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Block direct lead updates" ON public.leads;
CREATE POLICY "Block direct lead updates"
  ON public.leads FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "Block direct lead deletes" ON public.leads;
CREATE POLICY "Block direct lead deletes"
  ON public.leads FOR DELETE TO authenticated USING (false);

-- ── 7. Empresas editam próprio conteúdo (eventos, produtos, workshops) ────
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Companies manage own events" ON public.events;
CREATE POLICY "Companies manage own events"
  ON public.events FOR ALL
  USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies manage own products" ON public.products;
CREATE POLICY "Companies manage own products"
  ON public.products FOR ALL
  USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies manage own courses" ON public.courses;
CREATE POLICY "Companies manage own courses"
  ON public.courses FOR ALL
  USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

-- ── 8. Publicação de produtos (remove triggers bloqueantes + RPC) ─────────
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

DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.products'::regclass AND NOT tgisinternal
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
    name, description, category, price, company_id, company_name,
    company_whatsapp, available_for, website, image_url,
    anvisa_regularized, commercially_available, listing_type
  ) VALUES (
    payload->>'name', payload->>'description', payload->>'category',
    NULLIF(payload->>'price', ''), v_uid, payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''), payload->>'available_for',
    NULLIF(payload->>'website', ''), NULLIF(payload->>'image_url', ''),
    TRUE, TRUE, v_listing_type
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

-- ── 9. Publicação de eventos e workshops + imagens ────────────────────────
ALTER TABLE IF EXISTS public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS public.courses ADD COLUMN IF NOT EXISTS image_url TEXT;

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
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Faça login novamente para publicar.'; END IF;

  INSERT INTO public.events (
    title, description, date, time, location, category, max_participants,
    registered_count, company_id, company_name, company_whatsapp, website, image_url
  ) VALUES (
    payload->>'title', NULLIF(payload->>'description', ''), payload->>'date',
    NULLIF(payload->>'time', ''), NULLIF(payload->>'location', ''),
    NULLIF(payload->>'category', ''),
    COALESCE(NULLIF(payload->>'max_participants', '')::integer, 100),
    0, v_uid, payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''), NULLIF(payload->>'website', ''),
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
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Faça login novamente para publicar.'; END IF;

  v_date := NULLIF(payload->>'date', '')::date;

  INSERT INTO public.courses (
    title, description, category, modality, duration, instructor, price,
    company_id, company_name, company_whatsapp, website,
    date, time, location, image_url
  ) VALUES (
    payload->>'title', NULLIF(payload->>'description', ''),
    NULLIF(payload->>'category', ''), COALESCE(NULLIF(payload->>'modality', ''), 'online'),
    NULLIF(payload->>'duration', ''), NULLIF(payload->>'instructor', ''),
    NULLIF(payload->>'price', ''), v_uid, payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''), NULLIF(payload->>'website', ''),
    v_date, NULLIF(payload->>'time', '')::time, NULLIF(payload->>'location', ''),
    NULLIF(payload->>'image_url', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_event(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_company_course(jsonb) TO authenticated;

-- ── 10. Storage para imagens de oportunidades ─────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunity-images', 'opportunity-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read opportunity images" ON storage.objects;
CREATE POLICY "Public read opportunity images"
  ON storage.objects FOR SELECT USING (bucket_id = 'opportunity-images');

DROP POLICY IF EXISTS "Companies upload opportunity images" ON storage.objects;
CREATE POLICY "Companies upload opportunity images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'opportunity-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Companies update own opportunity images" ON storage.objects;
CREATE POLICY "Companies update own opportunity images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'opportunity-images' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'opportunity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Companies delete own opportunity images" ON storage.objects;
CREATE POLICY "Companies delete own opportunity images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'opportunity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 11. Contagem de inscritos em eventos (via leads) ──────────────────────
CREATE OR REPLACE FUNCTION public.sync_event_registered_count(p_event_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT doctor_id)::INTEGER INTO new_count
  FROM public.leads
  WHERE item_type = 'event' AND intent = 'event_interest' AND item_id = p_event_id;

  UPDATE public.events SET registered_count = new_count
  WHERE id = p_event_id AND registered_count IS DISTINCT FROM new_count;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_event_registered_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_event_registered_count(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_event_lead_count_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('DELETE', 'UPDATE')
    AND OLD.item_type = 'event' AND OLD.intent = 'event_interest' AND OLD.item_id IS NOT NULL
  THEN
    PERFORM public.sync_event_registered_count(OLD.item_id);
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE')
    AND NEW.item_type = 'event' AND NEW.intent = 'event_interest' AND NEW.item_id IS NOT NULL
  THEN
    PERFORM public.sync_event_registered_count(NEW.item_id);
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_sync_event_registered_count ON public.leads;
CREATE TRIGGER leads_sync_event_registered_count
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_event_lead_count_change();

-- ── 12. Gamificação: pontos por interesse ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.award_doctor_interest_points(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id UUID;
  v_already_awarded BOOLEAN;
  points_award INTEGER := 10;
BEGIN
  SELECT doctor_id, COALESCE(interest_points_awarded, FALSE)
  INTO v_doctor_id, v_already_awarded
  FROM public.leads WHERE id = p_lead_id LIMIT 1;

  IF v_doctor_id IS NULL THEN RETURN 0; END IF;
  IF auth.uid() IS NULL OR auth.uid() <> v_doctor_id THEN
    RAISE EXCEPTION 'Sem permissão para registrar pontos de interesse.';
  END IF;
  IF v_already_awarded THEN RETURN 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_doctor_id AND role = 'medico') THEN
    RETURN 0;
  END IF;

  UPDATE public.profiles SET points = COALESCE(points, 0) + points_award WHERE id = v_doctor_id;
  UPDATE public.leads SET interest_points_awarded = TRUE WHERE id = p_lead_id;

  RETURN points_award;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_doctor_interest_points(UUID) TO authenticated;

-- ── 13. Logos de empresas (sem expor CRM/WhatsApp de perfis) ──────────────
CREATE OR REPLACE FUNCTION public.get_company_branding(company_ids uuid[])
RETURNS TABLE (id uuid, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, NULLIF(trim(p.avatar_url), '') AS avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(company_ids) AND coalesce(p.role, '') = 'empresa';
$$;

REVOKE ALL ON FUNCTION public.get_company_branding(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_branding(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_branding(uuid[]) TO anon;

-- ── 14. Exclusão de conta pelo próprio usuário ────────────────────────────
DROP POLICY IF EXISTS "Usuário deleta próprio perfil" ON public.profiles;
CREATE POLICY "Usuário deleta próprio perfil"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado.'; END IF;
  DELETE FROM public.profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verificação rápida pós-execução
SELECT
  to_regclass('public.leads') IS NOT NULL AS leads_ok,
  to_regclass('public.representatives') IS NOT NULL AS reps_ok,
  to_regclass('public.locations') IS NOT NULL AS locations_ok,
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'publish_company_product') AS product_rpc_ok,
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_company_branding') AS branding_rpc_ok;
