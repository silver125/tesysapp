import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  accentColor: string;
  accentGradient: string;
}

export default function Layout({ children, navItems, accentColor, accentGradient }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '??';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300"
        style={{
          background: accentGradient,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: 'rgba(255,255,255,0.1) 1px solid' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm-1 6v5h-5v2h5v5h2v-5h5v-2h-5V10h-2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Tessy</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 pb-4" style={{ borderTop: 'rgba(255,255,255,0.1) 1px solid', paddingTop: '12px' }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {user?.specialty ?? user?.company ?? user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 mt-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Desktop sidebar (always visible on lg+) */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0"
        style={{ background: accentGradient }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm-1 6v5h-5v2h5v5h2v-5h5v-2h-5V10h-2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Tessy</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {user?.specialty ?? user?.company ?? user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 mt-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: '#64748B' }}
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: accentColor }}
            />
            <span className="text-sm font-medium" style={{ color: '#64748B' }}>
              {user?.role === 'medico' ? 'Área do Médico' : 'Área da Empresa'}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
              style={{ background: accentColor, color: 'white' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
