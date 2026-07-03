import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const { Client } = pg;

const projectRef = (process.env.VITE_SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

function buildSupabaseDbUrl() {
  if (process.env.SUPABASE_DB_URL?.trim()) return process.env.SUPABASE_DB_URL.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password || !projectRef) return null;
  const host = process.env.SUPABASE_DB_HOST?.trim()
    || `aws-0-us-east-1.pooler.supabase.com`;
  const port = process.env.SUPABASE_DB_PORT?.trim() || '6543';
  const user = process.env.SUPABASE_DB_USER?.trim() || `postgres.${projectRef}`;
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

const url = buildSupabaseDbUrl();

if (!url) {
  console.error(`
Não foi possível conectar ao Postgres do Supabase.

O POSTGRES_URL do Vercel aponta para outro banco (Neon), não para o Supabase do app.

Opção A — SQL Editor (recomendado, 1 minuto):
  https://supabase.com/dashboard/project/${projectRef ?? 'yuwqqyxnmkgomqjornlm'}/sql/new
  Cole e execute o arquivo: supabase/RUN_ONCE_product_publish.sql

Opção B — Script automático:
  1. Supabase → Project Settings → Database → copie a senha do banco
  2. Adicione no .env.local: SUPABASE_DB_PASSWORD=sua_senha
  3. Rode: npm run fix:db:products
`);
  process.exit(1);
}

if (/neon\.tech|vercel-storage/i.test(url)) {
  console.error('URL de banco inválida para o Tessy: use SUPABASE_DB_PASSWORD ou SUPABASE_DB_URL do Supabase.');
  process.exit(1);
}

const sql = readFileSync(
  join(process.cwd(), 'supabase/RUN_ONCE_product_publish.sql'),
  'utf8',
);

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log('OK: SQL de publicação de produtos aplicado no Supabase.');
} catch (err) {
  console.error('Falha:', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
