import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, VerifiedDot, Mono, BannerCard, Chip, ModalityBadge,
  WaIcon,
} from '../../components/ui';
import { buildWhatsappLink, categoryTint, companyTint } from '../../lib/uiHelpers';
import { getLevelProgress, countApprovedConnections, getBadges, POINTS_PER_CONNECTION } from '../../lib/gamification';
import { CategoryRail, FilterBar, MarketGrid, MarketCard, PhotoBadge, Sheet, Breadcrumb } from '../../components/market';
import type { CategoryItem } from '../../components/market';
import type { Event, Product, Course, Lead, Location, User, LeadIntent, LeadItemType } from '../../types';

type Tab = 'home' | 'events' | 'products' | 'courses' | 'connect';
type ScheduleLike = { date?: string | null; time?: string | null; start_date?: string | null; event_date?: string | null };
type CompanyMatch = {
  id: string;
  name: string;
  whatsapp?: string;
  products: Product[];
  events: Event[];
  courses: Course[];
  locations: Location[];
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
const WEEKDAYS_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

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

function buildCompanyMatches(events: Event[], products: Product[], courses: Course[], locations: Location[] = []) {
  const companyMap = new Map<string, CompanyMatch>();
  const ensureCompany = (id: string, name: string, whatsapp?: string) => {
    const ex = companyMap.get(id) ?? { id, name, whatsapp, products: [], events: [], courses: [], locations: [] };
    companyMap.set(id, { ...ex, whatsapp: ex.whatsapp ?? whatsapp });
    return companyMap.get(id)!;
  };

  events.forEach(e => ensureCompany(e.companyId, e.companyName, e.companyWhatsapp).events.push(e));
  products.forEach(p => ensureCompany(p.companyId, p.companyName, p.companyWhatsapp).products.push(p));
  courses.forEach(c => ensureCompany(c.companyId, c.companyName, c.companyWhatsapp).courses.push(c));
  locations.forEach(l => ensureCompany(l.companyId, l.companyName, l.whatsapp).locations.push(l));

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

function eventFormat(ev: Pick<Event, 'category' | 'location'>) {
  const text = `${ev.category} ${ev.location}`.toLowerCase();
  if (text.includes('híbrido') || text.includes('hibrido')) return 'Híbrido';
  if (text.includes('online') || text.includes('virtual') || text.includes('webinar')) return 'Online';
  return 'Presencial';
}

function locationTypeLabel(type: Location['type']) {
  const labels: Record<Location['type'], string> = {
    ponto_venda: 'Ponto de venda',
    distribuidor: 'Distribuidor',
    clinica: 'Clínica parceira',
    farmacia: 'Farmácia',
    loja: 'Loja',
    outro: 'Local',
  };
  return labels[type] ?? 'Local';
}

function locationPlace(loc: Location) {
  const parts = [loc.city?.trim(), loc.state?.trim()].filter(Boolean);
  if (parts.length > 0) return parts.join(' · ');
  return loc.address?.trim() || 'Local a confirmar';
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

const VISUAL_FALLBACKS = {
  clinical: '/hero-clinic-premium.png',
  community: '/hero-bg.jpg',
};

function visualUrl(src?: string | null, fallback = VISUAL_FALLBACKS.community) {
  return src?.trim() || fallback;
}

function doctorGreeting(user: User | null | undefined) {
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return firstName ? `Olá, ${firstName}` : 'Olá';
}

function todayLabel(now = new Date()) {
  return `${WEEKDAYS_PT[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${MONTHS_PT[now.getMonth()]}`;
}

function doctorProfileLabel(user: User | null | undefined) {
  return user?.specialty?.trim() || 'Perfil médico';
}

function doctorCityLabel(user: User | null | undefined) {
  const profile = user as (User & { city?: string; cidade?: string; location?: string }) | null | undefined;
  return profile?.city?.trim() || profile?.cidade?.trim() || profile?.location?.trim() || profile?.crmState?.trim() || '';
}

function doctorMetaLine(user: User | null | undefined) {
  const specialty = doctorProfileLabel(user);
  const city = doctorCityLabel(user);
  return city ? `${specialty} · ${city}` : specialty;
}

function opportunityCountLabel(pending: number, eventsCount: number, companiesCount: number) {
  const pendingText = `${pending} ${pending === 1 ? 'solicitação pendente' : 'solicitações pendentes'}`;
  const eventText = `${eventsCount} ${eventsCount === 1 ? 'evento próximo' : 'eventos próximos'}`;
  const companyText = `${companiesCount} ${companiesCount === 1 ? 'empresa sugerida' : 'empresas sugeridas'}`;
  return `Você tem ${pendingText}, ${eventText} e ${companyText} hoje.`;
}

export default function DoctorDashboard() {
  const { user, events, products, courses, leads, locations, refreshData, approveConnection } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [search, setSearch] = useState('');
  const [evFilter, setEvFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [priorityBusy, setPriorityBusy] = useState(false);
  const [priorityError, setPriorityError] = useState('');
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [openEvent, setOpenEvent] = useState<Event | null>(null);
  const [openCourse, setOpenCourse] = useState<Course | null>(null);

  // Refresh data every time the doctor switches tabs so new items from companies appear
  useEffect(() => {
    refreshData();
  }, [tab, refreshData]);

  const q = search.toLowerCase();
  const upcomingEvents = events.filter(isUpcomingEvent);
  const companyMatches = buildCompanyMatches(events, products, courses, locations);
  const recommendedProducts = products.filter(p => matchesDoctorProfile(user, p.name, p.category, p.description, p.availableFor));
  const filtEvents = events.filter(e => {
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.companyName.toLowerCase().includes(q);
    const filter = evFilter.toLowerCase();
    const matchFilter = evFilter === 'all'
      || e.category.toLowerCase().includes(filter)
      || eventFormat(e).toLowerCase().includes(filter);
    return matchQ && matchFilter;
  });
  const filtProducts = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q);
    const matchCat = productFilter === 'all' || p.category?.toLowerCase() === productFilter.toLowerCase();
    return matchQ && matchCat;
  });
  const homeProducts = (recommendedProducts.length > 0 ? recommendedProducts : products)
    .filter(p => productFilter === 'all' || p.category?.toLowerCase() === productFilter.toLowerCase());
  const productChips = productCategoryChips(products);
  const filtCourses  = courses.filter(c => {
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q);
    const matchCat = courseFilter === 'all' || c.category.toLowerCase() === courseFilter.toLowerCase();
    return matchQ && matchCat;
  });

  const pendingConnections = leads.filter(lead => lead.connectionStatus === 'requested');
  const representativesCount = companyMatches.filter(company => company.whatsapp).length;
  const featuredCompany = companyMatches[0];
  const featuredEvent = upcomingEvents[0];
  const featuredProduct = recommendedProducts[0];
  const priorityLead = pendingConnections[0];
  const priorityCompany = priorityLead
    ? companyMatches.find(company => company.id === priorityLead.companyId) ?? featuredCompany
    : featuredCompany;

  function scrollToPendingConnections() {
    document.getElementById('pending-connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollToPriority() {
    document.getElementById('priority-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function approvePriorityConnection() {
    const lead = pendingConnections[0];
    if (!lead) return;
    if (!user?.whatsapp) {
      setPriorityError('Cadastre seu WhatsApp profissional antes de aprovar conexões.');
      return;
    }

    setPriorityBusy(true);
    setPriorityError('');
    try {
      await approveConnection(lead.id);
      await refreshData();
    } catch (err) {
      setPriorityError(err instanceof Error ? err.message : 'Erro ao aprovar conexão.');
    } finally {
      setPriorityBusy(false);
    }
  }

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
          <ProgressCard
            points={user?.points ?? 0}
            connections={countApprovedConnections(leads)}
            pendingCount={pendingConnections.length}
            onApprovePending={scrollToPendingConnections}
          />

          <Breadcrumb items={['início', 'produtos']} />
          <BrowseRail active="products" onSelect={openTab} />
          <FilterBar chips={productChips} active={productFilter} onChange={setProductFilter} />

          {homeProducts.length === 0
            ? <Empty text="Nenhum produto disponível ainda." hint="Novidades das empresas aparecem aqui assim que publicadas." />
            : <MarketGrid>{homeProducts.map(p => <ProductMarketCard key={p.id} product={p} onOpen={() => setOpenProduct(p)} />)}</MarketGrid>
          }

          {priorityLead && (
            <div style={{ marginTop: 16 }}>
              <PriorityCard
                lead={priorityLead}
                event={featuredEvent}
                company={priorityCompany}
                user={user}
                userHasWhatsapp={Boolean(user?.whatsapp)}
                busy={priorityBusy}
                error={priorityError}
                onAnalyze={scrollToPendingConnections}
                onApprove={() => { void approvePriorityConnection(); }}
                onOpenEvent={() => openTab('events', featuredEvent?.companyName ?? '')}
                onOpenCompany={() => openTab('connect', featuredCompany?.name ?? '')}
                onUpdateProfile={() => openTab('connect')}
              />
            </div>
          )}

          {pendingConnections.length > 0 && (
            <PendingConnections leads={pendingConnections} onViewCompany={company => openTab('connect', company)} />
          )}

          <div style={{ marginTop: 16 }}>
            <SectionHeader title="Mais para você" />
          </div>

          <DashboardHeader
            user={user}
            pendingCount={pendingConnections.length}
            eventCount={upcomingEvents.length}
            companyCount={companyMatches.length}
            onViewPriorities={scrollToPriority}
          />

          <QuickAccessGrid
            companiesCount={companyMatches.length}
            representativesCount={representativesCount}
            eventsCount={upcomingEvents.length}
            productsCount={recommendedProducts.length}
            onCompanies={() => openTab('connect')}
            onRepresentatives={() => openTab('connect')}
            onEvents={() => openTab('events')}
            onProducts={() => openTab('products')}
          />

          <UpcomingEventCard
            event={featuredEvent}
            onView={() => openTab('events', featuredEvent?.companyName ?? '')}
          />

          <RecommendedCard
            user={user}
            company={featuredCompany}
            product={featuredProduct}
            event={featuredEvent}
            onOpenCompany={() => openTab('connect', featuredCompany?.name ?? '')}
            onOpenProducts={() => openTab('products', featuredProduct?.companyName ?? '')}
            onOpenEvents={() => openTab('events', featuredEvent?.companyName ?? '')}
          />

          <ProfileNudgeCard user={user} onUpdate={() => openTab('connect')} />
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <Breadcrumb items={['início', 'eventos']} />
          <MarketHead title="Eventos" count={events.length} countWord="evento" />
          <BrowseRail active="events" onSelect={openTab} />
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar eventos..." />
          <FilterBar
            chips={[['all','Todos'],['congresso','Congresso'],['workshop','Workshop'],['online','Online']]}
            active={evFilter} onChange={setEvFilter}
          />
          {filtEvents.length === 0
            ? <Empty text="Nenhum evento disponível no momento." hint="Novas oportunidades aparecerão aqui quando forem publicadas." />
            : <MarketGrid>{filtEvents.map(e => <EventMarketCard key={e.id} ev={e} onOpen={() => setOpenEvent(e)} />)}</MarketGrid>
          }
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div>
          <Breadcrumb items={['início', 'produtos']} />
          <MarketHead title="Produtos" subtitle="Novidades da indústria com contato direto." count={products.length} countWord="produto" />
          <BrowseRail active="products" onSelect={openTab} />
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar produto, empresa ou representante..." />
          <FilterBar chips={productChips} active={productFilter} onChange={setProductFilter} />
          {filtProducts.length === 0
            ? <Empty text="Nenhum produto recomendado ainda." hint="Atualize seus interesses para receber sugestões mais precisas." />
            : <MarketGrid>{filtProducts.map(p => <ProductMarketCard key={p.id} product={p} onOpen={() => setOpenProduct(p)} />)}</MarketGrid>
          }
        </div>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <div>
          <Breadcrumb items={['início', 'workshops']} />
          <MarketHead title="Workshops" subtitle="Capacitações e aulas selecionadas para médicos." count={courses.length} countWord="workshop" />
          <BrowseRail active="courses" onSelect={openTab} />
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar workshops e capacitações..." />
          <FilterBar
            chips={[
              ['all','Todos'],
              ['Nutrologia','Nutrologia'],
              ['Endocrinologia','Endocrinologia'],
              ['Dermatologia','Dermatologia'],
              ['Cirurgia Plástica','Cir. Plástica'],
              ['Cardiologia','Cardiologia'],
              ['Oncologia','Oncologia'],
              ['Neurologia','Neurologia'],
              ['Ortopedia','Ortopedia'],
              ['Pediatria','Pediatria'],
              ['Gastroenterologia','Gastro'],
              ['Ginecologia','Ginecologia'],
              ['Oftalmologia','Oftalmologia'],
              ['Psiquiatria','Psiquiatria'],
              ['Pneumologia','Pneumologia'],
              ['Clínica Médica','Clínica Méd.'],
              ['Outros','Outros'],
            ]}
            active={courseFilter}
            onChange={setCourseFilter}
          />
          {filtCourses.length === 0
            ? <Empty text="Nenhuma capacitação encontrada." hint="Quando empresas publicarem workshops e eventos médicos, eles aparecem aqui." />
            : <MarketGrid>{filtCourses.map(c => <CourseMarketCard key={c.id} course={c} onOpen={() => setOpenCourse(c)} />)}</MarketGrid>
          }
        </div>
      )}

      {/* ── CONNECT (WhatsApp matches) ── */}
      {tab === 'connect' && (
        <ConnectView
          events={events}
          products={products}
          courses={courses}
          locations={locations}
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

      <Sheet open={openProduct !== null} onClose={() => setOpenProduct(null)}>
        <div style={{ padding: '4px 14px 14px' }}>
          {openProduct && <ProductCard product={openProduct} />}
        </div>
      </Sheet>
      <Sheet open={openEvent !== null} onClose={() => setOpenEvent(null)}>
        <div style={{ padding: '4px 14px 14px' }}>
          {openEvent && <EventCard ev={openEvent} />}
        </div>
      </Sheet>
      <Sheet open={openCourse !== null} onClose={() => setOpenCourse(null)}>
        <div style={{ padding: '4px 14px 14px' }}>
          {openCourse && <CourseCard course={openCourse} />}
        </div>
      </Sheet>
    </Layout>
  );
}

/* ─── Cabeçalho de vitrine ─── */
function MarketHead({ title, subtitle, count, countWord }: {
  title: string; subtitle?: string; count: number; countWord: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h1 style={{ fontSize: 26, fontWeight: 560, letterSpacing: 0, marginBottom: 4 }}>
        {title}<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>
        {subtitle ? `${subtitle} ` : ''}
        <b style={{ color: 'var(--accent)' }}>{count}</b> {count === 1 ? countWord : `${countWord}s`} {count === 1 ? 'disponível' : 'disponíveis'}.
      </p>
    </div>
  );
}

function productCategoryChips(products: Product[]): [string, string][] {
  const cats: string[] = [];
  for (const p of products) {
    const c = p.category?.trim();
    if (c && !cats.includes(c)) cats.push(c);
  }
  return [['all', 'Todos'], ...cats.slice(0, 8).map(c => [c, c] as [string, string])];
}

/* ─── Rail de categorias do médico (troca de vitrine) ─── */
function railIcon(kind: string, active: boolean) {
  const c = active ? 'var(--accent)' : '#6F7A90';
  if (kind === 'products') return <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6"><path d="M17.5 13.5V6.5a1.5 1.5 0 00-.8-1.3l-6-3.3a1.5 1.5 0 00-1.4 0l-6 3.3A1.5 1.5 0 002.5 6.5v7a1.5 1.5 0 00.8 1.3l6 3.3a1.5 1.5 0 001.4 0l6-3.3a1.5 1.5 0 00.8-1.3z"/><path d="M2.8 5.8L10 10l7.2-4.2M10 18V10" strokeLinecap="round"/></svg>;
  if (kind === 'events') return <svg width="23" height="23" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><rect x="1.5" y="3.5" width="16" height="14" rx="3"/><path d="M13.5 2v3M5.5 2v3M1.5 8.5h16" strokeLinecap="round"/></svg>;
  if (kind === 'courses') return <svg width="22" height="22" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M3.5 16A2 2 0 015.5 14H17"/><path d="M5.5 1H17v17H5.5A2 2 0 013.5 16V3a2 2 0 012-2z"/></svg>;
  if (kind === 'connect') return <svg width="23" height="23" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6"><path d="M4 17V4.5A1.5 1.5 0 015.5 3h9A1.5 1.5 0 0116 4.5V17"/><path d="M7 7h2M11 7h2M7 10h2M11 10h2M8 17v-4h4v4" strokeLinecap="round"/></svg>;
  return null;
}

function BrowseRail({ active, onSelect }: { active: string; onSelect: (tab: Tab) => void }) {
  const items: CategoryItem[] = [
    { key: 'products', label: 'Produtos', icon: railIcon('products', active === 'products'), active: active === 'products' },
    { key: 'events',   label: 'Eventos',  icon: railIcon('events', active === 'events'),     active: active === 'events' },
    { key: 'courses',  label: 'Workshops', icon: railIcon('courses', active === 'courses'),   active: active === 'courses' },
    { key: 'connect',  label: 'Representantes', icon: railIcon('connect', active === 'connect'),   active: active === 'connect' },
  ];
  return <CategoryRail items={items} onSelect={key => onSelect(key as Tab)} />;
}

/* ─── Cards compactos de vitrine ─── */
function ProductMarketCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const [tint1] = categoryTint(product.category);
  const hasPrice = /^r\$/i.test(product.price?.trim() ?? '');
  return (
    <MarketCard
      image={visualUrl(product.imageUrl)}
      topLeft={<PhotoBadge color="#1EA97C">Amostra</PhotoBadge>}
      highlight={hasPrice ? product.price : undefined}
      title={product.name}
      subtitle={`${product.companyName} • ${product.category}`}
      tag={<Chip color={tint1}>{product.category}</Chip>}
      onClick={onOpen}
    />
  );
}

