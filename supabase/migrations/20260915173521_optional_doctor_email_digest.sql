CREATE TABLE public.doctor_email_preferences (
 doctor_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 frequency text NOT NULL DEFAULT 'off' CHECK(frequency IN ('off','daily','weekly')),
 opted_in_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_email_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.doctor_email_preferences FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.doctor_email_preferences TO authenticated;
GRANT ALL ON public.doctor_email_preferences TO service_role;
CREATE POLICY "Doctor reads own email preferences" ON public.doctor_email_preferences FOR SELECT TO authenticated USING(doctor_id=auth.uid());
CREATE TABLE private.doctor_email_state (
 doctor_id uuid PRIMARY KEY REFERENCES public.doctor_email_preferences(doctor_id) ON DELETE CASCADE,
 unsubscribe_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
 last_attempt_at timestamptz, last_checked_at timestamptz
);
CREATE TABLE private.doctor_email_dispatches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 doctor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'claimed' CHECK(status IN ('claimed','accepted','uncertain')),
 item_keys text[] NOT NULL, completed_at timestamptz
);
ALTER TABLE private.doctor_email_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.doctor_email_dispatches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.doctor_email_state,private.doctor_email_dispatches FROM PUBLIC,anon,authenticated;
CREATE INDEX ON private.doctor_email_dispatches(doctor_id,created_at DESC);

CREATE FUNCTION public.set_doctor_email_frequency(p_frequency text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='medico') THEN RAISE EXCEPTION 'Apenas médicos podem configurar estes avisos.'; END IF;
 IF p_frequency IS NULL OR p_frequency NOT IN ('off','daily','weekly') THEN RAISE EXCEPTION 'Frequência inválida.'; END IF;
 INSERT INTO public.doctor_email_preferences(doctor_id,frequency,opted_in_at)
 VALUES(auth.uid(),p_frequency,CASE WHEN p_frequency='off' THEN NULL ELSE now() END)
 ON CONFLICT(doctor_id) DO UPDATE SET frequency=p_frequency,
 opted_in_at=CASE WHEN p_frequency='off' THEN NULL WHEN doctor_email_preferences.frequency='off' THEN now() ELSE doctor_email_preferences.opted_in_at END,updated_at=now();
 INSERT INTO private.doctor_email_state(doctor_id) VALUES(auth.uid()) ON CONFLICT DO NOTHING;
 RETURN p_frequency;
END; $$;
REVOKE ALL ON FUNCTION public.set_doctor_email_frequency(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_doctor_email_frequency(text) TO authenticated;

-- Service-only atomic claim. No default subscriptions, no arbitrary recipients.
CREATE FUNCTION public.claim_doctor_email_digest()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r record; v_items jsonb; v_keys text[]; v_id uuid;
BEGIN
 -- Conservative initial rollout: at most 10 attempts per day, including uncertain SMTP results.
 PERFORM pg_advisory_xact_lock(74291357);
 IF (SELECT count(*) FROM private.doctor_email_dispatches WHERE created_at>now()-interval '24 hours')>=10 THEN RETURN NULL; END IF;
 FOR r IN SELECT p.*,pr.doctor_interests,pr.specialty,s.unsubscribe_token,s.last_attempt_at,u.email
 FROM public.doctor_email_preferences p JOIN public.profiles pr ON pr.id=p.doctor_id
 JOIN private.doctor_email_state s ON s.doctor_id=p.doctor_id JOIN auth.users u ON u.id=p.doctor_id
 WHERE p.frequency<>'off' AND p.opted_in_at IS NOT NULL AND pr.role='medico'
 AND u.email IS NOT NULL AND u.email_confirmed_at IS NOT NULL AND u.deleted_at IS NULL
 AND coalesce(s.last_attempt_at,p.opted_in_at)<=now()-CASE WHEN p.frequency='weekly' THEN interval '7 days' ELSE interval '1 day' END
 ORDER BY s.last_checked_at NULLS FIRST,s.last_attempt_at NULLS FIRST,p.opted_in_at LIMIT 100
 FOR UPDATE OF s SKIP LOCKED
 LOOP
  UPDATE private.doctor_email_state SET last_checked_at=now() WHERE doctor_id=r.doctor_id;
  SELECT jsonb_agg(to_jsonb(c)),array_agg(c.type||':'||c.id) INTO v_items,v_keys FROM (
   SELECT * FROM (
    SELECT p.id::text,'product'::text type,p.name title,p.company_name "companyName",p.created_at "createdAt"
    FROM public.products p WHERE p.created_at>=r.opted_in_at
     AND p.commercially_available IS TRUE
     AND ((coalesce(r.doctor_interests,'{}') && ARRAY['Produtos','Amostras']) OR (p.listing_type='partnership' AND coalesce(r.doctor_interests,'{}') && ARRAY['Representantes','Serviços']))
    UNION ALL
    SELECT e.id::text,'event',e.title,e.company_name,e.created_at FROM public.events e
    WHERE e.created_at>=r.opted_in_at AND e.date::date>=current_date AND coalesce(r.doctor_interests,'{}') && ARRAY['Eventos']
    UNION ALL
    SELECT c.id::text,'course',c.title,c.company_name,c.created_at FROM public.courses c
    WHERE c.created_at>=r.opted_in_at AND c.date::date>=current_date AND coalesce(r.doctor_interests,'{}') && ARRAY['Workshops','Eventos']
   ) news WHERE NOT EXISTS(SELECT 1 FROM private.doctor_email_dispatches d WHERE d.doctor_id=r.doctor_id AND (news.type||':'||news.id)=ANY(d.item_keys))
    AND NOT EXISTS(SELECT 1 FROM public.leads l WHERE l.doctor_id=r.doctor_id AND l.item_type=news.type AND l.item_id::text=news.id)
   ORDER BY "createdAt" DESC LIMIT 3
  ) c;
  IF v_items IS NOT NULL THEN
   INSERT INTO private.doctor_email_dispatches(doctor_id,item_keys) VALUES(r.doctor_id,v_keys) RETURNING id INTO v_id;
   UPDATE private.doctor_email_state SET last_attempt_at=now() WHERE doctor_id=r.doctor_id;
   RETURN jsonb_build_object('id',v_id,'email',r.email,'token',r.unsubscribe_token,'items',v_items);
  END IF;
 END LOOP;
 RETURN NULL;
END; $$;
CREATE FUNCTION public.finish_doctor_email_digest(p_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_status NOT IN ('accepted','uncertain') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 UPDATE private.doctor_email_dispatches SET status=p_status,completed_at=now() WHERE id=p_id AND status='claimed';
END; $$;
CREATE FUNCTION public.unsubscribe_doctor_email(p_token uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.doctor_email_preferences SET frequency='off',opted_in_at=NULL,updated_at=now()
 WHERE doctor_id=(SELECT doctor_id FROM private.doctor_email_state WHERE unsubscribe_token=p_token);
END; $$;
REVOKE ALL ON FUNCTION public.claim_doctor_email_digest(),public.finish_doctor_email_digest(uuid,text),public.unsubscribe_doctor_email(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_doctor_email_digest(),public.finish_doctor_email_digest(uuid,text),public.unsubscribe_doctor_email(uuid) TO service_role;
NOTIFY pgrst,'reload schema';
