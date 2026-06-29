import type { Event, Product, Course, Location, User } from '../types';
import { companyInitials } from './uiHelpers';

export type RepresentativeProfile = {
  companyId: string;
  companyName: string;
  repLabel: string;
  whatsapp?: string;
  specialty: string;
  regionLabel: string;
  regionKeys: string[];
  companyLogoUrl: string;
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

export function buildRepresentativeProfiles(
  events: Event[],
  products: Product[],
  courses: Course[],
  locations: Location[],
  user?: User | null,
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

  const profiles = [...map.values()]
    .filter(co => Boolean(co.whatsapp?.trim()))
    .map(co => {
      const regionKeys = [...new Set(co.locations.flatMap(locationRegionKeys))];
      return {
        companyId: co.id,
        companyName: co.name,
        repLabel: repLabel(co.name),
        whatsapp: co.whatsapp,
        specialty: topSpecialty(co.products, co.events, co.courses),
        regionLabel: regionLabelFromLocations(co.locations),
        regionKeys,
        companyLogoUrl: companyLogo(co.products, co.events, co.courses),
        products: co.products,
        events: co.events,
        locations: co.locations,
        _regionScore: regionScore(regionKeys, doctorKeys),
        _specialtyScore: specialty && topSpecialty(co.products, co.events, co.courses).toLowerCase().includes(specialty) ? 1 : 0,
      };
    })
    .sort((a, b) => (
      b._specialtyScore - a._specialtyScore
      || b._regionScore - a._regionScore
      || b.products.length - a.products.length
    ))
    .map((profile) => {
      const { _regionScore, _specialtyScore, ...rest } = profile;
      void _regionScore;
      void _specialtyScore;
      return rest;
    });

  return profiles;
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
