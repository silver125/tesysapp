import { scoreContentForInterests } from './doctorPreferences';
import type { RepresentativeProfile } from './representatives';
import type { Course, Event, Product, User } from '../types';

export type OpportunityKind = 'company' | 'product' | 'event' | 'rep';

export type DoctorOpportunity = {
  id: string;
  kind: OpportunityKind;
  title: string;
  companyName: string;
  companyId: string;
  reasons: string[];
  sentence: string;
  score: number;
  product?: Product;
  event?: Event;
};

export type CompanyCatalog = {
  id: string;
  name: string;
  products: Product[];
  events: Event[];
  courses: Course[];
  locations: Array<{ city?: string; state?: string; address?: string }>;
};

function uniq(values: string[]) {
  const seen = new Set<string>();
  return values.filter(value => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function doctorRegion(user?: User | null) {
  const profile = user as (User & { city?: string; cidade?: string }) | null | undefined;
  return profile?.city?.trim() || profile?.cidade?.trim() || profile?.crmState?.trim() || '';
}

function matchesRegion(region: string, ...texts: Array<string | undefined>) {
  const needle = region.trim().toLowerCase();
  if (!needle) return false;
  return texts.some(text => text?.toLowerCase().includes(needle));
}

function collectReasons(
  user: User | null | undefined,
  interests: string[],
  texts: Array<string | undefined>,
  regionTexts: Array<string | undefined>,
): string[] {
  const reasons: string[] = [];
  const hay = texts.filter(Boolean).join(' ').toLowerCase();
  const specialty = user?.specialty?.trim();
  if (specialty && hay.includes(specialty.toLowerCase())) reasons.push(specialty);

  const region = doctorRegion(user);
  if (region && matchesRegion(region, ...regionTexts, ...texts)) reasons.push(region);

  for (const interest of interests) {
    if (scoreContentForInterests([interest], ...texts) > 0) reasons.push(interest);
  }

  return uniq(reasons).slice(0, 3);
}

export function formatMatchSentence(name: string, reasons: string[]) {
  if (reasons.length === 0) return `${name} está em destaque na vitrine hoje.`;
  if (reasons.length === 1) return `${name} combina com seu perfil por ${reasons[0]}.`;
  const last = reasons[reasons.length - 1];
  return `${name} combina com seu perfil por ${reasons.slice(0, -1).join(', ')} e ${last}.`;
}

function scoreMatch(reasons: string[], extras = 0) {
  return reasons.length * 8 + extras;
}

function fromCompany(
  company: CompanyCatalog,
  user: User | null | undefined,
  interests: string[],
): DoctorOpportunity {
  const texts = [
    company.name,
    ...company.products.flatMap(p => [p.name, p.category, p.description, p.availableFor]),
    ...company.events.flatMap(e => [e.title, e.category, e.location]),
    ...company.courses.flatMap(c => [c.title, c.category]),
  ];
  const regionTexts = [
    ...company.locations.flatMap(l => [l.city, l.state, l.address]),
    ...company.events.map(e => e.location),
  ];
  const reasons = collectReasons(user, interests, texts, regionTexts);
  const extras = company.products.length * 2 + company.events.length + company.courses.length;
  return {
    id: `company-${company.id}`,
    kind: 'company',
    title: company.name,
    companyName: company.name,
    companyId: company.id,
    reasons,
    sentence: formatMatchSentence(company.name, reasons),
    score: scoreMatch(reasons, extras),
    product: company.products[0],
    event: company.events[0],
  };
}

export function pickDoctorOpportunities(
  companies: CompanyCatalog[],
  products: Product[],
  events: Event[],
  representatives: RepresentativeProfile[],
  user: User | null | undefined,
  interests: string[],
  limit = 2,
): DoctorOpportunity[] {
  const byCompany = companies.map(company => fromCompany(company, user, interests));

  const byProduct = products.map(product => {
    const reasons = collectReasons(
      user,
      interests,
      [product.name, product.companyName, product.category, product.description, product.availableFor],
      [product.companyName],
    );
    return {
      id: `product-${product.id}`,
      kind: 'product' as const,
      title: product.name,
      companyName: product.companyName,
      companyId: product.companyId,
      reasons,
      sentence: formatMatchSentence(product.companyName || product.name, reasons),
      score: scoreMatch(reasons, 4),
      product,
    };
  });

  const byEvent = events.map(event => {
    const reasons = collectReasons(
      user,
      interests,
      [event.title, event.companyName, event.category, event.location],
      [event.location],
    );
    return {
      id: `event-${event.id}`,
      kind: 'event' as const,
      title: event.title,
      companyName: event.companyName,
      companyId: event.companyId,
      reasons,
      sentence: formatMatchSentence(event.companyName || event.title, reasons),
      score: scoreMatch(reasons, 3),
      event,
    };
  });

  const byRep = representatives.map(rep => {
    const reasons = collectReasons(
      user,
      interests,
      [rep.companyName, rep.specialty, rep.repLabel, ...rep.products.map(p => p.name)],
      [rep.regionLabel, ...rep.regionKeys],
    );
    return {
      id: `rep-${rep.id}`,
      kind: 'rep' as const,
      title: rep.companyName,
      companyName: rep.companyName,
      companyId: rep.companyId,
      reasons,
      sentence: formatMatchSentence(rep.companyName, reasons),
      score: scoreMatch(reasons, 2),
    };
  });

  const ranked = [...byCompany, ...byProduct, ...byEvent, ...byRep]
    .sort((a, b) => b.score - a.score || a.companyName.localeCompare(b.companyName, 'pt-BR'));

  const picked: DoctorOpportunity[] = [];
  const seenCompanies = new Set<string>();
  for (const item of ranked) {
    if (seenCompanies.has(item.companyId)) continue;
    seenCompanies.add(item.companyId);
    picked.push(item);
    if (picked.length >= limit) break;
  }
  return picked;
}
