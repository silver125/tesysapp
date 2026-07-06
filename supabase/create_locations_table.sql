-- =============================================
-- TESSY — Locais de atendimento / distribuição (empresas)
--
-- Objetivo:
-- - Empresas divulgam onde seus produtos podem ser encontrados:
--   pontos de venda, distribuidores, clínicas parceiras, farmácias, etc.
-- - Médicos visualizam esses locais ao conhecer a empresa.
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'coworking'
                  CHECK (type IN (
                    'coworking','sala_reuniao','consultorio','clinica','hospital',
                    'ponto_venda','distribuidor','farmacia','loja','outro'
                  )),
  address       TEXT,
  city          TEXT,
  state         TEXT,
  whatsapp      TEXT,
  phone         TEXT,
  website       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Locais visíveis por todos" ON public.locations;
CREATE POLICY "Locais visíveis por todos"
  ON public.locations
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Empresa cria próprio local" ON public.locations;
CREATE POLICY "Empresa cria próprio local"
  ON public.locations
  FOR INSERT
  WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Empresa atualiza próprio local" ON public.locations;
CREATE POLICY "Empresa atualiza próprio local"
  ON public.locations
  FOR UPDATE
  USING (auth.uid() = company_id);

DROP POLICY IF EXISTS "Empresa deleta próprio local" ON public.locations;
CREATE POLICY "Empresa deleta próprio local"
  ON public.locations
  FOR DELETE
  USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS locations_company_idx
  ON public.locations (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS locations_city_idx
  ON public.locations (city);

NOTIFY pgrst, 'reload schema';

COMMIT;
