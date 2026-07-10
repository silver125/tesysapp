import type { User } from '../types';

const INTEREST_KEYWORDS: Record<string, string[]> = {
  Produtos: ['produto', 'product', 'amostra', 'sample'],
  Eventos: ['evento', 'congresso', 'webinar', 'simpósio', 'imersão'],
  Representantes: ['representante', 'comercial', 'parceria'],
  Amostras: ['amostra', 'sample', 'material'],
  Serviços: ['serviço', 'servico', 'parceiro', 'clínica', 'clinica'],
  Workshops: ['workshop', 'capacitação', 'capacitacao', 'curso'],
};

export type DoctorPreferences = {
  interests: string[];
  whatsappConnectionOnly?: boolean;
};

export function readDoctorPreferences(
  userId: string,
  profileInterests?: string[] | null,
): DoctorPreferences | null {
  if (profileInterests?.length) {
    return { interests: profileInterests };
  }
  try {
    const raw = localStorage.getItem(`tessy-doctor-preferences-${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DoctorPreferences;
  } catch {
    return null;
  }
}

export function writeDoctorPreferencesLocal(userId: string, interests: string[]) {
  try {
    localStorage.setItem(`tessy-doctor-preferences-${userId}`, JSON.stringify({
      interests,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    /* localStorage pode estar indisponível em modo privado. */
  }
}

export function doctorInterestList(user?: Pick<User, 'id' | 'doctorInterests'> | null): string[] {
  if (!user?.id) return [];
  return readDoctorPreferences(user.id, user.doctorInterests)?.interests ?? [];
}

/** Pontua conteúdo conforme interesses escolhidos no onboarding. */
export function scoreContentForInterests(interests: string[], ...texts: Array<string | undefined>): number {
  if (!interests.length) return 0;
  const hay = texts.filter(Boolean).join(' ').toLowerCase();
  let score = 0;
  for (const interest of interests) {
    const keywords = INTEREST_KEYWORDS[interest] ?? [interest.toLowerCase()];
    if (keywords.some(keyword => hay.includes(keyword))) score += 3;
  }
  return score;
}

export function sortByDoctorInterests<T>(
  items: T[],
  interests: string[],
  getTexts: (item: T) => Array<string | undefined>,
): T[] {
  if (!interests.length) return items;
  return [...items].sort((a, b) => (
    scoreContentForInterests(interests, ...getTexts(b))
    - scoreContentForInterests(interests, ...getTexts(a))
  ));
}
