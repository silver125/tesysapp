export const REP_CATEGORIES = [
  { id: 'skincare', label: 'Skincare' },
  { id: 'tecnologias', label: 'Tecnologias' },
  { id: 'parcerias', label: 'Parcerias' },
] as const;

export type RepCategoryId = (typeof REP_CATEGORIES)[number]['id'];

export const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export function categoryLabel(id: string): string {
  return REP_CATEGORIES.find(c => c.id === id)?.label ?? id;
}

export function parseBrands(raw?: string | null): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(
    raw.split(/[,;/|]+/).map(s => s.trim()).filter(Boolean),
  )];
}

export function formatBrands(brands: string[]): string {
  return brands.map(b => b.trim()).filter(Boolean).join(', ');
}

export type RepCompletenessInput = {
  name?: string | null;
  photoUrl?: string | null;
  companyName?: string | null;
  categories?: string[] | null;
  brands?: string | null;
  bio?: string | null;
  coversNationally?: boolean | null;
  coverageStates?: string[] | null;
  whatsapp?: string | null;
};

export type RepMissingField = {
  key: string;
  label: string;
};

export function representativeMissingFields(rep: RepCompletenessInput): RepMissingField[] {
  const missing: RepMissingField[] = [];
  if (!rep.name?.trim()) missing.push({ key: 'name', label: 'Nome' });
  if (!rep.photoUrl?.trim()) missing.push({ key: 'photo', label: 'Foto' });
  if (!rep.companyName?.trim()) missing.push({ key: 'company', label: 'Empresa' });
  if (!rep.categories?.length) missing.push({ key: 'categories', label: 'Categorias' });
  if (!parseBrands(rep.brands).length) missing.push({ key: 'brands', label: 'Marcas' });
  if (!rep.bio?.trim()) missing.push({ key: 'bio', label: 'Descrição do que oferece' });
  const hasCoverage = Boolean(rep.coversNationally) || Boolean(rep.coverageStates?.length);
  if (!hasCoverage) missing.push({ key: 'coverage', label: 'Regiões de atendimento' });
  if (!rep.whatsapp?.trim()) missing.push({ key: 'whatsapp', label: 'WhatsApp profissional' });
  return missing;
}

export function isRepresentativeSearchable(rep: RepCompletenessInput): boolean {
  return representativeMissingFields(rep).length === 0;
}

export function coverageLabel(rep: {
  coversNationally?: boolean | null;
  coverageStates?: string[] | null;
  coverageCities?: string[] | null;
}): string {
  if (rep.coversNationally) return 'Atendimento nacional';
  const states = (rep.coverageStates ?? []).map(s => s.trim().toUpperCase()).filter(Boolean);
  const cities = (rep.coverageCities ?? []).map(c => c.trim()).filter(Boolean);
  if (cities.length && states.length) {
    return `${cities.slice(0, 2).join(', ')}${cities.length > 2 ? '…' : ''} · ${states.join(', ')}`;
  }
  if (states.length) return states.join(', ');
  if (cities.length) return cities.slice(0, 3).join(', ');
  return 'Região não informada';
}

export function matchesCoverage(
  rep: {
    coversNationally?: boolean | null;
    coverageStates?: string[] | null;
    coverageCities?: string[] | null;
  },
  stateFilter: string,
  cityFilter: string,
): boolean {
  const stateQ = stateFilter.trim().toLowerCase();
  const cityQ = cityFilter.trim().toLowerCase();
  if (!stateQ && !cityQ) return true;
  if (rep.coversNationally) return true;

  const states = (rep.coverageStates ?? []).map(s => s.trim().toLowerCase());
  const cities = (rep.coverageCities ?? []).map(c => c.trim().toLowerCase());

  if (stateQ && stateQ !== 'all') {
    const stateOk = states.some(s => s === stateQ || s.includes(stateQ));
    if (!stateOk) return false;
  }
  if (cityQ) {
    const cityOk = cities.some(c => c.includes(cityQ));
    if (!cityOk && !rep.coversNationally) return false;
  }
  return true;
}
