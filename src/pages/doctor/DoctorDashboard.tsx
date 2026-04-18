import { useState } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth, buildWhatsappLink } from '../../context/AuthContext';
import type { Event, Product, Course } from '../../types';

type Tab = 'home' | 'events' | 'products' | 'courses';

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Início',   icon: <IcoHome /> },
  { key: 'events',   label: 'Eventos',  icon: <IcoCalendar /> },
  { key: 'products', label: 'Produtos', icon: <IcoBox /> },
  { key: 'courses',  label: 'Cursos',   icon: <IcoBook /> },
];

function fmt(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

function monthShort(date: string) {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export default function DoctorDashboard() {
  const { user, events, products, courses } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtEvents   = events.filter(e => !q || e.title.toLowerCase().includes(q) || e.companyName.toLowerCase().includes(q));
  const filtProducts = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q));
  const filtCourses  = courses.filter(c => !q || c.title.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q));

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={k => { setTab(k as Tab); setSearch(''); }}>
      {tab === 'home' && (
        <div>
          <div className="mb-6">
            <p className="text-slate-400 text-sm">Bem-vindo,</p>
            <h1 className="text-2xl font-bold tracking-tight">{user?.name?.split(' ')[0] ?? 'Doutor'} 👋</h1>
            {user?.specialty && <p className="text-[#6FA4FF] text-sm mt-0.5">{user.specialty}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Eventos"  value={events.length}   onClick={() => setTab('events')} />
            <StatCard label="Produtos" value={products.length} onClick={() => setTab('products')} />
            <StatCard label="Cursos"   value={courses.length}  onClick={() => setTab('courses')} />
          </div>

          <HomeSection title="Próximos eventos" onSeeAll={() => setTab('events')} empty={events.length === 0}>
            {events.slice(0, 3).map(e => <EventRow key={e.id} event={e} />)}
          </HomeSection>

          <HomeSection title="Cursos disponíveis" onSeeAll={() => setTab('courses')} empty={courses.length === 0} className="mt-4">
            {courses.slice(0, 2).map(c => <CourseRow key={c.id} course={c} />)}
          </HomeSection>

          <HomeSection title="Produtos em destaque" onSeeAll={() => setTab('products')} empty={products.length === 0} className="mt-4">
            {products.slice(0, 2).map(p => <ProductRow key={p.id} product={p} />)}
          </HomeSection>
        </div>
      )}

      {tab !== 'home' && (
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-4">
            {tab === 'events' ? 'Eventos' : tab === 'products' ? 'Produtos' : 'Cursos'}
          </h1>
          <SearchBar value={search} onChange={setSearch}
            placeholder={tab === 'events' ? 'Buscar eventos...' : tab === 'products' ? 'Buscar produtos...' : 'Buscar cursos...'} />

          <div className="mt-4 space-y-3">
            {tab === 'events'   && (filtEvents.length   === 0 ? <Empty text="Nenhum evento encontrado." />   : filtEvents.map(e   => <EventCard   key={e.id}   event={e} />))}
            {tab === 'products' && (filtProducts.length === 0 ? <Empty text="Nenhum produto encontrado." /> : filtProducts.map(p => <ProductCard key={p.id}  product={p} />))}
            {tab === 'courses'  && (filtCourses.length  === 0 ? <Empty text="Nenhum curso encontrado." />    : filtCourses.map(c  => <CourseCard  key={c.id}  course={c} />))}
          </div>
        </div>
      )}
    </Layout>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, onClick }: { label: string; value: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-[#131B2E] border border-[#1F2A44] rounded-xl p-3 text-left hover:border-[#4F8CFF]/50 transition w-full">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </button>
  );
}

/* ─── Home section ─── */
function HomeSection({ title, onSeeAll, empty, children, className = '' }: {
  title: string; onSeeAll: () => void; empty: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm text-slate-200">{title}</h2>
        {!empty && <button onClick={onSeeAll} className="text-xs font-medium text-[#6FA4FF]">Ver todos</button>}
      </div>
      {empty
        ? <div className="bg-[#131B2E] border border-[#1F2A44] rounded-xl p-4 text-sm text-slate-500 text-center">Nenhum cadastrado ainda.</div>
        : <div className="bg-[#131B2E] border border-[#1F2A44] rounded-xl divide-y divide-[#1F2A44] overflow-hidden">{children}</div>
      }
    </div>
  );
}

