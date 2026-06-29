-- =============================================
-- TESSY — Imagens de workshops (courses) + storage
--
-- Corrige workshop publicado sem foto da empresa
-- (médico via imagem genérica/IA de fallback).
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE OR REPLACE FUNCTION public.publish_company_course(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_date date;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Faça login novamente para publicar.';
  END IF;

  v_date := NULLIF(payload->>'date', '')::date;

  INSERT INTO public.courses (
    title,
    description,
    category,
    modality,
    duration,
    instructor,
    price,
    company_id,
    company_name,
    company_whatsapp,
    website,
    date,
    time,
    location,
    image_url
  ) VALUES (
    payload->>'title',
    NULLIF(payload->>'description', ''),
    NULLIF(payload->>'category', ''),
    COALESCE(NULLIF(payload->>'modality', ''), 'online'),
    NULLIF(payload->>'duration', ''),
    NULLIF(payload->>'instructor', ''),
    NULLIF(payload->>'price', ''),
    v_uid,
    payload->>'company_name',
    NULLIF(payload->>'company_whatsapp', ''),
    NULLIF(payload->>'website', ''),
    v_date,
    NULLIF(payload->>'time', '')::time,
    NULLIF(payload->>'location', ''),
    NULLIF(payload->>'image_url', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_company_course(jsonb) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunity-images',
  'opportunity-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read opportunity images" ON storage.objects;
CREATE POLICY "Public read opportunity images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'opportunity-images');

DROP POLICY IF EXISTS "Companies upload opportunity images" ON storage.objects;
CREATE POLICY "Companies upload opportunity images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'opportunity-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Companies update own opportunity images" ON storage.objects;
CREATE POLICY "Companies update own opportunity images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'opportunity-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'opportunity-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Companies delete own opportunity images" ON storage.objects;
CREATE POLICY "Companies delete own opportunity images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'opportunity-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
