import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const { Client } = pg;

function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const projectRef = (process.env.VITE_SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  ?? 'yuwqqyxnmkgomqjornlm';

function buildSupabaseDbUrl() {
  if (process.env.SUPABASE_DB_URL?.trim()) return process.env.SUPABASE_DB_URL.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;
  const host = process.env.SUPABASE_DB_HOST?.trim() || 'aws-0-us-east-1.pooler.supabase.com';
  const port = process.env.SUPABASE_DB_PORT?.trim() || '6543';
  const user = process.env.SUPABASE_DB_USER?.trim() || `postgres.${projectRef}`;
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

const url = buildSupabaseDbUrl();

if (!url || /neon\.tech|vercel-storage/i.test(url)) {
  console.error(`
Não foi possível conectar ao Postgres do Supabase.

Execute manualmente no SQL Editor:
  https://supabase.com/dashboard/project/${projectRef}/sql/new
  Arquivo: supabase/RESET_platform.sql

Ou adicione SUPABASE_DB_PASSWORD no .env.local e rode: npm run reset:platform
`);
  process.exit(1);
}

const sql = readFileSync(join(process.cwd(), 'supabase/RESET_platform.sql'), 'utf8');
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  const result = await client.query(sql);
  const counts = result.at(-1)?.rows?.[0];
  console.log('Plataforma zerada.');
  if (counts) console.log('Contagens:', counts);
} catch (err) {
  console.error('Falha:', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
