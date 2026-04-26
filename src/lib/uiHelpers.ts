const TINTS = [
  '#2E7BFF', '#1EA97C', '#F58220', '#5F2C82',
  '#F25C54', '#8B2D5C', '#4F46E5', '#0F7B8C',
];

export function companyTint(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return TINTS[h % TINTS.length];
}

export function categoryTint(cat: string): [string, string] {
  const map: Record<string, [string, string]> = {
    Congresso: ['#2E7BFF', '#1A46B8'],
    Workshop: ['#1EA97C', '#0D6B4E'],
    Simpósio: ['#F58220', '#9E4E0A'],
    Webinar: ['#5F2C82', '#3A1650'],
    Treinamento: ['#F25C54', '#9E2B25'],
    Nutrologia: ['#F58220', '#9E4E0A'],
    Endocrinologia: ['#1EA97C', '#0D6B4E'],
    Dermatologia: ['#E63E8C', '#8B1A50'],
    'Cirurgia Plástica': ['#8B5CF6', '#5B21B6'],
    Cardiologia: ['#E63946', '#8B1A22'],
    Oncologia: ['#5F2C82', '#3A1650'],
    Neurologia: ['#2E7BFF', '#1A46B8'],
    Ortopedia: ['#0F7B8C', '#074E5A'],
    Pediatria: ['#F58220', '#9E4E0A'],
    Gastroenterologia: ['#1EA97C', '#0D6B4E'],
    Ginecologia: ['#E63E8C', '#8B1A50'],
    Oftalmologia: ['#4F46E5', '#2D2898'],
    Psiquiatria: ['#5F2C82', '#3A1650'],
    Reumatologia: ['#F25C54', '#9E2B25'],
    Urologia: ['#2E7BFF', '#1A46B8'],
    Pneumologia: ['#0F7B8C', '#074E5A'],
    'Clínica Médica': ['#4F46E5', '#2D2898'],
    Outros: ['#6F7A90', '#3A4255'],
  };
  return map[cat] ?? ['#2E7BFF', '#1A46B8'];
}

export function buildWhatsappLink(phone: string | undefined, message?: string) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('55') ? clean : `55${clean}`;
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${msg}`;
}
