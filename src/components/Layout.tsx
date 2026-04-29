import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { CompanyMark } from './ui';
import { companyTint } from '../lib/uiHelpers';

export interface NavItem {
  label: string;
  key: string;
  icon: (active: boolean) => ReactNode;
  big?: boolean;
}

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeKey: string;
  onNavChange: (key: string) => void;
}

export default function Layout({ children, navItems, activeKey, onNavChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const code = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '??';

  const tint = companyTint(user?.name ?? 'T');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(247,248,255,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: 480, margin: '0 auto', padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 560, fontSize: 16, letterSpacing: 0,
            }}>T</div>
            <span style={{ fontWeight: 560, fontSize: 17, letterSpacing: 0, color: 'var(--accent-ink)' }}>
              Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
            </span>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'none' }} className="sm:flex items-center gap-2">
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.role === 'medico' ? 'médico' : 'empresa'}
              </span>
            </div>
            <CompanyMark code={code} tint={tint} size={30} radius={8} />
            <button
              onClick={() => { logout(); navigate('/', { replace: true }); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 12,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              }}
            >
              sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '20px 16px 96px' }}>
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '6px 8px 4px',
        }}>
          {navItems.map(item => {
            const active = item.key === activeKey;
            const accent = 'var(--accent)';
            const muted = 'var(--muted)';

            if (item.big) {
              return (
                <button
                  key={item.key}
                  onClick={() => onNavChange(item.key)}
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    marginTop: -18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: 'drop-shadow(0 8px 18px rgba(52,57,73,0.20))',
                  }}
                >
                  {item.icon(active)}
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => onNavChange(item.key)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  color: active ? accent : muted, padding: '4px 8px',
                  position: 'relative',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 20, height: 2.5, borderRadius: 999, background: accent,
                  }} />
                )}
                {item.icon(active)}
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Home indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 6 }}>
          <div style={{ width: 100, height: 3.5, borderRadius: 999, background: 'rgba(52,57,73,0.14)' }} />
        </div>
      </nav>
    </div>
  );
}
