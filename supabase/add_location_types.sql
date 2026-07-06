-- Tipos de local para médicos: coworking, consultório, hospital, etc.
-- Rode no Supabase SQL Editor (idempotente).

BEGIN;

ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_type_check;

ALTER TABLE public.locations
  ADD CONSTRAINT locations_type_check
  CHECK (type IN (
    'coworking',
    'sala_reuniao',
    'consultorio',
    'clinica',
    'hospital',
    'ponto_venda',
    'distribuidor',
    'farmacia',
    'loja',
    'outro'
  ));

NOTIFY pgrst, 'reload schema';

COMMIT;
