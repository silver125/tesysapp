CREATE OR REPLACE FUNCTION public.save_connection_feedback(p_lead_id uuid,p_received_reply boolean,p_useful boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l public.leads;
BEGIN
 SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND doctor_id=auth.uid() AND (connection_status='approved' OR intent='representative_contact');
 IF l.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='medico') THEN RAISE EXCEPTION 'Avalie apenas seus contatos registrados.'; END IF;
 IF p_received_reply IS NULL OR (p_received_reply AND p_useful IS NULL) OR (NOT p_received_reply AND p_useful IS NOT NULL) THEN RAISE EXCEPTION 'Resposta inválida.'; END IF;
 INSERT INTO public.connection_feedback(lead_id,doctor_id,company_id,received_reply,useful)
 VALUES(l.id,auth.uid(),l.company_id,p_received_reply,p_useful)
 ON CONFLICT(lead_id) DO UPDATE SET received_reply=excluded.received_reply,useful=excluded.useful,updated_at=now();
END; $$;
