import type { AddLeadResult, LeadInput } from '../types';

export function representativeLeadInput(companyId: string, companyName: string, representative?: { id: string; name: string }): LeadInput {
  return {
    companyId,
    companyName,
    itemType: 'company',
    itemId: representative?.id,
    itemName: representative?.name || companyName,
    intent: 'representative_contact',
    message: representative ? `Médico pediu contato de ${representative.name}.` : 'Médico pediu contato do representante regional.',
  };
}

export type RepresentativeConnectResult = {
  whatsappOpened: boolean;
  created: boolean;
  pointsAwarded: number;
  message: string;
};

/**
 * Registra interesse no representante/empresa — fluxo unificado sem abrir WhatsApp direto.
 * A empresa vê o sinal em Médicos e pode pedir permissão para WhatsApp.
 */
export async function connectWithRepresentative(
  companyId: string,
  companyName: string,
  _whatsapp: string | undefined,
  addLead: (input: LeadInput) => Promise<AddLeadResult>,
  representative?: { id: string; name: string },
): Promise<RepresentativeConnectResult> {
  const lead = await addLead(representativeLeadInput(companyId, companyName, representative));

  let message: string;
  if (lead.pointsAwarded > 0) {
    message = `Interesse enviado · +${lead.pointsAwarded} pts. A empresa pode pedir permissão para WhatsApp.`;
  } else if (lead.created) {
    message = 'Interesse enviado. A empresa pode pedir permissão para WhatsApp.';
  } else {
    message = 'Interesse já registrado. Aguarde a empresa pedir permissão para WhatsApp.';
  }

  return {
    whatsappOpened: false,
    created: lead.created,
    pointsAwarded: lead.pointsAwarded,
    message,
  };
}
