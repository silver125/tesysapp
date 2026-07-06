import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const envPath = join(process.cwd(), '.env.local');
const help = `
Supabase não configurado para desenvolvimento local.

1. Abra: https://supabase.com/dashboard/project/yuwqqyxnmkgomqjornlm/settings/api
2. Copie Project URL + anon/publishable key para .env.local
3. Ou rode: npx vercel env pull .env.local --yes
4. Reinicie: npm run dev
`;

function stripEnvValue(raw) {
  const value = String(raw ?? '').trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

function isValidSupabaseUrl(url) {
  return /^https:\/\/.+\.supabase\.co\/?$/i.test(stripEnvValue(url));
}

function isValidSupabasePublicKey(key) {
  const value = stripEnvValue(key);
  if (value.length < 20) return false;
  return value.startsWith('eyJ') || value.startsWith('sb_publishable_');
}

if (!existsSync(envPath)) {
  console.error(help);
  process.exit(1);
}

const env = readFileSync(envPath, 'utf8');
const url = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1] ?? '';
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1] ?? '';
const urlOk = isValidSupabaseUrl(url);
const keyOk = isValidSupabasePublicKey(key);

if (!urlOk || !keyOk) {
  console.error(help);
  if (!urlOk) console.error('→ VITE_SUPABASE_URL inválida em .env.local\n');
  if (!keyOk) console.error('→ VITE_SUPABASE_ANON_KEY ausente ou inválida em .env.local\n');
  process.exit(1);
}
