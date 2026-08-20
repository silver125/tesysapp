import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { CompanyMark, TessyMark, BellIcon } from './ui';
import { companyInitials, companyTint, displayUserLabel } from '../lib/uiHelpers';
import OnboardingModal from './OnboardingModal';
import ProfileSettingsSheet from './ProfileSettingsSheet';
import HelpSheet from './HelpSheet';
import { openDeleteAccountDialog, openHelp, openProfileSettings } from '../lib/profileSettingsEvents';

export interface NavItem {
  label: string;
  key: string;
  icon: (active: boolean) => ReactNode;
  big?: boolean;
  variant?: 'search';
}

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeKey: string;
  onNavChange: (key: string) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export default function Layout({ children, navItems, activeKey, onNavChange, notificationCount = 0, onNotificationClick }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = displayUserLabel(user);
  const code = companyInitials(displayName, '??');
  const tint = companyTint(displayName);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  useEffect(() => {
    if (!profileOpen) return;
    function handleOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [profileOpen]);

  const menuButtonStyle = {
    width: '100%',
    height: 36,
    borderRadius: 11,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  } as const;

  return (
    <div className="tessy-app-shell" style={{ color: 'var(--ink)' }}>
      <header className="tessy-app-header">
        <div className="tessy-app-header-inner">
          <div className="tessy-app-brand">
            <TessyMark size={30} />
            <span className="tessy-app-brand__name">
              Tessy<span className="tessy-app-brand__dot">.app</span>
            </span>
          </div>

          <div ref={profileMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            {(user?.role === 'medico' || user?.role === 'empresa') && onNotificationClick && (
              <button
                type="button"
                aria-label={notificationCount > 0 ? `${notificationCount} pedido${notificationCount === 1 ? '' : 's'} de contato` : 'Pedidos de contato'}
                onClick={onNotificationClick}
                style={{
                  position: 'relative',
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid rgba(245,130,32,0.16)',
                  background: notificationCount > 0
                    ? 'linear-gradient(180deg, rgba(255,243,233,0.98), rgba(245,130,32,0.12))'
                    : 'rgba(255,255,255,0.72)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: notificationCount > 0
                    ? '0 8px 18px rgba(245,130,32,0.14)'
                    : '0 2px 8px rgba(30,36,51,0.04)',
                }}
              >
                <BellIcon size={19} color={notificationCount > 0 ? 'var(--accent)' : 'var(--accent-ink)'} />
                {notificationCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 10px rgba(245,130,32,0.28)',
                  }}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            {user?.role === 'medico' && (
              <div
                title="Pontos Tessy: ganhe ao avisar interesse. Conexões aprovadas valem +50."
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,130,32,0.10))',
                  border: '1px solid rgba(245,130,32,0.18)',
                  fontSize: 11.5,
                  fontWeight: 650,
                  color: 'var(--accent-ink)',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(245,130,32,0.10)',
                }}
              >
                <span style={{ fontSize: 11, lineHeight: 1 }}>★</span>
                <span>{user.points ?? 0}</span>
              </div>
            )}
            <button
              type="button"
              aria-label="Abrir menu do perfil"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(open => !open)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.95)',
                background: user?.avatarUrl
                  ? `url(${user.avatarUrl}) center/cover`
                  : 'rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(30,36,51,0.10)',
                overflow: 'hidden',
              }}
            >
              {!user?.avatarUrl && <CompanyMark code={code} tint={tint} size={32} radius={999} />}
            </button>
            {profileOpen && (
              <div style={{
                position: 'absolute',
                top: 44,
                right: 0,
                width: 220,
                padding: 12,
                borderRadius: 18,
                border: '1px solid rgba(216,222,236,0.95)',
                background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 20px 48px rgba(37,44,66,0.16)',
                zIndex: 40,
                animation: 'tessy-fade-up 0.18s ease-out',
              }}>
                <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.role === 'empresa' ? (user.company ?? user.name) : (user?.name ?? 'Perfil')}
                </div>
                <div style={{ marginTop: 2, fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {user?.role === 'medico' ? 'médico' : 'empresa'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    openHelp();
                  }}
                  style={{
                    ...menuButtonStyle,
                    marginTop: 12,
                    border: '1px solid rgba(61,127,232,0.18)',
                    background: 'rgba(61,127,232,0.07)',
                    color: 'var(--accent-ink)',
                  }}
                >
                  Como funciona
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    openProfileSettings();
                  }}
                  style={{
                    ...menuButtonStyle,
                    marginTop: 8,
                    border: '1px solid rgba(245,130,32,0.22)',
                    background: 'rgba(245,130,32,0.08)',
                    color: 'var(--accent-ink)',
                  }}
                >
                  Editar perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    openDeleteAccountDialog();
                  }}
                  style={{
                    ...menuButtonStyle,
                    marginTop: 8,
                    border: '1px solid rgba(242,92,84,0.18)',
                    background: 'rgba(242,92,84,0.06)',
                    color: '#F25C54',
                  }}
                >
                  Excluir conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      setProfileOpen(false);
                      await logout();
                      navigate('/', { replace: true });
                    })();
                  }}
                  style={{
                    ...menuButtonStyle,
                    marginTop: 8,
                    border: '1px solid rgba(216,222,236,0.86)',
                    background: 'rgba(247,248,255,0.92)',
                    color: 'var(--ink)',
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tessy-app-main tessy-tab-panel">
        {children}
      </main>

      <nav className="tessy-app-bottom-nav" aria-label="Navegação principal">
        <div className="tessy-app-bottom-nav__inner">
          <div className="tessy-app-nav-inner">
            {navItems.map(item => {
              const active = item.key === activeKey;
              const accent = 'var(--accent)';
              const muted = 'var(--muted)';

              if (item.big) {
                if (item.variant === 'search') {
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-label={item.label || 'Buscar'}
                      onClick={() => onNavChange(item.key)}
                      className="tessy-search-fab"
                    >
                      {item.icon(true)}
                    </button>
                  );
                }

                if (item.label) {
                  return (
                    <button
                      key={item.key}
                      onClick={() => onNavChange(item.key)}
                      className="tessy-create-cta"
                      style={{
                        minWidth: 118,
                        height: 42,
                        borderRadius: 999,
                        background: active ? 'var(--brand-gradient)' : 'var(--accent-ink)',
                        border: '1px solid rgba(255,255,255,0.72)',
                        color: '#fff',
                        cursor: 'pointer',
                        marginTop: -12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 14px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        lineHeight: 1.05,
                        textAlign: 'center',
                        boxShadow: active
                          ? '0 14px 28px rgba(245,130,32,0.32)'
                          : '0 12px 28px rgba(30,36,51,0.22)',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                }

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
                  className="tessy-nav-btn"
                  style={{
                    background: active ? 'rgba(245,130,32,0.08)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    color: active ? accent : muted,
                    padding: '6px 4px',
                    borderRadius: 14,
                    position: 'relative',
                    minWidth: 0,
                  }}
                >
                  {item.icon(active)}
                  <span className="tessy-nav-label" style={{
                    fontSize: 10,
                    fontWeight: active ? 650 : 500,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 6 }}>
            <div style={{ width: 108, height: 4, borderRadius: 999, background: 'rgba(30,36,51,0.12)' }} />
          </div>
        </div>
      </nav>

      <OnboardingModal />
      <ProfileSettingsSheet />
      <HelpSheet />
    </div>
  );
}
