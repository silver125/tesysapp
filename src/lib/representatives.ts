import type { Event, Product, Course, Location, Representative, User } from '../types';
import { companyInitials } from './uiHelpers';

export type RepresentativeProfile = {
  id: string;
  companyId: string;
  companyName: string;
  repLabel: string;
  whatsapp?: string;
  specialty: string;
  regionLabel: string;
  regionKeys: string[];
  companyLogoUrl: string;
  photoUrl?: string;
  bio?: string;
  registered: boolean;
  products: Product[];
  events: Event[];
  locations: Location[];
};

type CompanyBucket = {
  id: string;
  name: string;
  whatsapp?: string;
  products: Product[];
  events: Event[];
  courses: Course[];
  locations: Location[];
};

function normalizeRegion(value?: string | null) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export const BRAZIL_STATES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

function statesInRegion(value: string): string[] {
  const normalized = normalizeRegion(value);
  const tokens = normalized.split(/[^a-z0-9]+/);
  // Match longer state names first: Mato Grosso do Sul must not also become MT.
  let remaining = ` ${normalized} `;
  const states = new Set(tokens.filter(token => token.toUpperCase() in BRAZIL_STATES));
  for (const [uf, name] of Object.entries(BRAZIL_STATES).sort((a, b) => b[1].length - a[1].length)) {
    const pattern = new RegExp(`(^|[^a-z])${normalizeRegion(name)}(?=$|[^a-z])`, 'g');
    if (pattern.test(remaining)) {
      states.add(uf.toLowerCase());
      remaining = remaining.replace(pattern, ' ');
    }
  }
  return [...states];
}

function isNational(keys: string[]): boolean {
  return keys.some(key => /^(brasil|nacional|todo o brasil|todo brasil|atendimento nacional)$/.test(normalizeRegion(key)));
}

export function doctorRegionKeys(user?: User | null): string[] {
  const profile = user as (User & { city?: string; cidade?: string }) | null | undefined;
  const keys = [
    profile?.crmState,
    profile?.city,
    profile?.cidade,
  ].map(normalizeRegion).filter(Boolean);
  return [...new Set(keys)];
}

function locationRegionKeys(loc: Location): string[] {
  return [loc.state, loc.city, loc.address]
    .map(normalizeRegion)
    .filter(Boolean);
}

export function regionLabelFromLocations(locations: Location[]): string {
  const first = locations.find(l => l.city?.trim() || l.state?.trim());
  if (!first) return 'Região não informada';
  const city = first.city?.trim();
  const state = first.state?.trim();
  if (city && state) return `${city} · ${state}`;
  return city || state || 'Região não informada';
}

/** Logo da empresa (perfil) — nunca imagem de produto, evento ou curso. */
function resolveCompanyLogo(companyId: string, companyLogos: Record<string, string>): string {
  return companyLogos[companyId]?.trim() || '';
}

function topSpecialty(products: Product[], events: Event[], courses: Course[]): string {
  return products[0]?.category?.trim()
    || events[0]?.category?.trim()
    || courses[0]?.category?.trim()
    || 'Saúde';
}

function repLabel(companyName: string): string {
  const short = companyName.trim().split(/\s+/)[0];
  return short ? `Representante ${short}` : 'Representante comercial';
}

function regionScore(regionKeys: string[], doctorKeys: string[]): number {
  if (doctorKeys.length === 0 || regionKeys.length === 0) return 0;
  const states = regionKeys.flatMap(statesInRegion);
  return doctorKeys.reduce((score, key) => score + (
    regionKeys.includes(key) || statesInRegion(key).some(state => states.includes(state)) ? 2 : 0
  ), isNational(regionKeys) ? 1 : 0);
}

function repRegionLabel(rep: Representative, fallback: string): string {
  const city = rep.city?.trim();
  const state = rep.state?.trim();
  if (rep.region?.trim()) return rep.region.trim();
  if (city && state) return `${city} · ${state}`;
  return city || state || fallback;
}