function EventMarketCard({ ev, onOpen }: { ev: Event; onOpen: () => void }) {
  const countdown = eventCountdown(ev);
  const dateBadge = `${dayNum(ev.date)} ${monthShort(ev.date)}`.trim();
  return (
    <MarketCard
      image={visualUrl(ev.imageUrl, VISUAL_FALLBACKS.clinical)}
      topLeft={dateBadge ? <PhotoBadge color="var(--accent)">{dateBadge}</PhotoBadge> : undefined}
      topRight={<PhotoBadge solid={false}>{eventFormat(ev)}</PhotoBadge>}
      title={ev.title}
      subtitle={`${ev.companyName} • ${locationText(ev.location)}`}
      tag={countdown ? <Chip color="var(--accent)">{countdown}</Chip> : undefined}
      onClick={onOpen}
    />
  );
}

function CourseMarketCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  const hasPrice = /^r\$/i.test(course.price?.trim() ?? '');
  return (
    <MarketCard
      image={visualUrl(course.imageUrl, VISUAL_FALLBACKS.clinical)}
      topLeft={<PhotoBadge color="#F58220">{modalityText(course.modality)}</PhotoBadge>}
      highlight={hasPrice ? course.price : undefined}
      title={course.title}
      subtitle={`${course.companyName} • ${course.category}`}
      tag={<Chip color="var(--accent-ink)">{course.instructor || 'Capacitação'}</Chip>}
      onClick={onOpen}
    />
  );
}

