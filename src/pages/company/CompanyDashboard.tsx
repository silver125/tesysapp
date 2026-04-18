import { useState } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import type { Event, Product, Course, CourseModality } from '../../types';

type Tab = 'home' | 'events' | 'products' | 'courses';

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Início',   icon: <IcoHome /> },
  { key: 'events',   label: 'Eventos',  icon: <IcoCalendar /> },
  { key: 'products', label: 'Produtos', icon: <IcoBox /> },
  { key: 'courses',  label: 'Cursos',   icon: <IcoBook /> },
];

const EVENT_CATS    = ['Congresso', 'Workshop', 'Simpósio', 'Webinar', 'Treinamento'];
const PRODUCT_CATS  = ['Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Outros'];
const COURSE_CATS   = ['Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Clínica Médica', 'Outros'];
const MODALITIES: CourseModality[] = ['online', 'presencial', 'hibrido'];

function fmt(d: string) {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

/* ─────────────────────────── Main ─────────────────────────── */
export default function CompanyDashboard() {
  const { user, events, products, courses, addEvent, addProduct, addCourse, deleteEvent, deleteProduct, deleteCourse } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<null | 'event' | 'product' | 'course'>(null);

  const myEvents   = events.filter(e => e.companyId === user?.id);
  const myProducts = products.filter(p => p.companyId === user?.id);
  const myCourses  = courses.filter(c => c.companyId === user?.id);

  const companyInfo = { id: user?.id ?? '', name: user?.company ?? user?.name ?? '', whatsapp: user?.whatsapp };

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={k => setTab(k as Tab)}>
      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          <div className="mb-6">
            <p className="text-slate-400 text-sm">Olá,</p>
            <h1 className="text-2xl font-bold tracking-tight">{user?.company ?? user?.name} 🏢</h1>
            {user?.whatsapp && (
              <p className="text-[#34E178] text-sm mt-0.5 flex items-center gap-1.5">
                <WaIcon /> {user.whatsapp}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Eventos"  value={myEvents.length}   onClick={() => setTab('events')} />
            <StatCard label="Produtos" value={myProducts.length} onClick={() => setTab('products')} />
            <StatCard label="Cursos"   value={myCourses.length}  onClick={() => setTab('courses')} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AddBtn label="+ Evento"  onClick={() => { setTab('events');   setModal('event'); }} />
            <AddBtn label="+ Produto" onClick={() => { setTab('products'); setModal('product'); }} />
            <AddBtn label="+ Curso"   onClick={() => { setTab('courses');  setModal('course'); }} />
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <ListTab
          title="Meus eventos"
          onAdd={() => setModal('event')}
          empty={myEvents.length === 0}
          emptyText="Nenhum evento criado ainda."
        >
          {myEvents.map(e => (
            <EventCard key={e.id} event={e} onDelete={() => deleteEvent(e.id)} />
          ))}
        </ListTab>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <ListTab
          title="Meus produtos"
          onAdd={() => setModal('product')}
          empty={myProducts.length === 0}
          emptyText="Nenhum produto criado ainda."
        >
          {myProducts.map(p => (
            <ProductCard key={p.id} product={p} onDelete={() => deleteProduct(p.id)} />
          ))}
        </ListTab>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <ListTab
          title="Meus cursos"
          onAdd={() => setModal('course')}
          empty={myCourses.length === 0}
          emptyText="Nenhum curso criado ainda."
        >
          {myCourses.map(c => (
            <CourseCard key={c.id} course={c} onDelete={() => deleteCourse(c.id)} />
          ))}
        </ListTab>
      )}

      {/* ── MODALS ── */}
      {modal === 'event' && (
        <EventForm
          company={companyInfo}
          onClose={() => setModal(null)}
          onSave={data => { addEvent(data); setModal(null); }}
        />
      )}
      {modal === 'product' && (
        <ProductForm
          company={companyInfo}
          onClose={() => setModal(null)}
          onSave={data => { addProduct(data); setModal(null); }}
        />
      )}
      {modal === 'course' && (
        <CourseForm
          company={companyInfo}
          onClose={() => setModal(null)}
          onSave={data => { addCourse(data); setModal(null); }}
        />
      )}
    </Layout>
  );
}

