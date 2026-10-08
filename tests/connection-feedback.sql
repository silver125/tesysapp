-- Run inside a transaction and ROLLBACK. No real users modified.
DO $$ DECLARE i integer; u uuid; company uuid='cf000000-0000-0000-0000-000000000099'; l uuid; r jsonb; BEGIN
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(company,'feedback-company@example.invalid','{"role":"empresa"}');
 INSERT INTO public.profiles(id,role,name) VALUES(company,'empresa','QA Feedback') ON CONFLICT(id) DO UPDATE SET role='empresa';
 FOR i IN 1..6 LOOP
 u:=('cf000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid;
 l:=('cf100000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid;
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(u,'feedback-'||i||'@example.invalid','{"role":"medico"}');
 INSERT INTO public.profiles(id,role,name) VALUES(u,'medico','QA Doctor') ON CONFLICT(id) DO UPDATE SET role='medico';
 INSERT INTO public.leads(id,company_id,doctor_id,item_type,item_name,intent,connection_status) VALUES(l,company,u,'company','QA Contact','representative_contact',CASE WHEN i=6 THEN 'requested' ELSE 'approved' END);
 PERFORM set_config('request.jwt.claim.sub',u::text,true);SET LOCAL ROLE authenticated;
 IF i=6 THEN
  BEGIN PERFORM public.save_connection_feedback(l,true,true); RAISE EXCEPTION 'TEST FAILED pending accepted';EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE; END IF; END;
 ELSE
  PERFORM public.save_connection_feedback(l,true,true);
  PERFORM public.save_connection_feedback(l,true,false);
  IF (SELECT count(*) FROM public.connection_feedback)<>1 THEN RAISE EXCEPTION 'TEST FAILED ownership or duplicate';END IF;
 END IF;
 RESET ROLE;
 IF i=4 THEN
  PERFORM set_config('request.jwt.claim.sub',company::text,true);SET LOCAL ROLE authenticated;
  r:=public.company_feedback_summary();IF (r->>'available')::boolean THEN RAISE EXCEPTION 'TEST FAILED threshold';END IF;
  IF EXISTS(SELECT 1 FROM public.connection_feedback) THEN RAISE EXCEPTION 'TEST FAILED company reads ratings';END IF;
  RESET ROLE;
 END IF;
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',company::text,true);SET LOCAL ROLE authenticated;
 r:=public.company_feedback_summary();IF r->>'doctors'<>'5' OR r->>'replyPercent'<>'100' OR r->>'usefulPercent'<>'0' THEN RAISE EXCEPTION 'TEST FAILED aggregation: %',r;END IF;
 BEGIN PERFORM public.save_connection_feedback('cf100000-0000-0000-0000-000000000001',true,true);RAISE EXCEPTION 'TEST FAILED company edits';EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED%' THEN RAISE;END IF;END;
 PERFORM public.delete_connection_feedback('cf100000-0000-0000-0000-000000000001');RESET ROLE;
 IF (SELECT count(*) FROM public.connection_feedback WHERE company_id=company)<>5 THEN RAISE EXCEPTION 'TEST FAILED cross-user deletion';END IF;
 PERFORM set_config('request.jwt.claim.sub','cf000000-0000-0000-0000-000000000001',true);SET LOCAL ROLE authenticated;
 PERFORM public.delete_connection_feedback('cf100000-0000-0000-0000-000000000001');
 IF EXISTS(SELECT 1 FROM public.connection_feedback) THEN RAISE EXCEPTION 'TEST FAILED delete';END IF;
 RESET ROLE;
 SET LOCAL ROLE anon;
 BEGIN PERFORM public.company_feedback_summary();RAISE EXCEPTION 'TEST FAILED anonymous aggregate';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 RESET ROLE;
END $$;
SELECT 'PASS approved-only, isolation, update, delete, aggregate threshold, anonymous denial' result;
