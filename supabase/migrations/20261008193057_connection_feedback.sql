CREATE TABLE public.connection_feedback (
 lead_id uuid PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
 doctor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 company_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 received_reply boolean NOT NULL,
 useful boolean,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((received_reply AND useful IS NOT NULL) OR (NOT received_reply AND useful IS NULL))
);
ALTER TABLE public.connection_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.connection_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.connection_feedback TO authenticated;
CREATE POLICY "Doctor reads own feedback" ON public.connection_feedback FOR SELECT TO authenticated USING(doctor_id=(SELECT auth.uid()));
CREATE INDEX connection_feedback_company_idx ON public.connection_feedback(company_id);
CREATE INDEX connection_feedback_doctor_idx ON public.connection_feedback(doctor_id);
CREATE FUNCTION public.save_connection_feedback(p_lead_id uuid,p_received_reply boolean,p_useful boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l public.leads;
BEGIN
 SELECT * INTO l FROM public.leads WHERE id=p_lead_id AND doctor_id=auth.uid() AND connection_status='approved';
 IF l.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='medico') THEN RAISE EXCEPTION 'Avalie apenas suas conexões aprovadas.'; END IF;
 IF p_received_reply IS NULL OR (p_received_reply AND p_useful IS NULL) OR (NOT p_received_reply AND p_useful IS NOT NULL) THEN RAISE EXCEPTION 'Resposta inválida.'; END IF;
 INSERT INTO public.connection_feedback(lead_id,doctor_id,company_id,received_reply,useful)
 VALUES(l.id,auth.uid(),l.company_id,p_received_reply,p_useful)
 ON CONFLICT(lead_id) DO UPDATE SET received_reply=excluded.received_reply,useful=excluded.useful,updated_at=now();
END; $$;
CREATE FUNCTION public.delete_connection_feedback(p_lead_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 DELETE FROM public.connection_feedback WHERE lead_id=p_lead_id AND doctor_id=auth.uid();
$$;
-- No recipient IDs, text comments or physician-level breakdowns are exposed to companies.
CREATE FUNCTION public.company_feedback_summary()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE n integer; useful_n integer; reply_rate numeric; useful_rate numeric;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='empresa') THEN RAISE EXCEPTION 'Acesso exclusivo da empresa.'; END IF;
 -- Equal weight per doctor, even if one doctor has many connections.
 SELECT count(*),count(helpful), round(avg(reply)*10)*10, round(avg(helpful)*10)*10 INTO n,useful_n,reply_rate,useful_rate FROM (
  SELECT doctor_id, avg(received_reply::int) reply, avg(useful::int) helpful
  FROM public.connection_feedback WHERE company_id=auth.uid() GROUP BY doctor_id
 ) per_doctor;
 IF n<5 THEN RETURN jsonb_build_object('available',false,'minimum',5); END IF;
 RETURN jsonb_build_object('available',true,'doctors',n,'replyPercent',reply_rate,'usefulPercent',CASE WHEN useful_n>=5 THEN useful_rate ELSE NULL END,'period','Todo o histórico');
END; $$;
REVOKE ALL ON FUNCTION public.save_connection_feedback(uuid,boolean,boolean),public.delete_connection_feedback(uuid),public.company_feedback_summary() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_connection_feedback(uuid,boolean,boolean),public.delete_connection_feedback(uuid),public.company_feedback_summary() TO authenticated;
NOTIFY pgrst,'reload schema';
