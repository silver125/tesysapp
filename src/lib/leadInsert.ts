import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead } from '../types';
import { isMissingDbColumnError, omitDbColumns } from './dbSchema';

/**
 * Payload mínimo — compatível com schema legado de `leads`.
 * Nomes do médico/empresa vêm de `profiles` no SELECT (join), não duplicamos aqui.
 */
export function buildMinimalLeadPayload(lead: Pick<Lead, 'id' | 'companyId' | 'doctorId' | 'doctorName' | 'doctorSpecialty' | 'itemType' | 'itemName' | 'intent' | 'itemId' | 'message' | 'createdAt' | 'companyName'>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: lead.id,
    company_id: lead.companyId,
    doctor_id: lead.doctorId,
    item_type: lead.itemType,
    item_name: lead.itemName,
    intent: lead.intent,
  };
  if (lead.itemId) payload.item_id = lead.itemId;
  if (lead.message) payload.message = lead.message;
  if (lead.createdAt) payload.created_at = lead.createdAt;
  if (lead.companyName) payload.company_name = lead.companyName;
  if (lead.doctorName) payload.doctor_name = lead.doctorName;
  if (lead.doctorSpecialty) payload.doctor_specialty = lead.doctorSpecialty;
  return payload;
}

const LEAD_OPTIONAL_COLUMNS = [
  'company_name',
  'doctor_name',
  'doctor_specialty',
  'message',
  'item_id',
  'created_at',
  'id',
] as const;

async function tryInsert(
  client: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<{ error: { message: string; code?: string } | null; omittedColumns: string[] }> {
  let current: Record<string, unknown> = { ...payload };
  const omitted = new Set<string>();
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < LEAD_OPTIONAL_COLUMNS.length + 3; attempt++) {
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

    const anyMissing = extractMissingColumnFromError(error.message);
    if (anyMissing && anyMissing in current && !omitted.has(anyMissing)) {
      omitted.add(anyMissing);
      current = omitDbColumns(current, [anyMissing]);
      console.warn(`Coluna ${anyMissing} ausente em leads. Inserindo sem ela.`);
      continue;
    }

    break;
  }

  return { error: lastError, omittedColumns: [...omitted] };
}

function extractMissingColumnFromError(message: string): string | null {
  const match = message.match(/'([a-z_]+)' column of 'leads'/i);
  return match?.[1] ?? null;
}

export async function insertLeadResilient(
  client: SupabaseClient,
  lead: Pick<Lead, 'id' | 'companyId' | 'doctorId' | 'doctorName' | 'doctorSpecialty' | 'itemType' | 'itemName' | 'intent' | 'itemId' | 'message' | 'createdAt' | 'companyName'>,
): Promise<{ error: { message: string; code?: string } | null; omittedColumns: string[] }> {
  const full = buildMinimalLeadPayload(lead);
  const coreOnly: Record<string, unknown> = {
    company_id: lead.companyId,
    doctor_id: lead.doctorId,
    item_type: lead.itemType,
    item_name: lead.itemName,
    intent: lead.intent,
  };
  if (lead.id) coreOnly.id = lead.id;
  if (lead.itemId) coreOnly.item_id = lead.itemId;

  const attempts = [full, coreOnly];
  let lastResult: { error: { message: string; code?: string } | null; omittedColumns: string[] } = {
    error: { message: 'Não foi possível registrar interesse.' },
    omittedColumns: [],
  };

  for (const payload of attempts) {
    lastResult = await tryInsert(client, payload);
    if (!lastResult.error) return lastResult;
  }

  return lastResult;
}
