import { assertSupabaseConfigured, isSupabaseConfigured, supabase } from './supabase';
import { isMissingRpcError } from './dbSchema';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export type PublishProductInput = {
  name: string;
  description: string;
  category: string;
  price?: string;
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  availableFor: string;
  website?: string;
  imageUrl?: string;
  listingType: string;
};

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} demorou para responder.`)), ms),
    ),
  ]);
}

function isComplianceBlock(message: string) {
  return /anvisa|regularizacao|regularização|disponibilidade comercial|validate_product_compliance|products_validate_compliance|compliance_confirmed/i.test(message);
}

function rpcPayload(data: PublishProductInput) {
  return {
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price ?? '',
    company_name: data.companyName,
    company_whatsapp: data.companyWhatsapp ?? '',
    available_for: data.availableFor,
    website: data.website ?? '',
    image_url: data.imageUrl ?? '',
    listing_type: data.listingType,
    anvisa_regularized: true,
    commercially_available: true,
    compliance_confirmed: true,
  };
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function callRpc(
  fn: 'tessy_publish_product' | 'publish_company_product',
  payload: Record<string, unknown>,
): Promise<string | null> {
  const viaClient = await withTimeout(
    supabase.rpc(fn, { payload }),
    15000,
    'Publicar produto',
  );
  if (!viaClient.error) return null;
  if (isMissingRpcError(viaClient.error, fn)) {
    return `__missing_rpc__:${fn}`;
  }

  if (!isSupabaseConfigured) return viaClient.error.message;
  const token = await getAccessToken();
  if (!token) return 'Faça login novamente para publicar.';

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload }),
  });

  if (response.ok) return null;
  const body = await response.text();
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    return parsed.message || parsed.error || body;
  } catch {
    return body || response.statusText;
  }
}

async function insertDirect(data: PublishProductInput): Promise<string | null> {
  const payload = {
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price ?? null,
    company_id: data.companyId,
    company_name: data.companyName,
    company_whatsapp: data.companyWhatsapp ?? null,
    available_for: data.availableFor,
    website: data.website ?? null,
    image_url: data.imageUrl ?? null,
    listing_type: data.listingType,
    anvisa_regularized: true,
    commercially_available: true,
  };

  const result = await withTimeout(
    supabase.from('products').insert(payload),
    15000,
    'Publicar produto',
  );
  if (!result.error) return null;
  return result.error.message;
}

export async function publishProduct(data: PublishProductInput): Promise<void> {
  assertSupabaseConfigured();

  const payload = rpcPayload(data);
  const rpcFns: Array<'tessy_publish_product' | 'publish_company_product'> = [
    'tessy_publish_product',
    'publish_company_product',
  ];
  const errors: string[] = [];

  for (const fn of rpcFns) {
    const err = await callRpc(fn, payload);
    if (!err) return;
    if (err.startsWith('__missing_rpc__:')) continue;
    errors.push(err);
  }

  const directErr = await insertDirect(data);
  if (!directErr) return;
  errors.push(directErr);

  if (errors.some(isComplianceBlock)) {
    throw new Error(
      'O banco ainda bloqueia publicação (regra antiga). Abra o Supabase → SQL Editor e execute '
      + 'supabase/RUN_ONCE_product_publish.sql inteiro. Depois recarregue e tente de novo.',
    );
  }

  throw new Error(errors[0] ?? 'Não foi possível publicar o produto.');
}
