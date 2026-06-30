-- =============================================
-- TESSY — Cadastro de representantes (empresa)
--
-- Cria a tabela public.representatives para a empresa
-- cadastrar representantes (nome, foto, região, especialidade,
-- WhatsApp). Médicos enxergam esses representantes na vitrine.
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

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

-- Leitura pública (vitrine para médicos autenticados)
DROP POLICY IF EXISTS "Representatives readable by authenticated" ON public.representatives;
CREATE POLICY "Representatives readable by authenticated"
  ON public.representatives FOR SELECT
  TO authenticated
  USING (true);

-- Empresa cria os próprios representantes
DROP POLICY IF EXISTS "Companies create own representatives" ON public.representatives;
CREATE POLICY "Companies create own representatives"
  ON public.representatives FOR INSERT
  WITH CHECK (auth.uid() = company_id);

-- Empresa edita os próprios representantes
DROP POLICY IF EXISTS "Companies update own representatives" ON public.representatives;
CREATE POLICY "Companies update own representatives"
  ON public.representatives FOR UPDATE
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

-- Empresa exclui os próprios representantes
DROP POLICY IF EXISTS "Companies delete own representatives" ON public.representatives;
CREATE POLICY "Companies delete own representatives"
  ON public.representatives FOR DELETE
  USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS representatives_company_created_idx
  ON public.representatives (company_id, created_at DESC);

NOTIFY pgrst, 'reload schema';

COMMIT;
