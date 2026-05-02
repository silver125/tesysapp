-- =============================================
-- TESSY — Conexões médico/empresa em tempo real
--
-- Objetivo:
-- - Evitar leads duplicados do mesmo médico para o mesmo item/intenção.
-- - Permitir que médico cancele o próprio interesse em evento.
-- - Permitir que empresa leia os leads recebidos.
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- Não apaga produtos, eventos, empresas nem médicos.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

-- Remove duplicados antigos, mantendo o registro mais recente da mesma relação.
WITH ranked AS (
  SELECT
    ctid,
    row_number() OVER (
      PARTITION BY
        company_id,
        doctor_id,
        item_type,
        COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::uuid),
        intent
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.leads
)
DELETE FROM public.leads l
USING ranked r
WHERE l.ctid = r.ctid
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS leads_unique_connection_idx
  ON public.leads (
    company_id,
    doctor_id,
    item_type,
    COALESCE(item_id, '00000000-0000-0000-0000-000000000000'::uuid),
    intent
  );

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

CREATE INDEX IF NOT EXISTS leads_company_created_idx
  ON public.leads (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_doctor_created_idx
  ON public.leads (doctor_id, created_at DESC);

NOTIFY pgrst, 'reload schema';

COMMIT;
