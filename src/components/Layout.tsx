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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">T</div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-800 text-sm">{title ?? 'Tessy'}</p>
              <p className="text-xs text-slate-400">
                {user?.role === 'medico' ? 'Área do médico' : 'Área da empresa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              <span className="text-xs font-medium text-slate-600 max-w-[140px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-100 safe-bottom">
        <div className="max-w-3xl mx-auto grid" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
          {navItems.map(item => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => onNavChange(item.key)}
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition"
                style={{ color: active ? '#2563EB' : '#64748B' }}
              >
                <span className={active ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
