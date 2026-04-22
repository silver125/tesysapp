-- =============================================
-- Migration: adiciona coluna `website` em events, products e courses
-- Execute este SQL no SQL Editor do Supabase.
-- =============================================

ALTER TABLE events   ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE courses  ADD COLUMN IF NOT EXISTS website TEXT;
