-- =============================================
-- TESSY — Leads médicos para empresas
-- Execute no Supabase SQL Editor antes de usar a aba Leads.
-- Seguro para rodar mais de uma vez.
-- =============================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT,
  doctor_whatsapp TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('company', 'product', 'event', 'course')),
  item_id UUID,
  item_name TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN (
    'representative_contact',
    'sample_request',
    'instagram_partnership',
    'event_interest',
    'course_interest'
  )),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors create own leads" ON public.leads;
CREATE POLICY "Doctors create own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Companies read own leads" ON public.leads;
CREATE POLICY "Companies read own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS leads_company_created_idx
  ON public.leads (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_doctor_created_idx
  ON public.leads (doctor_id, created_at DESC);

NOTIFY pgrst, 'reload schema';
