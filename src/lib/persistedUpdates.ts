import type { SupabaseClient } from '@supabase/supabase-js';
type Row = Record<string, unknown>;

/** RLS can return success with zero affected rows. Only confirmed rows are saved. */
export async function updateCompanyRecord(
  client: SupabaseClient, table: string, id: string, companyId: string, patch: Row,
): Promise<Row> {
  const { data, error } = await client.from(table).update(patch)
    .eq('id', id).eq('company_id', companyId).select('*');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Não foi possível salvar. O registro foi removido ou você não tem permissão para editá-lo.');
  return data[0];
}

export function eventWebsitePatch(value: string | undefined): Row {
  return value === undefined ? {} : { website: value.trim() || null };
}

export function eventCapacityError(value: string | number, registered = 0): string {
  const capacity = Number(value);
  if (!Number.isSafeInteger(capacity) || capacity < 1) return 'Informe um número inteiro de vagas maior que zero.';
  if (capacity < registered) return `Vagas não podem ser menores que o nº de inscritos (${registered}).`;
  return '';
}
