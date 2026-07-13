import type { Event, Product, Course } from '../types';
import type { RepresentativeProfile } from './representatives';

export type HomeFeedItem =
  | { kind: 'product'; product: Product }
  | { kind: 'event'; event: Event }
  | { kind: 'course'; course: Course }
  | { kind: 'rep'; rep: RepresentativeProfile };

/**
 * Feed da home do médico — uma entrada por empresa, sem repetir produto + representante da mesma marca.
 * Prioridade: produto → evento → workshop → representante cadastrado.
 */
export function buildHomeFeed(
  products: Product[],
  events: Event[],
  courses: Course[],
  representatives: RepresentativeProfile[],
  maxItems = 10,
): HomeFeedItem[] {
  const companyShown = new Set<string>();
  const items: HomeFeedItem[] = [];

  function take(companyId: string) {
    if (companyShown.has(companyId)) return false;
    companyShown.add(companyId);
    return true;
  }

  for (const product of products) {
    if (!take(product.companyId)) continue;
    items.push({ kind: 'product', product });
    if (items.length >= maxItems) return items;
  }

  for (const event of events) {
    if (!take(event.companyId)) continue;
    items.push({ kind: 'event', event });
    if (items.length >= maxItems) return items;
  }

  for (const course of courses) {
    if (!take(course.companyId)) continue;
    items.push({ kind: 'course', course });
    if (items.length >= maxItems) return items;
  }

  for (const rep of representatives) {
    if (!take(rep.companyId)) continue;
    if (!rep.registered && rep.products.length === 0 && rep.events.length === 0) {
      companyShown.delete(rep.companyId);
      continue;
    }
    items.push({ kind: 'rep', rep });
    if (items.length >= maxItems) return items;
  }

  return items;
}