export function buildRepresentativeProfiles(
  events: Event[],
  products: Product[],
  courses: Course[],
  locations: Location[],
  user?: User | null,
  representatives: Representative[] = [],
  companyLogos: Record<string, string> = {},
): RepresentativeProfile[] {
  const map = new Map<string, CompanyBucket>();

  const ensure = (id: string, name: string, whatsapp?: string) => {
    const existing = map.get(id) ?? {
      id, name, whatsapp, products: [], events: [], courses: [], locations: [],
    };
    map.set(id, { ...existing, whatsapp: existing.whatsapp ?? whatsapp });
    return map.get(id)!;
  };

  events.forEach(e => ensure(e.companyId, e.companyName, e.companyWhatsapp).events.push(e));
  products.forEach(p => ensure(p.companyId, p.companyName, p.companyWhatsapp).products.push(p));
  courses.forEach(c => ensure(c.companyId, c.companyName, c.companyWhatsapp).courses.push(c));
  locations.forEach(l => ensure(l.companyId, l.companyName, l.whatsapp).locations.push(l));

  const doctorKeys = doctorRegionKeys(user);
  const specialty = normalizeRegion(user?.specialty);
  const companiesWithRegistered = new Set(representatives.map(r => r.companyId));

  type Scored = RepresentativeProfile & { _regionScore: number; _specialtyScore: number };
  const scored: Scored[] = [];

  // 1) Representantes cadastrados pela empresa (com foto, região e especialidade próprias).
  for (const rep of representatives) {
    const bucket = map.get(rep.companyId);
    const products = bucket?.products ?? [];
    const events = bucket?.events ?? [];
    const courses = bucket?.courses ?? [];
    const bucketLocations = bucket?.locations ?? [];
    const regionKeys = [...new Set([
      ...[rep.city, rep.state, rep.region].map(normalizeRegion).filter(Boolean),
    ])];
    const repSpecialty = rep.specialty?.trim() || topSpecialty(products, events, courses);
    scored.push({
      id: rep.id,
      companyId: rep.companyId,
      companyName: rep.companyName,
      repLabel: rep.name?.trim() || repLabel(rep.companyName),
      whatsapp: rep.whatsapp?.trim() || bucket?.whatsapp,
      specialty: repSpecialty,
      regionLabel: repRegionLabel(rep, regionLabelFromLocations(bucketLocations)),
      regionKeys,
      companyLogoUrl: resolveCompanyLogo(rep.companyId, companyLogos),
      photoUrl: rep.photoUrl?.trim() || undefined,
      bio: rep.bio?.trim() || undefined,
      registered: true,
      products,
      events,
      locations: bucketLocations,
      _regionScore: regionScore(regionKeys, doctorKeys),
      _specialtyScore: specialty && repSpecialty.toLowerCase().includes(specialty) ? 1 : 0,
    });
  }

  // 2) Empresas sem representante cadastrado — perfil derivado quando há ofertas publicadas.
  for (const co of map.values()) {
    if (companiesWithRegistered.has(co.id)) continue;
    const hasOfferings = co.products.length > 0 || co.events.length > 0 || co.courses.length > 0;
    if (!hasOfferings) continue;
    const regionKeys = [...new Set([
      ...co.locations.flatMap(locationRegionKeys),
    ])];
    const repSpecialty = topSpecialty(co.products, co.events, co.courses);
    scored.push({
      id: co.id,
      companyId: co.id,
      companyName: co.name,
      repLabel: repLabel(co.name),
      whatsapp: co.whatsapp,
      specialty: repSpecialty,
      regionLabel: regionLabelFromLocations(co.locations),
      regionKeys,
      companyLogoUrl: resolveCompanyLogo(co.id, companyLogos),
      photoUrl: undefined,
      registered: false,
      products: co.products,
      events: co.events,
      locations: co.locations,
      _regionScore: regionScore(regionKeys, doctorKeys),
      _specialtyScore: specialty && repSpecialty.toLowerCase().includes(specialty) ? 1 : 0,
    });
  }

  return scored
    .sort((a, b) => (
      Number(b.registered) - Number(a.registered)
      || b._regionScore - a._regionScore
      || b._specialtyScore - a._specialtyScore
      || b.events.length - a.events.length
      || b.products.length - a.products.length
    ))
    .map(({ _regionScore, _specialtyScore, ...rest }) => {
      void _regionScore;
      void _specialtyScore;
      return rest;
    });
}

export function representativeRegionFilters(): [string, string][] {
  return [['all', 'Todas as regiões'], ...Object.entries(BRAZIL_STATES)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([uf, name]) => [uf.toLowerCase(), `${uf} · ${name}`] as [string, string])];
}

export function matchesRepresentativeRegion(profile: RepresentativeProfile, filter: string) {
  if (filter === 'all') return true;
  const keys = profile.regionKeys.map(normalizeRegion);
  if (isNational(keys)) return true;
  const q = normalizeRegion(filter);
  if (q.toUpperCase() in BRAZIL_STATES) {
    return keys.some(key => statesInRegion(key).includes(q));
  }
  return keys.some(key => key === q);
}

