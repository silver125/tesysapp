/** URLs e textos prontos para convidar médicos (WhatsApp, e-mail, etc.). */

export const TESSY_BASE_URL = 'https://www.tessybr.com';
export const TESSY_CONTACT_EMAIL = 'contato@tessybr.com';

export const INVITE_URLS = {
  medico: `${TESSY_BASE_URL}/cadastro`,
  /** Empresas entram via reunião comercial — sem self-serve nesta etapa. */
  empresa: `mailto:${TESSY_CONTACT_EMAIL}?subject=${encodeURIComponent('Reunião comercial Tessy')}&body=${encodeURIComponent('Olá, gostaria de agendar uma reunião para conhecer a Tessy como empresa.')}`,
} as const;

export const INVITE_WHATSAPP = {
  medico:
    'Olá! Estou usando a Tessy para conectar com empresas de saúde, eventos e oportunidades. Cadastre-se como médico: ' +
    INVITE_URLS.medico,
  empresa:
    'Olá! Na Tessy, o atendimento a empresas é feito por reunião. Para agendar, escreva para ' +
    TESSY_CONTACT_EMAIL +
    '.',
} as const;
