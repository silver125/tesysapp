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
