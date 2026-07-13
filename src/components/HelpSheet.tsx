import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Sheet } from './market';
import { Mono } from './ui';
import { helpFlowSummary, helpItemsForRole } from '../lib/helpContent';
import { OPEN_HELP_EVENT } from '../lib/profileSettingsEvents';

export default function HelpSheet() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_HELP_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_HELP_EVENT, handleOpen);
  }, []);

  if (!user) return null;

  const items = helpItemsForRole(user.role);

  return (
    <Sheet open={open} onClose={() => setOpen(false)}>
      <div style={{ padding: '4px 16px 24px' }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Ajuda
        </Mono>
        <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 560, color: 'var(--accent-ink)', lineHeight: 1.1 }}>
          Como a Tessy funciona
        </h2>
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.45, color: 'var(--ink-2)' }}>
          {helpFlowSummary(user.role)}
        </p>

        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          borderRadius: 14,
          background: 'rgba(74,168,255,0.08)',
          border: '1px solid rgba(74,168,255,0.18)',
          fontSize: 12.5,
          lineHeight: 1.5,
          color: 'var(--ink-2)',
        }}>
          {user.role === 'medico' ? (
            <>
              <strong style={{ color: 'var(--accent-ink)' }}>1.</strong> Veja oportunidades ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>2.</strong> Avisar interesse ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>3.</strong> Aprovar pedido ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>4.</strong> WhatsApp
            </>
          ) : (
            <>
              <strong style={{ color: 'var(--accent-ink)' }}>1.</strong> Publicar anúncio ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>2.</strong> Médico avisa interesse ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>3.</strong> Pedir permissão ·{' '}
              <strong style={{ color: 'var(--accent-ink)' }}>4.</strong> WhatsApp
            </>
          )}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <details
              key={item.question}
              style={{
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: '#fff',
                padding: '12px 14px',
              }}
            >
              <summary style={{
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 620,
                color: 'var(--accent-ink)',
                lineHeight: 1.35,
                listStyle: 'none',
              }}>
                {item.question}
              </summary>
              <p style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <p style={{ marginTop: 16, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>
          Dúvidas? contato@tessybr.com
        </p>
      </div>
    </Sheet>
  );
}
