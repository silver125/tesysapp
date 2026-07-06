-- ============================================================
-- TESSY — Privacidade de perfis (WhatsApp, CRM)
--
-- Problema: policy "SELECT USING (true)" expõe whatsapp/CRM de
-- todos os médicos para qualquer usuário autenticado (ou anônimo).
--
-- Solução: cada usuário só lê o próprio perfil completo.
-- Nome/especialidade do médico vêm da tabela leads (denormalizado).
--
-- Rode no Supabase SQL Editor (idempotente).
-- ============================================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis visíveis por todos" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Garante que leads não aceitem UPDATE direto (só via RPC)
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

NOTIFY pgrst, 'reload schema';

COMMIT;
