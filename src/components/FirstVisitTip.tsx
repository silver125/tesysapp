import { useState } from 'react';
import type { UserRole } from '../types';

const TIPS: Record<UserRole, { title: string; body: string }> = {
  medico: {
    title: 'Como a Tessy funciona',
    body: 'Veja oportunidades em Produtos, Eventos ou Representantes. Use "Avisar interesse" para notificar a empresa sem expor seu WhatsApp. Se a empresa pedir contato, você aprova antes de liberar o número.',
  },
  empresa: {
    title: 'Como a Tessy funciona',
    body: 'Publique em Meus anúncios (produto, evento ou workshop). Médicos interessados aparecem em Médicos. Clique em "Pedir permissão para WhatsApp" — após aprovação, a conversa segue no WhatsApp.',
  },
};

function tipKey(userId: string) {
  return `tessy-first-tip-dismissed-${userId}`;
}

export default function FirstVisitTip({ userId, role }: { userId: string; role: UserRole }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(tipKey(userId)) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const tip = TIPS[role];

  function dismiss() {
    try {
      localStorage.setItem(tipKey(userId), '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  return (
    <div style={{
      marginBottom: 14,
      padding: '14px 16px',
      borderRadius: 18,
      background: 'linear-gradient(135deg, rgba(74,168,255,0.10), rgba(255,255,255,0.96))',
      border: '1px solid rgba(74,168,255,0.22)',
      boxShadow: '0 10px 24px rgba(85,96,130,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--accent-ink)' }}>{tip.title}</div>
          <p style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>{tip.body}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar dica"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: '#fff',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        style={{
          marginTop: 10,
          padding: 0,
          border: 'none',
          background: 'none',
          color: 'var(--accent)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Entendi
      </button>
    </div>
  );
}
