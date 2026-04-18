import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface NavItem {
  label: string;
  key: string;
  icon: ReactNode;
}

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeKey: string;
  onNavChange: (key: string) => void;
  title?: string;
}

export default function Layout({ children, navItems, activeKey, onNavChange, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '??';

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <header className="sticky top-0 z-20 border-b border-[#1F2A44]/70 bg-[#0A0F1F]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B73FF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#4F8CFF]/30 flex-shrink-0">T</div>
            <div className="leading-tight min-w-0">
              <p className="font-semibold text-sm truncate">{title ?? 'Tessy'}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'medico' ? 'Área do médico' : 'Área da empresa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131B2E] border border-[#1F2A44]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B73FF] text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              <span className="text-xs font-medium text-slate-300 max-w-[140px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-[#131B2E] transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-[#1F2A44]/70 bg-[#0A0F1F]/90 backdrop-blur-md safe-bottom">
        <div
          className="max-w-3xl mx-auto grid"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map(item => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => onNavChange(item.key)}
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition relative"
                style={{ color: active ? '#6FA4FF' : '#8A96B2' }}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#8B73FF]" />
                )}
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
