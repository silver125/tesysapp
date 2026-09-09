import { useState } from 'react';
import type { UserRole } from '../types';

const TIPS: Record<UserRole, { title: string; body: string }> = {
  medico: {
    title: 'Como a Tessy funciona',
    body: 'Busque representantes por região e toque em Solicitar contato. Quando pedirem autorização, aprove em Conexões para liberar seu WhatsApp.',
  },
  empresa: {
    title: 'Como a Tessy funciona',
    body: 'Complete Meu perfil (sem precisar cadastrar produto ou evento). Médicos interessados aparecem em Interessados — peça autorização e converse no WhatsApp após a aprovação.',
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
    <div className="tessy-panel" style={{
      marginBottom: 12,
      padding: '12px 14px',
      borderColor: 'rgba(245,130,32,0.2)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--accent-ink)' }}>{tip.title}</div>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{tip.body}</p>
      <button
        type="button"
        onClick={dismiss}
        style={{
          marginTop: 10,
          padding: '8px 12px',
          borderRadius: 10,
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
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
