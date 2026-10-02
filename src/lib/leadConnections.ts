import type { Lead } from '../types';

const CONNECTION_RANK = { none: 0, requested: 1, approved: 2 };

/** Keep the persisted id and status together; never merge permission from another lead. */
export function groupCompanyContacts(leads: Lead[]): Lead[] {
  const groups = new Map<string, Lead>();
  const ordered = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const lead of ordered) {
    const representative = lead.intent === 'representative_contact' && lead.itemType === 'company'
      ? lead.itemId ?? 'company' : 'other';
    const key = `${lead.companyId}:${lead.doctorId}:${representative}`;
    const current = groups.get(key);
    if (!current || CONNECTION_RANK[lead.connectionStatus ?? 'none'] > CONNECTION_RANK[current.connectionStatus ?? 'none']
      || (lead.connectionStatus === current.connectionStatus && Boolean(lead.contactConsentAt) && !current.contactConsentAt)) {
      groups.set(key, lead);
    }
  }
  return [...groups.values()];
}


type CatalogItem = { id: string; companyId: string };
type VisibleCatalog = {
  events: CatalogItem[];
  products: CatalogItem[];
  courses: CatalogItem[];
  representatives: Array<CatalogItem & { registered: boolean }>;
};

/** Invitations must resolve to an existing item in the already-filtered catalog. */
export function filterLeadsForCatalog(leads: Lead[], catalog: VisibleCatalog): Lead[] {
  const key = (companyId: string, itemId: string) => `${companyId}:${itemId}`;
  const ids = {
    event: new Set(catalog.events.map(item => key(item.companyId, item.id))),
    product: new Set(catalog.products.map(item => key(item.companyId, item.id))),
    course: new Set(catalog.courses.map(item => key(item.companyId, item.id))),
    company: new Set(catalog.representatives.filter(rep => rep.registered).map(rep => key(rep.companyId, rep.id))),
  };
  const companyContacts = new Set(catalog.representatives.filter(rep => !rep.registered).map(rep => rep.companyId));
  return leads.filter(lead => {
    if (lead.itemType === 'company' && !lead.itemId) return companyContacts.has(lead.companyId);
    return Boolean(lead.itemId && ids[lead.itemType]?.has(key(lead.companyId, lead.itemId)));
  });
}
