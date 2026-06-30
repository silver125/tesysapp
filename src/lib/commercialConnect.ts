import type { AddLeadResult, LeadInput } from '../types';
import { openWhatsappLink } from './uiHelpers';

export function representativeLeadInput(companyId: string, companyName: string): LeadInput {
  return {
    companyId,
    companyName,
    itemType: 'company',
    itemName: companyName,
    intent: 'representative_contact',
    message: 'Médico pediu contato do representante regional.',
  };
}

export function representativeWhatsappMessage(companyName: string) {
  return `Olá ${companyName}, sou médico no Tessy e gostaria de falar com o representante.`;
}

export type RepresentativeConnectResult = {
  whatsappOpened: boolean;
  created: boolean;
  pointsAwarded: number;
  message: string;
};

/**
 * Abre WhatsApp no gesto do clique e registra o lead de forma idempotente.
 * Pontos só entram na primeira vez (via RPC award_doctor_interest_points).
 */
export async function connectWithRepresentative(
  companyId: string,
  companyName: string,
  whatsapp: string | undefined,
  addLead: (input: LeadInput) => Promise<AddLeadResult>,
): Promise<RepresentativeConnectResult> {
  const whatsappOpened = openWhatsappLink(whatsapp, representativeWhatsappMessage(companyName));
  const lead = await addLead(representativeLeadInput(companyId, companyName));

  let message: string;
  if (lead.pointsAwarded > 0) {
    message = whatsappOpened
      ? `WhatsApp aberto · +${lead.pointsAwarded} pts`
      : `Contato registrado · +${lead.pointsAwarded} pts`;
  } else if (whatsappOpened) {
    message = 'WhatsApp aberto · contato já registrado';
  } else if (lead.created) {
    message = 'Contato registrado';
  } else {
    message = 'Contato já registrado. Peça à empresa para atualizar o WhatsApp.';
  }

  return {
    whatsappOpened,
    created: lead.created,
    pointsAwarded: lead.pointsAwarded,
    message,
  };
}
