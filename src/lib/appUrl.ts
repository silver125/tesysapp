/** URL pública do app (produção). */
export const TESSY_PROD_URL = 'https://www.tessybr.com';

/** Base URL do app — evita links de e-mail apontando para localhost em produção. */
export function getAppBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }
    if (hostname.endsWith('tessybr.com') || hostname.endsWith('vercel.app')) {
      return TESSY_PROD_URL;
    }
    return origin;
  }

  return TESSY_PROD_URL;
}

export function getPasswordResetUrl(): string {
  return `${getAppBaseUrl()}/redefinir-senha`;
}
