import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  /^https:\/\/.+\.supabase\.co$/i.test(url) &&
  key.length > 40;

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local e no Vercel.',
    );
  }
}

export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? key : 'placeholder-anon-key',
);

export async function upsertProfileWithToken(accessToken: string, profile: Record<string, unknown>) {
  assertSupabaseConfigured();

  const response = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText || 'Erro ao salvar perfil.');
  }
}
