import { useState } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import type { Event, Product } from '../../types';

type Tab = 'home' | 'events' | 'products';

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Início', icon: <IconHome /> },
  { key: 'events', label: 'Eventos', icon: <IconCalendar /> },
  { key: 'products', label: 'Produtos', icon: <IconBox /> },
];

function formatDate(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

export default function DoctorDashboard() {
  const { user, events, products } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [search, setSearch] = useState('');

  const matchEvent = (e: Event) =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.companyName.toLowerCase().includes(search.toLowerCase());

  const matchProduct = (p: Product) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.companyName.toLowerCase().includes(search.toLowerCase());

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={k => setTab(k as Tab)} title="Tessy">
      {tab === 'home' && (
        <div>
          <h1 className="text-xl font-bold text-slate-900">Olá, {user?.name?.split(' ')[0] ?? 'doutor'}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.specialty ? `${user.specialty} · ` : ''}Veja as oportunidades disponíveis para você.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <Stat label="Eventos" value={events.length} />
            <Stat label="Produtos" value={products.length} />
          </div>

          <Section
            title="Próximos eventos"
            onSeeAll={() => setTab('events')}
            empty={events.length === 0 ? 'Nenhum evento ainda.' : undefined}
          >
            {events.slice(0, 3).map(e => (
              <EventRow key={e.id} event={e} />
            ))}
          </Section>

          <Section
            title="Produtos em destaque"
            onSeeAll={() => setTab('products')}
            empty={products.length === 0 ? 'Nenhum produto ainda.' : undefined}
          >
            {products.slice(0, 3).map(p => (
              <ProductRow key={p.id} product={p} />
            ))}
          </Section>
        </div>
      )}

      {tab !== 'home' && (
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-3">
            {tab === 'events' ? 'Eventos' : 'Produtos'}
          </h1>
          <SearchInput value={search} onChange={setSearch} placeholder={tab === 'events' ? 'Buscar evento...' : 'Buscar produto...'} />

          <div className="mt-4 space-y-3">
            {tab === 'events' && events.filter(matchEvent).map(e => <EventCard key={e.id} event={e} />)}
            {tab === 'events' && events.filter(matchEvent).length === 0 && <EmptyState text="Nenhum evento encontrado." />}

            {tab === 'products' && products.filter(matchProduct).map(p => <ProductCard key={p.id} product={p} />)}
            {tab === 'products' && products.filter(matchProduct).length === 0 && <EmptyState text="Nenhum produto encontrado." />}
          </div>
        </div>
      )}
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Section({
  title, children, onSeeAll, empty,
}: {
  title: string; children: React.ReactNode; onSeeAll?: () => void; empty?: string;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {onSeeAll && !empty && (
          <button onClick={onSeeAll} className="text-sm font-medium text-blue-600">Ver todos</button>
        )}
      </div>
      {empty ? (
        <div className="bg-white rounded-xl border border-slate-100 p-5 text-sm text-slate-500 text-center">
          {empty}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex flex-col items-center justify-center text-xs leading-none">
        <span className="font-bold text-sm">{event.date.split('-')[2] || '?'}</span>
        <span className="text-[10px] uppercase mt-0.5">{monthShort(event.date)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{event.title}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{event.companyName} · {event.location}</p>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
        <IconBox />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{product.companyName} · {product.category}</p>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const pct = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));
  const full = pct >= 100;
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{event.category}</span>
          <h3 className="font-semibold text-slate-900 mt-2">{event.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500 space-y-1">
        <div>📅 {formatDate(event.date)} às {event.time}</div>
        <div>📍 {event.location}</div>
        <div>🏢 {event.companyName}</div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Vagas</span>
          <span>{event.registeredCount}/{event.maxParticipants}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <button
        disabled={full}
        className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition disabled:bg-slate-100 disabled:text-slate-400 bg-blue-600 text-white hover:bg-blue-700"
      >
        {full ? 'Vagas esgotadas' : 'Tenho interesse'}
      </button>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{product.category}</span>
      <h3 className="font-semibold text-slate-900 mt-2">{product.name}</h3>
      <p className="text-sm text-slate-500 mt-1 line-clamp-3">{product.description}</p>
      <div className="mt-3 text-xs text-slate-500 space-y-1">
        <div>🏢 {product.companyName}</div>
        <div>👤 {product.availableFor}</div>
        {product.price && <div>💰 {product.price}</div>}
      </div>
      <button className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">
        Solicitar informações
      </button>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-slate-200 focus:border-blue-500 focus:outline-none"
    />
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function monthShort(date: string) {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2"/>
      <path d="M3.3 7L12 12l8.7-5M12 22V12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
