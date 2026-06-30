import type { SupabaseClient } from '@supabase/supabase-js';
import { isMissingDbColumnError, omitDbColumns } from './dbSchema';

/** Colunas opcionais em `leads` — removidas uma a uma se o schema legado não tiver. */
const LEAD_OPTIONAL_COLUMNS = [
  'doctor_whatsapp',
  'doctor_specialty',
  'doctor_name',
  'company_name',
  'message',
  'item_id',
  'created_at',
] as const;

export async function insertLeadResilient(
  client: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<{ error: { message: string; code?: string } | null; omittedColumns: string[] }> {
  let current: Record<string, unknown> = { ...payload };
  const omitted = new Set<string>();
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < LEAD_OPTIONAL_COLUMNS.length + 2; attempt++) {
    const { error } = await client.from('leads').insert(current);
    if (!error) {
      return { error: null, omittedColumns: [...omitted] };
    }

    lastError = { message: error.message, code: error.code };

    const missing = LEAD_OPTIONAL_COLUMNS.find(
      col => !omitted.has(col)
        && col in current
        && isMissingDbColumnError(error, [col]),
    );

    if (missing) {
      omitted.add(missing);
      current = omitDbColumns(current, [missing]);
      console.warn(`Coluna ${missing} ausente em leads. Inserindo sem ela.`);
      continue;
    }

    break;
  }

  return { error: lastError, omittedColumns: [...omitted] };
}