/* ─── Shared layout helpers ─── */
function StatCard({ label, value, onClick }: { label: string; value: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-[#131B2E] border border-[#1F2A44] rounded-xl p-3 text-left hover:border-[#4F8CFF]/50 transition w-full">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </button>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="py-3 rounded-xl text-sm font-semibold bg-[#4F8CFF] text-white hover:bg-[#6FA4FF] transition glow">
      {label}
    </button>
  );
}

function ListTab({ title, onAdd, empty, emptyText, children }: {
  title: string; onAdd: () => void; empty: boolean; emptyText: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <button onClick={onAdd}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-[#4F8CFF] text-white hover:bg-[#6FA4FF] transition">
          + Novo
        </button>
      </div>
      {empty
        ? <div className="bg-[#131B2E] border border-[#1F2A44] rounded-xl p-10 text-center text-sm text-slate-500">{emptyText}</div>
        : <div className="space-y-3">{children}</div>
      }
    </div>
  );
}

/* ─── Item cards (company view) ─── */
function EventCard({ event, onDelete }: { event: Event; onDelete: () => void }) {
  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#4F8CFF]/10 text-[#6FA4FF] border border-[#4F8CFF]/20">
            {event.category}
          </span>
          <h3 className="font-semibold mt-2 text-slate-100">{event.title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{event.description}</p>
          <div className="text-xs text-slate-500 mt-2 space-y-0.5">
            <div>📅 {fmt(event.date)} às {event.time}</div>
            <div>📍 {event.location}</div>
            <div>👥 {event.registeredCount}/{event.maxParticipants} inscritos</div>
          </div>
        </div>
        <button onClick={onDelete}
          className="text-xs font-medium text-red-400 hover:text-red-300 transition px-1 flex-shrink-0">
          Excluir
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#4F8CFF]/10 text-[#6FA4FF] border border-[#4F8CFF]/20">
            {product.category}
          </span>
          <h3 className="font-semibold mt-2 text-slate-100">{product.name}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{product.description}</p>
          <div className="text-xs text-slate-500 mt-2 space-y-0.5">
            <div>👤 {product.availableFor}</div>
            {product.price && <div>💰 {product.price}</div>}
          </div>
        </div>
        <button onClick={onDelete}
          className="text-xs font-medium text-red-400 hover:text-red-300 transition px-1 flex-shrink-0">
          Excluir
        </button>
      </div>
    </div>
  );
}

function CourseCard({ course, onDelete }: { course: Course; onDelete: () => void }) {
  const modalityLabel = { online: 'Online', presencial: 'Presencial', hibrido: 'Híbrido' }[course.modality];
  const modalityColor = {
    online:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    presencial: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    hibrido:    'text-sky-400 bg-sky-400/10 border-sky-400/20',
  }[course.modality];

  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#8B73FF]/10 text-[#A78BFF] border border-[#8B73FF]/20">
              {course.category}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${modalityColor}`}>
              {modalityLabel}
            </span>
          </div>
          <h3 className="font-semibold mt-2 text-slate-100">{course.title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
          <div className="text-xs text-slate-500 mt-2 space-y-0.5">
            <div>🎓 {course.instructor}</div>
            <div>⏱ {course.duration}</div>
            {course.price && <div>💰 {course.price}</div>}
          </div>
        </div>
        <button onClick={onDelete}
          className="text-xs font-medium text-red-400 hover:text-red-300 transition px-1 flex-shrink-0">
          Excluir
        </button>
      </div>
    </div>
  );
}

/* ─── Modal shell ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="bg-[#0F172A] border border-[#1F2A44] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#1F2A44] flex items-center justify-between px-5 py-4">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, as = 'input', options, required = true,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; as?: 'input' | 'textarea' | 'select'; options?: string[]; required?: boolean;
}) {
  const base = 'w-full px-4 py-3 rounded-xl text-sm text-slate-100 bg-[#1B2540] border border-[#2B3A5C] focus:border-[#4F8CFF] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/20 transition';
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {as === 'textarea'
        ? <textarea required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={base} />
        : as === 'select'
          ? <select required value={value} onChange={e => onChange(e.target.value)} className={base}>
              {options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          : <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
    </div>
  );
}

/* ─── Forms ─── */
function EventForm({ company, onClose, onSave }: {
  company: { id: string; name: string; whatsapp?: string };
  onClose: () => void;
  onSave: (e: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => void;
}) {
  const [f, setF] = useState({ title: '', description: '', date: '', time: '09:00', location: '', category: EVENT_CATS[0], maxParticipants: '100' });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal title="Novo evento" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave({ ...f, maxParticipants: Number(f.maxParticipants) || 100, companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp }); }} className="space-y-4">
        <Field label="Título" value={f.title} onChange={set('title')} placeholder="Ex: Simpósio de Cardiologia" />
        <Field label="Descrição" value={f.description} onChange={set('description')} as="textarea" placeholder="Descreva o evento" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" value={f.date} onChange={set('date')} type="date" />
          <Field label="Hora" value={f.time} onChange={set('time')} type="time" />
        </div>
        <Field label="Local" value={f.location} onChange={set('location')} placeholder="São Paulo, SP" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" value={f.category} onChange={set('category')} as="select" options={EVENT_CATS} />
          <Field label="Vagas" value={f.maxParticipants} onChange={set('maxParticipants')} type="number" />
        </div>
        <button type="submit" className="w-full py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition glow">
          Criar evento
        </button>
      </form>
    </Modal>
  );
}

function ProductForm({ company, onClose, onSave }: {
  company: { id: string; name: string; whatsapp?: string };
  onClose: () => void;
  onSave: (p: Omit<Product, 'id' | 'createdAt'>) => void;
}) {
  const [f, setF] = useState({ name: '', description: '', category: PRODUCT_CATS[0], availableFor: 'Médicos credenciados', price: 'Sob consulta' });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal title="Novo produto" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave({ ...f, companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp }); }} className="space-y-4">
        <Field label="Nome" value={f.name} onChange={set('name')} placeholder="Ex: CardioPlus 10mg" />
        <Field label="Descrição" value={f.description} onChange={set('description')} as="textarea" placeholder="Descreva o produto" />
        <Field label="Categoria" value={f.category} onChange={set('category')} as="select" options={PRODUCT_CATS} />
        <Field label="Disponível para" value={f.availableFor} onChange={set('availableFor')} placeholder="Ex: Médicos credenciados" />
        <Field label="Preço" value={f.price} onChange={set('price')} placeholder="Sob consulta" required={false} />
        <button type="submit" className="w-full py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition glow">
          Criar produto
        </button>
      </form>
    </Modal>
  );
}

function CourseForm({ company, onClose, onSave }: {
  company: { id: string; name: string; whatsapp?: string };
  onClose: () => void;
  onSave: (c: Omit<Course, 'id' | 'createdAt'>) => void;
}) {
  const [f, setF] = useState({ title: '', description: '', category: COURSE_CATS[0], modality: 'online' as CourseModality, duration: '', instructor: '', price: '' });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal title="Novo curso" onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        onSave({ ...f, companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp });
      }} className="space-y-4">
        <Field label="Título do curso" value={f.title} onChange={set('title')} placeholder="Ex: Atualização em ECG" />
        <Field label="Descrição" value={f.description} onChange={set('description')} as="textarea" placeholder="Descreva o curso, público-alvo, objetivos..." />
        <Field label="Instrutor / Professor" value={f.instructor} onChange={set('instructor')} placeholder="Ex: Dr. João Silva" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" value={f.category} onChange={set('category')} as="select" options={COURSE_CATS} />
          <Field label="Modalidade" value={f.modality} onChange={v => setF(p => ({ ...p, modality: v as CourseModality }))} as="select" options={MODALITIES} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duração" value={f.duration} onChange={set('duration')} placeholder="Ex: 20 horas" />
          <Field label="Preço" value={f.price} onChange={set('price')} placeholder="Ex: R$ 490" required={false} />
        </div>
        <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B73FF] to-[#4F8CFF] text-white font-semibold text-sm hover:opacity-90 transition glow">
          Criar curso
        </button>
      </form>
    </Modal>
  );
}

/* ─── Icons ─── */
function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
    </svg>
  );
}
function IcoHome() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2z"/></svg>;
}
function IcoCalendar() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>;
}
function IcoBox() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>;
}
function IcoBook() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
