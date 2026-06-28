-- =============================================
-- TESSY — Pontos e gamificação do médico
--
-- Objetivo:
-- - Médicos acumulam pontos cada vez que CONCRETIZAM uma conexão
--   com uma empresa (quando o médico aprova e libera o WhatsApp).
-- - +50 pontos por conexão aprovada, contados apenas UMA vez por lead
--   (a transição 'requested'/'none' → 'approved').
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- Não apaga nem zera dados existentes.
-- =============================================

BEGIN;

-- 1. Coluna de pontos no perfil do médico
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- 2. Aprovar conexão premiando pontos (idempotente por lead)
--    Substitui a função anterior: além de aprovar e liberar o WhatsApp,
--    soma +50 pontos ao médico somente quando o lead ainda não estava aprovado.
CREATE OR REPLACE FUNCTION public.approve_lead_connection(p_lead_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_doctor_id   UUID;
  lead_status      TEXT;
  profile_whatsapp TEXT;
  points_award     INTEGER := 50;
BEGIN
  SELECT doctor_id, connection_status
  INTO lead_doctor_id, lead_status
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

  -- Premia o médico apenas na primeira vez que a conexão é concretizada.
  IF lead_status IS DISTINCT FROM 'approved' THEN
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + points_award
    WHERE id = auth.uid();
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_lead_connection(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
