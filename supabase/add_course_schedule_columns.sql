-- Adiciona agenda aos workshops/capacitacoes sem apagar dados.
ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS time TIME,
  ADD COLUMN IF NOT EXISTS location TEXT;

CREATE INDEX IF NOT EXISTS courses_date_time_idx
  ON public.courses (date, time);

NOTIFY pgrst, 'reload schema';
