import { WhatsappLogo } from '@phosphor-icons/react';
import { useAuth } from '../context/useAuth';
import { representativeLeadInput } from '../lib/commercialConnect';
import { buildWhatsappLink } from '../lib/uiHelpers';
import type { RepresentativeProfile } from '../lib/representatives';

/** A real link opens on the click; recording interest never gates the conversation. */
export default function RepresentativeWhatsapp({ rep }: { rep: RepresentativeProfile }) {
  const { addLead } = useAuth();
  const href = buildWhatsappLink(rep.whatsapp, `Olá, ${rep.repLabel}! Encontrei seu contato na Tessy e gostaria de saber mais.`);
  if (!href) return <span className="doctor-contact-unavailable">WhatsApp não cadastrado</span>;
  return <a className="doctor-whatsapp" href={href} target="_blank" rel="noopener noreferrer"
    aria-label={`Falar com ${rep.repLabel} no WhatsApp`}
    onClick={() => {
      void addLead(representativeLeadInput(rep.companyId, rep.companyName, rep.registered ? { id: rep.id, name: rep.repLabel } : undefined))
        .catch(() => { /* The direct contact remains available if interest tracking is offline. */ });
    }}><WhatsappLogo size={21} weight="fill" aria-hidden="true" /> WhatsApp direto</a>;
}
