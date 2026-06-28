-- Permite que empresas removam leads ligados a anúncios excluídos
-- e habilita realtime para sincronizar exclusões com o perfil médico.
-- Seguro para rodar mais de uma vez.

DROP POLICY IF EXISTS "Companies delete own leads" ON public.leads;
CREATE POLICY "Companies delete own leads"
  ON public.leads
  FOR DELETE
  USING (auth.uid() = company_id);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
