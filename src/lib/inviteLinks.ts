/** URLs e textos prontos para convidar médicos (WhatsApp, e-mail, etc.). */

export const TESSY_BASE_URL = 'https://www.tessybr.com';
export const TESSY_CONTACT_EMAIL = 'contato@tessybr.com';

/**
 * CTA principal da página Para Empresas — abre WhatsApp do time comercial.
 * Número não é exibido na UI; o link abre em nova aba.
 */
export const COMPANY_MEETING_HREF =
  'https://wa.me/5511916391848?text=' +
  encodeURIComponent(
    'Olá! Conheci a Tessy e gostaria de agendar uma reunião para conhecer as oportunidades para empresas.',
  );

export const INVITE_URLS = {
  medico: `${TESSY_BASE_URL}/cadastro`,
  /** Página pública para empresas/representantes — sem self-serve de cadastro. */
  empresa: `${TESSY_BASE_URL}/para-empresas`,
} as const;

export const INVITE_WHATSAPP = {
  medico:
    'Olá! Estou usando a Tessy para conectar com empresas de saúde, eventos e oportunidades. Cadastre-se como médico: ' +
    INVITE_URLS.medico,
  empresa:
    'Olá! Conheça a Tessy para empresas — presença estratégica junto a médicos. Agende uma conversa pelo site: ' +
    INVITE_URLS.empresa,
} as const;
