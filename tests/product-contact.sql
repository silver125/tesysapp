-- Run inside a transaction and ROLLBACK. Synthetic fixtures never persist.
INSERT INTO auth.users(id,raw_user_meta_data) VALUES
 ('a1000000-0000-0000-0000-000000000001','{"role":"medico","name":"QA Doctor"}'),
 ('a1000000-0000-0000-0000-000000000002','{"role":"empresa","name":"QA Company"}'),
 ('a1000000-0000-0000-0000-000000000003','{"role":"empresa","name":"QA Other Company"}');
INSERT INTO public.profiles(id,role,name) VALUES
 ('a1000000-0000-0000-0000-000000000001','medico','QA Doctor'),
 ('a1000000-0000-0000-0000-000000000002','empresa','QA Company'),
 ('a1000000-0000-0000-0000-000000000003','empresa','QA Other Company') ON CONFLICT(id) DO NOTHING;
UPDATE public.profiles SET role=CASE WHEN id='a1000000-0000-0000-0000-000000000001' THEN 'medico' ELSE 'empresa' END,
 whatsapp='11999999999',points=0 WHERE id IN ('a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003');
INSERT INTO public.products(id,company_id,name,category,company_name) VALUES
 ('a2000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002','QA Product','Outros','QA Company'),
 ('a2000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000002','QA Legacy','Outros','QA Company');
INSERT INTO public.leads(id,company_id,doctor_id,item_type,item_id,item_name,intent) VALUES
 ('a3000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001','product','a2000000-0000-0000-0000-000000000002','QA Legacy','sample_request');
DO $$
DECLARE r jsonb; lid uuid; n integer;
BEGIN
 PERFORM set_config('request.jwt.claim.sub','a1000000-0000-0000-0000-000000000001',true);
 SET LOCAL ROLE authenticated;
 BEGIN
   PERFORM public.register_product_interest('a2000000-0000-0000-0000-000000000001',NULL);
   RAISE EXCEPTION 'TEST FAILED: consent required';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE; END IF; END;
 UPDATE public.profiles SET whatsapp='' WHERE id=auth.uid();
 BEGIN
   PERFORM public.register_product_interest('a2000000-0000-0000-0000-000000000001','product-contact-v1');
   RAISE EXCEPTION 'TEST FAILED: missing WhatsApp accepted';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE; END IF; END;
 UPDATE public.profiles SET whatsapp='11999999999' WHERE id=auth.uid();
 r:=public.register_product_interest('a2000000-0000-0000-0000-000000000001','product-contact-v1');
 lid:=(r->'lead'->>'id')::uuid;
 IF lid IS NULL OR (r->>'pointsAwarded')::integer<>10 OR r->'lead'->>'doctor_whatsapp' IS NOT NULL OR r->'lead'->>'contact_consent_at' IS NULL THEN RAISE EXCEPTION 'TEST FAILED: interest response'; END IF;
 r:=public.register_product_interest('a2000000-0000-0000-0000-000000000001','product-contact-v1');
 IF (r->>'created')::boolean OR (r->>'pointsAwarded')::integer<>0 THEN RAISE EXCEPTION 'TEST FAILED: duplicate interest'; END IF;
 BEGIN
   INSERT INTO public.leads(company_id,doctor_id,item_type,item_name,intent,connection_status,doctor_whatsapp)
   VALUES('a1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001','product','Forged','sample_request','approved','11111111111');
   RAISE EXCEPTION 'TEST FAILED: forged approval';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   PERFORM public.approve_lead_connection(lid);
   RAISE EXCEPTION 'TEST FAILED: doctor bypassed company acceptance';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE; END IF; END;
 r:=public.register_product_interest('a2000000-0000-0000-0000-000000000002','product-contact-v1');
 IF r->'lead'->>'contact_consent_at' IS NOT NULL THEN RAISE EXCEPTION 'TEST FAILED: legacy consent upgraded'; END IF;
 PERFORM set_config('request.jwt.claim.sub','a1000000-0000-0000-0000-000000000003',true);
 SELECT count(*) INTO n FROM public.leads WHERE id=lid;
 IF n<>0 THEN RAISE EXCEPTION 'TEST FAILED: foreign company lead access'; END IF;
 BEGIN
   PERFORM public.accept_product_interest(lid);
   RAISE EXCEPTION 'TEST FAILED: foreign company accepted';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE; END IF; END;
 PERFORM set_config('request.jwt.claim.sub','a1000000-0000-0000-0000-000000000002',true);
 SELECT count(*) INTO n FROM public.profiles WHERE id='a1000000-0000-0000-0000-000000000001';
 IF n<>0 THEN RAISE EXCEPTION 'TEST FAILED: profile leaked before acceptance'; END IF;
 SELECT count(*) INTO n FROM public.leads WHERE id=lid AND doctor_whatsapp IS NOT NULL;
 IF n<>0 THEN RAISE EXCEPTION 'TEST FAILED: phone leaked before acceptance'; END IF;
 BEGIN
   PERFORM 1 FROM private.lead_contact_consents;
   RAISE EXCEPTION 'TEST FAILED: private consent readable';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   PERFORM public.accept_product_interest('a3000000-0000-0000-0000-000000000002');
   RAISE EXCEPTION 'TEST FAILED: legacy accepted without consent';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM LIKE 'TEST FAILED:%' THEN RAISE; END IF; END;
 r:=public.accept_product_interest(lid);
 IF r->>'connection_status'<>'approved' OR r->>'doctor_whatsapp'<>'11999999999' THEN RAISE EXCEPTION 'TEST FAILED: company acceptance'; END IF;
 PERFORM public.accept_product_interest(lid);
 SELECT points INTO n FROM public.profiles WHERE id='a1000000-0000-0000-0000-000000000001';
 IF n<>70 THEN RAISE EXCEPTION 'TEST FAILED: expected 70 points (2 interests + 1 acceptance), got %',n; END IF;
 PERFORM public.request_lead_connection('a3000000-0000-0000-0000-000000000002');
 PERFORM set_config('request.jwt.claim.sub','a1000000-0000-0000-0000-000000000001',true);
 PERFORM public.approve_lead_connection('a3000000-0000-0000-0000-000000000002');
 PERFORM public.approve_lead_connection('a3000000-0000-0000-0000-000000000002');
 SELECT points INTO n FROM public.profiles WHERE id=auth.uid();
 IF n<>120 THEN RAISE EXCEPTION 'TEST FAILED: legacy points duplicated'; END IF;
 RESET ROLE;
 SET LOCAL ROLE anon;
 BEGIN
   PERFORM public.accept_product_interest(lid);
   RAISE EXCEPTION 'TEST FAILED: anonymous execution';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 RESET ROLE;
END;
$$;
SELECT 'PASS: consent, scoped access, contact release, duplicate points, legacy compatibility' AS result;