/* ─── Row components (home list) ─── */
function EventRow({ event }: { event: Event }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-[#1B2540] flex flex-col items-center justify-center text-[#6FA4FF] flex-shrink-0">
        <span className="font-bold text-sm leading-none">{event.date.split('-')[2]}</span>
        <span className="text-[9px] uppercase">{monthShort(event.date)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{event.title}</p>
        <p className="text-xs text-slate-400 truncate">{event.companyName}</p>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-[#1B2540] flex items-center justify-center text-slate-400 flex-shrink-0">
        <IcoBox />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{product.name}</p>
        <p className="text-xs text-slate-400 truncate">{product.companyName} · {product.category}</p>
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: Course }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-[#1B2540] flex items-center justify-center text-slate-400 flex-shrink-0">
        <IcoBook />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{course.title}</p>
        <p className="text-xs text-slate-400 truncate">{course.companyName} · {course.duration}</p>
      </div>
      <ModalityBadge modality={course.modality} />
    </div>
  );
}

/* ─── Full card components ─── */
function EventCard({ event }: { event: Event }) {
  const pct = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));
  const full = pct >= 100;
  const waLink = buildWhatsappLink(event.companyWhatsapp, `Olá! Vi o evento "${event.title}" na Tessy e tenho interesse.`);

  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#4F8CFF]/10 text-[#6FA4FF] border border-[#4F8CFF]/20">
          {event.category}
        </span>
        {full && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Esgotado</span>}
      </div>

      <div>
        <h3 className="font-semibold text-slate-100 leading-snug">{event.title}</h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{event.description}</p>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5">📅 <span>{fmt(event.date)} às {event.time}</span></div>
        <div className="flex items-center gap-1.5">📍 <span>{event.location}</span></div>
        <div className="flex items-center gap-1.5">🏢 <span>{event.companyName}</span></div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Vagas</span><span>{event.registeredCount}/{event.maxParticipants}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1B2540] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#8B73FF]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          disabled={full}
          className="py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#4F8CFF] text-white hover:bg-[#6FA4FF]"
        >
          {full ? 'Esgotado' : 'Tenho interesse'}
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/10 text-[#34E178] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition">
            <WaIcon /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const waLink = buildWhatsappLink(product.companyWhatsapp, `Olá! Vi o produto "${product.name}" na Tessy e gostaria de mais informações.`);

  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4 space-y-3">
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#4F8CFF]/10 text-[#6FA4FF] border border-[#4F8CFF]/20">
        {product.category}
      </span>

      <div>
        <h3 className="font-semibold text-slate-100">{product.name}</h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-3">{product.description}</p>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5">🏢 <span>{product.companyName}</span></div>
        <div className="flex items-center gap-1.5">👤 <span>{product.availableFor}</span></div>
        {product.price && <div className="flex items-center gap-1.5">💰 <span>{product.price}</span></div>}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="py-2.5 rounded-xl text-sm font-semibold bg-[#4F8CFF] text-white hover:bg-[#6FA4FF] transition">
          Solicitar info
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/10 text-[#34E178] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition">
            <WaIcon /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const waLink = buildWhatsappLink(course.companyWhatsapp, `Olá! Vi o curso "${course.title}" na Tessy e tenho interesse.`);

  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#8B73FF]/10 text-[#A78BFF] border border-[#8B73FF]/20">
          {course.category}
        </span>
        <ModalityBadge modality={course.modality} />
      </div>

      <div>
        <h3 className="font-semibold text-slate-100 leading-snug">{course.title}</h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5">🎓 <span>{course.instructor}</span></div>
        <div className="flex items-center gap-1.5">⏱ <span>{course.duration}</span></div>
        <div className="flex items-center gap-1.5">🏢 <span>{course.companyName}</span></div>
        {course.price && <div className="flex items-center gap-1.5">💰 <span>{course.price}</span></div>}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8B73FF] to-[#4F8CFF] text-white hover:opacity-90 transition">
          Tenho interesse
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366]/10 text-[#34E178] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition">
            <WaIcon /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Shared helpers ─── */
function ModalityBadge({ modality }: { modality: string }) {
  const map: Record<string, { label: string; color: string }> = {
    online:     { label: 'Online',     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    presencial: { label: 'Presencial', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    hibrido:    { label: 'Híbrido',    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  };
  const { label, color } = map[modality] ?? { label: modality, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>{label}</span>;
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 bg-[#131B2E] border border-[#1F2A44] focus:border-[#4F8CFF] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/20 transition"
      />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="bg-[#131B2E] border border-[#1F2A44] rounded-xl p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
    </svg>
  );
}

/* ─── Icons ─── */
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
