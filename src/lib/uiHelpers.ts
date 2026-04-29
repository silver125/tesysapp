const TINTS = [
  '#4AA8FF', '#7FA7B8', '#B9C1EA', '#777F95',
  '#8FA6D8', '#AAB1C4', '#6F829F', '#343949',
];

export function companyTint(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return TINTS[h % TINTS.length];
}

export function categoryTint(cat: string): [string, string] {
  const map: Record<string, [string, string]> = {
    Congresso: ['#7FA7B8', '#343949'],
    Workshop: ['#8FA6D8', '#343949'],
    Simpósio: ['#AAB1C4', '#343949'],
    Webinar: ['#B9C1EA', '#343949'],
    Treinamento: ['#777F95', '#343949'],
    Nutrologia: ['#AAB1C4', '#343949'],
    Endocrinologia: ['#7FA7B8', '#343949'],
    Dermatologia: ['#B9C1EA', '#343949'],
    'Cirurgia Plástica': ['#8FA6D8', '#343949'],
    Cardiologia: ['#AAB1C4', '#343949'],
    Oncologia: ['#777F95', '#343949'],
    Neurologia: ['#4AA8FF', '#343949'],
    Ortopedia: ['#7FA7B8', '#343949'],
    Pediatria: ['#B9C1EA', '#343949'],
    Gastroenterologia: ['#8FA6D8', '#343949'],
    Ginecologia: ['#B9C1EA', '#343949'],
    Oftalmologia: ['#4AA8FF', '#343949'],
    Psiquiatria: ['#777F95', '#343949'],
    Reumatologia: ['#AAB1C4', '#343949'],
    Urologia: ['#4AA8FF', '#343949'],
    Pneumologia: ['#7FA7B8', '#343949'],
    'Clínica Médica': ['#8FA6D8', '#343949'],
    Outros: ['#777F95', '#343949'],
  };
  return map[cat] ?? ['#4AA8FF', '#343949'];
}

export function buildWhatsappLink(phone: string | undefined, message?: string) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('55') ? clean : `55${clean}`;
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${msg}`;
}
