-- =============================================
-- TESSY — Sincronizar vagas de eventos por leads
--
-- Objetivo:
-- - Fazer events.registered_count refletir os médicos inscritos via leads.
-- - Garantir que novos usuários vejam vagas restantes corretas.
-- - Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

CREATE OR REPLACE FUNCTION public.sync_event_registered_count(p_event_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT doctor_id)::INTEGER
    INTO new_count
  FROM public.leads
  WHERE item_type = 'event'
    AND intent = 'event_interest'
    AND item_id = p_event_id;

  UPDATE public.events
  SET registered_count = new_count
  WHERE id = p_event_id
    AND registered_count IS DISTINCT FROM new_count;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_event_registered_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_event_registered_count(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_event_lead_count_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('DELETE', 'UPDATE')
    AND OLD.item_type = 'event'
    AND OLD.intent = 'event_interest'
    AND OLD.item_id IS NOT NULL
  THEN
    PERFORM public.sync_event_registered_count(OLD.item_id);
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE')
    AND NEW.item_type = 'event'
    AND NEW.intent = 'event_interest'
    AND NEW.item_id IS NOT NULL
  THEN
    PERFORM public.sync_event_registered_count(NEW.item_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_sync_event_registered_count ON public.leads;
CREATE TRIGGER leads_sync_event_registered_count
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_lead_count_change();

NOTIFY pgrst, 'reload schema';

COMMIT;
