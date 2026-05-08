import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, VerifiedDot, Mono, BannerCard, Chip, ModalityBadge,
  WaIcon,
} from '../../components/ui';
import { buildWhatsappLink, categoryTint, companyTint } from '../../lib/uiHelpers';
import type { Event, Product, Course, Lead, User, LeadIntent, LeadItemType } from '../../types';

type Tab = 'home' | 'events' | 'products' | 'courses' | 'connect';
type HomeSegment = 'for-you' | 'companies' | 'representatives' | 'events';
type ScheduleLike = { date?: string | null; time?: string | null; start_date?: string | null; event_date?: string | null };
type CompanyMatch = {
  id: string;
  name: string;
  whatsapp?: string;
  products: Product[];
  events: Event[];
  courses: Course[];
};

function IcoHome(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return <svg width="20" height="19" viewBox="0 0 20 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M2 9l8-7 8 7v9H13v-5H7v5H2z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoCalendar(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><rect x="1.5" y="3.5" width="16" height="14" rx="2"/><path d="M13.5 2v3M5.5 2v3M1.5 8.5h16" strokeLinecap="round"/></svg>;
}
function IcoBox(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6"><path d="M17.5 13.5V6.5a1.5 1.5 0 00-.8-1.3l-6-3.3a1.5 1.5 0 00-1.4 0l-6 3.3A1.5 1.5 0 002.5 6.5v7a1.5 1.5 0 00.8 1.3l6 3.3a1.5 1.5 0 001.4 0l6-3.3a1.5 1.5 0 00.8-1.3z"/><path d="M2.8 5.8L10 10l7.2-4.2M10 18V10" strokeLinecap="round"/></svg>;
}
function IcoBook(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M3.5 16A2 2 0 015.5 14H17"/><path d="M5.5 1H17v17H5.5A2 2 0 013.5 16V3a2 2 0 012-2z"/></svg>;
}
function IcoBigConnect() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="26" fill="var(--accent)"/>
      <path d="M26 14v24M14 26h24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Início',   icon: IcoHome },
  { key: 'events',   label: 'Eventos',  icon: IcoCalendar },
  { key: 'connect',  label: '',         icon: () => <IcoBigConnect />, big: true },
  { key: 'products', label: 'Produtos', icon: IcoBox },
  { key: 'courses',  label: 'Workshops', icon: IcoBook },
];

const MONTHS_PT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function pickScheduleDate(item: ScheduleLike) {
  return item.start_date || item.event_date || item.date || '';
}

