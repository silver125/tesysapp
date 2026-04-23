-- =============================================
-- FIX ALL COLUMNS — adiciona TODAS as colunas que o app espera
-- Idempotente: pode rodar várias vezes sem quebrar nada.
-- Execute UMA VEZ no SQL Editor do Supabase.
-- =============================================

-- ── PROFILES ──────────────────────────────────────────────────────────────
-- App envia: id, name, first_name, last_name, email, role, specialty,
--            crm, crm_state, company, company_name, whatsapp
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm_state    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio          TEXT;

-- ── EVENTS ────────────────────────────────────────────────────────────────
-- App envia/lê: title, description, date, time, location, category,
--               max_participants, registered_count, company_id, company_name,
--               company_whatsapp, website
ALTER TABLE events ADD COLUMN IF NOT EXISTS title             TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS description       TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS date              TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time              TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location          TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS category          TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants  INTEGER DEFAULT 100;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registered_count  INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS company_id        UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS company_name      TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS company_whatsapp  TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS website           TEXT;

-- ── PRODUCTS ──────────────────────────────────────────────────────────────
-- App envia/lê: name, description, category, price, company_id, company_name,
--               company_whatsapp, website, available_for
ALTER TABLE products ADD COLUMN IF NOT EXISTS name             TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description      TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category         TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price            TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id       UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_name     TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_whatsapp TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS website          TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_for    TEXT;

-- ── COURSES ───────────────────────────────────────────────────────────────
-- App envia/lê: title, description, category, modality, duration, instructor,
--               price, company_id, company_name, company_whatsapp, website
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title            TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description      TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category         TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS modality         TEXT DEFAULT 'online';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration         TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor       TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price            TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS company_id       UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS company_name     TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS company_whatsapp TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS website          TEXT;

-- ── Recarrega cache do PostgREST imediatamente ────────────────────────────
NOTIFY pgrst, 'reload schema';
