import type { Representative, User } from '../types';
import { companyInitials } from './uiHelpers';
import {
  categoryLabel,
  coverageLabel,
  isRepresentativeSearchable,
  matchesCoverage,
  parseBrands,
} from './repProfile';

export type RepresentativeProfile = {
  id: string;
  companyId: string;
  companyName: string;
  repLabel: string;
  /** WhatsApp profissional — só use após conexão aprovada no fluxo de leads. */
  whatsapp?: string;
  specialty: string;
  categories: string[];
  brands: string[];
  regionLabel: string;
  regionKeys: string[];
  coversNationally: boolean;
  coverageStates: string[];
  coverageCities: string[];
  companyLogoUrl: string;
  photoUrl?: string;
  bio?: string;
  registered: boolean;
  searchable: boolean;
};

function normalizeRegion(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
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

function regionScore(regionKeys: string[], doctorKeys: string[], national: boolean): number {
  if (national) return 1;
  if (doctorKeys.length === 0 || regionKeys.length === 0) return 0;
  let score = 0;
  for (const doctorKey of doctorKeys) {
    if (regionKeys.some(key => key.includes(doctorKey) || doctorKey.includes(key))) {
      score += 2;
    }
  }
  return score;
}

function repRegionKeys(rep: Representative): string[] {
  if (rep.coversNationally) return ['nacional', 'brasil', 'br'];
  return [...new Set([
    ...(rep.coverageStates ?? []).map(normalizeRegion),
    ...(rep.coverageCities ?? []).map(normalizeRegion),
    normalizeRegion(rep.region),
    normalizeRegion(rep.state),
    normalizeRegion(rep.city),
  ].filter(Boolean))];
}

function resolveCategories(rep: Representative): string[] {
  if (rep.categories?.length) return rep.categories;
  if (rep.specialty?.trim()) {
    const s = rep.specialty.toLowerCase();
    if (s.includes('derma') || s.includes('skin')) return ['skincare'];
    if (s.includes('tecnolog') || s.includes('equip') || s.includes('laser')) return ['tecnologias'];
    if (s.includes('parcer')) return ['parcerias'];
  }
  return [];
}

/**
 * Monta perfis para a busca médica.
 * Apenas representantes cadastrados e com perfil completo entram na vitrine.
 * Não gera perfis fictícios a partir de produtos/eventos.
 */
export function buildRepresentativeProfiles(
  _events: unknown[],
  _products: unknown[],
  _courses: unknown[],
  _locations: unknown[],
  user?: User | null,
  representatives: Representative[] = [],
  companyLogos: Record<string, string> = {},
): RepresentativeProfile[] {
  const doctorKeys = doctorRegionKeys(user);

  type Scored = RepresentativeProfile & { _regionScore: number };
  const scored: Scored[] = [];

  for (const rep of representatives) {
    if (!rep.name?.trim()) continue;
    const categories = resolveCategories(rep);
    const searchable = isRepresentativeSearchable({
      ...rep,
      categories,
    });
    if (!searchable) continue;

    const coversNationally = Boolean(rep.coversNationally);
    const coverageStates = (rep.coverageStates ?? []).map(s => s.trim().toUpperCase()).filter(Boolean);
    const coverageCities = (rep.coverageCities ?? []).map(c => c.trim()).filter(Boolean);
    const regionKeys = repRegionKeys({ ...rep, categories, coversNationally, coverageStates, coverageCities });
    const brands = parseBrands(rep.brands);
    const specialty = categories.map(categoryLabel).join(' · ') || rep.specialty?.trim() || 'Comercial';

    scored.push({
      id: rep.id,
      companyId: rep.companyId,
      companyName: rep.companyName,
      repLabel: rep.name.trim(),
      whatsapp: undefined,
      specialty,
      categories,
      brands,
      regionLabel: coverageLabel({ coversNationally, coverageStates, coverageCities }),
      regionKeys,
      coversNationally,
      coverageStates,
      coverageCities,
      companyLogoUrl: companyLogos[rep.companyId]?.trim() || '',
      photoUrl: rep.photoUrl?.trim() || undefined,
      bio: rep.bio?.trim() || undefined,
      registered: true,
      searchable: true,
      _regionScore: regionScore(regionKeys, doctorKeys, coversNationally),
    });
  }

  return scored
    .sort((a, b) => b._regionScore - a._regionScore || a.repLabel.localeCompare(b.repLabel, 'pt-BR'))
    .map(({ _regionScore, ...rest }) => {
      void _regionScore;
      return rest;
    });
}

export function representativeRegionFilters(profiles: RepresentativeProfile[]): [string, string][] {
  const states = new Set<string>();
  for (const profile of profiles) {
    if (profile.coversNationally) {
      states.add('Nacional');
      continue;
    }
    for (const state of profile.coverageStates) {
      states.add(state.toUpperCase());
    }
  }
  return [['all', 'Todas regiões'], ...[...states].sort().map(s => [s.toLowerCase(), s] as [string, string])];
}

export function matchesRepresentativeRegion(profile: RepresentativeProfile, filter: string) {
  if (filter === 'all') return true;
  return matchesCoverage(profile, filter, '');
}

export function matchesRepresentativeCategory(profile: RepresentativeProfile, filter: string) {
  if (filter === 'all') return true;
  return profile.categories.includes(filter);
}

export function matchesRepresentativeQuery(profile: RepresentativeProfile, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    profile.repLabel,
    profile.companyName,
    ...profile.brands,
    ...profile.categories.map(categoryLabel),
    profile.regionLabel,
    profile.bio ?? '',
  ].some(value => value.toLowerCase().includes(q));
}

export function representativeInitials(name: string) {
  return companyInitials(name, 'RC');
}

export function representativeOfferSummary(profile: RepresentativeProfile): string {
  const bits: string[] = [];
  if (profile.categories.length) bits.push(profile.categories.map(categoryLabel).join(' · '));
  if (profile.brands.length) bits.push(profile.brands.slice(0, 3).join(', '));
  return bits.join(' · ');
}

export function representativeDisplayName(profile: RepresentativeProfile): string {
  return profile.repLabel.trim() || profile.companyName.trim() || 'Representante';
}

export function representativeAvatarUrl(profile: RepresentativeProfile): string | undefined {
  return profile.photoUrl?.trim() || undefined;
}

export function representativeDisplayImageUrl(profile: RepresentativeProfile): string | undefined {
  return profile.photoUrl?.trim() || profile.companyLogoUrl?.trim() || undefined;
}

export function representativeCompanyBadgeUrl(profile: RepresentativeProfile): string | undefined {
  const photo = representativeAvatarUrl(profile);
  const logo = profile.companyLogoUrl?.trim();
  if (photo && logo) return logo;
  return undefined;
}