export function matchesRepresentativeCategory(profile: RepresentativeProfile, category: string): boolean {
  if (category === 'all') return true;
  const text = normalizeRegion([profile.specialty, profile.bio,
    ...profile.products.flatMap(product => [product.name, product.category, product.description]),
  ].filter(Boolean).join(' '));
  if (category === 'skincare') return /skincare|dermocosm|cosmet|cuidados com a pele/.test(text);
  if (category === 'tecnologias') return /tecnolog|equipamento|laser|ultrassom|radiofrequencia/.test(text);
  if (category === 'parcerias') return /parceria/.test(text) || profile.products.some(product => product.listingType === 'partnership');
  return false;
}

export function matchesRepresentativeSearch(profile: RepresentativeProfile, query: string): boolean {
  const q = normalizeRegion(query);
  return !q || normalizeRegion([profile.companyName, profile.repLabel, profile.specialty,
    profile.bio, ...profile.regionKeys,
    ...profile.products.flatMap(product => [product.name, product.category]),
    ...profile.events.flatMap(event => [event.title, event.category]),
  ].filter(Boolean).join(' ')).includes(q);
}

export function representativeInitials(name: string) {
  return companyInitials(name, 'RC');
}

/** Resumo do que a empresa/representante oferece na plataforma. */
export function representativeOfferSummary(profile: RepresentativeProfile): string {
  const bits: string[] = [];
  const nProducts = profile.products.length;
  const nEvents = profile.events.length;
  if (nProducts > 0) bits.push(`${nProducts} produto${nProducts === 1 ? '' : 's'}`);
  if (nEvents > 0) bits.push(`${nEvents} evento${nEvents === 1 ? '' : 's'}`);
  const nextEvent = profile.events[0]?.title?.trim();
  if (nextEvent) bits.push(nextEvent);
  else if (bits.length === 0 && profile.products[0]?.category?.trim()) {
    bits.push(profile.products[0].category.trim());
  }
  return bits.join(' · ');
}

/** Nome exibido no card — cadastrado usa o nome; derivado usa a empresa (sem "Representante X"). */
export function representativeDisplayName(profile: RepresentativeProfile): string {
  if (profile.registered) {
    return profile.repLabel.trim() || profile.companyName.trim() || 'Representante';
  }
  return profile.companyName.trim() || profile.repLabel.replace(/^Representante\s+/i, '').trim() || 'Representante';
}

function normalizeImageUrl(url?: string | null): string {
  return (url ?? '').trim().toLowerCase();
}

/** URLs de imagem de produto da mesma empresa — nunca devem aparecer no card de representante. */
function productImageUrls(products: Product[]): Set<string> {
  const urls = new Set<string>();
  for (const product of products) {
    const image = normalizeImageUrl(product.imageUrl);
    if (image) urls.add(image);
  }
  return urls;
}

function isProductImageUrl(url: string | undefined, products: Product[]): boolean {
  const normalized = normalizeImageUrl(url);
  return normalized.length > 0 && productImageUrls(products).has(normalized);
}

/** Foto pessoal do representante — nunca imagem de produto ou logo da empresa. */
export function representativeAvatarUrl(profile: RepresentativeProfile): string | undefined {
  const photo = profile.photoUrl?.trim();
  if (!photo || isProductImageUrl(photo, profile.products)) return undefined;
  return photo;
}

/**
 * Imagem principal do card de representante: foto do rep ou logo da empresa.
 * Sem foto nem logo → undefined (UI usa iniciais).
 */
export function representativeDisplayImageUrl(profile: RepresentativeProfile): string | undefined {
  const photo = profile.photoUrl?.trim();
  if (photo && !isProductImageUrl(photo, profile.products)) return photo;

  const logo = profile.companyLogoUrl?.trim();
  if (logo && !isProductImageUrl(logo, profile.products)) return logo;

  return undefined;
}

/** Selo da empresa no canto — só quando há foto pessoal do representante. */
export function representativeCompanyBadgeUrl(profile: RepresentativeProfile): string | undefined {
  const photo = representativeAvatarUrl(profile);
  const logo = profile.companyLogoUrl?.trim();
  if (photo && logo && !isProductImageUrl(logo, profile.products)) {
    return logo;
  }
  return undefined;
}