function DashboardHeader({
  user,
  pendingCount,
  eventCount,
  companyCount,
  onViewPriorities,
}: {
  user: User | null | undefined;
  pendingCount: number;
  eventCount: number;
  companyCount: number;
  onViewPriorities: () => void;
}) {
  const summary = [
    { value: pendingCount, label: pendingCount === 1 ? 'solicitação pendente' : 'solicitações pendentes' },
    { value: eventCount, label: eventCount === 1 ? 'evento recomendado' : 'eventos recomendados' },
    { value: companyCount, label: companyCount === 1 ? 'empresa compatível' : 'empresas compatíveis' },
  ];

  return (
    <section style={{
      position: 'relative',
      marginBottom: 10,
      padding: 13,
      borderRadius: 18,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,246,255,0.86) 55%, rgba(255,246,243,0.74))',
      border: '1px solid rgba(216,222,236,0.88)',
      boxShadow: '0 10px 28px rgba(88,98,130,0.065)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.25,
        background: 'radial-gradient(circle at 0% 0%, rgba(74,168,255,0.18), transparent 32%), radial-gradient(circle at 100% 20%, rgba(255,111,77,0.12), transparent 34%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Mono style={{ fontSize: 8.5, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {todayLabel()}
            </Mono>
            <h1 style={{ marginTop: 7, fontSize: 22, fontWeight: 560, letterSpacing: 0, lineHeight: 1.05, color: 'var(--ink)' }}>
              {doctorGreeting(user)}<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            <p style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctorMetaLine(user)}
            </p>
          </div>
          <button
            type="button"
            onClick={onViewPriorities}
            style={{
              height: 34,
              padding: '0 12px',
              borderRadius: 999,
              border: '1px solid rgba(74,168,255,0.24)',
              background: 'rgba(74,168,255,0.09)',
              color: 'var(--accent)',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Ver prioridades
          </button>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {opportunityCountLabel(pendingCount, eventCount, companyCount)}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginTop: 11 }}>
          {summary.map(item => (
            <div
              key={item.label}
              style={{
                minHeight: 48,
                padding: '8px 7px',
                borderRadius: 13,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(216,222,236,0.72)',
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1, color: 'var(--ink)', fontWeight: 620 }}>{item.value}</div>
              <div style={{ marginTop: 4, fontSize: 9.6, lineHeight: 1.15, color: 'var(--muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ percent, size = 64 }: { percent: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, percent)) / 100);
  const inner = size * 0.30;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(15,22,38,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: inner * 2, height: inner * 2, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-blue), #5B6EF5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(74,168,255,0.35)',
        color: '#fff', fontSize: inner * 0.95, lineHeight: 1,
      }}>
        ★
      </div>
    </div>
  );
}

function ProgressChip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderRadius: 999,
      background: 'var(--chip)', border: '1px solid var(--line)',
      color: 'var(--ink)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>{children}
    </span>
  );
}

