import type { Lead } from '../types';
import { buildWhatsappLink } from './uiHelpers';

/** Reserve the tab during the click so async acceptance is not blocked as a popup. */
export async function runCompanyContactAction(lead: Lead, accept: (id: string) => Promise<string | void>) {
  const tab = lead.contactConsentAt ? window.open('about:blank', '_blank') : null;
  if (tab) tab.opener = null;
  try {
    const phone = await accept(lead.id);
    const url = phone ? buildWhatsappLink(phone, `Olá ${lead.doctorName}, vi seu interesse em ${lead.itemName} na Tessy. Podemos conversar?`) : '';
    if (tab && url) tab.location.replace(url);
    else tab?.close();
  } catch (error) {
    tab?.close();
    throw error;
  }
}
