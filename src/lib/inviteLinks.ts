/** URLs e textos prontos para convidar médicos e empresas (WhatsApp, e-mail, etc.). */

export const TESSY_BASE_URL = 'https://www.tessybr.com';

export const INVITE_URLS = {
  medico: `${TESSY_BASE_URL}/cadastro?perfil=medico`,
  empresa: `${TESSY_BASE_URL}/cadastro?perfil=empresa`,
} as const;

export const INVITE_WHATSAPP = {
  medico:
    'Olá! Estou usando a Tessy para conectar com empresas de saúde, eventos e oportunidades. Cadastre-se como médico: ' +
    INVITE_URLS.medico,
  empresa:
    'Olá! A Tessy conecta empresas de saúde a médicos interessados. Publique produtos, eventos e receba médicos interessados: ' +
    INVITE_URLS.empresa,
} as const;
