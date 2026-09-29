const TINTS = ['#CC510C', '#E97828', '#717B95', '#A8B4CE'];

export function companyTint(name: string): string {
  let h = 0;
  const source = name || 'T';
  for (const c of source) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return TINTS[h % TINTS.length];
}

export function companyInitials(name?: string | null, fallback = 'EM'): string {
  const source = (name ?? '').trim() || fallback;
  return source.split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || fallback;
}

/** Converte rótulos em CAPS para sentence case amigável em formulários. */
export function humanizeFieldLabel(label: string): string {
  const raw = label.trim();
  const match = raw.match(/^(.+?)(\s*\((.+)\))?$/);
  if (!match) return raw;
  const main = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  if (match[3]) return `${main} (${match[3].toLowerCase()})`;
  return main;
}

export function displayUserLabel(user: { role?: string; company?: string; name?: string } | null | undefined): string {
  if (!user) return 'Perfil';
  if (user.role === 'empresa') return (user.company ?? user.name ?? 'Empresa').trim() || 'Empresa';
  return (user.name ?? 'Perfil').trim() || 'Perfil';
}

export function categoryTint(cat: string): [string, string] {
  void cat;
  return ['#E97828', '#3A4258'];
}

export function buildWhatsappLink(phone: string | undefined, message?: string) {
  if (!phone || /[a-z]/i.test(phone)) return '';
  const raw = phone.trim();
  const international = raw.startsWith('+') || raw.startsWith('00');
  const digits = raw.replace(/\D/g, '');
  const clean = raw.startsWith('00') ? digits.slice(2) : digits;
  let num: string;
  if (!international && (clean.length === 10 || clean.length === 11)) {
    // A local number with DDD 55 still needs the Brazilian country code.
    num = `55${clean}`;
  } else if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
    num = clean;
  } else if (international && !clean.startsWith('55') && clean.length >= 10 && clean.length <= 15) {
    num = clean;
  } else return '';
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${msg}`;
}

function openUrlInNewContext(url: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** Abre WhatsApp no gesto do clique; evita bloqueio de popup após awaits. */
export function openWhatsappLink(phone: string | undefined, message?: string) {
  const url = buildWhatsappLink(phone, message);
  if (!url) return false;
  openUrlInNewContext(url);
  return true;
}

export function openExternalLink(url: string) {
  if (!url) return false;
  openUrlInNewContext(url);
  return true;
}
