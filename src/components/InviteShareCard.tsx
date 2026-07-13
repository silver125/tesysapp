import { useState } from 'react';
import { INVITE_URLS, INVITE_WHATSAPP } from '../lib/inviteLinks';
import { openExternalLink } from '../lib/uiHelpers';

type InviteTarget = 'medico' | 'empresa';

const LABELS: Record<InviteTarget, { title: string; subtitle: string }> = {
  medico: {
    title: 'Convidar médico',
    subtitle: 'Compartilhe o cadastro com médicos da sua rede.',
  },
  empresa: {
    title: 'Convidar empresa',
    subtitle: 'Indique empresas de saúde para publicarem na Tessy.',
  },
};

export default function InviteShareCard({ target }: { target: InviteTarget }) {
  const [copied, setCopied] = useState(false);
  const url = INVITE_URLS[target];
  const labels = LABELS[target];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(INVITE_WHATSAPP[target]);
    openExternalLink(`https://wa.me/?text=${text}`);
  }

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 18,
      background: 'linear-gradient(135deg, rgba(74,168,255,0.08), rgba(255,255,255,0.96))',
      border: '1px solid rgba(74,168,255,0.18)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--accent-ink)' }}>{labels.title}</div>
      <p style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: 'var(--ink-2)' }}>{labels.subtitle}</p>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { void copyLink(); }}
          style={{
            flex: 1,
            minWidth: 120,
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: '#fff',
            color: 'var(--accent-ink)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Link copiado ✓' : 'Copiar link'}
        </button>
        <button
          type="button"
          onClick={shareWhatsApp}
          style={{
            flex: 1,
            minWidth: 120,
            padding: '9px 12px',
            borderRadius: 10,
            border: 'none',
            background: '#25D366',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Enviar no WhatsApp
        </button>
      </div>
    </div>
  );
}
