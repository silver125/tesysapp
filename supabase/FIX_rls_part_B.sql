-- ============================================================
-- FIX RLS — Parte B (cole e rode depois da Parte A)
-- Recria policies mínimas do Tessy
-- ============================================================

DO $pol$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Doctors create own leads" ON public.leads;
    CREATE POLICY "Doctors create own leads"
      ON public.leads FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = doctor_id);

    DROP POLICY IF EXISTS "Doctors read own leads" ON public.leads;
    CREATE POLICY "Doctors read own leads"
      ON public.leads FOR SELECT TO authenticated
      USING (auth.uid() = doctor_id);

    DROP POLICY IF EXISTS "Companies read own leads" ON public.leads;
    CREATE POLICY "Companies read own leads"
      ON public.leads FOR SELECT TO authenticated
      USING (auth.uid() = company_id);

    DROP POLICY IF EXISTS "Block direct lead updates" ON public.leads;
    CREATE POLICY "Block direct lead updates"
      ON public.leads FOR UPDATE TO authenticated USING (false);

    DROP POLICY IF EXISTS "Block direct lead deletes" ON public.leads;
    CREATE POLICY "Block direct lead deletes"
      ON public.leads FOR DELETE TO authenticated USING (false);
  END IF;

  IF to_regclass('public.representatives') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Representatives readable by authenticated" ON public.representatives;
    CREATE POLICY "Representatives readable by authenticated"
      ON public.representatives FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Companies create own representatives" ON public.representatives;
    CREATE POLICY "Companies create own representatives"
      ON public.representatives FOR INSERT WITH CHECK (auth.uid() = company_id);

    DROP POLICY IF EXISTS "Companies update own representatives" ON public.representatives;
    CREATE POLICY "Companies update own representatives"
      ON public.representatives FOR UPDATE
      USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

    DROP POLICY IF EXISTS "Companies delete own representatives" ON public.representatives;
    CREATE POLICY "Companies delete own representatives"
      ON public.representatives FOR DELETE USING (auth.uid() = company_id);
  END IF;

  IF to_regclass('public.locations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Locais visíveis por todos" ON public.locations;
    CREATE POLICY "Locais visíveis por todos"
      ON public.locations FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Empresa cria próprio local" ON public.locations;
    CREATE POLICY "Empresa cria próprio local"
      ON public.locations FOR INSERT WITH CHECK (auth.uid() = company_id);

    DROP POLICY IF EXISTS "Empresa atualiza próprio local" ON public.locations;
    CREATE POLICY "Empresa atualiza próprio local"
      ON public.locations FOR UPDATE USING (auth.uid() = company_id);

    DROP POLICY IF EXISTS "Empresa deleta próprio local" ON public.locations;
    CREATE POLICY "Empresa deleta próprio local"
      ON public.locations FOR DELETE USING (auth.uid() = company_id);
  END IF;

  IF to_regclass('public.events') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public events are readable" ON public.events;
    CREATE POLICY "Public events are readable" ON public.events FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Companies manage own events" ON public.events;
    CREATE POLICY "Companies manage own events"
      ON public.events FOR ALL
      USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);
  END IF;

  IF to_regclass('public.products') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public products are readable" ON public.products;
    CREATE POLICY "Public products are readable" ON public.products FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Companies manage own products" ON public.products;
    CREATE POLICY "Companies manage own products"
      ON public.products FOR ALL
      USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);
  END IF;

  IF to_regclass('public.courses') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public courses are readable" ON public.courses;
    CREATE POLICY "Public courses are readable" ON public.courses FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Companies manage own courses" ON public.courses;
    CREATE POLICY "Companies manage own courses"
      ON public.courses FOR ALL
      USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);
  END IF;
END $pol$;

NOTIFY pgrst, 'reload schema';
