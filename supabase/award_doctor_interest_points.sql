-- =============================================
-- TESSY — Pontos ao marcar interesse (médico)
--
-- +10 pts quando o médico registra interesse em
-- produto, workshop, evento ou empresa (1x por lead).
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS interest_points_awarded BOOLEAN NOT NULL DEFAULT FALSE;

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
  FROM public.leads
  WHERE id = p_lead_id
  LIMIT 1;

  IF v_doctor_id IS NULL THEN
    RETURN 0;
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> v_doctor_id THEN
    RAISE EXCEPTION 'Sem permissão para registrar pontos de interesse.';
  END IF;

  IF v_already_awarded THEN
    RETURN 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_doctor_id AND role = 'medico'
  ) THEN
    RETURN 0;
  END IF;

  UPDATE public.profiles
  SET points = COALESCE(points, 0) + points_award
  WHERE id = v_doctor_id;

  UPDATE public.leads
  SET interest_points_awarded = TRUE
  WHERE id = p_lead_id;

  RETURN points_award;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_doctor_interest_points(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
