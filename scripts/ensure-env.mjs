import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const envPath = join(process.cwd(), '.env.local');
const help = `
Supabase não configurado para desenvolvimento local.

1. Abra: https://supabase.com/dashboard/project/yuwqqyxnmkgomqjornlm/settings/api
2. Copie a "anon public" key para .env.local:
   VITE_SUPABASE_ANON_KEY=eyJ...
3. Reinicie: npm run dev

Produção (tessybr.com): Vercel → Project → Settings → Environment Variables
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   (Production + Preview + Development) → Redeploy
`;

if (!existsSync(envPath)) {
  console.error(help);
  process.exit(1);
}

const env = readFileSync(envPath, 'utf8');
const url = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim() ?? '';
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1]?.trim() ?? '';
const urlOk = /^https:\/\/.+\.supabase\.co$/i.test(url);
const keyOk = key.length > 40 && key.startsWith('eyJ');

if (!urlOk || !keyOk) {
  console.error(help);
  if (!keyOk) {
    console.error('→ Falta VITE_SUPABASE_ANON_KEY em .env.local\n');
  }
  process.exit(1);
}