function ProgressCard({
  points,
  connections,
  pendingCount,
  onApprovePending,
}: {
  points: number;
  connections: number;
  pendingCount: number;
  onApprovePending: () => void;
}) {
  const progress = getLevelProgress(points);
  const badges = getBadges(connections, points);
  const unlockedBadges = badges.filter(b => b.unlocked).length;

  return (
    <section style={{ marginBottom: 12 }}>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        padding: 14,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7F0 60%, #FFF1F4 100%)',
        border: '1px solid rgba(216,222,236,0.9)',
        boxShadow: '0 12px 30px rgba(85,96,130,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <ProgressRing percent={progress.percent} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 650, color: 'var(--accent-ink)', lineHeight: 1.1 }}>
                  Seu progresso Tessy
                </div>
                <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-2)' }}>
                  Nível {progress.level.index + 1} · <b style={{ color: 'var(--accent)' }}>{progress.level.name}</b>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <ProgressChip icon="🤝">{connections}</ProgressChip>
                <ProgressChip icon="⭐">{unlockedBadges}</ProgressChip>
                <ProgressChip icon="🏆">Nível {progress.level.index + 1}</ProgressChip>
              </div>
            </div>

            <div style={{ marginTop: 11 }}>
              <div style={{ height: 8, borderRadius: 999, background: 'rgba(15,22,38,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${progress.percent}%`, background: 'linear-gradient(90deg, #F58220, #FFB066)', transition: 'width 0.6s var(--ease)' }} />
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--accent-ink)' }}>{progress.points} pontos</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.3, textAlign: 'right' }}>
                  {progress.isMax ? 'Nível máximo!' : `+${progress.pointsForNextLevel} p/ ${progress.next?.name}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {pendingCount > 0 && (
          <button type="button" onClick={onApprovePending} style={{
            marginTop: 12,
            width: '100%',
            minHeight: 40,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 22px rgba(245,130,32,0.22)',
          }}>
            Aprovar conexão e ganhar +{POINTS_PER_CONNECTION} pts ({pendingCount} pendente{pendingCount > 1 ? 's' : ''})
          </button>
        )}
      </div>
    </section>
  );
}

function PriorityCard({
  lead,
  event,
  company,
  user,
  userHasWhatsapp,
  busy,
  error,
  onAnalyze,
  onApprove,
  onOpenEvent,
  onOpenCompany,
  onUpdateProfile,
}: {
  lead?: Lead;
  event?: Event;
  company?: CompanyMatch;
  user: User | null | undefined;
  userHasWhatsapp: boolean;
  busy: boolean;
  error: string;
  onAnalyze: () => void;
  onApprove: () => void;
  onOpenEvent: () => void;
  onOpenCompany: () => void;
  onUpdateProfile: () => void;
}) {
  const mode = lead ? 'lead' : event ? 'event' : company ? 'company' : 'profile';
  const score = lead ? Math.max(92, compatibilityScore(company, user)) : compatibilityScore(company, user);
  const title = lead
    ? `${lead.companyName} solicitou conexão com você`
    : event
      ? 'Próximo evento recomendado'
      : company
        ? `${company.name} combina com seu perfil`
        : 'Complete seu perfil para melhorar as recomendações';
  const interest = lead?.itemName || event?.title || company?.events[0]?.title || company?.products[0]?.name || 'Oportunidade Tessy';
  const type = lead ? leadTypeLabel(lead) : event ? 'Evento' : company ? 'Empresa' : 'Perfil';
  const image = visualUrl(event?.imageUrl ?? company?.events[0]?.imageUrl ?? company?.products[0]?.imageUrl, VISUAL_FALLBACKS.clinical);
  const leadAge = lead ? leadAgeLabel(lead.connectionRequestedAt || lead.createdAt) : event ? eventCountdown(event) : 'Alta compatibilidade';

  return (
    <section id="priority-card" style={{ marginBottom: 12 }}>
      <SectionHeader title="Prioridade agora" />
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(216,222,236,0.92)',
        boxShadow: '0 12px 30px rgba(85,96,130,0.075)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(74,168,255,0.08), transparent 42%, rgba(255,111,77,0.07))',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: mode === 'profile' ? '1fr' : '1fr 78px', gap: 12, padding: 13 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{
                padding: '5px 8px',
                borderRadius: 999,
                background: mode === 'lead' ? 'rgba(255,111,77,0.10)' : 'rgba(74,168,255,0.10)',
                color: mode === 'lead' ? '#d65f4f' : 'var(--accent)',
                fontSize: 9.5,
                fontWeight: 620,
              }}>
                {leadAge}
              </span>
              <span style={{
                padding: '5px 8px',
                borderRadius: 999,
                background: 'rgba(15,22,38,0.05)',
                color: 'var(--ink-2)',
                fontSize: 9.5,
                fontWeight: 600,
              }}>
                Tipo: {type}
              </span>
            </div>
            <h2 style={{ fontSize: 16.5, lineHeight: 1.15, color: 'var(--ink)', fontWeight: 620, letterSpacing: 0 }}>
              {title}
            </h2>
            <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
              <PriorityMeta label="Interesse" value={interest} />
              {mode !== 'profile' && <PriorityMeta label="Compatibilidade" value={`${score || 92}%`} />}
            </div>
            {error && <p style={{ marginTop: 8, fontSize: 11, color: '#d65f4f' }}>{error}</p>}
          </div>

          {mode !== 'profile' && (
            <div style={{
              width: 78,
              minHeight: 94,
              borderRadius: 15,
              background: `linear-gradient(180deg, rgba(15,22,38,0.10), rgba(15,22,38,0.40)), url(${image}) center/cover`,
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: '0 10px 22px rgba(85,96,130,0.11)',
            }} />
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 8, padding: '0 13px 13px' }}>
          {mode === 'lead' ? (
            <>
              <button type="button" onClick={onAnalyze} style={priorityButtonStyle('light')}>Ver solicitação</button>
              <button type="button" onClick={onApprove} disabled={busy || !userHasWhatsapp} style={priorityButtonStyle('solid', busy || !userHasWhatsapp)}>
                {busy ? 'Aprovando...' : 'Aprovar'}
              </button>
            </>
          ) : mode === 'event' ? (
            <button type="button" onClick={onOpenEvent} style={priorityButtonStyle('solid')}>Ver evento</button>
          ) : mode === 'company' ? (
            <button type="button" onClick={onOpenCompany} style={priorityButtonStyle('solid')}>Conhecer empresa</button>
          ) : (
            <button type="button" onClick={onUpdateProfile} style={priorityButtonStyle('solid')}>Atualizar perfil</button>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickAccessGrid({
  companiesCount,
  representativesCount,
  eventsCount,
  productsCount,
  onCompanies,
  onRepresentatives,
  onEvents,
  onProducts,
}: {
  companiesCount: number;
  representativesCount: number;
  eventsCount: number;
  productsCount: number;
  onCompanies: () => void;
  onRepresentatives: () => void;
  onEvents: () => void;
  onProducts: () => void;
}) {
  const items: Array<{
    key: 'events' | 'companies' | 'representatives' | 'products';
    label: string;
    count: number;
    hint: string;
    onClick: () => void;
    icon: string;
  }> = [
    { key: 'events', label: 'Eventos recomendados', count: eventsCount, hint: 'Aulas, encontros e imersões', onClick: onEvents, icon: 'calendar' },
    { key: 'companies', label: 'Empresas para conectar', count: companiesCount, hint: 'Marcas compatíveis', onClick: onCompanies, icon: 'company' },
    { key: 'representatives', label: 'Representantes disponíveis', count: representativesCount, hint: 'Contato comercial direto', onClick: onRepresentatives, icon: 'rep' },
    { key: 'products', label: 'Novidades da indústria', count: productsCount, hint: 'Produtos e tecnologias', onClick: onProducts, icon: 'product' },
  ];

  return (
    <div style={{ marginBottom: 12 }}>
      <SectionHeader title="Atalhos inteligentes" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        {items.map(item => {
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              style={{
                minHeight: 78,
                padding: 10,
                borderRadius: 16,
                border: '1px solid rgba(216,222,236,0.88)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,252,255,0.86))',
                boxShadow: '0 8px 22px rgba(88,98,130,0.05)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', background: 'rgba(74,168,255,0.10)' }}>
                  <QuickAccessIcon type={item.icon} />
                </span>
                <span style={{
                  minWidth: 28,
                  height: 26,
                  borderRadius: 999,
                  background: 'rgba(15,22,38,0.05)',
                  color: 'var(--ink)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  fontWeight: 600,
                }}>
                  {item.count}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11.8, lineHeight: 1.15, fontWeight: 620, color: 'var(--ink)' }}>
                  {item.label}
              </div>
              <div style={{ marginTop: 4, fontSize: 10.2, color: 'var(--muted)', lineHeight: 1.2 }}>
                {item.hint}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PriorityMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
      <span style={{
        flexShrink: 0,
        color: 'var(--muted)',
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
      }}>
        {label}:
      </span>
      <span style={{ minWidth: 0, color: 'var(--ink-2)', fontSize: 11.5, fontWeight: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}


function priorityButtonStyle(variant: 'solid' | 'light', disabled = false): CSSProperties {
  return {
    flex: 1,
    minHeight: 40,
    padding: '8px 12px',
    borderRadius: 12,
    border: variant === 'light' ? '1px solid rgba(216,222,236,0.92)' : 'none',
    background: variant === 'solid' ? 'rgba(74,168,255,0.98)' : 'rgba(247,248,255,0.92)',
    color: variant === 'solid' ? '#fff' : 'var(--ink)',
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.58 : 1,
    boxShadow: variant === 'solid' ? '0 10px 22px rgba(74,168,255,0.22)' : 'none',
  };
}

function QuickAccessIcon({ type }: { type: string }) {
  if (type === 'calendar') {
    return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="14" height="13" rx="3"/><path d="M7 2.5v3M13 2.5v3M3 8h14" strokeLinecap="round"/></svg>;
  }
  if (type === 'company') {
    return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 17V4.5A1.5 1.5 0 015.5 3h9A1.5 1.5 0 0116 4.5V17"/><path d="M7 7h2M11 7h2M7 10h2M11 10h2M8 17v-4h4v4" strokeLinecap="round"/></svg>;
  }
  if (type === 'rep') {
    return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="7" r="3"/><path d="M3 17a5 5 0 0110 0"/><path d="M14 6.5a3 3 0 010 6" strokeLinecap="round"/></svg>;
  }
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3.5 6.5L10 3l6.5 3.5v7L10 17l-6.5-3.5v-7z"/><path d="M3.8 6.7L10 10l6.2-3.3M10 17v-7" strokeLinecap="round"/></svg>;
}

function leadTypeLabel(lead: Lead) {
  if (lead.itemType === 'event') return 'Evento';
  if (lead.itemType === 'course') return 'Workshop';
  if (lead.itemType === 'product') return lead.intent === 'sample_request' ? 'Amostra' : 'Produto';
  return lead.intent === 'instagram_partnership' ? 'Parceria' : 'Empresa';
}

function leadAgeLabel(date?: string) {
  if (!date) return 'Novo';
  const created = new Date(date);
  if (Number.isNaN(created.getTime())) return 'Novo';
  const diffDays = Math.floor((startOfDay(new Date()).getTime() - startOfDay(created).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoje';
  if (diffDays === 1) return 'Pendente há 1 dia';
  return `Pendente há ${diffDays} dias`;
}

function compatibilityScore(company?: CompanyMatch, user?: User | null) {
  if (!company) return 0;
  const texts = [
    company.name,
    ...company.products.map(product => `${product.name} ${product.category} ${product.description} ${product.availableFor}`),
    ...company.events.map(event => `${event.title} ${event.category} ${event.description}`),
    ...company.courses.map(course => `${course.title} ${course.category} ${course.description}`),
  ];
  let score = 76;
  if (matchesDoctorProfile(user, ...texts)) score += 9;
  if (company.whatsapp) score += 4;
  if (company.events.length > 0) score += 3;
  if (company.products.length > 0) score += 3;
  return Math.min(94, score);
}

function UpcomingEventCard({ event, onView }: { event?: Event; onView: () => void }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <SectionHeader title="Agenda e oportunidades" />
      {!event ? (
        <Empty text="Nenhum evento próximo no momento." hint="Novas oportunidades aparecerão aqui quando empresas publicarem eventos." />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '78px minmax(0, 1fr)',
          gap: 11,
          alignItems: 'stretch',
          padding: 10,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.94)',
          border: '1px solid rgba(216,222,236,0.92)',
          boxShadow: '0 10px 28px rgba(85,96,130,0.06)',
        }}>
          <div style={{
            position: 'relative',
            minHeight: 92,
            borderRadius: 15,
            overflow: 'hidden',
            background: `linear-gradient(180deg, rgba(15,22,38,0.08), rgba(15,22,38,0.48)), url(${visualUrl(event.imageUrl, VISUAL_FALLBACKS.clinical)}) center/cover`,
          }}>
            <div style={{
              position: 'absolute',
              right: 7,
              top: 7,
              width: 42,
              height: 46,
              borderRadius: 13,
              background: 'rgba(255,255,255,0.94)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(15,22,38,0.12)',
            }}>
              <span style={{ fontSize: 8.5, color: 'var(--accent)', fontWeight: 700 }}>{monthShort(pickScheduleDate(event)) || 'DATA'}</span>
              <span style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 650, lineHeight: 1 }}>{dayNum(pickScheduleDate(event)) || '--'}</span>
            </div>
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Chip color="var(--accent)">{eventCountdown(event) || 'Evento'}</Chip>
                <Chip color="#1EA97C">{eventFormat(event)}</Chip>
              </div>
              <h3 style={{ marginTop: 7, fontSize: 15.5, lineHeight: 1.14, fontWeight: 650, color: 'var(--ink)' }}>{event.title}</h3>
              <p style={{ marginTop: 5, fontSize: 11.5, lineHeight: 1.35, color: 'var(--ink-2)' }}>
                {eventDateLabel(event)} · {locationText(event.location)}
              </p>
              <p style={{ marginTop: 4, fontSize: 10.8, color: 'var(--muted)' }}>
                {eventSeatText(event.maxParticipants, Math.max(0, event.maxParticipants - event.registeredCount))}
              </p>
            </div>
            <button type="button" onClick={onView} style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              minHeight: 35,
              padding: '8px 12px',
              borderRadius: 11,
              border: 'none',
              background: 'var(--accent-ink)',
              color: '#fff',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Ver detalhes
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function PendingConnections({ leads, onViewCompany }: { leads: Lead[]; onViewCompany: (company: string) => void }) {
  const { user, approveConnection } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function approve(leadId: string) {
    if (!user?.whatsapp) {
      setError('Cadastre seu WhatsApp profissional antes de aprovar conexões.');
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
    <section id="pending-connections" style={{ marginBottom: 14, scrollMarginTop: 16 }}>
      <SectionHeader title="Solicitações pendentes" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leads.slice(0, 3).map(lead => (
          <div key={lead.id} style={{
            padding: 12,
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(242,247,255,0.90))',
            border: '1px solid rgba(216,222,236,0.92)',
            boxShadow: '0 10px 24px rgba(85,96,130,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 650 }}>{lead.companyName}</span>
                  <Chip color="var(--accent)">{leadTypeLabel(lead)}</Chip>
                </div>
                <p style={{ marginTop: 5, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                  Quer falar sobre <b style={{ color: 'var(--ink)' }}>{lead.itemName || 'uma oportunidade'}</b>.
                </p>
              </div>
              <span style={{ flexShrink: 0, fontSize: 10.2, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {leadAgeLabel(lead.connectionRequestedAt || lead.createdAt)}
              </span>
            </div>
            {!user?.whatsapp && <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--danger)' }}>WhatsApp ainda não informado.</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 10 }}>
              <button type="button" disabled={!user?.whatsapp || busyId === lead.id} onClick={() => { void approve(lead.id); }} style={{
                minHeight: 40,
                padding: '8px 10px',
                borderRadius: 12,
                border: 'none',
                background: user?.whatsapp ? 'var(--accent)' : 'var(--chip)',
                color: user?.whatsapp ? '#fff' : 'var(--muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: user?.whatsapp && busyId !== lead.id ? 'pointer' : 'not-allowed',
              }}>
                {busyId === lead.id ? 'Aprovando...' : 'Aprovar'}
              </button>
              <button type="button" onClick={() => onViewCompany(lead.companyName)} style={{
                minHeight: 40,
                padding: '8px 10px',
                borderRadius: 12,
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.78)',
                color: 'var(--ink-2)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Ver perfil
              </button>
            </div>
            <button type="button" style={{ marginTop: 8, border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: 11.2, padding: 0, cursor: 'pointer' }}>
              Deixar para depois
            </button>
          </div>
        ))}
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
    </section>
  );
}

function RecommendedCard({
  user,
  company,
  product,
  event,
  onOpenCompany,
  onOpenProducts,
  onOpenEvents,
}: {
  user: User | null | undefined;
  company?: CompanyMatch;
  product?: Product;
  event?: Event;
  onOpenCompany: () => void;
  onOpenProducts: () => void;
  onOpenEvents: () => void;
}) {
  if (!company && !product && !event) {
    return (
      <section style={{ marginBottom: 14 }}>
        <SectionHeader title="Recomendado para você" />
        <Empty text="Nenhuma recomendação por enquanto." hint="Complete seu perfil para receber empresas, produtos e eventos compatíveis." />
      </section>
    );
  }

  const score = compatibilityScore(company, user);
  const visual = visualUrl(company?.products[0]?.imageUrl ?? company?.events[0]?.imageUrl ?? product?.imageUrl ?? event?.imageUrl, VISUAL_FALLBACKS.clinical);
  const title = company?.name ?? product?.name ?? event?.title ?? 'Oportunidade Tessy';
  const type = company ? 'Empresa' : product ? 'Produto' : 'Evento';
  const reason = company
    ? `Compatível com ${doctorProfileLabel(user).toLowerCase()} e com oportunidades comerciais ativas.`
    : product
      ? product.availableFor || 'Produto recomendado para avaliação médica.'
      : event
        ? `Evento com data próxima em ${locationText(event.location)}.`
        : 'Recomendação baseada no seu perfil.';

  return (
    <section style={{ marginBottom: 14 }}>
      <SectionHeader title="Recomendado para você" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '74px minmax(0, 1fr)',
        gap: 11,
        padding: 11,
        borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(246,249,255,0.90))',
        border: '1px solid rgba(216,222,236,0.92)',
        boxShadow: '0 10px 28px rgba(85,96,130,0.06)',
      }}>
        <div style={{
          minHeight: 96,
          borderRadius: 15,
          background: `linear-gradient(180deg, rgba(15,22,38,0.06), rgba(15,22,38,0.42)), url(${visual}) center/cover`,
          overflow: 'hidden',
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Mono style={{ fontSize: 8.5, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{type}</Mono>
            {company && <Chip color="#1EA97C">{score}% compatível</Chip>}
          </div>
          <h3 style={{ marginTop: 6, fontSize: 16, lineHeight: 1.14, fontWeight: 650, color: 'var(--ink)' }}>{title}</h3>
          <p style={{ marginTop: 5, fontSize: 11.8, lineHeight: 1.36, color: 'var(--ink-2)' }}>{reason}</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
            {company?.events[0]?.category && <Chip color="var(--accent)">{company.events[0].category}</Chip>}
            {company?.whatsapp && <Chip color="#25D366">representante</Chip>}
            {product?.category && <Chip color="var(--accent)">{product.category}</Chip>}
            {event && <Chip color="var(--accent)">{eventCountdown(event) || 'Evento'}</Chip>}
          </div>
          <button type="button" onClick={company ? onOpenCompany : product ? onOpenProducts : onOpenEvents} style={{
            marginTop: 10,
            minHeight: 38,
            padding: '8px 12px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--accent-ink)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            {company ? 'Conhecer empresa' : product ? 'Ver produto' : 'Ver evento'}
          </button>
        </div>
      </div>
    </section>
  );
}

function ProfileNudgeCard({ user, onUpdate }: { user: User | null | undefined; onUpdate: () => void }) {
  const hasWhats = Boolean(user?.whatsapp);
  const hasSpecialty = Boolean(user?.specialty?.trim());
  if (hasWhats && hasSpecialty) {
    return (
      <section style={{ marginBottom: 16 }}>
        <div style={{
          padding: 12,
          borderRadius: 16,
          background: 'rgba(30,169,124,0.08)',
          border: '1px solid rgba(30,169,124,0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--ink)' }}>Canal profissional ativo</div>
            <div style={{ marginTop: 2, fontSize: 11.2, color: 'var(--ink-2)' }}>{user?.whatsapp ? fmtPhone(user.whatsapp) : 'WhatsApp cadastrado'}</div>
          </div>
          <Chip color="#1EA97C">empresas aprovadas</Chip>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{
        padding: 12,
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(74,168,255,0.10), rgba(255,255,255,0.92))',
        border: '1px solid rgba(74,168,255,0.18)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>Melhore suas recomendações</div>
        <p style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {hasWhats ? 'Complete sua especialidade para receber matches melhores.' : 'Cadastre seu WhatsApp profissional para aprovar contatos comerciais.'}
        </p>
        <button type="button" onClick={onUpdate} style={{
          marginTop: 10,
          minHeight: 38,
          padding: '8px 12px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Completar dados
        </button>
      </div>
    </section>
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

/* ─── Connect view ─── */
function ConnectView({
  events,
  products,
  courses,
  locations,
  onOpenProducts,
  onOpenEvents,
}: {
  events: Event[];
  products: Product[];
  courses: Course[];
  locations: Location[];
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

  const companies = buildCompanyMatches(events, products, courses, locations);

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
      <Breadcrumb items={['início', 'representantes']} />
      <div style={{
        padding: '18px 16px',
        borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(245,130,32,0.12) 0%, rgba(30,169,124,0.10) 100%)',
        border: '1px solid rgba(245,130,32,0.16)',
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
                    {co.locations.length > 0 && <Chip color="#F58220">{co.locations.length} local{co.locations.length > 1 ? 'is' : ''}</Chip>}
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

              {co.locations.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '12px 12px',
                  borderRadius: 14,
                  background: 'rgba(245,130,32,0.06)',
                  border: '1px solid rgba(245,130,32,0.18)',
                }}>
                  <Mono style={{ display: 'block', fontSize: 9, color: '#F58220', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                    Onde encontrar
                  </Mono>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {co.locations.slice(0, 3).map(loc => {
                      const locWa = buildWhatsappLink(loc.whatsapp, `Olá ${loc.companyName}, sou médico no Tessy e gostaria de informações sobre o local "${loc.name}".`);
                      return (
                        <div key={loc.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>{loc.name}</div>
                            <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                              {locationTypeLabel(loc.type)} · {locationPlace(loc)}
                            </div>
                            {loc.address && (
                              <div style={{ marginTop: 1, fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>{loc.address}</div>
                            )}
                          </div>
                          {locWa && (
                            <a href={locWa} target="_blank" rel="noopener noreferrer" style={{
                              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                              padding: '6px 9px', borderRadius: 10, textDecoration: 'none',
                              background: 'rgba(37,211,102,0.12)', color: '#25D366',
                              border: '1px solid rgba(37,211,102,0.3)', fontSize: 11, fontWeight: 600,
                            }}>
                              <WaIcon size={12} /> Contato
                            </a>
                          )}
                        </div>
                      );
                    })}
                    {co.locations.length > 3 && (
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>+{co.locations.length - 3} outros locais</div>
                    )}
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
    <BannerCard
      tint1={tint1}
      tint2={tint2}
      month={monthShort(ev.date)}
      day={dayNum(ev.date)}
      format={ev.category || 'Evento'}
      imageUrl={visualUrl(ev.imageUrl, VISUAL_FALLBACKS.clinical)}
    >
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
      <div style={{
        height: 88,
        padding: 12,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: `linear-gradient(135deg, rgba(18,24,40,0.38), rgba(74,168,255,0.18)), url(${visualUrl(product.imageUrl)}) center/cover`,
      }}>
        <span style={{
          padding: '5px 9px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.84)',
          color: 'var(--ink)',
          fontSize: 10,
          fontWeight: 560,
          letterSpacing: '0.04em',
        }}>
          Produto recomendado
        </span>
      </div>
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
    <BannerCard
      tint1={tint1}
      tint2={tint2}
      month={displayDate ? monthShort(displayDate) : undefined}
      day={displayDate ? dayNum(displayDate) : undefined}
      format={bannerLabel}
      imageUrl={visualUrl(course.imageUrl, VISUAL_FALLBACKS.clinical)}
    >
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