function parseLocalDate(raw?: string | null) {
  if (!raw) return null;
  const value = raw.includes('T') ? raw.split('T')[0] : raw;
  const [year, month, day] = value.split('-').map(Number);
  if (year && month && day) return new Date(year, month - 1, day);

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthShort(d?: string | null) {
  const date = parseLocalDate(d);
  return date ? MONTHS_PT[date.getMonth()] : '';
}

function dayNum(d?: string | null) {
  const date = parseLocalDate(d);
  return date ? String(date.getDate()).padStart(2, '0') : '';
}

function courseDisplayDate(course: Course) {
  if (course.date) return course.date;
  return '';
}

function eventDateTime(ev: ScheduleLike) {
  const date = parseLocalDate(pickScheduleDate(ev));
  if (!date) return null;
  const [hour = 0, minute = 0] = (ev.time || '00:00').split(':').map(Number);
  date.setHours(Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);
  return date;
}

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function eventCountdown(ev: ScheduleLike, now = new Date()) {
  const target = eventDateTime(ev);
  if (!target || Number.isNaN(target.getTime())) return '';

  const diffDays = Math.ceil((startOfDay(target).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `Faltam ${diffDays} dias`;
  if (diffDays === 1) return 'É amanhã';
  if (diffDays === 0) return 'É hoje';
  return 'Evento encerrado';
}

function formatEventTime(time?: string | null) {
  if (!time) return 'Horário a confirmar';
  const [rawHour, rawMinute = '0'] = time.split(':');
  const hourNumber = Number(rawHour);
  const minuteNumber = Number(rawMinute);
  if (!Number.isFinite(hourNumber)) return 'Horário a confirmar';
  const hour = String(hourNumber).padStart(2, '0');
  if (!Number.isFinite(minuteNumber) || minuteNumber === 0) return `${hour}H`;
  return `${hour}H${String(minuteNumber).padStart(2, '0')}`;
}

function eventDateLabel(ev: ScheduleLike) {
  const dateText = pickScheduleDate(ev);
  if (!parseLocalDate(dateText)) return 'Data a confirmar';
  return `${dayNum(dateText)} ${monthShort(dateText)} • ${formatEventTime(ev.time)}`;
}

function locationText(location?: string | null) {
  return location?.trim() || 'Local a confirmar';
}

function eventSeatText(total: number | undefined, remaining: number) {
  if (!total || total <= 0) return 'Vagas limitadas';
  return `${remaining} ${remaining === 1 ? 'vaga restante' : 'vagas restantes'}`;
}

function isUpcomingEvent(ev: ScheduleLike) {
  const target = eventDateTime(ev);
  if (!target) return true;
  return startOfDay(target).getTime() >= startOfDay(new Date()).getTime();
}

function leadKey(itemType: LeadItemType, itemId: string | undefined, intent: LeadIntent) {
  return `${itemType}:${itemId ?? 'none'}:${intent}`;
}

function hasLeadInterest(leads: Lead[], itemType: LeadItemType, itemId: string | undefined, intent: LeadIntent) {
  return leads.some(lead => leadKey(lead.itemType, lead.itemId, lead.intent) === leadKey(itemType, itemId, intent));
}

function buildCompanyMatches(events: Event[], products: Product[], courses: Course[]) {
  const companyMap = new Map<string, CompanyMatch>();
  const ensureCompany = (id: string, name: string, whatsapp?: string) => {
    const ex = companyMap.get(id) ?? { id, name, whatsapp, products: [], events: [], courses: [] };
    companyMap.set(id, { ...ex, whatsapp: ex.whatsapp ?? whatsapp });
    return companyMap.get(id)!;
  };

  events.forEach(e => ensureCompany(e.companyId, e.companyName, e.companyWhatsapp).events.push(e));
  products.forEach(p => ensureCompany(p.companyId, p.companyName, p.companyWhatsapp).products.push(p));
  courses.forEach(c => ensureCompany(c.companyId, c.companyName, c.companyWhatsapp).courses.push(c));

  return [...companyMap.values()].sort((a, b) =>
    (b.products.length * 3 + b.events.length * 2 + b.courses.length) -
    (a.products.length * 3 + a.events.length * 2 + a.courses.length),
  );
}

function matchesDoctorProfile(user: User | null | undefined, ...texts: Array<string | undefined>) {
  const specialty = user?.specialty?.trim().toLowerCase();
  if (!specialty) return true;
  return texts.some(text => text?.toLowerCase().includes(specialty));
}

function professionalInterestTags(user: User | null | undefined, products: Product[], courses: Course[], events: Event[]) {
  const tags = new Set<string>();
  if (user?.specialty) tags.add(user.specialty);
  [...products, ...courses, ...events].forEach(item => {
    if ('category' in item && item.category) tags.add(item.category);
  });
  return [...tags].slice(0, 5);
}

function eventFormat(ev: Pick<Event, 'category' | 'location'>) {
  const text = `${ev.category} ${ev.location}`.toLowerCase();
  if (text.includes('híbrido') || text.includes('hibrido')) return 'Híbrido';
  if (text.includes('online') || text.includes('virtual') || text.includes('webinar')) return 'Online';
  return 'Presencial';
}

function modalityText(modality: Course['modality']) {
  const labels: Record<Course['modality'], string> = {
    online: 'Online',
    presencial: 'Presencial',
    hibrido: 'Híbrido',
  };
  return labels[modality] ?? modality;
}

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').replace(/^55/, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  return d.startsWith('55') ? d : `55${d}`;
}

function doctorGreeting(user: User | null | undefined) {
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return firstName ? `Olá, Dra. ${firstName}` : 'Olá, Dra.';
}

function opportunityCountLabel(count: number) {
  if (count <= 0) return 'Novas oportunidades aparecerão aqui.';
  return `${count} ${count === 1 ? 'oportunidade relevante' : 'oportunidades relevantes'} para você hoje`;
}

export default function DoctorDashboard() {
  const { user, events, products, courses, leads, refreshData } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [homeSegment, setHomeSegment] = useState<HomeSegment>('for-you');
  const [search, setSearch] = useState('');
  const [evFilter, setEvFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  // Refresh data every time the doctor switches tabs so new items from companies appear
  useEffect(() => {
    refreshData();
  }, [tab, refreshData]);

  const q = search.toLowerCase();
  const upcomingEvents = events.filter(isUpcomingEvent);
  const companyMatches = buildCompanyMatches(events, products, courses);
  const recommendedProducts = products.filter(p => matchesDoctorProfile(user, p.name, p.category, p.description, p.availableFor));
  const interestTags = professionalInterestTags(user, products, courses, events);
  const filtEvents = events.filter(e => {
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.companyName.toLowerCase().includes(q);
    const filter = evFilter.toLowerCase();
    const matchFilter = evFilter === 'all'
      || e.category.toLowerCase().includes(filter)
      || eventFormat(e).toLowerCase().includes(filter);
    return matchQ && matchFilter;
  });
  const filtProducts = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q));
  const filtCourses  = courses.filter(c => {
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q);
    const matchCat = courseFilter === 'all' || c.category.toLowerCase() === courseFilter.toLowerCase();
    return matchQ && matchCat;
  });

  const pendingConnections = leads.filter(lead => lead.connectionStatus === 'requested');
  const representativesAvailable = companyMatches.filter(company => company.whatsapp);
  const todayRelevantCount = Math.min(9, companyMatches.length + pendingConnections.length + upcomingEvents.length);

  function openTab(k: Tab, nextSearch = '') {
    setTab(k);
    setSearch(nextSearch);
    setActionSheetOpen(false);
  }

  function goTab(k: string) {
    if (k === 'connect') {
      setActionSheetOpen(true);
      return;
    }
    openTab(k as Tab);
  }

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={goTab}>

      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 560, letterSpacing: 0, lineHeight: 1.06, color: 'var(--ink)' }}>
              {doctorGreeting(user)}<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.3 }}>
              {opportunityCountLabel(todayRelevantCount)}
            </p>
          </div>

          <div className="no-scrollbar" style={{ display: 'flex', gap: 7, marginBottom: 13, overflowX: 'auto', paddingBottom: 2 }}>
            <OpportunityMetric label={companyMatches.length === 1 ? 'empresa sugerida' : 'empresas sugeridas'} value={companyMatches.length} onClick={() => setHomeSegment('companies')} />
            <OpportunityMetric label="solicitações" value={pendingConnections.length} onClick={() => setHomeSegment('for-you')} />
            <OpportunityMetric label={upcomingEvents.length === 1 ? 'evento próximo' : 'eventos próximos'} value={upcomingEvents.length} onClick={() => setHomeSegment('events')} />
          </div>

          <CommunityPulse
            companies={companyMatches}
            representatives={representativesAvailable}
            events={upcomingEvents}
          />

          {pendingConnections.length > 0 && (
            <ConnectionRequests leads={pendingConnections} onViewCompany={company => openTab('connect', company)} />
          )}

          <HomeSegmentTabs active={homeSegment} onChange={setHomeSegment} />

          <SuggestedConnections
            activeSegment={homeSegment}
            companies={companyMatches}
            events={upcomingEvents}
            products={recommendedProducts}
            courses={courses}
            onOpenCompany={company => openTab('connect', company)}
            onOpenEvents={company => openTab('events', company)}
            onOpenProducts={company => openTab('products', company)}
            onOpenCourses={company => openTab('courses', company)}
            onUpdateInterests={() => openTab('connect')}
          />

          <DoctorWhatsappCard />

          <ProfessionalInterests
            tags={interestTags}
            onUpdate={() => openTab('connect')}
          />
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 560, letterSpacing: 0, marginBottom: 4 }}>
            Eventos<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            <b style={{ color: 'var(--accent)' }}>{events.length}</b> eventos disponíveis.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar eventos..." />
          <FilterChips
            tabs={[['all','TODOS'],['congresso','CONGRESSO'],['workshop','WORKSHOP'],['online','ONLINE']]}
            active={evFilter} onChange={setEvFilter}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtEvents.length === 0
              ? <Empty text="Nenhum evento disponível no momento." hint="Novas oportunidades aparecerão aqui quando forem publicadas." />
              : filtEvents.map(e => <EventCard key={e.id} ev={e} />)
            }
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 560, letterSpacing: 0, marginBottom: 4 }}>
            Produtos e representantes<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            Empresas e startups com contato comercial direto para médicos.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar empresa, produto ou representante..." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtProducts.length === 0
              ? <Empty text="Nenhum produto recomendado ainda." hint="Atualize seus interesses para receber sugestões mais precisas." />
              : filtProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 560, letterSpacing: 0, marginBottom: 4 }}>
            Eventos e capacitações médicas<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            Workshops, aulas e oportunidades selecionadas para médicos.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar workshops e eventos..." />
          <FilterChips
            tabs={[
              ['all','TODOS'],
              ['Nutrologia','NUTROLOGIA'],
              ['Endocrinologia','ENDOCRINOLOGIA'],
              ['Dermatologia','DERMATOLOGIA'],
              ['Cirurgia Plástica','CIR. PLÁSTICA'],
              ['Cardiologia','CARDIOLOGIA'],
              ['Oncologia','ONCOLOGIA'],
              ['Neurologia','NEUROLOGIA'],
              ['Ortopedia','ORTOPEDIA'],
              ['Pediatria','PEDIATRIA'],
              ['Gastroenterologia','GASTRO'],
              ['Ginecologia','GINECOLOGIA'],
              ['Oftalmologia','OFTALMOLOGIA'],
              ['Psiquiatria','PSIQUIATRIA'],
              ['Pneumologia','PNEUMOLOGIA'],
              ['Clínica Médica','CLÍNICA MÉD.'],
              ['Outros','OUTROS'],
            ]}
            active={courseFilter}
            onChange={setCourseFilter}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtCourses.length === 0
              ? <Empty text="Nenhuma capacitação encontrada." hint="Quando empresas publicarem workshops e eventos médicos, eles aparecem aqui." />
              : filtCourses.map(c => <CourseCard key={c.id} course={c} />)
            }
          </div>
        </div>
      )}

      {/* ── CONNECT (WhatsApp matches) ── */}
      {tab === 'connect' && (
        <ConnectView
          events={events}
          products={products}
          courses={courses}
          onOpenProducts={company => openTab('products', company)}
          onOpenEvents={company => openTab('events', company)}
        />
      )}

      <DoctorActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onSelect={action => {
          if (action === 'companies') openTab('connect');
          if (action === 'representative') openTab('connect');
          if (action === 'interest') openTab('products');
          if (action === 'events') openTab('events');
          if (action === 'profile') openTab('home');
        }}
      />
    </Layout>
  );
}

