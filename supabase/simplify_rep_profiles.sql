-- =============================================
-- TESSY — Perfil enriquecido de representante
--
-- Adiciona categorias, marcas, cobertura regional e
-- flag de atendimento nacional. Não apaga dados.
-- Seguro para rodar mais de uma vez.
-- =============================================

BEGIN;

ALTER TABLE public.representatives
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS brands TEXT,
  ADD COLUMN IF NOT EXISTS coverage_states TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS coverage_cities TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS covers_nationally BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_city TEXT,
  ADD COLUMN IF NOT EXISTS home_state TEXT;

-- Backfill: cidade/estado antigos viram residência + cobertura inicial.
UPDATE public.representatives
SET
  home_city = COALESCE(NULLIF(TRIM(home_city), ''), NULLIF(TRIM(city), '')),
  home_state = COALESCE(NULLIF(TRIM(home_state), ''), NULLIF(TRIM(state), ''))
WHERE home_city IS NULL OR home_state IS NULL;

UPDATE public.representatives
SET coverage_states = ARRAY[UPPER(TRIM(state))]
WHERE COALESCE(array_length(coverage_states, 1), 0) = 0
  AND state IS NOT NULL
  AND TRIM(state) <> ''
  AND covers_nationally IS NOT TRUE;

UPDATE public.representatives
SET coverage_cities = ARRAY[TRIM(city)]
WHERE COALESCE(array_length(coverage_cities, 1), 0) = 0
  AND city IS NOT NULL
  AND TRIM(city) <> ''
  AND covers_nationally IS NOT TRUE;

-- Especialidade legada → categorias quando possível.
UPDATE public.representatives
SET categories = ARRAY['skincare']
WHERE COALESCE(array_length(categories, 1), 0) = 0
  AND specialty ILIKE '%derma%';

UPDATE public.representatives
SET categories = ARRAY['tecnologias']
WHERE COALESCE(array_length(categories, 1), 0) = 0
  AND (
    specialty ILIKE '%tecnolog%'
    OR specialty ILIKE '%equip%'
    OR specialty ILIKE '%laser%'
  );

UPDATE public.representatives
SET categories = ARRAY['parcerias']
WHERE COALESCE(array_length(categories, 1), 0) = 0
  AND (
    specialty ILIKE '%parcer%'
    OR specialty ILIKE '%comercial%'
  );

CREATE INDEX IF NOT EXISTS representatives_coverage_states_gin
  ON public.representatives USING GIN (coverage_states);

CREATE INDEX IF NOT EXISTS representatives_categories_gin
  ON public.representatives USING GIN (categories);

NOTIFY pgrst, 'reload schema';

COMMIT;
