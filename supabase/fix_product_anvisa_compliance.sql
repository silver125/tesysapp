-- =============================================
-- TESSY — Compliance Anvisa em products
--
-- Corrige bloqueio ao publicar produto:
-- "Confirme a regularizacao vigente na Anvisa e a disponibilidade comercial do produto."
--
-- O app agora envia anvisa_regularized=true e commercially_available=true
-- quando a empresa marca as confirmações no formulário.
--
-- Seguro para rodar mais de uma vez no Supabase SQL Editor.
-- =============================================

BEGIN;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS anvisa_regularized BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS commercially_available BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.validate_product_compliance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(NEW.anvisa_regularized, FALSE) IS NOT TRUE
     OR COALESCE(NEW.commercially_available, FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'Confirme a regularizacao vigente na Anvisa e a disponibilidade comercial do produto.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_validate_compliance ON public.products;

CREATE TRIGGER products_validate_compliance
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_compliance();

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Para inspecionar triggers existentes (opcional):
-- SELECT tgname, pg_get_triggerdef(oid)
-- FROM pg_trigger
-- WHERE tgrelid = 'public.products'::regclass AND NOT tgisinternal;
