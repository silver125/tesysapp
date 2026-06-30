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

function locationRegionKeys(loc: Location): string[] {
  return [loc.state, loc.city, loc.address]
    .map(normalizeRegion)
    .filter(Boolean);
}

export function regionLabelFromLocations(locations: Location[]): string {
  const first = locations.find(l => l.city?.trim() || l.state?.trim());
  if (!first) return 'Brasil';
  const city = first.city?.trim();
  const state = first.state?.trim();
  if (city && state) return `${city} · ${state}`;
  return city || state || 'Brasil';
}

function companyLogo(products: Product[], events: Event[], courses: Course[]): string {
  return products.find(p => p.imageUrl?.trim())?.imageUrl?.trim()
    || events.find(e => e.imageUrl?.trim())?.imageUrl?.trim()
    || courses.find(c => c.imageUrl?.trim())?.imageUrl?.trim()
    || '';
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
  let score = 0;
  for (const doctorKey of doctorKeys) {
    if (regionKeys.some(key => key.includes(doctorKey) || doctorKey.includes(key))) {
      score += 2;
    }
  }
  return score;
}

function repRegionLabel(rep: Representative, fallback: string): string {
  const city = rep.city?.trim();
  const state = rep.state?.trim();
  if (city && state) return `${city} · ${state}`;
  if (rep.region?.trim()) return rep.region.trim();
  return city || state || fallback;
}

export function buildRepresentativeProfiles(
  events: Event[],
  products: Product[],
  courses: Course[],
  locations: Location[],
  user?: User | null,
  representatives: Representative[] = [],
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
      ...bucketLocations.flatMap(locationRegionKeys),
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
      companyLogoUrl: companyLogo(products, events, courses),
      photoUrl: rep.photoUrl?.trim() || undefined,
      registered: true,
      products,
      events,
      locations: bucketLocations,
      _regionScore: regionScore(regionKeys, doctorKeys),
      _specialtyScore: specialty && repSpecialty.toLowerCase().includes(specialty) ? 1 : 0,
    });
  }

  // 2) Empresas sem representante cadastrado caem no perfil derivado (precisa de WhatsApp).
  for (const co of map.values()) {
    if (companiesWithRegistered.has(co.id)) continue;
    if (!co.whatsapp?.trim()) continue;
    const regionKeys = [...new Set(co.locations.flatMap(locationRegionKeys))];
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
      companyLogoUrl: companyLogo(co.products, co.events, co.courses),
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
      || b._specialtyScore - a._specialtyScore
      || b._regionScore - a._regionScore
      || b.products.length - a.products.length
    ))
    .map(({ _regionScore, _specialtyScore, ...rest }) => {
      void _regionScore;
      void _specialtyScore;
      return rest;
    });
}

export function representativeRegionFilters(profiles: RepresentativeProfile[]): [string, string][] {
  const states = new Set<string>();
  for (const profile of profiles) {
    for (const key of profile.regionKeys) {
      if (key.length <= 3) states.add(key.toUpperCase());
    }
    const state = profile.regionLabel.split('·').pop()?.trim();
    if (state) states.add(state);
  }
  return [['all', 'Todas regiões'], ...[...states].slice(0, 8).map(s => [s.toLowerCase(), s] as [string, string])];
}

export function matchesRepresentativeRegion(profile: RepresentativeProfile, filter: string) {
  if (filter === 'all') return true;
  const q = filter.toLowerCase();
  return profile.regionKeys.some(key => key.includes(q))
    || profile.regionLabel.toLowerCase().includes(q);
}

export function representativeInitials(name: string) {
  return companyInitials(name, 'RC');
}
