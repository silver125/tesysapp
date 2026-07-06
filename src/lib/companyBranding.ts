import { isSupabaseConfigured, supabase } from './supabase';

/** Busca logos de empresa (avatar do perfil) para cards de representante. */
export async function fetchCompanyLogos(companyIds: string[]): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || companyIds.length === 0) return {};

  const logos: Record<string, string> = {};

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_company_branding', {
    company_ids: companyIds,
  });

  if (!rpcError && Array.isArray(rpcData)) {
    for (const row of rpcData as { id: string; avatar_url?: string | null }[]) {
      const avatar = row.avatar_url?.trim();
      if (avatar) logos[row.id] = avatar;
    }
    if (Object.keys(logos).length > 0) return logos;
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .in('id', companyIds);

  if (data) {
    for (const row of data) {
      const avatar = (row as { id: string; avatar_url?: string | null }).avatar_url?.trim();
      if (avatar) logos[(row as { id: string }).id] = avatar;
    }
  }

  return logos;
}
