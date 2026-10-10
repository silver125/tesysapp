-- Synthetic data only. Caller must run inside BEGIN / ROLLBACK.
DO $$ DECLARE i integer; c uuid; d uuid='ef000000-0000-0000-0000-000000000099'; n integer; BEGIN
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(d,'tenant-doctor@example.invalid','{"role":"medico"}');
 INSERT INTO public.profiles(id,role,name) VALUES(d,'medico','QA Doctor') ON CONFLICT(id) DO UPDATE SET role='medico';
 FOR i IN 1..10 LOOP
  c:=('ef000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid;
  INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(c,'tenant-'||i||'@example.invalid','{"role":"empresa"}');
  INSERT INTO public.profiles(id,role,name) VALUES(c,'empresa','QA Company') ON CONFLICT(id) DO UPDATE SET role='empresa';
  INSERT INTO public.leads(company_id,doctor_id,item_type,item_name,intent) VALUES(c,d,'company','QA Representative','representative_contact');
 END LOOP;
 FOR i IN 1..10 LOOP
  c:=('ef000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid;
  PERFORM set_config('request.jwt.claim.sub',c::text,true); SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM public.leads WHERE doctor_id=d;
  IF n<>1 OR EXISTS(SELECT 1 FROM public.leads WHERE doctor_id=d AND company_id<>c) THEN RAISE EXCEPTION 'Company isolation failed'; END IF;
  RESET ROLE;
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',d::text,true); SET LOCAL ROLE authenticated;
 SELECT count(*) INTO n FROM public.leads WHERE doctor_id=d;
 IF n<>10 THEN RAISE EXCEPTION 'Doctor history incomplete'; END IF;
 RESET ROLE;
END $$;
SELECT 'PASS: ten companies isolated; doctor retains ten separate connections' AS result;
