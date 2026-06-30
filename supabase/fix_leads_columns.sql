-- =============================================
-- TESSY — Colunas faltantes na tabela leads
--
-- Corrige: "Could not find the 'company_name' column of 'leads'"
--          "Could not find the 'doctor_name' column of 'leads'"
-- ao marcar interesse / pontuação do médico.
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'product',
  item_name TEXT NOT NULL DEFAULT 'Interesse',
  intent TEXT NOT NULL DEFAULT 'representative_contact',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS doctor_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS doctor_specialty TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS doctor_whatsapp TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS connection_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS connection_requested_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS connection_approved_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS item_id UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interest_points_awarded BOOLEAN NOT NULL DEFAULT FALSE;

-- Preenche nomes em registros antigos
UPDATE public.leads l
SET company_name = COALESCE(p.company, p.company_name, p.name, 'Empresa')
FROM public.profiles p
WHERE l.company_id = p.id
  AND (l.company_name IS NULL OR TRIM(l.company_name) = '');

UPDATE public.leads l
SET doctor_name = COALESCE(p.name, TRIM(CONCAT(p.first_name, ' ', p.last_name)), 'Médico')
FROM public.profiles p
WHERE l.doctor_id = p.id
  AND (l.doctor_name IS NULL OR TRIM(l.doctor_name) = '');

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS leads_company_created_idx
  ON public.leads (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_doctor_created_idx
  ON public.leads (doctor_id, created_at DESC);

NOTIFY pgrst, 'reload schema';

COMMIT;
