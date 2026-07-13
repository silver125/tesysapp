import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { CompanyMark, TessyMark, BellIcon } from './ui';
import { companyInitials, companyTint, displayUserLabel } from '../lib/uiHelpers';
import OnboardingModal from './OnboardingModal';
import ProfileSettingsSheet from './ProfileSettingsSheet';
import { openDeleteAccountDialog, openProfileSettings } from '../lib/profileSettingsEvents';

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
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(247,248,255,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="tessy-app-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <TessyMark size={30} />
            <span style={{ fontWeight: 560, fontSize: 15, letterSpacing: 0, color: 'var(--accent-ink)', whiteSpace: 'nowrap' }}>
              Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
            </span>
          </div>

          <div ref={profileMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            {(user?.role === 'medico' || user?.role === 'empresa') && onNotificationClick && (
              <button
                type="button"
                aria-label={notificationCount > 0 ? `${notificationCount} notificações` : 'Notificações'}
                onClick={onNotificationClick}
                style={{
                  position: 'relative',
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid rgba(245,130,32,0.16)',
                  background: notificationCount > 0
                    ? 'linear-gradient(180deg, rgba(255,243,233,0.98), rgba(245,130,32,0.12))'
                    : 'rgba(245,130,32,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: notificationCount > 0
                    ? '0 8px 18px rgba(245,130,32,0.14)'
                    : 'none',
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
                    border: '2px solid #F7F8FF',
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
                  padding: '5px 9px',
                  borderRadius: 999,
                  background: 'rgba(245,130,32,0.10)',
                  border: '1px solid rgba(245,130,32,0.18)',
                  fontSize: 11.5,
                  fontWeight: 650,
                  color: 'var(--accent-ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 11, lineHeight: 1 }}>⭐</span>
                <span>{user.points ?? 0}</span>
              </div>
            )}
            <div style={{ display: 'none' }} className="sm:flex items-center gap-2">
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.role === 'medico' ? 'médico' : 'empresa'}
              </span>
            </div>
            <button
              type="button"
              aria-label="Abrir menu do perfil"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(open => !open)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid rgba(216,222,236,0.92)',
                background: user?.avatarUrl
                  ? `url(${user.avatarUrl}) center/cover`
                  : 'rgba(255,255,255,0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(88,98,130,0.08)',
                overflow: 'hidden',
              }}
            >
              {!user?.avatarUrl && <CompanyMark code={code} tint={tint} size={30} radius={999} />}
            </button>
            {profileOpen && (
              <div style={{
                position: 'absolute',
                top: 42,
                right: 0,
                width: 210,
                padding: 10,
                borderRadius: 16,
                border: '1px solid rgba(216,222,236,0.95)',
                background: 'rgba(255,255,255,0.98)',
                boxShadow: '0 18px 42px rgba(37,44,66,0.14)',
                zIndex: 40,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.role === 'empresa' ? (user.company ?? user.name) : (user?.name ?? 'Perfil')}
                </div>
                <div style={{ marginTop: 2, fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {user?.role === 'medico' ? 'médico' : 'empresa'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    openProfileSettings();
                  }}
                  style={{
                    ...menuButtonStyle,
                    marginTop: 10,
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

      <main className="tessy-app-main">
        {children}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div className="tessy-app-nav-inner">
          {navItems.map(item => {
            const active = item.key === activeKey;
            const accent = 'var(--accent)';
            const muted = 'var(--muted)';

            if (item.big) {
              if (item.label) {
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavChange(item.key)}
                    className="tessy-create-cta"
                    style={{
                      minWidth: 118,
                      height: 40,
                      borderRadius: 999,
                      background: active ? 'var(--accent)' : 'var(--accent-ink)',
                      border: '1px solid rgba(255,255,255,0.72)',
                      color: '#fff',
                      cursor: 'pointer',
                      marginTop: -10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 12px',
                      fontSize: 11.5,
                      fontWeight: 560,
                      lineHeight: 1.05,
                      textAlign: 'center',
                      boxShadow: '0 12px 28px rgba(52,57,73,0.22)',
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
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  color: active ? accent : muted, padding: '4px 6px',
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
                <span className="tessy-nav-label" style={{
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

      <OnboardingModal />
      <ProfileSettingsSheet />
    </div>
  );
}
