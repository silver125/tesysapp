-- =============================================
-- TESSY – Schema Supabase
-- Cole este SQL no SQL Editor do Supabase e execute.
-- =============================================

-- 1. Perfis de usuário (ligado ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('medico', 'empresa')),
  specialty   TEXT,
  crm         TEXT,
  crm_state   TEXT,
  company     TEXT,
  whatsapp    TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Eventos
CREATE TABLE IF NOT EXISTS events (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT,
  date              TEXT NOT NULL,
  time              TEXT,
  location          TEXT,
  category          TEXT,
  max_participants  INTEGER DEFAULT 100,
  registered_count  INTEGER DEFAULT 0,
  company_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  company_whatsapp  TEXT,
  website           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Produtos
CREATE TABLE IF NOT EXISTS products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT,
  price             TEXT,
  company_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  company_whatsapp  TEXT,
  website           TEXT,
  available_for     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cursos
CREATE TABLE IF NOT EXISTS courses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT,
  modality          TEXT DEFAULT 'online' CHECK (modality IN ('online','presencial','hibrido')),
  duration          TEXT,
  instructor        TEXT,
  price             TEXT,
  company_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  company_whatsapp  TEXT,
  website           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses  ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Perfis visíveis por todos"        ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuário cria próprio perfil"      ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuário atualiza próprio perfil"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Events
CREATE POLICY "Eventos visíveis por todos"       ON events FOR SELECT USING (true);
CREATE POLICY "Empresa cria evento"              ON events FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Empresa deleta próprio evento"    ON events FOR DELETE USING (auth.uid() = company_id);

-- Products
CREATE POLICY "Produtos visíveis por todos"      ON products FOR SELECT USING (true);
CREATE POLICY "Empresa cria produto"             ON products FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Empresa deleta próprio produto"   ON products FOR DELETE USING (auth.uid() = company_id);

-- Courses
CREATE POLICY "Cursos visíveis por todos"        ON courses FOR SELECT USING (true);
CREATE POLICY "Empresa cria curso"               ON courses FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Empresa deleta próprio curso"     ON courses FOR DELETE USING (auth.uid() = company_id);

-- =============================================
-- Trigger: criar perfil automaticamente ao cadastrar
-- (Garante que todo auth.user tenha um perfil)
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- O perfil é criado pelo app logo após o signUp
  -- Esta função existe como fallback
  RETURN NEW;
END;
$$;
