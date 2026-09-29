-- Explicit medical audience; format (e.g. Congresso) remains independent.
-- Apply before deploying the frontend. Existing unclassified rows stay hidden
-- until their owner assigns a medical segment. No guessing from marketing text.
BEGIN;
CREATE OR REPLACE FUNCTION public.tessy_medical_segment(value text)
RETURNS text LANGUAGE sql IMMUTABLE STRICT SECURITY INVOKER
SET search_path = '' AS $$
  SELECT label FROM (VALUES
    ('Nutrologia'),
    ('Endocrinologia'),
    ('Dermatologia'),
    ('Cirurgia Plástica'),
    ('Cardiologia'),
    ('Oncologia'),
    ('Neurologia'),
    ('Ortopedia'),
    ('Pediatria'),
    ('Gastroenterologia'),
    ('Ginecologia'),
    ('Oftalmologia'),
    ('Psiquiatria'),
    ('Reumatologia'),
    ('Urologia'),
    ('Pneumologia'),
    ('Clínica Médica'),
    ('Medicina de Família'),
    ('Radiologia'),
    ('Anestesiologia'),
    ('Otorrinolaringologia')
  ) AS segments(label)
  WHERE lower(trim(label)) = lower(trim(value));
$$;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS segment text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS segment text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS segment text;
ALTER TABLE public.representatives ADD COLUMN IF NOT EXISTS segment text;

-- Only exact, known specialty labels are eligible for safe legacy backfill.
UPDATE public.products SET segment = public.tessy_medical_segment(category)
WHERE segment IS NULL AND public.tessy_medical_segment(category) IS NOT NULL;
UPDATE public.courses SET segment = public.tessy_medical_segment(category)
WHERE segment IS NULL AND public.tessy_medical_segment(category) IS NOT NULL;
UPDATE public.events SET segment = public.tessy_medical_segment(category)
WHERE segment IS NULL AND public.tessy_medical_segment(category) IS NOT NULL;
UPDATE public.representatives SET segment = public.tessy_medical_segment(specialty)
WHERE segment IS NULL AND public.tessy_medical_segment(specialty) IS NOT NULL;

CREATE OR REPLACE FUNCTION public.tessy_validate_publication_segment()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE company_segment text;
BEGIN
  -- Ordinary edits/count updates must not silently reclassify legacy content.
  IF TG_OP = 'UPDATE' THEN
    IF NEW.segment IS NOT DISTINCT FROM OLD.segment
       AND NEW.company_id IS NOT DISTINCT FROM OLD.company_id THEN
      IF TG_TABLE_NAME NOT IN ('products', 'courses') THEN
        RETURN NEW;
      END IF;
      IF NEW.category IS NOT DISTINCT FROM OLD.category THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> NEW.company_id THEN
    RAISE EXCEPTION 'Somente a empresa proprietária pode classificar a publicação.';
  END IF;
  SELECT public.tessy_medical_segment(p.specialty) INTO company_segment
  FROM public.profiles p WHERE p.id = NEW.company_id AND p.role IN ('empresa', 'company');
  IF company_segment IS NULL THEN
    RAISE EXCEPTION 'Defina o segmento médico da empresa em Editar perfil antes de publicar.';
  END IF;
  -- Legacy publish RPCs omit the new column; inherit it atomically on INSERT.
  NEW.segment := coalesce(NEW.segment, company_segment);
  IF NEW.segment <> company_segment THEN
    RAISE EXCEPTION 'O segmento deve ser o mesmo do perfil da empresa.';
  END IF;
  IF TG_TABLE_NAME IN ('products', 'courses') THEN
    IF public.tessy_medical_segment(NEW.category) IS DISTINCT FROM company_segment THEN
      RAISE EXCEPTION 'A categoria deve corresponder ao segmento médico da empresa.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ DECLARE tbl text; BEGIN
  FOREACH tbl IN ARRAY ARRAY['events','products','courses','representatives'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS validate_medical_segment ON public.%I', tbl);
    EXECUTE format('CREATE TRIGGER validate_medical_segment BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.tessy_validate_publication_segment()', tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (segment)', tbl || '_segment_idx', tbl);
  END LOOP;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
