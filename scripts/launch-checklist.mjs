#!/usr/bin/env node
/**
 * Checklist de lançamento Tessy — rode: node scripts/launch-checklist.mjs
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROD_URL = 'https://www.tessybr.com';
const PROJECT_REF = 'yuwqqyxnmkgomqjornlm';
const dash = (path) => `https://supabase.com/dashboard/project/${PROJECT_REF}${path}`;

const envPath = join(process.cwd(), '.env.local');
let envUrl = '';
let envKey = '';
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  envUrl = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim() ?? '';
  envKey = env.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1]?.trim() ?? '';
}

const checks = [];

function item(done, label, detail = '') {
  checks.push({ done, label, detail });
}

// Env vars
item(Boolean(envUrl && envUrl.includes('supabase.co')), 'VITE_SUPABASE_URL em .env.local / Vercel');
item(Boolean(envKey && envKey.length > 20), 'VITE_SUPABASE_ANON_KEY em .env.local / Vercel');

// SQL
item(true, 'SQL de lançamento', `Cole e execute: supabase/LAUNCH_real_users.sql`);
item(true, 'SQL de segurança (médicos)', `Depois rode: supabase/SECURITY_doctors_launch.sql`);
console.log('');
console.log('═'.repeat(60));
console.log('  TESSY — Checklist de lançamento (usuários reais)');
console.log('═'.repeat(60));
console.log('');

for (const { done, label, detail } of checks) {
  console.log(`  ${done ? '✓' : '○'} ${label}`);
  if (detail) console.log(`      → ${detail}`);
}

console.log('');
console.log('── Supabase Auth (Dashboard) ──');
console.log(`  1. Confirm email`);
console.log(`     ${dash('/auth/providers')}`);
console.log('     • Opção A (mais simples): DESLIGAR "Confirm email" para cadastro imediato');
console.log('     • Opção B: manter ligado — app guarda perfil e completa no 1º login');
console.log('');
console.log('  2. Site URL');
console.log(`     ${dash('/auth/url-configuration')}`);
console.log(`     • Site URL: ${PROD_URL}`);
console.log('');
console.log('  3. Redirect URLs (adicionar todas):');
console.log(`     • ${PROD_URL}/**`);
console.log(`     • ${PROD_URL}/redefinir-senha`);
console.log(`     • http://localhost:5173/**  (dev)`);
console.log('');
console.log('── SQL (obrigatório após reset) ──');
console.log(`  ${dash('/sql/new')}`);
console.log('  1. supabase/LAUNCH_real_users.sql');
console.log('     Confirme no final: leads_ok, reps_ok, locations_ok, product_rpc_ok = true');
console.log('  2. supabase/SECURITY_doctors_launch.sql  (antes de convidar médicos)');
console.log('     Confirme: só policy "Users read own profile" em profiles SELECT');
console.log('');
console.log('── Vercel (produção) ──');
console.log('  • Env vars: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY');
console.log(`  • Domínio: ${PROD_URL}`);
console.log('  • Redeploy após alterar env');
console.log('');
console.log('── Links de convite ──');
console.log(`  Médico:  ${PROD_URL}/cadastro?perfil=medico`);
console.log(`  Empresa: ${PROD_URL}/cadastro?perfil=empresa`);
console.log('  (também em src/lib/inviteLinks.ts)');
console.log('');
console.log('── Teste manual rápido ──');
console.log('  1. Cadastro médico → login → dashboard');
console.log('  2. Cadastro empresa → publicar produto');
console.log('  3. Médico marca interesse → lead aparece na empresa');
console.log('  4. Recuperação de senha → /redefinir-senha');
console.log('');

const pending = checks.filter((c) => !c.done).length;
if (pending > 0) {
  console.log(`⚠  ${pending} item(ns) local pendente(s) — configure .env.local ou Vercel.`);
  process.exitCode = 1;
} else {
  console.log('✓ Variáveis locais OK. Execute o SQL e revise Auth no Supabase.');
}
