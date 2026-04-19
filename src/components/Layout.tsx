import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CompanyMark, companyTint } from './ui';

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
        background: 'rgba(11,14,22,0.85)', backdropFilter: 'blur(12px)',
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
              background: 'linear-gradient(135deg,#2E7BFF 0%,#5F2C82 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em',
            }}>T</div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Tessy<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'none' }} className="sm:flex items-center gap-2">
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                {user?.role === 'medico' ? 'médico' : 'empresa'}
              </span>
            </div>
            <CompanyMark code={code} tint={tint} size={30} radius={8} />
            <button
              onClick={() => { logout(); navigate('/', { replace: true }); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
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
        background: 'rgba(11,14,22,0.95)', backdropFilter: 'blur(16px)',
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
            const accent = '#2E7BFF';
            const muted = '#6F7A90';

            if (item.big) {
              return (
                <button
                  key={item.key}
                  onClick={() => onNavChange(item.key)}
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    marginTop: -18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: 'drop-shadow(0 6px 16px rgba(46,123,255,0.4))',
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
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Home indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 6 }}>
          <div style={{ width: 100, height: 3.5, borderRadius: 999, background: 'rgba(255,255,255,0.45)' }} />
        </div>
      </nav>
    </div>
  );
}
