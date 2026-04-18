import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import type { Event, Product } from '../../types';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/empresa',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Eventos',
    path: '/empresa/eventos',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Produtos',
    path: '/empresa/produtos',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

type Tab = 'overview' | 'events' | 'products';

const ACCENT = '#7C3AED';
const GRADIENT = 'linear-gradient(180deg, #5B21B6 0%, #7C3AED 100%)';

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

function EventForm({ onClose, onSave, user }: { onClose: () => void; onSave: (e: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => void; user: { id: string; name: string } }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '',
    category: 'Congresso', maxParticipants: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, companyId: user.id, companyName: user.name, maxParticipants: Number(form.maxParticipants) });
    onClose();
  };

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        required
        value={form[key] as string}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm"
        style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
        onFocus={e => (e.target.style.borderColor = ACCENT)}
        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h3 className="text-lg font-semibold text-slate-800">Criar Evento</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" style={{ color: '#64748B' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('Título do evento', 'title', 'text', 'Ex: Simpósio de Cardiologia 2025')}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <textarea
              required
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o evento..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
              style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
              onFocus={e => (e.target.style.borderColor = ACCENT)}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Data', 'date', 'date')}
            {field('Horário', 'time', 'time')}
          </div>
          {field('Local', 'location', 'text', 'Cidade, Estado — Local')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
              >
                {['Congresso', 'Workshop', 'Simpósio', 'Webinar', 'Treinamento'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Vagas</label>
              <input
                type="number"
                min={1}
                required
                value={form.maxParticipants}
                onChange={e => setForm(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#F1F5F9', color: '#64748B' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: GRADIENT }}>
              Criar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductForm({ onClose, onSave, user }: { onClose: () => void; onSave: (p: Omit<Product, 'id' | 'createdAt'>) => void; user: { id: string; name: string } }) {
  const [form, setForm] = useState({
    name: '', description: '', category: 'Cardiologia', price: '', availableFor: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, companyId: user.id, companyName: user.name });
    onClose();
  };

  const field = (label: string, key: keyof typeof form, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type="text"
        required={key !== 'price'}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm"
        style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
        onFocus={e => (e.target.style.borderColor = ACCENT)}
        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h3 className="text-lg font-semibold text-slate-800">Adicionar Produto</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" style={{ color: '#64748B' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('Nome do produto', 'name', 'Ex: CardioPlus 10mg')}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <textarea
              required
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o produto..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
              style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
              onFocus={e => (e.target.style.borderColor = ACCENT)}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#1E293B' }}
              >
                {['Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Outros'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {field('Preço (opcional)', 'price', 'Ex: Sob consulta')}
          </div>
          {field('Disponível para', 'availableFor', 'Ex: Médicos credenciados')}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#F1F5F9', color: '#64748B' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: GRADIENT }}>
              Adicionar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Congresso: '#2563EB', Workshop: '#059669', Simpósio: '#D97706', Webinar: '#7C3AED', Treinamento: '#DC2626',
  Cardiologia: '#DC2626', Oncologia: '#7C3AED', Neurologia: '#2563EB', Ortopedia: '#059669', Pediatria: '#D97706', Outros: '#64748B',
};

export default function CompanyDashboard() {
  const { user, events, products, addEvent, addProduct, deleteEvent, deleteProduct } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const myEvents = events.filter(e => e.companyId === user?.id);
  const myProducts = products.filter(p => p.companyId === user?.id);

  const navItemsWithClick = NAV_ITEMS;

  return (
    <Layout
      navItems={navItemsWithClick.map(item => ({
        ...item,
        path: (() => { return item.path; })(),
      }))}
      accentColor={ACCENT}
      accentGradient={GRADIENT}
    >
      {showEventForm && user && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onSave={addEvent}
          user={user}
        />
      )}
      {showProductForm && user && (
        <ProductForm
          onClose={() => setShowProductForm(false)}
          onSave={addProduct}
          user={user}
        />
      )}

      {/* Tab routing via sidebar click is handled in Layout, but we detect path here */}
      <TabContent
        tab={tab}
        setTab={setTab}
        myEvents={myEvents}
        myProducts={myProducts}
        onCreateEvent={() => setShowEventForm(true)}
        onCreateProduct={() => setShowProductForm(true)}
        onDeleteEvent={deleteEvent}
        onDeleteProduct={deleteProduct}
        user={user}
      />
    </Layout>
  );
}

function TabContent({
  tab, setTab, myEvents, myProducts,
  onCreateEvent, onCreateProduct, onDeleteEvent, onDeleteProduct, user
}: {
  tab: Tab; setTab: (t: Tab) => void;
  myEvents: Event[]; myProducts: Product[];
  onCreateEvent: () => void; onCreateProduct: () => void;
  onDeleteEvent: (id: string) => void; onDeleteProduct: (id: string) => void;
  user: { name: string } | null;
}) {
  return (
    <>
      {/* Inner tab bar */}
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

      {tab === 'overview' && <Overview myEvents={myEvents} myProducts={myProducts} user={user} setTab={setTab} />}
      {tab === 'events' && <EventsTab events={myEvents} onCreate={onCreateEvent} onDelete={onDeleteEvent} />}
      {tab === 'products' && <ProductsTab products={myProducts} onCreate={onCreateProduct} onDelete={onDeleteProduct} />}
    </>
  );
}

function Overview({ myEvents, myProducts, user, setTab }: { myEvents: Event[]; myProducts: Product[]; user: { name: string } | null; setTab: (t: Tab) => void }) {
  const totalVagas = myEvents.reduce((s, e) => s + e.maxParticipants, 0);
  const totalInscritos = myEvents.reduce((s, e) => s + e.registeredCount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name ?? 'Empresa'}</h1>
        <p className="text-slate-500 mt-1">Gerencie seus eventos e produtos para médicos.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Eventos ativos" value={myEvents.length} color="#7C3AED"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
        <StatCard label="Produtos cadastrados" value={myProducts.length} color="#2563EB"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard label="Vagas oferecidas" value={totalVagas} color="#059669"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <StatCard label="Inscrições recebidas" value={totalInscritos} color="#D97706"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setTab('events')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm text-left transition-all hover:shadow-md"
          style={{ border: '1px solid #F1F5F9' }}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: '#7C3AED15' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#7C3AED" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Criar Evento</p>
            <p className="text-sm text-slate-500 mt-0.5">Adicione congressos, workshops e mais</p>
          </div>
        </button>
        <button
          onClick={() => setTab('products')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm text-left transition-all hover:shadow-md"
          style={{ border: '1px solid #F1F5F9' }}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: '#2563EB15' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#2563EB" strokeWidth="2"/></svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Adicionar Produto</p>
            <p className="text-sm text-slate-500 mt-0.5">Cadastre medicamentos e soluções</p>
          </div>
        </button>
      </div>

      {/* Recent events */}
      {myEvents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-semibold text-slate-800">Eventos recentes</h2>
            <button onClick={() => setTab('events')} className="text-sm font-medium" style={{ color: '#7C3AED' }}>Ver todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {myEvents.slice(0, 3).map(ev => (
              <div key={ev.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: `${CATEGORY_COLORS[ev.category] ?? '#64748B'}15` }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke={CATEGORY_COLORS[ev.category] ?? '#64748B'} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={CATEGORY_COLORS[ev.category] ?? '#64748B'} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{ev.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(ev.date)} · {ev.location}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: `${CATEGORY_COLORS[ev.category] ?? '#64748B'}15`, color: CATEGORY_COLORS[ev.category] ?? '#64748B' }}>
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsTab({ events, onCreate, onDelete }: { events: Event[]; onCreate: () => void; onDelete: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Eventos</h1>
          <p className="text-slate-500 mt-0.5">{events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: GRADIENT }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Novo Evento
        </button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Nenhum evento criado"
          subtitle="Crie seu primeiro evento para que médicos possam visualizar."
          action="Criar primeiro evento"
          onAction={onCreate}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} onDelete={() => onDelete(ev.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsTab({ products, onCreate, onDelete }: { products: Product[]; onCreate: () => void; onDelete: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-slate-500 mt-0.5">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: GRADIENT }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Novo Produto
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          subtitle="Adicione produtos para que médicos possam conhecer seu portfólio."
          action="Adicionar primeiro produto"
          onAction={onCreate}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onDelete }: { event: Event; onDelete: () => void }) {
  const pct = Math.round((event.registeredCount / event.maxParticipants) * 100);
  const color = CATEGORY_COLORS[event.category] ?? '#64748B';
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F1F5F9' }}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{event.category}</span>
            <h3 className="font-semibold text-slate-800 mt-2 leading-snug">{event.title}</h3>
          </div>
          <button onClick={onDelete} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: '#94A3B8' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {formatDate(event.date)} às {event.time}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            {event.location.split('—')[0].trim()}
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Inscrições</span>
          <span>{event.registeredCount}/{event.maxParticipants}</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#F1F5F9' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const color = CATEGORY_COLORS[product.category] ?? '#64748B';
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #F1F5F9' }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{product.category}</span>
          <h3 className="font-semibold text-slate-800 mt-2">{product.name}</h3>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: '#94A3B8' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{product.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {product.price && (
          <span className="px-2.5 py-1 rounded-full" style={{ background: '#F0FDF4', color: '#059669' }}>
            {product.price}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-full" style={{ background: '#F8FAFC', color: '#64748B' }}>
          {product.availableFor}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, action, onAction }: { title: string; subtitle: string; action: string; onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F1F5F9' }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 max-w-xs">{subtitle}</p>
      <button onClick={onAction} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: GRADIENT }}>
        {action}
      </button>
    </div>
  );
}
