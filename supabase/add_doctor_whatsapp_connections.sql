-- =============================================
-- TESSY — WhatsApp profissional do médico
-- e conexão aprovada médico/empresa
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- Não apaga médicos, empresas, produtos, eventos nem leads.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_connection_only BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS connection_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS connection_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connection_approved_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors create own leads" ON public.leads;
CREATE POLICY "Doctors create own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors read own leads" ON public.leads;
CREATE POLICY "Doctors read own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors delete own event leads" ON public.leads;
CREATE POLICY "Doctors delete own event leads"
  ON public.leads
  FOR DELETE
  USING (
    auth.uid() = doctor_id
    AND item_type = 'event'
    AND intent = 'event_interest'
  );

DROP POLICY IF EXISTS "Companies read own leads" ON public.leads;
CREATE POLICY "Companies read own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = company_id);

DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'leads_connection_status_check'
         AND conrelid = 'public.leads'::regclass
     ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_connection_status_check
      CHECK (connection_status IN ('none', 'requested', 'approved'));
  END IF;
END $$;

-- Segurança: WhatsApp do médico só fica gravado no lead depois de aprovação.
UPDATE public.leads
SET doctor_whatsapp = NULL
WHERE connection_status <> 'approved'
  AND doctor_whatsapp IS NOT NULL;

CREATE OR REPLACE FUNCTION public.request_lead_connection(p_lead_id UUID)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  SELECT *
  INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead não encontrado.';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> v_lead.company_id THEN
    RAISE EXCEPTION 'Sem permissão para solicitar conexão.';
  END IF;

  UPDATE public.leads
  SET connection_status = CASE
        WHEN connection_status = 'approved' THEN 'approved'
        ELSE 'requested'
      END,
      connection_requested_at = COALESCE(connection_requested_at, NOW())
  WHERE id = p_lead_id
    AND company_id = auth.uid()
  RETURNING *
  INTO v_lead;

  RETURN v_lead;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_lead_connection(p_lead_id UUID)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
  v_whatsapp TEXT;
BEGIN
  SELECT *
  INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead não encontrado.';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> v_lead.doctor_id THEN
    RAISE EXCEPTION 'Sem permissão para aprovar conexão.';
  END IF;

  SELECT whatsapp
  INTO v_whatsapp
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;

  UPDATE public.leads
  SET connection_status = 'approved',
      connection_approved_at = NOW(),
      doctor_whatsapp = NULLIF(v_whatsapp, '')
  WHERE id = p_lead_id
    AND doctor_id = auth.uid()
  RETURNING *
  INTO v_lead;

  RETURN v_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.request_lead_connection(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_lead_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_lead_connection(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_lead_connection(UUID) TO authenticated;

CREATE INDEX IF NOT EXISTS leads_doctor_connection_status_idx
  ON public.leads (doctor_id, connection_status, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_company_connection_status_idx
  ON public.leads (company_id, connection_status, created_at DESC);

NOTIFY pgrst, 'reload schema';

COMMIT;
