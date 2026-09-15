/** Provider-independent rendering. Only pass authorized, previously unseen items. */
export const DIGEST_FROM = 'Tessy <contato@tessybr.com>';
export const DIGEST_REPLY_TO = 'contato@tessybr.com';
const ORIGIN = 'https://www.tessybr.com';
const tabs = { product: 'products', event: 'events', course: 'events', representative: 'representatives' };
const labels = { product: 'Produto', event: 'Evento', course: 'Workshop', representative: 'Representante' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Frequency is a maximum. No eligible news means no email. */
export function shouldSendDigest({ optedInAt, frequency, lastSentAt }, now = new Date()) {
  if (!optedInAt || !['daily', 'weekly'].includes(frequency)) return false;
  const interval = (frequency === 'weekly' ? 7 : 1) * 86400000;
  const start = Date.parse(lastSentAt || optedInAt);
  return Number.isFinite(start) && now.getTime() - start >= interval;
}

export function selectDigestItems(items, { optedInAt, deliveredKeys = [] }, now = new Date()) {
  const since = Date.parse(optedInAt);
  if (!Number.isFinite(since)) return [];
  const seen = new Set(deliveredKeys);
  return [...items].filter(item => {
    const key = `${item.type}:${item.id}`;
    const created = Date.parse(item.createdAt);
    if (!tabs[item.type] || !item.id || !item.title || !item.relevant || seen.has(key)
      || !Number.isFinite(created) || created < since || created > now.getTime()
      || (item.expiresAt && (!Number.isFinite(Date.parse(item.expiresAt)) || Date.parse(item.expiresAt) <= now.getTime()))) return false;
    seen.add(key);
    return true;
  }).sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,3);
}

export function renderDoctorDigest({ items, unsubscribeUrl }) {
  if (!items.length) return null;
  const unsubscribe = new URL(unsubscribeUrl);
  if (unsubscribe.origin !== ORIGIN) throw new Error('Unsubscribe must use the Tessy domain.');
  const subject = items.length === 1 ? 'Uma novidade para você na Tessy' : `${items.length} novidades para você na Tessy`;
  const rows = items.map(item => {
    if (!tabs[item.type]) throw new Error('Unsupported opportunity type.');
    const href = `${ORIGIN}/medico?tab=${tabs[item.type]}`;
    return { ...item, href, label: labels[item.type] };
  });
  const text = `${subject}\n\n${rows.map(item => `${item.label}: ${item.title}\n${item.companyName || ''}\n${item.href}`).join('\n\n')}\n\nVocê recebe este resumo porque ativou novidades por e-mail na Tessy.\nCancelar avisos: ${unsubscribe.href}`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;color:#202331"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #dedee2"><tr><td style="padding:28px"><p style="margin:0 0 28px;font-size:22px;font-weight:bold">Tessy<span style="color:#ff4f00">.app</span></p><h1 style="font-size:26px;line-height:1.2;margin:0 0 12px">${escape(subject)}</h1><p style="font-size:15px;line-height:1.5;color:#555">Uma seleção curta para você conferir quando puder.</p>${rows.map(item=>`<div style="border-top:1px solid #dedee2;padding:20px 0"><p style="font-size:12px;color:#a63900;margin:0 0 8px">${item.label}</p><h2 style="font-size:19px;margin:0 0 8px">${escape(item.title)}</h2><p style="font-size:14px;color:#555">${escape(item.companyName)}</p><a href="${item.href}" style="display:inline-block;background:#ff4f00;color:#fff;padding:13px 18px;text-decoration:none;font-weight:bold">Ver na Tessy →</a></div>`).join('')}<p style="border-top:1px solid #dedee2;padding-top:20px;font-size:12px;line-height:1.5;color:#666">Você ativou novidades por e-mail na Tessy.<br><a style="color:#555" href="${escape(unsubscribe.href)}">Cancelar avisos</a></p></td></tr></table></td></tr></table></body></html>`;
  return { from: DIGEST_FROM, replyTo: DIGEST_REPLY_TO, subject, html, text };
}
