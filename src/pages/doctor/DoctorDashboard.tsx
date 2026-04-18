import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import type { Event, Product } from '../../types';

const ACCENT = '#2563EB';
const GRADIENT = 'linear-gradient(180deg, #1E40AF 0%, #2563EB 100%)';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/medico',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Eventos',
    path: '/medico/eventos',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Produtos',
    path: '/medico/produtos',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
];

type Tab = 'overview' | 'events' | 'products';

const CATEGORY_COLORS: Record<string, string> = {
  Congresso: '#2563EB', Workshop: '#059669', Simpósio: '#D97706', Webinar: '#7C3AED', Treinamento: '#DC2626',
  Cardiologia: '#DC2626', Oncologia: '#7C3AED', Neurologia: '#2563EB', Ortopedia: '#059669', Pediatria: '#D97706', Outros: '#64748B',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #F1F5F9' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${color}15` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, events, products } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const allCategories = Array.from(new Set([
    ...events.map(e => e.category),
    ...products.map(p => p.category),
  ])).sort();

  const filteredEvents = events.filter(e =>
    (search === '' || e.title.toLowerCase().includes(search.toLowerCase()) || e.companyName.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory === '' || e.category === filterCategory)
  );

  const filteredProducts = products.filter(p =>
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.companyName.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory === '' || p.category === filterCategory)
  );

  return (
    <Layout navItems={NAV_ITEMS} accentColor={ACCENT} accentGradient={GRADIENT}>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#E2E8F0', width: 'fit-content' }}>
        {(['overview', 'events', 'products'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1E293B' : '#64748B',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t === 'overview' ? 'Visão Geral' : t === 'events' ? 'Eventos' : 'Produtos'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Overview user={user} events={events} products={products} setTab={setTab} />
      )}

      {tab !== 'overview' && (
        <>
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="#94A3B8" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white"
                style={{ border: '1.5px solid #E2E8F0', outline: 'none', color: '#1E293B' }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl text-sm bg-white"
              style={{ border: '1.5px solid #E2E8F0', outline: 'none', color: filterCategory ? '#1E293B' : '#94A3B8' }}
            >
              <option value="">Todas as categorias</option>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {tab === 'events' && <EventsGrid events={filteredEvents} />}
          {tab === 'products' && <ProductsGrid products={filteredProducts} />}
        </>
      )}
    </Layout>
  );
}

function Overview({ user, events, products, setTab }: {
  user: { name: string; specialty?: string } | null;
  events: Event[];
  products: Product[];
  setTab: (t: Tab) => void;
}) {
  const upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name ?? 'Médico'}</h1>
        <p className="text-slate-500 mt-1">
          {user?.specialty ? `${user.specialty} · ` : ''}Confira as oportunidades disponíveis para você.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Eventos disponíveis" value={events.length} color="#2563EB"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
        <StatCard label="Produtos disponíveis" value={products.length} color="#7C3AED"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard label="Empresas parceiras" value={new Set([...events.map(e => e.companyId), ...products.map(p => p.companyId)]).size} color="#059669"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6" style={{ border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-semibold text-slate-800">Próximos eventos</h2>
            <button onClick={() => setTab('events')} className="text-sm font-medium" style={{ color: ACCENT }}>Ver todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.slice(0, 4).map(ev => {
              const color = CATEGORY_COLORS[ev.category] ?? '#64748B';
              const pct = Math.round((ev.registeredCount / ev.maxParticipants) * 100);
              return (
                <div key={ev.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center w-12">
                      <div className="text-xs font-medium uppercase" style={{ color: '#94A3B8' }}>
                        {ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }) : ''}
                      </div>
                      <div className="text-xl font-bold text-slate-800 leading-none">
                        {ev.date ? ev.date.split('-')[2] : ''}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{ev.category}</span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                      <p className="text-sm text-slate-500">{ev.companyName} · {ev.location.split('—')[0].trim()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#F1F5F9' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-xs text-slate-400">{ev.registeredCount}/{ev.maxParticipants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products highlight */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-semibold text-slate-800">Produtos em destaque</h2>
            <button onClick={() => setTab('products')} className="text-sm font-medium" style={{ color: ACCENT }}>Ver todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {products.slice(0, 3).map(p => {
              const color = CATEGORY_COLORS[p.category] ?? '#64748B';
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: `${color}15` }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-sm text-slate-500">{p.companyName} · {p.category}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: `${color}15`, color }}>
                    {p.availableFor}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsGrid({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F1F5F9' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#94A3B8" strokeWidth="2"/>
            <path d="M3 10h18M8 2v4M16 2v4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">Nenhum evento encontrado</h3>
        <p className="text-sm text-slate-500">Tente ajustar os filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {events.map(ev => {
        const color = CATEGORY_COLORS[ev.category] ?? '#64748B';
        const pct = Math.round((ev.registeredCount / ev.maxParticipants) * 100);
        const isFull = pct >= 100;
        return (
          <div key={ev.id} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{ev.category}</span>
                {isFull && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#FEF2F2', color: '#DC2626' }}>Esgotado</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 leading-snug">{ev.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{ev.description}</p>
              <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  {formatDate(ev.date)} às {ev.time}
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  {ev.location}
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  {ev.companyName}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Vagas</span>
                <span>{ev.registeredCount}/{ev.maxParticipants} inscritos</span>
              </div>
              <div className="h-1.5 rounded-full mb-4" style={{ background: '#F1F5F9' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: isFull ? '#DC2626' : color }} />
              </div>
              <button
                disabled={isFull}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: isFull ? '#F1F5F9' : `linear-gradient(135deg, ${color}, ${color}CC)`,
                  color: isFull ? '#94A3B8' : 'white',
                  cursor: isFull ? 'not-allowed' : 'pointer',
                }}
              >
                {isFull ? 'Vagas esgotadas' : 'Tenho interesse'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F1F5F9' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#94A3B8" strokeWidth="2"/>
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">Nenhum produto encontrado</h3>
        <p className="text-sm text-slate-500">Tente ajustar os filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {products.map(p => {
        const color = CATEGORY_COLORS[p.category] ?? '#64748B';
        return (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{p.category}</span>
                {p.price && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#059669' }}>{p.price}</span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{p.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{p.description}</p>
              <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  {p.companyName}
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  {p.availableFor}
                </div>
              </div>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
              >
                Solicitar informações
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
