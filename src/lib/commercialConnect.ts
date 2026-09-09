import type { AddLeadResult, LeadInput, Representative } from '../types';

export function representativeLeadInput(rep: Pick<Representative, 'id' | 'companyId' | 'companyName' | 'name'>): LeadInput {
  return {
    companyId: rep.companyId,
    companyName: rep.companyName,
    itemType: 'company',
    itemId: rep.id,
    itemName: rep.name.trim() || 'Representante',
    intent: 'representative_contact',
    message: `Médico pediu contato de ${rep.name.trim() || 'representante'}.`,
  };
}

export type RepresentativeConnectResult = {
  whatsappOpened: boolean;
  created: boolean;
  pointsAwarded: number;
  message: string;
};

/**
 * Registra interesse em um representante específico — sem abrir WhatsApp.
 * A empresa responsável vê o sinal e pode pedir permissão.
 */
export async function connectWithRepresentative(
  rep: Pick<Representative, 'id' | 'companyId' | 'companyName' | 'name'>,
  addLead: (input: LeadInput) => Promise<AddLeadResult>,
): Promise<RepresentativeConnectResult> {
  const lead = await addLead(representativeLeadInput(rep));

  let message: string;
  if (lead.created) {
    message = 'Interesse enviado. Aguarde a autorização para conversar.';
  } else {
    message = 'Interesse já registrado. Aguarde a autorização para conversar.';
  }

  return {
    whatsappOpened: false,
    created: lead.created,
    pointsAwarded: lead.pointsAwarded,
    message,
  };
}
