-- =============================================
-- TESSY — WhatsApp profissional do médico
-- e conexão aprovada médico/empresa
--
-- Versão conservadora para Supabase SQL Editor:
-- - sem DROP POLICY
-- - sem DELETE
-- - sem UPDATE geral para limpar dados antigos
-- - funções retornam VOID para evitar falso alerta de tabela "v_lead"
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_connection_only BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS connection_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS connection_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connection_approved_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

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

DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'leads'
         AND policyname = 'Doctors read own leads'
     ) THEN
    CREATE POLICY "Doctors read own leads"
      ON public.leads
      FOR SELECT
      USING (auth.uid() = doctor_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'leads'
         AND policyname = 'Companies read own leads'
     ) THEN
    CREATE POLICY "Companies read own leads"
      ON public.leads
      FOR SELECT
      USING (auth.uid() = company_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.request_lead_connection(p_lead_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_company_id UUID;
BEGIN
  SELECT company_id
  INTO lead_company_id
  FROM public.leads
  WHERE id = p_lead_id
  LIMIT 1;

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
  WHERE id = p_lead_id
    AND company_id = auth.uid();
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
  SELECT doctor_id
  INTO lead_doctor_id
  FROM public.leads
  WHERE id = p_lead_id
  LIMIT 1;

  IF lead_doctor_id IS NULL THEN
    RAISE EXCEPTION 'Lead não encontrado.';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> lead_doctor_id THEN
    RAISE EXCEPTION 'Sem permissão para aprovar conexão.';
  END IF;

  SELECT whatsapp
  INTO profile_whatsapp
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;

  UPDATE public.leads
  SET connection_status = 'approved',
      connection_approved_at = NOW(),
      doctor_whatsapp = NULLIF(profile_whatsapp, '')
  WHERE id = p_lead_id
    AND doctor_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_lead_connection(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_lead_connection(UUID) TO authenticated;

CREATE INDEX IF NOT EXISTS leads_doctor_connection_status_idx
  ON public.leads (doctor_id, connection_status, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_company_connection_status_idx
  ON public.leads (company_id, connection_status, created_at DESC);

NOTIFY pgrst, 'reload schema';

COMMIT;
