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

const EVENT_CATEGORIES = ['Congresso', 'Workshop', 'Simpósio', 'Webinar', 'Treinamento'];
const PRODUCT_CATEGORIES = ['Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Outros'];

function formatDate(d: string) {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

export default function CompanyDashboard() {
  const { user, events, products, addEvent, addProduct, deleteEvent, deleteProduct } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [eventModal, setEventModal] = useState(false);
  const [productModal, setProductModal] = useState(false);

  const myEvents = events.filter(e => e.companyId === user?.id);
  const myProducts = products.filter(p => p.companyId === user?.id);

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={k => setTab(k as Tab)} title="Tessy">
      {tab === 'home' && (
        <div>
          <h1 className="text-xl font-bold text-slate-900">Olá, {user?.name ?? 'empresa'}</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie eventos e produtos para médicos.</p>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <Stat label="Seus eventos" value={myEvents.length} />
            <Stat label="Seus produtos" value={myProducts.length} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <ActionButton label="Novo evento" onClick={() => { setTab('events'); setEventModal(true); }} />
            <ActionButton label="Novo produto" onClick={() => { setTab('products'); setProductModal(true); }} />
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900">Meus eventos</h1>
            <button onClick={() => setEventModal(true)} className="text-sm font-semibold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              + Novo
            </button>
          </div>

          {myEvents.length === 0 ? (
            <EmptyState text="Você ainda não criou eventos." />
          ) : (
            <div className="space-y-3">
              {myEvents.map(e => (
                <EventCard key={e.id} event={e} onDelete={() => deleteEvent(e.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900">Meus produtos</h1>
            <button onClick={() => setProductModal(true)} className="text-sm font-semibold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              + Novo
            </button>
          </div>

          {myProducts.length === 0 ? (
            <EmptyState text="Você ainda não criou produtos." />
          ) : (
            <div className="space-y-3">
              {myProducts.map(p => (
                <ProductCard key={p.id} product={p} onDelete={() => deleteProduct(p.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {eventModal && user && (
        <EventForm
          onClose={() => setEventModal(false)}
          onSave={data => addEvent(data)}
          user={{ id: user.id, name: user.company ?? user.name }}
        />
      )}
      {productModal && user && (
        <ProductForm
          onClose={() => setProductModal(false)}
          onSave={data => addProduct(data)}
          user={{ id: user.id, name: user.company ?? user.name }}
        />
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

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function EventCard({ event, onDelete }: { event: Event; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{event.category}</span>
          <h3 className="font-semibold text-slate-900 mt-2">{event.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            <div>📅 {formatDate(event.date)} às {event.time}</div>
            <div>📍 {event.location}</div>
            <div>👥 {event.registeredCount}/{event.maxParticipants} inscritos</div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1"
          aria-label="Excluir"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{product.category}</span>
          <h3 className="font-semibold text-slate-900 mt-2">{product.name}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-3">{product.description}</p>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            <div>👤 {product.availableFor}</div>
            {product.price && <div>💰 {product.price}</div>}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 text-2xl leading-none px-2" aria-label="Fechar">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, as = 'input', options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: string[];
}) {
  const base = 'w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none';
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {as === 'textarea' ? (
        <textarea required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={base} />
      ) : as === 'select' ? (
        <select required value={value} onChange={e => onChange(e.target.value)} className={base}>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input required type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      )}
    </div>
  );
}

function EventForm({ onClose, onSave, user }: {
  onClose: () => void;
  onSave: (e: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => void;
  user: { id: string; name: string };
}) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '',
    category: EVENT_CATEGORIES[0], maxParticipants: '100',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      maxParticipants: Number(form.maxParticipants) || 100,
      companyId: user.id,
      companyName: user.name,
    });
    onClose();
  };

  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal title="Novo evento" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Título" value={form.title} onChange={set('title')} placeholder="Ex: Simpósio de Cardiologia" />
        <Field label="Descrição" value={form.description} onChange={set('description')} as="textarea" placeholder="Descreva o evento" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" value={form.date} onChange={set('date')} type="date" />
          <Field label="Hora" value={form.time} onChange={set('time')} type="time" />
        </div>
        <Field label="Local" value={form.location} onChange={set('location')} placeholder="Cidade, UF" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" value={form.category} onChange={set('category')} as="select" options={EVENT_CATEGORIES} />
          <Field label="Vagas" value={form.maxParticipants} onChange={set('maxParticipants')} type="number" />
        </div>
        <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition">
          Criar evento
        </button>
      </form>
    </Modal>
  );
}

function ProductForm({ onClose, onSave, user }: {
  onClose: () => void;
  onSave: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  user: { id: string; name: string };
}) {
  const [form, setForm] = useState({
    name: '', description: '', category: PRODUCT_CATEGORIES[0],
    availableFor: 'Médicos credenciados', price: 'Sob consulta',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, companyId: user.id, companyName: user.name });
    onClose();
  };

  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal title="Novo produto" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome" value={form.name} onChange={set('name')} placeholder="Ex: CardioPlus 10mg" />
        <Field label="Descrição" value={form.description} onChange={set('description')} as="textarea" placeholder="Descreva o produto" />
        <Field label="Categoria" value={form.category} onChange={set('category')} as="select" options={PRODUCT_CATEGORIES} />
        <Field label="Disponível para" value={form.availableFor} onChange={set('availableFor')} placeholder="Ex: Médicos credenciados" />
        <Field label="Preço" value={form.price} onChange={set('price')} placeholder="Sob consulta" />
        <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition">
          Criar produto
        </button>
      </form>
    </Modal>
  );
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