function OpportunityMetric({ label, value, onClick }: { label: string; value: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '0 0 auto',
        minHeight: 38,
        padding: '7px 11px',
        borderRadius: 999,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 2px 10px rgba(90,80,130,0.04)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 560, color: 'var(--ink)', letterSpacing: 0, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-2)', fontWeight: 560, lineHeight: 1, whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </button>
  );
}

function HomeSegmentTabs({ active, onChange }: { active: HomeSegment; onChange: (value: HomeSegment) => void }) {
  const tabs: Array<[HomeSegment, string]> = [
    ['for-you', 'Para você'],
    ['companies', 'Empresas'],
    ['representatives', 'Representantes'],
    ['events', 'Eventos'],
  ];

  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
      {tabs.map(([value, label]) => {
        const selected = value === active;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            style={{
              flex: '0 0 auto',
              minHeight: 34,
              padding: '7px 12px',
              borderRadius: 999,
              border: `1px solid ${selected ? 'rgba(74,168,255,0.28)' : 'var(--line)'}`,
              background: selected ? 'rgba(74,168,255,0.10)' : 'var(--card)',
              color: selected ? 'var(--accent)' : 'var(--ink-2)',
              fontSize: 11.5,
              fontWeight: 560,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SuggestedConnections({
  activeSegment,
  companies,
  events,
  products,
  courses,
  onOpenCompany,
  onOpenEvents,
  onOpenProducts,
  onOpenCourses,
  onUpdateInterests,
}: {
  activeSegment: HomeSegment;
  companies: CompanyMatch[];
  events: Event[];
  products: Product[];
  courses: Course[];
  onOpenCompany: (company: string) => void;
  onOpenEvents: (company: string) => void;
  onOpenProducts: (company: string) => void;
  onOpenCourses: (company: string) => void;
  onUpdateInterests: () => void;
}) {
  const { addLead, registerInterest, registeredEventIds, leads } = useAuth();
  const [savedContacts, setSavedContacts] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('tessy-doctor-saved-contacts') ?? '[]'));
    } catch {
      return new Set();
    }
  });
  const [sentCompanies, setSentCompanies] = useState<Set<string>>(new Set());
  const topCompany = companies[0];
  const representative = companies.find(company => company.whatsapp);
  const topEvent = events[0];
  const topProduct = products[0];
  const topCourse = courses[0];
  const suggestionsAvailable = topCompany || representative || topEvent || topProduct || topCourse;

  function saveContact(id: string) {
    setSavedContacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('tessy-doctor-saved-contacts', JSON.stringify([...next]));
      return next;
    });
  }

  async function connectCompany(company: CompanyMatch) {
    setSentCompanies(prev => new Set(prev).add(company.id));
    await addLead({
      companyId: company.id,
      companyName: company.name,
      itemType: 'company',
      itemName: company.name,
      intent: 'representative_contact',
      message: 'Médico demonstrou interesse em conexão com a empresa.',
    });
  }

  async function interestEvent(ev: Event) {
    if (registeredEventIds.has(ev.id) || hasLeadInterest(leads, 'event', ev.id, 'event_interest')) return;
    await addLead({
      companyId: ev.companyId,
      companyName: ev.companyName,
      itemType: 'event',
      itemId: ev.id,
      itemName: ev.title,
      intent: 'event_interest',
      message: `Médico demonstrou interesse no evento ${ev.title}.`,
    });
    await registerInterest(ev.id);
  }

  async function interestCourse(course: Course) {
    if (hasLeadInterest(leads, 'course', course.id, 'course_interest')) return;
    await addLead({
      companyId: course.companyId,
      companyName: course.companyName,
      itemType: 'course',
      itemId: course.id,
      itemName: course.title,
      intent: 'course_interest',
      message: `Médico demonstrou interesse em ${course.title}.`,
    });
  }

  const representatives = companies.filter(company => company.whatsapp);
  const titleBySegment: Record<HomeSegment, string> = {
    'for-you': 'Para você agora',
    companies: 'Empresas relevantes',
    representatives: 'Representantes disponíveis',
    events: 'Eventos próximos',
  };

  const emptyTextBySegment: Record<HomeSegment, string> = {
    'for-you': 'Ainda não encontramos oportunidades compatíveis com seu perfil.',
    companies: 'Nenhuma empresa sugerida por enquanto.',
    representatives: 'Nenhum representante disponível por enquanto.',
    events: 'Nenhum evento próximo no momento.',
  };

  const emptyHintBySegment: Record<HomeSegment, string> = {
    'for-you': 'Atualize seus interesses para receber sugestões melhores.',
    companies: 'Complete seu perfil para melhorar suas recomendações.',
    representatives: 'Novos contatos aparecem aqui quando empresas publicarem oportunidades.',
    events: 'Novas oportunidades aparecerão aqui quando forem publicadas.',
  };

  const hasContent = activeSegment === 'for-you'
    ? suggestionsAvailable
    : activeSegment === 'companies'
      ? companies.length > 0
      : activeSegment === 'representatives'
        ? representatives.length > 0
        : events.length > 0;

  return (
    <div style={{ marginBottom: 14 }}>
      <SectionHeader title={titleBySegment[activeSegment]} />
      {!hasContent ? (
        <Empty
          text={emptyTextBySegment[activeSegment]}
          hint={emptyHintBySegment[activeSegment]}
          actionLabel={activeSegment === 'for-you' || activeSegment === 'companies' ? 'Atualizar interesses' : undefined}
          onAction={activeSegment === 'for-you' || activeSegment === 'companies' ? onUpdateInterests : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {(activeSegment === 'for-you' || activeSegment === 'companies') && companies.slice(0, activeSegment === 'companies' ? 4 : 1).map(company => (
            <SuggestionCard
              key={`company-${company.id}`}
              eyebrow="Empresa"
              title={company.name}
              meta={[
                company.products.length > 0 ? `${company.products.length} produto${company.products.length > 1 ? 's' : ''}` : '',
                company.events.length > 0 ? `${company.events.length} evento${company.events.length > 1 ? 's' : ''}` : '',
              ].filter(Boolean).join(' · ') || 'Perfil comercial ativo'}
              reason="Pode combinar com seu perfil e interesses médicos."
              tags={[company.products[0]?.category, company.events[0]?.category].filter((tag): tag is string => Boolean(tag)).slice(0, 2)}
              primaryLabel="Ver perfil"
              onPrimary={() => onOpenCompany(company.name)}
              secondaryLabel={sentCompanies.has(company.id) ? 'Conexão enviada' : 'Conectar'}
              onSecondary={() => { void connectCompany(company); }}
              secondaryDone={sentCompanies.has(company.id)}
            />
          ))}

          {(activeSegment === 'for-you' || activeSegment === 'representatives') && representatives.slice(0, activeSegment === 'representatives' ? 4 : 1).map(company => (
            <SuggestionCard
              key={`rep-${company.id}`}
              eyebrow="Representante"
              title={`Representante ${company.name}`}
              meta="Contato comercial direto"
              reason="Disponível para conversas com intenção clara."
              tags={['WhatsApp', company.events[0]?.location].filter((tag): tag is string => Boolean(tag)).slice(0, 2)}
              primaryLabel="WhatsApp"
              primaryHref={buildWhatsappLink(company.whatsapp, `Olá ${company.name}, sou médico no Tessy e gostaria de falar com um representante.`)}
              secondaryLabel={savedContacts.has(company.id) ? 'Salvo' : 'Salvar'}
              onSecondary={() => saveContact(company.id)}
              secondaryDone={savedContacts.has(company.id)}
            />
          ))}

          {(activeSegment === 'for-you' || activeSegment === 'events') && events.slice(0, activeSegment === 'events' ? 4 : 1).map(ev => (
            <SuggestionCard
              key={`event-${ev.id}`}
              eyebrow="Evento"
              title={ev.title}
              meta={`${eventDateLabel(ev)} · ${locationText(ev.location)}`}
              reason={`Para atualização prática em ${ev.category.toLowerCase()}.`}
              tags={[eventFormat(ev), eventSeatText(ev.maxParticipants || 0, Math.max(0, (ev.maxParticipants || 0) - ev.registeredCount)), eventCountdown(ev)].filter(Boolean)}
              primaryLabel="Ver detalhes"
              onPrimary={() => onOpenEvents(ev.companyName)}
              secondaryLabel={(registeredEventIds.has(ev.id) || hasLeadInterest(leads, 'event', ev.id, 'event_interest')) ? 'Interesse enviado' : 'Tenho interesse'}
              onSecondary={() => { void interestEvent(ev); }}
              secondaryDone={registeredEventIds.has(ev.id) || hasLeadInterest(leads, 'event', ev.id, 'event_interest')}
            />
          ))}

          {activeSegment === 'for-you' && topCourse && !topEvent && (
            <SuggestionCard
              eyebrow="Workshop"
              title={topCourse.title}
              meta={`${eventDateLabel({ date: courseDisplayDate(topCourse), time: topCourse.time })} · ${locationText(topCourse.location)}`}
              reason={`Capacitação alinhada à área ${topCourse.category}.`}
              tags={[modalityText(topCourse.modality), topCourse.category]}
              primaryLabel="Ver detalhes"
              onPrimary={() => onOpenCourses(topCourse.companyName)}
              secondaryLabel={hasLeadInterest(leads, 'course', topCourse.id, 'course_interest') ? 'Interesse enviado' : 'Tenho interesse'}
              onSecondary={() => { void interestCourse(topCourse); }}
              secondaryDone={hasLeadInterest(leads, 'course', topCourse.id, 'course_interest')}
            />
          )}

          {activeSegment === 'for-you' && topProduct && (
            <SuggestionCard
              eyebrow="Produto"
              title={topProduct.name}
              meta={topProduct.companyName}
              reason={topProduct.availableFor || 'Produto recomendado para avaliação médica.'}
              tags={[topProduct.category, 'Amostra'].filter(Boolean)}
              primaryLabel="Ver produtos"
              onPrimary={() => onOpenProducts(topProduct.companyName)}
              secondaryLabel={hasLeadInterest(leads, 'product', topProduct.id, 'sample_request') ? 'Interesse enviado' : 'Tenho interesse'}
              onSecondary={() => {
                void addLead({
                  companyId: topProduct.companyId,
                  companyName: topProduct.companyName,
                  itemType: 'product',
                  itemId: topProduct.id,
                  itemName: topProduct.name,
                  intent: 'sample_request',
                  message: 'Médico demonstrou interesse no produto.',
                });
              }}
              secondaryDone={hasLeadInterest(leads, 'product', topProduct.id, 'sample_request')}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({
  eyebrow,
  title,
  meta,
  reason,
  tags = [],
  primaryLabel,
  secondaryLabel,
  primaryHref,
  onPrimary,
  onSecondary,
  secondaryDone,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  reason: string;
  tags?: string[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  secondaryDone?: boolean;
}) {
  const primaryStyle = {
    flex: '0 0 auto',
    minWidth: 82,
    minHeight: 36,
    padding: '8px 9px',
    borderRadius: 10,
    background: 'var(--accent-ink)',
    color: '#fff',
    border: 'none',
    textDecoration: 'none',
    fontSize: 11,
    fontWeight: 560,
    textAlign: 'center' as const,
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      padding: 10,
      borderRadius: 14,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      boxShadow: '0 2px 10px rgba(90,80,130,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          flexShrink: 0,
          background: 'rgba(74,168,255,0.10)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 560,
        }}>
          {eyebrow.slice(0, 1)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Mono style={{ fontSize: 8, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {eyebrow}
          </Mono>
          <div style={{ marginTop: 3, fontSize: 13.5, color: 'var(--ink)', fontWeight: 560, lineHeight: 1.15 }}>
            {title}
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: 'var(--muted)', lineHeight: 1.25 }}>
            {meta}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.3 }}>
            {reason}
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
              {tags.slice(0, 3).map(tag => <Chip key={tag} color={tag.toLowerCase().includes('whatsapp') ? '#25D366' : 'var(--accent)'}>{tag}</Chip>)}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
        {primaryHref ? (
          <a href={primaryHref} target="_blank" rel="noopener noreferrer" style={primaryStyle}>
            {primaryLabel}
          </a>
        ) : (
          <button type="button" onClick={onPrimary} style={primaryStyle}>
            {primaryLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onSecondary}
          style={{
            flex: 1,
            minHeight: 36,
            padding: '8px 8px',
            borderRadius: 10,
            background: secondaryDone ? 'rgba(30,169,124,0.10)' : 'var(--chip)',
            color: secondaryDone ? '#1EA97C' : 'var(--ink-2)',
            border: `1px solid ${secondaryDone ? 'rgba(30,169,124,0.28)' : 'var(--line)'}`,
            fontSize: 11,
            fontWeight: 560,
            cursor: 'pointer',
          }}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function CommunityPulse({
  companies,
  representatives,
  events,
}: {
  companies: CompanyMatch[];
  representatives: CompanyMatch[];
  events: Event[];
}) {
  const items = [
    companies.length > 0
      ? `${companies.length} ${companies.length === 1 ? 'empresa publicou' : 'empresas publicaram'} oportunidades esta semana`
      : 'Novas empresas aparecem conforme seu perfil evolui',
    representatives.length > 0
      ? `${representatives.length} ${representatives.length === 1 ? 'representante disponível' : 'representantes disponíveis'} para contato direto`
      : 'Representantes aparecem quando houver contato disponível',
    events.length > 0
      ? `${events.length} ${events.length === 1 ? 'evento próximo' : 'eventos próximos'} da sua especialidade`
      : 'Eventos próximos aparecem quando forem publicados',
  ];

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <SectionHeader title="Movimento da sua rede" />
      <div style={{ display: 'grid', gap: 6 }}>
        {items.map(item => (
          <div key={item} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minHeight: 34,
            padding: '8px 10px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(74,168,255,0.08), rgba(255,111,77,0.06))',
            border: '1px solid rgba(74,168,255,0.14)',
            fontSize: 11.5,
            color: 'var(--ink-2)',
            lineHeight: 1.28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfessionalInterests({ tags, onUpdate }: { tags: string[]; onUpdate: () => void }) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 18,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      marginBottom: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <Mono style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Perfil
          </Mono>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 560, color: 'var(--ink)' }}>
            Seus interesses profissionais
          </div>
        </div>
        <button
          type="button"
          onClick={onUpdate}
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--chip)',
            color: 'var(--ink-2)',
            fontSize: 12,
            fontWeight: 560,
            cursor: 'pointer',
          }}
        >
          Atualizar interesses
        </button>
      </div>
      {tags.length > 0 ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {tags.map(tag => <Chip key={tag} color="var(--accent)">{tag}</Chip>)}
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>
          Complete seu perfil para melhorar suas recomendações.
        </div>
      )}
    </div>
  );
}

function DoctorActionSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (action: 'companies' | 'representative' | 'interest' | 'events' | 'profile') => void;
}) {
  if (!open) return null;
  const actions: Array<{ key: 'companies' | 'representative' | 'interest' | 'events' | 'profile'; label: string }> = [
    { key: 'companies', label: 'Buscar empresas' },
    { key: 'representative', label: 'Encontrar representante' },
    { key: 'interest', label: 'Publicar interesse' },
    { key: 'events', label: 'Ver eventos próximos' },
    { key: 'profile', label: 'Atualizar meu perfil' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(15,22,38,0.22)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 12px max(12px, env(safe-area-inset-bottom))',
    }}>
      <button
        type="button"
        aria-label="Fechar ações"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
      />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 456,
        padding: 14,
        borderRadius: 22,
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid var(--line)',
        boxShadow: '0 18px 50px rgba(52,57,73,0.20)',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 999, background: 'rgba(52,57,73,0.16)', margin: '2px auto 12px' }} />
        <div style={{ fontSize: 17, fontWeight: 560, color: 'var(--ink)', marginBottom: 10 }}>
          O que você deseja fazer?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {actions.map(action => (
            <button
              key={action.key}
              type="button"
              onClick={() => onSelect(action.key)}
              style={{
                padding: '13px 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--card)',
                color: 'var(--ink)',
                fontSize: 14,
                fontWeight: 560,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorWhatsappCard() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user?.whatsapp ? fmtPhone(user.whatsapp) : '');
  const [privateOnly, setPrivateOnly] = useState(user?.whatsappConnectionOnly !== false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);

  async function save() {
    const normalized = normalizePhone(phone);
    if (phone.trim() && normalized.length < 12) {
      setError('Informe um telefone brasileiro com DDD.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await updateProfile({
        whatsapp: normalized || '',
        whatsappConnectionOnly: privateOnly,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar WhatsApp.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      marginBottom: 16,
      padding: 11,
      borderRadius: 14,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      boxShadow: '0 2px 10px rgba(90,80,130,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <Mono style={{ fontSize: 8.5, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Contato profissional
          </Mono>
          <div style={{ marginTop: 5, fontSize: 14, color: 'var(--ink)', fontWeight: 560 }}>
            Seu canal de contato profissional
          </div>
          <div style={{ marginTop: 3, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
            Empresas e representantes aprovados podem falar com você por aqui.
          </div>
        </div>
      </div>

      {!editing && (
        <div style={{ marginTop: 10 }}>
          {user?.whatsapp ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 560 }}>
                  {fmtPhone(user.whatsapp)}
                </div>
                <Chip color="#1EA97C">Visível para empresas aprovadas</Chip>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setPhone(user.whatsapp ? fmtPhone(user.whatsapp) : '');
                    setPrivateOnly(user.whatsappConnectionOnly !== false);
                    setEditing(true);
                  }}
                  style={{
                    minHeight: 40,
                    padding: '8px 8px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--chip)',
                    color: 'var(--ink-2)',
                    fontSize: 12,
                    fontWeight: 560,
                    cursor: 'pointer',
                  }}
                >
                  Editar WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissions(prev => !prev)}
                  style={{
                    minHeight: 40,
                    padding: '8px 8px',
                    borderRadius: 10,
                    border: '1px solid rgba(74,168,255,0.22)',
                    background: 'rgba(74,168,255,0.08)',
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 560,
                    cursor: 'pointer',
                  }}
                >
                  Ver permissões de contato
                </button>
              </div>
              {showPermissions && (
                <div style={{
                  marginTop: 10,
                  padding: '9px 10px',
                  borderRadius: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  fontSize: 11.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.35,
                }}>
                  Seu WhatsApp não aparece publicamente. Empresas veem o botão de conexão e só recebem acesso após aprovação.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>
                Cadastre seu WhatsApp profissional para receber contatos de empresas, representantes e organizadores de eventos.
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  minHeight: 40,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 560,
                  cursor: 'pointer',
                }}
              >
                Cadastrar WhatsApp
              </button>
            </>
          )}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 10 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#25D366', display: 'flex' }}>
              <WaIcon size={15} />
            </span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={event => setPhone(fmtPhone(event.target.value))}
              placeholder="(11) 99999-9999"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 10,
                background: 'var(--bg)',
                border: '1.5px solid var(--line)',
                color: 'var(--ink)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginTop: 7, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>
            Use um número que possa receber contatos comerciais, convites, eventos e oportunidades da Tessy.
          </div>
          <label style={{ marginTop: 9, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
            <input
              type="checkbox"
              checked={privateOnly}
              onChange={event => setPrivateOnly(event.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--accent)' }}
            />
            <span>Mostrar WhatsApp apenas para empresas com conexão aprovada.</span>
          </label>
          {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {user?.whatsapp && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  padding: '8px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--chip)',
                  color: 'var(--ink-2)',
                  fontSize: 13,
                  fontWeight: 560,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => { void save(); }}
              style={{
                flex: 2,
                minHeight: 40,
                padding: '8px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 560,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.72 : 1,
              }}
            >
              {busy ? 'Salvando...' : 'Salvar WhatsApp'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionRequests({ leads, onViewCompany }: { leads: Lead[]; onViewCompany: (company: string) => void }) {
  const { user, approveConnection } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function approve(leadId: string) {
    if (!user?.whatsapp) {
      setError('WhatsApp ainda não informado.');
      return;
    }
    setBusyId(leadId);
    setError('');
    try {
      await approveConnection(leadId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar conexão.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeader title="Solicitações de conexão" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {leads.slice(0, 3).map(lead => (
          <div key={lead.id} style={{
            padding: 11,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(74,168,255,0.10), rgba(255,111,77,0.08))',
            border: '1px solid rgba(74,168,255,0.16)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 560, lineHeight: 1.15 }}>
                  {lead.companyName}
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.32 }}>
                  Quer falar sobre <b>{lead.itemName}</b>.
                </div>
              </div>
              <Chip color="var(--accent)">Pendente</Chip>
            </div>
            {!user?.whatsapp && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>
                WhatsApp ainda não informado.
              </div>
            )}
            <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
              <button
                type="button"
                disabled={!user?.whatsapp || busyId === lead.id}
                onClick={() => { void approve(lead.id); }}
                style={{
                  flex: 1,
                  minHeight: 40,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: user?.whatsapp ? 'var(--accent)' : 'var(--chip)',
                  color: user?.whatsapp ? '#fff' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 560,
                  cursor: user?.whatsapp && busyId !== lead.id ? 'pointer' : 'not-allowed',
                }}
              >
                {busyId === lead.id ? 'Aprovando...' : 'Aprovar'}
              </button>
              <button
                type="button"
                onClick={() => onViewCompany(lead.companyName)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--card)',
                  color: 'var(--ink-2)',
                  fontSize: 12,
                  fontWeight: 560,
                  cursor: 'pointer',
                }}
              >
                Ver perfil
              </button>
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
    </div>
  );
}

/* ─── Connect view ─── */
function ConnectView({
  events,
  products,
  courses,
  onOpenProducts,
  onOpenEvents,
}: {
  events: Event[];
  products: Product[];
  courses: Course[];
  onOpenProducts: (company: string) => void;
  onOpenEvents: (company: string) => void;
}) {
  const [saved, setSaved] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('tessy-saved-companies') ?? '[]'));
    } catch {
      return new Set();
    }
  });
  const [sentLeadIds, setSentLeadIds] = useState<Set<string>>(new Set());
  const { addLead } = useAuth();

  const companies = buildCompanyMatches(events, products, courses);

  function toggleSaved(id: string) {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('tessy-saved-companies', JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div>
      <div style={{
        padding: '18px 16px',
        borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(74,168,255,0.12) 0%, rgba(30,169,124,0.10) 100%)',
        border: '1px solid rgba(74,168,255,0.16)',
        marginBottom: 18,
      }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Ponte médico-empresa
        </Mono>
        <h1 style={{ fontSize: 26, fontWeight: 560, letterSpacing: 0, lineHeight: 1.1, marginTop: 8 }}>
          Comunidade prática<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>
          Encontre empresas com produtos, eventos e treinamentos relevantes. Salve contato ou fale direto com o representante.
        </p>
      </div>

      {companies.length === 0 && (
        <Empty
          text="Nenhuma conexão sugerida por enquanto."
          hint="Complete seu perfil para melhorar suas recomendações."
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {companies.map(co => {
          const tint = companyTint(co.name);
          const code = co.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
          const topProduct = co.products[0];
          const topEvent = co.events[0];
          const waLink = buildWhatsappLink(
            co.whatsapp,
            `Olá ${co.name}, sou médico no Tessy e gostaria de falar com um representante sobre produtos, eventos e possíveis parcerias.`,
          );
          const isSaved = saved.has(co.id);
          const leadSent = sentLeadIds.has(co.id);

          async function registerCompanyLead(intent: 'representative_contact' | 'sample_request') {
            setSentLeadIds(prev => new Set(prev).add(co.id));
            await addLead({
              companyId: co.id,
              companyName: co.name,
              itemType: 'company',
              itemName: co.name,
              intent,
              message: intent === 'sample_request'
                ? 'Médico solicitou amostras e materiais para avaliação.'
                : 'Médico pediu contato do representante regional.',
            });
          }

          return (
            <div key={co.id} style={{
              padding: 16,
              background: 'var(--card)',
              borderRadius: 18,
              border: '1px solid var(--line)',
              boxShadow: '0 2px 10px rgba(90,80,130,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CompanyMark code={code} tint={tint} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 560, color: 'var(--ink)' }}>{co.name}</span>
                    <VerifiedDot />
                    {co.whatsapp && <Chip color="#25D366">WhatsApp direto</Chip>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {co.products.length > 0 && <Chip color="#1EA97C">{co.products.length} produto{co.products.length > 1 ? 's' : ''}</Chip>}
                    {co.events.length > 0 && <Chip color="var(--accent)">{co.events.length} evento{co.events.length > 1 ? 's' : ''}</Chip>}
                    {co.courses.length > 0 && <Chip color="var(--accent-ink)">{co.courses.length} treinamento{co.courses.length > 1 ? 's' : ''}</Chip>}
                  </div>
                </div>
              </div>

              {(topProduct || topEvent) && (
                <div style={{
                  marginTop: 14,
                  padding: '12px 12px',
                  borderRadius: 14,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                }}>
                  <Mono style={{ display: 'block', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                    Melhor oportunidade agora
                  </Mono>
                  <div style={{ fontSize: 14, fontWeight: 560, color: 'var(--ink)', lineHeight: 1.25 }}>
                    {topProduct?.name ?? topEvent?.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 5, lineHeight: 1.45 }}>
                    {topProduct
                      ? topProduct.availableFor || topProduct.description
                      : `${topEvent?.category || 'Evento'} · ${locationText(topEvent?.location)} · ${topEvent ? eventDateLabel(topEvent) : 'Data a confirmar'}`}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { void registerCompanyLead('representative_contact'); }}
                    style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '11px 8px', borderRadius: 12,
                    background: 'rgba(37,211,102,0.12)', color: '#25D366',
                    border: '1px solid rgba(37,211,102,0.32)',
                    textDecoration: 'none', fontWeight: 560, fontSize: 13,
                  }}>
                    <WaIcon size={15} /> WhatsApp
                  </a>
                )}
                <button onClick={() => toggleSaved(co.id)} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: isSaved ? 'rgba(74,168,255,0.10)' : 'var(--chip)',
                  color: isSaved ? 'var(--accent)' : 'var(--ink-2)',
                  border: `1px solid ${isSaved ? 'rgba(74,168,255,0.28)' : 'var(--line)'}`,
                  fontWeight: 560, fontSize: 13, cursor: 'pointer',
                }}>
                  {isSaved ? 'Contato salvo' : 'Salvar contato'}
                </button>
                <button onClick={() => { void registerCompanyLead('sample_request'); }} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: leadSent ? 'rgba(30,169,124,0.10)' : 'rgba(74,168,255,0.08)',
                  color: leadSent ? '#1EA97C' : 'var(--accent)',
                  border: `1px solid ${leadSent ? 'rgba(30,169,124,0.28)' : 'rgba(74,168,255,0.22)'}`,
                  fontWeight: 560, fontSize: 13, cursor: 'pointer',
                }}>
                  {leadSent ? 'Interesse enviado' : 'Tenho interesse'}
                </button>
                <button onClick={() => onOpenProducts(co.name)} disabled={co.products.length === 0} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: co.products.length > 0 ? 'var(--accent)' : 'var(--chip)',
                  color: co.products.length > 0 ? '#fff' : 'var(--muted)',
                  border: 'none',
                  fontWeight: 560, fontSize: 13,
                  cursor: co.products.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                  Ver produtos
                </button>
                <button onClick={() => onOpenEvents(co.name)} disabled={co.events.length === 0} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: co.events.length > 0 ? 'var(--deep)' : 'var(--chip)',
                  color: co.events.length > 0 ? '#fff' : 'var(--muted)',
                  border: 'none',
                  fontWeight: 560, fontSize: 13,
                  cursor: co.events.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                  Ver eventos
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── WebsiteLink (link para site da empresa, exibido nos cards) ─── */
function WebsiteLink({ url }: { url?: string }) {
  if (!url) return null;
  let host = url;
  try { host = new URL(url).host.replace(/^www\./, ''); } catch { /* manter url original se inválida */ }
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        marginTop: 6, padding: '4px 10px', borderRadius: 999,
        background: 'rgba(91,110,245,0.10)', border: '1px solid rgba(91,110,245,0.25)',
        color: 'var(--accent)', fontSize: 11, fontWeight: 600, textDecoration: 'none',
        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="6.5" /><path d="M1.5 8h13M8 1.5c2 2.2 3 4.5 3 6.5s-1 4.3-3 6.5M8 1.5c-2 2.2-3 4.5-3 6.5s1 4.3 3 6.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {host}
    </a>
  );
}

/* ─── EventCard (full banner) ─── */
function EventCard({ ev }: { ev: Event }) {
  const { registerInterest, registeredEventIds, addLead, leads } = useAuth();
  const [tint1, tint2] = categoryTint(ev.category);
  const registered = registeredEventIds.has(ev.id) || hasLeadInterest(leads, 'event', ev.id, 'event_interest');
  const effectiveRegisteredCount = registered ? Math.max(ev.registeredCount, 1) : ev.registeredCount;
  const totalSeats = ev.maxParticipants || 0;
  const remainingSeats = totalSeats > 0 ? Math.max(0, totalSeats - effectiveRegisteredCount) : 0;
  const pct = totalSeats > 0 ? Math.min(100, Math.round((effectiveRegisteredCount / totalSeats) * 100)) : 0;
  const full = pct >= 100;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const waLink = buildWhatsappLink(ev.companyWhatsapp, `Olá! Vi o evento "${ev.title}" no Tessy e tenho interesse.`);
  const code = ev.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  async function handleInterest() {
    if ((full && !registered) || busy) return;
    setBusy(true);
    setErr('');
    try {
      if (registered) return;
      await addLead({
        companyId: ev.companyId,
        companyName: ev.companyName,
        itemType: 'event',
        itemId: ev.id,
        itemName: ev.title,
        intent: 'event_interest',
        message: `Médico demonstrou interesse no evento ${ev.title}.`,
      });
      await registerInterest(ev.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao atualizar participação.');
    } finally {
      setBusy(false);
    }
  }

  const btnLabel = busy ? '...' : registered ? 'Interesse enviado' : full ? 'Esgotado' : 'Tenho interesse';
  const btnBg = full && !registered ? 'var(--chip)' : registered ? 'rgba(30,169,124,0.10)' : 'var(--accent)';
  const btnColor = full && !registered ? 'var(--muted)' : registered ? '#1EA97C' : '#fff';
  const btnBorder = registered ? '1px solid rgba(30,169,124,0.28)' : 'none';
  const btnCursor = (full && !registered) || busy || registered ? 'not-allowed' : 'pointer';
  const dateLabel = eventDateLabel(ev);
  const formatLabel = eventFormat(ev);
  const countdown = eventCountdown(ev);
  const eventStatus = full ? 'Inscrições encerradas' : 'Inscrições abertas';

  return (
    <BannerCard tint1={tint1} tint2={tint2} month={monthShort(ev.date)} day={dayNum(ev.date)} format={ev.category || 'Evento'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CompanyMark code={code} tint={companyTint(ev.companyName)} size={22} radius={6} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ev.companyName}</span>
        <VerifiedDot size={11} />
      </div>
      <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--accent)', fontWeight: 560, lineHeight: 1.35 }}>
        Para médicos que buscam atualização prática em {(ev.category || 'saúde').toLowerCase()}.
      </div>
      <div style={{ fontSize: 16, fontWeight: 560, letterSpacing: 0, lineHeight: 1.25, color: 'var(--ink)' }}>{ev.title}</div>
      {ev.description && (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {ev.description}
        </div>
      )}
      {ev.website && <div><WebsiteLink url={ev.website} /></div>}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Mono style={{ fontSize: 12, color: 'var(--ink)', letterSpacing: '0.06em' }}>
          {dateLabel}
        </Mono>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {locationText(ev.location)} • {formatLabel}
        </div>
        {countdown && (
          <div style={{ fontSize: 12, color: full ? 'var(--danger)' : 'var(--accent)', fontWeight: 560 }}>
            {countdown}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>
          {eventStatus} • Exclusivo médicos
        </div>
      </div>

      {/* seats */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Mono style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vagas</Mono>
          <Mono style={{ fontSize: 10, color: full ? 'var(--danger)' : 'var(--muted)' }}>
            {eventSeatText(totalSeats, remainingSeats)}
          </Mono>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: full ? 'var(--danger)' : tint1, width: `${pct}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      {err && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 8,
          background: 'rgba(232,69,69,0.08)', color: 'var(--danger)', fontSize: 12,
        }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={handleInterest}
          disabled={(full && !registered) || busy || registered}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: btnBorder,
            background: btnBg, color: btnColor,
            fontSize: 13, fontWeight: 560, cursor: btnCursor,
            transition: 'all 0.2s',
          }}
        >
          {btnLabel}
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(37,211,102,0.1)', color: '#25D366',
            border: '1px solid rgba(37,211,102,0.3)',
            fontSize: 13, fontWeight: 560,
          }}>
            <WaIcon size={14} /> Falar com organizador
          </a>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── ProductCard ─── */
function ProductCard({ product }: { product: Product }) {
  const { addLead, leads } = useAuth();
  const [leadSent, setLeadSent] = useState(false);
  const [tint1] = categoryTint(product.category);
  const code = product.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const repMessage = `Olá! Vi o produto "${product.name}" no Tessy e gostaria de falar com o representante sobre uma possível parceria.`;
  const creatorMessage = `Olá! Sou médico cadastrado no Tessy. Tenho interesse em divulgar o produto "${product.name}" no Instagram e gostaria de entender a proposta, briefing, condições e materiais disponíveis.`;
  const waLink = buildWhatsappLink(product.companyWhatsapp, repMessage);
  const creatorLink = buildWhatsappLink(product.companyWhatsapp, creatorMessage);

  // Prioriza conversa com representante. Se a empresa não cadastrou WhatsApp, cai para o site.
  const repTarget = waLink || product.website || '';
  const creatorTarget = creatorLink || product.website || '';
  const canContactRep = !!repTarget;
  const interestSent = leadSent || hasLeadInterest(leads, 'product', product.id, 'sample_request');

  async function sendProductLead(intent: 'representative_contact' | 'sample_request' | 'instagram_partnership') {
    setLeadSent(true);
    await addLead({
      companyId: product.companyId,
      companyName: product.companyName,
      itemType: 'product',
      itemId: product.id,
      itemName: product.name,
      intent,
      message: intent === 'sample_request'
        ? 'Médico pediu amostra, material científico e condições comerciais.'
        : intent === 'instagram_partnership'
          ? 'Médico quer avaliar parceria para divulgação no Instagram.'
          : 'Médico pediu contato do representante do produto.',
    });
  }

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 18,
      border: '1px solid var(--line)',
      boxShadow: '0 2px 12px rgba(90,80,130,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{ height: 5, background: tint1 }} />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <CompanyMark code={code} tint={companyTint(product.companyName)} size={44} radius={10} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 560 }}>{product.companyName}</span>
              <VerifiedDot size={12} />
              {product.companyWhatsapp && <Chip color="#25D366">Representante direto</Chip>}
            </div>
            <h2 style={{ marginTop: 7, fontSize: 20, fontWeight: 560, letterSpacing: 0, color: 'var(--ink)', lineHeight: 1.1 }}>
              {product.name}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip color={tint1}>{product.category}</Chip>
          <Chip color="#1EA97C">Amostra</Chip>
          {product.price && <Chip color="var(--accent-ink)">{product.price}</Chip>}
        </div>

        <div style={{ marginTop: 14 }}>
          <Mono style={{ display: 'block', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
            Produto
          </Mono>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.45, fontWeight: 600 }}>
            {product.description}
          </div>
        </div>

        <div style={{
          marginTop: 13,
          padding: '11px 12px',
          borderRadius: 12,
          background: 'rgba(74,168,255,0.06)',
          border: '1px solid rgba(74,168,255,0.16)',
        }}>
          <Mono style={{ display: 'block', fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
            Próximo passo
          </Mono>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            {product.availableFor || 'Peça amostra, materiais e fale com o representante da empresa.'}
          </div>
        </div>

        {product.website && <div style={{ marginTop: 8 }}><WebsiteLink url={product.website} /></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            disabled={!canContactRep}
            onClick={() => {
              if (!canContactRep) return;
              void sendProductLead('representative_contact');
              window.open(repTarget, '_blank', 'noopener,noreferrer');
            }}
            style={{
              padding: '12px 10px', borderRadius: 12, border: 'none',
              background: canContactRep ? 'var(--accent)' : 'var(--chip)',
              color: canContactRep ? '#fff' : 'var(--muted)',
              fontSize: 13, fontWeight: 560,
              cursor: canContactRep ? 'pointer' : 'not-allowed',
              opacity: canContactRep ? 1 : 0.7,
            }}>
            {leadSent ? 'Interesse enviado' : 'Falar com representante'}
          </button>
          <button
            type="button"
            onClick={() => { void sendProductLead('sample_request'); }}
            style={{
              padding: '12px 10px', borderRadius: 12,
              background: 'rgba(74,168,255,0.08)', color: 'var(--accent)',
              border: '1px solid rgba(74,168,255,0.22)',
              fontSize: 13, fontWeight: 560, cursor: 'pointer',
            }}>
            {interestSent ? 'Interesse enviado' : 'Tenho interesse'}
          </button>
          {creatorTarget && (
            <a href={creatorTarget} target="_blank" rel="noopener noreferrer" onClick={() => { void sendProductLead('instagram_partnership'); }} style={{
              gridColumn: '1 / -1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 10px', borderRadius: 12, textDecoration: 'none',
              background: 'rgba(37,211,102,0.1)', color: '#25D366',
              border: '1px solid rgba(37,211,102,0.3)', fontSize: 13, fontWeight: 560,
            }}>
              <WaIcon size={14} /> Conversar sobre parceria
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CourseCard (full) ─── */
function CourseCard({ course }: { course: Course }) {
  const { addLead, leads } = useAuth();
  const [tint1, tint2] = categoryTint(course.category);
  const [sent, setSent] = useState(false);
  const code = course.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const waLink = buildWhatsappLink(course.companyWhatsapp, `Olá! Vi "${course.title}" no Tessy e gostaria de falar com o representante.`);
  const interestTarget = course.website || '';
  const displayDate = courseDisplayDate(course);
  const schedule = { date: displayDate, time: course.time };
  const dateLabel = displayDate ? eventDateLabel(schedule) : 'Data a confirmar';
  const countdown = displayDate ? eventCountdown(schedule) : '';
  const placeLabel = course.location?.trim() || (course.modality === 'online' ? 'Online' : 'Local a confirmar');
  const formatLabel = modalityText(course.modality);
  const bannerLabel = course.category === 'Outros' ? 'CAPACITAÇÃO' : course.category;
  const interestSent = sent || hasLeadInterest(leads, 'course', course.id, 'course_interest');

  async function sendCourseInterest() {
    if (interestSent) return;
    setSent(true);
    await addLead({
      companyId: course.companyId,
      companyName: course.companyName,
      itemType: 'course',
      itemId: course.id,
      itemName: course.title,
      intent: 'course_interest',
      message: `Médico demonstrou interesse em ${course.title}.`,
    });
    if (interestTarget) window.open(interestTarget, '_blank', 'noopener,noreferrer');
  }

  return (
    <BannerCard tint1={tint1} tint2={tint2} month={displayDate ? monthShort(displayDate) : undefined} day={displayDate ? dayNum(displayDate) : undefined} format={bannerLabel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <CompanyMark code={code} tint={companyTint(course.companyName)} size={22} radius={6} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{course.companyName}</span>
        <ModalityBadge modality={course.modality} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 560, letterSpacing: 0, color: 'var(--ink)' }}>{course.title}</div>
      {course.website && <div><WebsiteLink url={course.website} /></div>}
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 5, lineHeight: 1.5 }}>{course.description}</div>
      <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Mono style={{ fontSize: 12, color: 'var(--ink)', letterSpacing: '0.06em' }}>
          {dateLabel}
        </Mono>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {placeLabel} • {formatLabel}
        </div>
        {countdown && (
          <div style={{ fontSize: 12, color: countdown === 'Evento encerrado' ? 'var(--danger)' : 'var(--accent)', fontWeight: 560 }}>
            {countdown}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>
          Inscrições abertas • Exclusivo médicos
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: 'INSTRUTOR', val: course.instructor || 'A confirmar' },
          { label: 'DURAÇÃO', val: course.duration || 'A confirmar' },
          { label: 'PREÇO', val: course.price || 'Sob consulta' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <Mono style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', flexShrink: 0 }}>
              {r.label}
            </Mono>
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          type="button"
          disabled={interestSent}
          onClick={() => {
            void sendCourseInterest();
          }}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
            background: interestSent
              ? 'rgba(30,169,124,0.10)'
              : 'linear-gradient(135deg, var(--accent-ink) 0%, var(--accent) 100%)',
            color: interestSent ? '#1EA97C' : '#fff',
            fontSize: 13, fontWeight: 560,
            cursor: interestSent ? 'not-allowed' : 'pointer',
          }}>
          {interestSent ? 'Interesse enviado' : 'Tenho interesse'}
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(37,211,102,0.1)', color: '#25D366',
            border: '1px solid rgba(37,211,102,0.3)', fontSize: 13, fontWeight: 560,
          }}>
            <WaIcon size={14} /> WhatsApp
          </a>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── Shared ─── */
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 16, fontWeight: 560, color: 'var(--ink)' }}>{title}</span>
      {onSeeAll && (
        <button onClick={onSeeAll} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          ver todos →
        </button>
      )}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
        width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="5.5"/><path d="M11 11l3.5 3.5" strokeLinecap="round"/>
      </svg>
      <input
        type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
          borderRadius: 12, background: 'var(--card)', border: '1px solid var(--line)',
          color: 'var(--ink)', fontSize: 14, outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
    </div>
  );
}

function FilterChips({ tabs, active, onChange }: {
  tabs: [string, string][]; active: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 4 }} className="no-scrollbar">
      {tabs.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: '8px 14px', borderRadius: 10, flexShrink: 0,
          background: active === v ? 'var(--accent)' : 'var(--card)',
          border: `1px solid ${active === v ? 'var(--accent)' : 'var(--line)'}`,
          color: active === v ? '#fff' : 'var(--ink-2)',
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 560,
          letterSpacing: '0.08em', cursor: 'pointer',
        }}>{l}</button>
      ))}
    </div>
  );
}

function Empty({
  text,
  hint,
  actionLabel,
  onAction,
}: {
  text: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{
      padding: '16px 14px', textAlign: 'center',
      background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)',
      color: 'var(--muted)', fontSize: 12.5,
    }}>
      <div style={{ color: 'var(--ink)', fontWeight: 560 }}>{text}</div>
      {hint && (
        <div style={{ marginTop: 5, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>
          {hint}
        </div>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 11.5,
            fontWeight: 560,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
