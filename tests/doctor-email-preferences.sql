-- Execute inside BEGIN/ROLLBACK; no SMTP calls.
INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES('b5000000-0000-0000-0000-000000000001','qa-digest@example.invalid',now(),'{"role":"medico"}'),('b5000000-0000-0000-0000-000000000002','qa-company@example.invalid',now(),'{"role":"empresa"}');
INSERT INTO public.profiles(id,role,name,doctor_interests) VALUES('b5000000-0000-0000-0000-000000000001','medico','QA Doctor',ARRAY['Produtos']),('b5000000-0000-0000-0000-000000000002','empresa','QA Company','{}') ON CONFLICT(id) DO UPDATE SET role=excluded.role,doctor_interests=excluded.doctor_interests;
DO $$ DECLARE r jsonb; v_token uuid; BEGIN
 PERFORM set_config('request.jwt.claim.sub','b5000000-0000-0000-0000-000000000001',true);SET LOCAL ROLE authenticated;
 PERFORM public.set_doctor_email_frequency('weekly');
 BEGIN PERFORM public.claim_doctor_email_digest();RAISE EXCEPTION 'TEST FAILED: doctor claims email';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 RESET ROLE;
 UPDATE public.doctor_email_preferences SET opted_in_at=now()-interval '8 days' WHERE doctor_id='b5000000-0000-0000-0000-000000000001';
 INSERT INTO public.products(id,company_id,name,category,created_at) VALUES('b5000000-0000-0000-0000-000000000003','b5000000-0000-0000-0000-000000000002','QA Digest Item','Outros',now());
 SET LOCAL ROLE service_role;
 r:=public.claim_doctor_email_digest();
 IF r IS NULL OR r->>'email'<>'qa-digest@example.invalid' OR jsonb_array_length(r->'items')<>1 THEN RAISE EXCEPTION 'TEST FAILED: eligible recipient';END IF;
 IF public.claim_doctor_email_digest() IS NOT NULL THEN RAISE EXCEPTION 'TEST FAILED: duplicate claim';END IF;
 PERFORM public.finish_doctor_email_digest((r->>'id')::uuid,'accepted');
 v_token:=(r->>'token')::uuid;PERFORM public.unsubscribe_doctor_email(v_token);
 RESET ROLE;
 IF EXISTS(SELECT 1 FROM public.doctor_email_preferences WHERE doctor_id='b5000000-0000-0000-0000-000000000001' AND frequency<>'off') THEN RAISE EXCEPTION 'TEST FAILED: unsubscribe';END IF;
 PERFORM set_config('request.jwt.claim.sub','b5000000-0000-0000-0000-000000000002',true);SET LOCAL ROLE authenticated;
 IF EXISTS(SELECT 1 FROM public.doctor_email_preferences) THEN RAISE EXCEPTION 'TEST FAILED: another user sees preferences';END IF;
 BEGIN PERFORM public.set_doctor_email_frequency('weekly');RAISE EXCEPTION 'TEST FAILED: company opt-in';EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE;END IF;END;
 RESET ROLE;
END $$;
SELECT 'PASS opt-in, eligibility, duplicate prevention, unsubscribe, company isolation' result;
