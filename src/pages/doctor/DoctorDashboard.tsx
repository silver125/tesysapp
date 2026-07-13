import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Layout, { type NavItem } from '../../components/Layout';
import { openProfileSettings, openHelp } from '../../lib/profileSettingsEvents';
import { doctorInterestList, sortByDoctorInterests } from '../../lib/doctorPreferences';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, VerifiedDot, Mono, BannerCard, Chip, ModalityBadge,
} from '../../components/ui';
import { categoryTint, companyInitials, companyTint } from '../../lib/uiHelpers';
import {
  buildRepresentativeProfiles,
  matchesRepresentativeRegion,
  representativeInitials,
  representativeDisplayName,
  representativeDisplayImageUrl,
  representativeCompanyBadgeUrl,
  representativeRegionFilters,
  representativeOfferSummary,
  type RepresentativeProfile,
} from '../../lib/representatives';
import { connectWithRepresentative } from '../../lib/commercialConnect';
import { buildHomeFeed, type HomeFeedItem } from '../../lib/homeFeed';
import { formatLeadError } from '../../lib/leadErrors';
import { getLevelProgress, getBadges, POINTS_PER_INTEREST, POINTS_PER_CONNECTION, countApprovedConnections } from '../../lib/gamification';
import { FilterBar, MarketGrid, MarketCard, PhotoBadge, Sheet } from '../../components/market';
import { fetchCompanyLogos } from '../../lib/companyBranding';
import CompanyAvatar from '../../components/CompanyAvatar';
import FirstVisitTip from '../../components/FirstVisitTip';
import InviteShareCard from '../../components/InviteShareCard';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { Event, Product, Course, Lead, Location, User, LeadIntent, LeadItemType } from '../../types';

type Tab = 'home' | 'products' | 'events' | 'representatives' | 'companies';
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

function includesQ(value: string | undefined | null, q: string) {
  return (value ?? '').toLowerCase().includes(q);
}

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
function IcoCompanies(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6">
      <path d="M4 17V4.5A1.5 1.5 0 015.5 3h9A1.5 1.5 0 0116 4.5V17" strokeLinejoin="round" />
      <path d="M7 7h2M11 7h2M7 10h2M11 10h2M8 17v-4h4v4" strokeLinecap="round" />
    </svg>
  );
}

function IcoRepresentatives(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-5 6-5s6 1.7 6 5" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home',             label: 'Início',          icon: IcoHome },
  { key: 'products',         label: 'Produtos',        icon: IcoBox },
  { key: 'events',           label: 'Eventos e workshops', icon: IcoCalendar },
  { key: 'representatives',  label: 'Representantes',  icon: IcoRepresentatives },
  { key: 'companies',        label: 'Empresas',        icon: IcoCompanies },
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

function modalityText(modality: Course['modality']) {
  const labels: Record<Course['modality'], string> = {
    online: 'Online',
    presencial: 'Presencial',
    hibrido: 'Híbrido',
  };
  return labels[modality] ?? modality;
}

function visualUrl(src?: string | null) {
  return src?.trim() || '';
}

function doctorGreeting(user: User | null | undefined) {
  const firstName = user?.name?.trim().split(/\s+/)[0];
  return firstName ? `Olá, ${firstName}` : 'Olá';
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
  return city ? `${specialty} • ${city}` : specialty;
}


export default function DoctorDashboard() {
  const { user, events, products, courses, leads, locations, representatives: registeredReps, refreshData } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [search, setSearch] = useState('');
  const [evFilter, setEvFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [openEvent, setOpenEvent] = useState<Event | null>(null);
  const [openCourse, setOpenCourse] = useState<Course | null>(null);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  // Refresh data every time the doctor switches tabs so new items from companies appear
  useEffect(() => {
    refreshData();
  }, [tab, refreshData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const ids = [...new Set([
      ...products.map(p => p.companyId),
      ...events.map(e => e.companyId),
      ...courses.map(c => c.companyId),
      ...locations.map(l => l.companyId),
      ...registeredReps.map(r => r.companyId),
    ].filter(Boolean))];
    if (ids.length === 0) {
      setCompanyLogos({});
      return;
    }
    let cancelled = false;
    void fetchCompanyLogos(ids).then(logos => {
      if (!cancelled) setCompanyLogos(logos);
    });
    return () => { cancelled = true; };
  }, [products, events, courses, locations, registeredReps]);

  const q = search.toLowerCase();
  const doctorInterests = doctorInterestList(user);
  const rankedProducts = sortByDoctorInterests(
    products,
    doctorInterests,
    p => [p.name, p.category, p.description, p.availableFor],
  );
  const upcomingEvents = events.filter(isUpcomingEvent);
  const homeProductPool = (() => {
    const recommended = rankedProducts.filter(p => matchesDoctorProfile(user, p.name, p.category, p.description, p.availableFor));
    if (recommended.length === 0) return rankedProducts;
    const seen = new Set(recommended.map(p => p.id));
    return [...recommended, ...rankedProducts.filter(p => !seen.has(p.id))];
  })();
  const filtEvents = events.filter(e => {
    const matchQ = !q || includesQ(e.title, q) || includesQ(e.companyName, q);
    const filter = evFilter.toLowerCase();
    const matchFilter = evFilter === 'all'
      || includesQ(e.category, filter)
      || includesQ(eventFormat(e), filter);
    return matchQ && matchFilter;
  });
  const filtProducts = rankedProducts.filter(p => {
    const matchQ = !q || includesQ(p.name, q) || includesQ(p.companyName, q);
    const matchCat = productFilter === 'all' || includesQ(p.category, productFilter);
    return matchQ && matchCat;
  });
  const homeEvents = upcomingEvents
    .filter(e => !q || includesQ(e.title, q) || includesQ(e.companyName, q));
  const homeWorkshops = courses.filter(c => !q || includesQ(c.title, q) || includesQ(c.companyName, q));
  const filtCourses = courses.filter(c => {
    const matchQ = !q || includesQ(c.title, q) || includesQ(c.companyName, q);
    const matchFilter = evFilter === 'all'
      || evFilter === 'workshop'
      || (evFilter === 'online' && c.modality === 'online');
    return matchQ && matchFilter;
  });
  const productChips = productCategoryChips(products);
  const representatives = sortByDoctorInterests(
    buildRepresentativeProfiles(events, products, courses, locations, user, registeredReps, companyLogos),
    doctorInterests,
    rep => [
      rep.companyName,
      rep.repLabel,
      rep.specialty,
      ...rep.products.map(p => p.name),
      ...rep.events.map(e => e.title),
      ...rep.events.map(e => e.category),
    ],
  );
  const regionChips = representativeRegionFilters(representatives);
  const filtRepresentatives = representatives.filter(rep => {
    const matchQ = !q || includesQ(rep.companyName, q) || includesQ(rep.repLabel, q) || includesQ(rep.specialty, q)
      || rep.events.some(e => includesQ(e.title, q) || includesQ(e.category, q));
    const matchRegion = matchesRepresentativeRegion(rep, regionFilter);
    return matchQ && matchRegion;
  });
  const filtCompanies = buildCompanyMatches(events, products, courses, locations).filter(co => {
    return !q || includesQ(co.name, q) || co.products.some(p => includesQ(p.name, q)) || co.events.some(e => includesQ(e.title, q));
  });
  const homeFeed = buildHomeFeed(homeProductPool, homeEvents, homeWorkshops, representatives);
  const marketplaceCounts = {
    products: products.length,
    events: events.length,
    workshops: courses.length,
    reps: representatives.length,
    companies: filtCompanies.length,
  };
  const platformEmpty = products.length === 0 && events.length === 0 && courses.length === 0;
  const homeQuiet = homeFeed.length === 0;

  const pendingConnections = leads.filter(lead => lead.connectionStatus === 'requested');

  function scrollToPendingConnections() {
    document.getElementById('pending-connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openTab(k: Tab, nextSearch = '') {
    setTab(k);
    setSearch(nextSearch);
  }

  function goTab(k: string) {
    openTab(k as Tab);
  }

  return (
    <Layout
      navItems={NAV_ITEMS}
      activeKey={tab}
      onNavChange={goTab}
      notificationCount={pendingConnections.length}
      onNotificationClick={scrollToPendingConnections}
    >

      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          <HomeGreeting user={user} />

          {user?.id && <FirstVisitTip userId={user.id} role="medico" />}

          <DoctorPointsBar
            points={user?.points ?? 0}
            connections={countApprovedConnections(leads)}
          />

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar produtos, eventos, empresas ou representantes"
          />

          {pendingConnections.length > 0 && (
            <PendingConnectionsInbox leads={pendingConnections} />
          )}

          {!user?.whatsapp && (
            <SlimProfileBanner onFix={openProfileSettings} />
          )}

          {!platformEmpty && (
            <HomeExploreNav counts={marketplaceCounts} onNavigate={openTab} />
          )}

          {homeFeed.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <SectionHeader
                title="Destaques"
                onSeeAll={() => openTab(homeFeed[0]?.kind === 'event' || homeFeed[0]?.kind === 'course' ? 'events' : 'products')}
              />
              <HomeCarousel>
                {homeFeed.map(item => (
                  <HomeFeedCard
                    key={homeFeedKey(item)}
                    item={item}
                    onOpenProduct={setOpenProduct}
                    onOpenEvent={setOpenEvent}
                    onOpenCourse={setOpenCourse}
                    onOpenRepresentatives={(name) => openTab('representatives', name)}
                  />
                ))}
              </HomeCarousel>
            </section>
          )}

          {homeQuiet && (
            platformEmpty ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Empty
                  text="A vitrine ainda está sendo montada"
                  hint="Empresas estão entrando na Tessy. Complete seu perfil para receber sugestões melhores quando novos anúncios chegarem."
                  actionLabel="Completar perfil"
                  onAction={openProfileSettings}
                />
                <InviteShareCard target="empresa" />
              </div>
            ) : (
              <Empty
                text="Nenhuma sugestão para seu perfil agora"
                hint="Explore Produtos, Eventos ou Representantes — ou ajuste seus interesses."
                actionLabel="Ajustar interesses"
                onAction={openProfileSettings}
              />
            )
          )}
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <MarketHead title="Eventos e workshops" count={events.length + courses.length} countWord="atividade" />
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar eventos ou workshops..." />
          <FilterBar
            chips={[['all','Todos'],['congresso','Congresso'],['workshop','Workshop'],['online','Online']]}
            active={evFilter} onChange={setEvFilter}
          />
          {filtEvents.length === 0 && filtCourses.length === 0
            ? <Empty text="Nenhum evento ou workshop disponível." hint="Novas oportunidades aparecerão aqui quando forem publicadas." />
            : (
              <MarketGrid>
                {filtEvents.map(e => <EventMarketCard key={e.id} ev={e} onOpen={() => setOpenEvent(e)} />)}
                {filtCourses.map(c => <CourseMarketCard key={c.id} course={c} onOpen={() => setOpenCourse(c)} />)}
              </MarketGrid>
            )
          }
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div>
          <MarketHead title="Produtos" subtitle="Toque para ver detalhes e falar com o representante." count={products.length} countWord="produto" />
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar produto, empresa ou representante..." />
          <FilterBar chips={productChips} active={productFilter} onChange={setProductFilter} />
          {filtProducts.length === 0
            ? <Empty
                text="Nenhum produto disponível ainda."
                hint="Empresas publicam novidades aqui em breve."
                actionLabel="Atualizar interesses"
                onAction={openProfileSettings}
              />
            : <MarketGrid>{filtProducts.map(p => <ProductMarketCard key={p.id} product={p} onOpen={() => setOpenProduct(p)} />)}</MarketGrid>
          }
        </div>
      )}

      {tab === 'representatives' && (
        <RepresentativesView
          representatives={filtRepresentatives}
          regionChips={regionChips}
          regionFilter={regionFilter}
          onRegionChange={setRegionFilter}
          search={search}
          onSearchChange={setSearch}
          doctorRegion={doctorCityLabel(user) || user?.crmState || 'sua região'}
        />
      )}

      {tab === 'companies' && (
        <CompaniesView
          companies={filtCompanies}
          companyLogos={companyLogos}
          search={search}
          onSearchChange={setSearch}
          onOpenProducts={company => openTab('products', company)}
          onOpenEvents={company => openTab('events', company)}
        />
      )}

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
      <div style={{ marginBottom: 10 }}>
      <h1 className="tessy-page-title" style={{ marginBottom: 4 }}>
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

function HomeGreeting({ user }: { user: User | null | undefined }) {
  return (
    <section style={{ marginBottom: 16, paddingTop: 2 }}>
      <h1 style={{ fontSize: 22, fontWeight: 650, lineHeight: 1.15, color: 'var(--accent-ink)', letterSpacing: -0.2 }}>
        {doctorGreeting(user)}
      </h1>
      <p style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)', lineHeight: 1.35 }}>
        {doctorMetaLine(user)}
      </p>
    </section>
  );
}

function DoctorPointsBar({
  points,
  connections,
}: {
  points: number;
  connections: number;
}) {
  const progress = getLevelProgress(points);
  const badges = getBadges(connections, points);
  const unlockedBadges = badges.filter(b => b.unlocked);

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        background: '#fff',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--accent-soft)',
            border: '1px solid rgba(245,130,32,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0,
          }}>
            {progress.level.index + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--accent-ink)' }}>
                Nível {progress.level.index + 1} · {progress.level.name}
              </div>
              <button
                type="button"
                onClick={openHelp}
                aria-label="Como funcionam os pontos"
                style={{
                  border: 'none',
                  background: 'rgba(74,168,255,0.10)',
                  color: 'var(--accent-ink)',
                  borderRadius: 8,
                  width: 26,
                  height: 26,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ?
              </button>
            </div>
            <div style={{ marginTop: 3, display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
              <span>{connections} {connections === 1 ? 'conexão aprovada' : 'conexões aprovadas'}</span>
              <span>{progress.points} pts</span>
            </div>
            <p style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.35, color: 'var(--muted)' }}>
              Ganhe pontos ao avisar interesse. Conexões aprovadas valem +{POINTS_PER_CONNECTION}.
            </p>
          </div>
        </div>
        {unlockedBadges.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {unlockedBadges.map(badge => (
              <span
                key={badge.id}
                title={badge.description}
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: 'rgba(245,130,32,0.08)',
                  border: '1px solid rgba(245,130,32,0.14)',
                  fontSize: 11,
                  color: 'var(--accent-ink)',
                }}
              >
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 10, height: 4, borderRadius: 999, background: 'var(--chip)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: 999,
            width: `${progress.percent}%`,
            background: 'var(--accent)',
          }} />
        </div>
      </div>
    </section>
  );
}

function HomeCarousel({ children }: { children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScroll();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    const observer = new ResizeObserver(updateScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      observer.disconnect();
    };
  }, [updateScroll, children]);

  function scrollByDir(dir: -1 | 1) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.82), behavior: 'smooth' });
  }

  const showControls = canScrollLeft || canScrollRight;

  return (
    <div className="tessy-home-carousel">
      {showControls && (
        <button
          type="button"
          className="tessy-home-carousel__btn tessy-home-carousel__btn--prev"
          aria-label="Anterior"
          disabled={!canScrollLeft}
          onClick={() => scrollByDir(-1)}
        >
          ‹
        </button>
      )}
      <div ref={railRef} className="tessy-home-rail">
        {children}
      </div>
      {showControls && (
        <button
          type="button"
          className="tessy-home-carousel__btn tessy-home-carousel__btn--next"
          aria-label="Próximo"
          disabled={!canScrollRight}
          onClick={() => scrollByDir(1)}
        >
          ›
        </button>
      )}
    </div>
  );
}

function HomeMediaColumn({
  imageUrl,
  fallbackCode,
  fallbackTint,
  topBadge,
  bottomBadge,
}: {
  imageUrl?: string;
  fallbackCode: string;
  fallbackTint: string;
  topBadge?: ReactNode;
  bottomBadge?: ReactNode;
}) {
  return (
    <div className="tessy-home-wide-card__media">
      {imageUrl ? (
        <div
          className="tessy-home-wide-card__media-fill"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="tessy-home-wide-card__media-fallback">
          <CompanyMark code={fallbackCode} tint={fallbackTint} size={56} radius={8} />
        </div>
      )}
      {topBadge}
      {bottomBadge}
    </div>
  );
}

function homeFeedKey(item: HomeFeedItem): string {
  switch (item.kind) {
    case 'product': return `product-${item.product.id}`;
    case 'event': return `event-${item.event.id}`;
    case 'course': return `course-${item.course.id}`;
    case 'rep': return `rep-${item.rep.id}`;
  }
}

function HomeFeedCard({
  item,
  onOpenProduct,
  onOpenEvent,
  onOpenCourse,
  onOpenRepresentatives,
}: {
  item: HomeFeedItem;
  onOpenProduct: (p: Product) => void;
  onOpenEvent: (e: Event) => void;
  onOpenCourse: (c: Course) => void;
  onOpenRepresentatives: (companyName: string) => void;
}) {
  if (item.kind === 'product') {
    return <HomeProductCard product={item.product} onOpen={() => onOpenProduct(item.product)} />;
  }
  if (item.kind === 'event') {
    return <HomeEventRow ev={item.event} onOpen={() => onOpenEvent(item.event)} />;
  }
  if (item.kind === 'course') {
    return <HomeCourseRow course={item.course} onOpen={() => onOpenCourse(item.course)} />;
  }
  return (
    <HomeRepCard
      rep={item.rep}
      onConnect={() => onOpenRepresentatives(item.rep.companyName)}
    />
  );
}

function HomeExploreNav({
  counts,
  onNavigate,
}: {
  counts: { products: number; events: number; workshops: number; reps: number; companies: number };
  onNavigate: (tab: Tab) => void;
}) {
  const items: { tab: Tab; label: string; count: number }[] = [
    { tab: 'products', label: 'Produtos', count: counts.products },
    { tab: 'events', label: 'Eventos', count: counts.events + counts.workshops },
    { tab: 'representatives', label: 'Representantes', count: counts.reps },
    { tab: 'companies', label: 'Empresas', count: counts.companies },
  ];

  return (
    <section style={{ marginBottom: 20 }}>
      <Mono style={{ display: 'block', marginBottom: 10, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Explorar marketplace
      </Mono>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        {items.map(entry => (
          <button
            key={entry.tab}
            type="button"
            onClick={() => onNavigate(entry.tab)}
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid var(--line)',
              background: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(85,96,130,0.04)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 620, color: 'var(--accent-ink)' }}>{entry.label}</div>
            <div style={{ marginTop: 3, fontSize: 11.5, color: 'var(--muted)' }}>
              {entry.count} {entry.count === 1 ? 'disponível' : 'disponíveis'}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function HomeCourseRow({ course, onOpen }: { course: Course; onOpen: () => void }) {
  const image = visualUrl(course.imageUrl);
  return (
    <article className="tessy-home-wide-card tessy-home-wide-card--action">
      <HomeMediaColumn
        imageUrl={image}
        fallbackCode={companyInitials(course.companyName)}
        fallbackTint={companyTint(course.companyName)}
        topBadge={<span className="tessy-home-wide-card__badge tessy-home-wide-card__badge--top">Workshop</span>}
      />
      <div className="tessy-home-wide-card__body tessy-home-wide-card__body--stacked">
        <div className="tessy-home-wide-card__copy">
          <div className="tessy-home-card__label">{course.companyName}</div>
          <div className="tessy-home-card__title">{course.title}</div>
        </div>
        <div className="tessy-home-wide-card__footer">
          <button type="button" className="tessy-home-btn-inline" onClick={onOpen}>
            Ver workshop
          </button>
        </div>
      </div>
    </article>
  );
}

function HomeRepCard({ rep, onConnect }: { rep: RepresentativeProfile; onConnect: () => void }) {
  const { addLead } = useAuth();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const image = visualUrl(representativeDisplayImageUrl(rep));
  const displayName = representativeDisplayName(rep);
  const showCompany = rep.companyName.trim()
    && rep.companyName.trim().toLowerCase() !== displayName.trim().toLowerCase();

  async function handleConnect() {
    if (busy) return;
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      const result = await connectWithRepresentative(rep.companyId, rep.companyName, rep.whatsapp, addLead);
      setFeedback(result.message);
      if (!result.whatsappOpened) onConnect();
    } catch (err) {
      setError(formatLeadError(err instanceof Error ? err.message : ''));
      onConnect();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="tessy-home-wide-card tessy-home-wide-card--action">
      <HomeMediaColumn
        imageUrl={image}
        fallbackCode={representativeInitials(displayName)}
        fallbackTint={companyTint(rep.companyName)}
        topBadge={rep.specialty ? (
          <span className="tessy-home-wide-card__badge tessy-home-wide-card__badge--top">{rep.specialty}</span>
        ) : undefined}
      />
      <div className="tessy-home-wide-card__body tessy-home-wide-card__body--stacked">
        <div className="tessy-home-wide-card__copy">
          <div className="tessy-home-card__label">Representante Comercial</div>
          <div className="tessy-home-card__title">{displayName}</div>
          {showCompany && <div className="tessy-home-card__meta">{rep.companyName}</div>}
          {representativeOfferSummary(rep) && (
            <div className="tessy-home-card__info">{representativeOfferSummary(rep)}</div>
          )}
          {rep.regionLabel && <div className="tessy-home-card__info">{rep.regionLabel}</div>}
        </div>
        <div className="tessy-home-wide-card__footer">
          <button type="button" className="tessy-home-btn-inline" onClick={() => { void handleConnect(); }} disabled={busy}>
            {busy ? 'Enviando…' : feedback ? 'Interesse enviado ✓' : 'Avisar interesse'}
          </button>
        </div>
        {feedback && !error && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--success)', lineHeight: 1.35 }}>{feedback}</div>
        )}
        {error && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', lineHeight: 1.35 }}>{error}</div>
        )}
      </div>
    </article>
  );
}

function HomeProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const image = visualUrl(product.imageUrl);

  return (
    <article className="tessy-home-wide-card tessy-home-wide-card--action">
      <HomeMediaColumn
        imageUrl={image}
        fallbackCode={companyInitials(product.companyName)}
        fallbackTint={companyTint(product.companyName)}
        topBadge={product.category ? (
          <span className="tessy-home-wide-card__badge tessy-home-wide-card__badge--top">{product.category}</span>
        ) : undefined}
      />
      <div className="tessy-home-wide-card__body tessy-home-wide-card__body--stacked">
        <div className="tessy-home-wide-card__copy">
          <div className="tessy-home-card__title">{product.name}</div>
          <div className="tessy-home-card__meta">{product.companyName}</div>
        </div>
        <div className="tessy-home-wide-card__footer">
          <button type="button" className="tessy-home-btn-inline" onClick={onOpen}>
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}

function AvatarBubble({ photoUrl, initials, tint, size = 52 }: { photoUrl?: string; initials: string; tint: string; size?: number }) {
  if (photoUrl) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `url(${photoUrl}) center/cover`,
        border: '2px solid #fff',
        boxShadow: '0 6px 16px rgba(80,90,120,0.12)',
        flexShrink: 0,
      }} />
    );
  }
  return <CompanyMark code={initials} tint={tint} size={size} radius={999} />;
}

function RepAvatar({ rep, size = 52 }: { rep: RepresentativeProfile; size?: number }) {
  const photo = representativeDisplayImageUrl(rep);
  const badge = representativeCompanyBadgeUrl(rep);
  const radius = size >= 56 ? 18 : 999;
  const displayName = representativeDisplayName(rep);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {photo ? (
        <div style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: `url(${photo}) center/cover`,
          border: '1px solid rgba(216,222,236,0.92)',
          boxShadow: '0 6px 16px rgba(80,90,120,0.1)',
        }} />
      ) : (
        <AvatarBubble
          initials={representativeInitials(displayName)}
          tint={companyTint(rep.companyName)}
          size={size}
        />
      )}
      {badge && (
        <div style={{
          position: 'absolute',
          right: -4,
          bottom: -4,
          width: Math.round(size * 0.42),
          height: Math.round(size * 0.42),
          borderRadius: 8,
          border: '2px solid #fff',
          background: `url(${badge}) center/cover`,
          boxShadow: '0 4px 10px rgba(80,90,120,0.12)',
        }} />
      )}
    </div>
  );
}

function HomeEventRow({ ev, onOpen }: { ev: Event; onOpen: () => void }) {
  const countdown = eventCountdown(ev);
  const dateBadge = `${dayNum(ev.date)} ${monthShort(ev.date)}`.trim();
  const image = visualUrl(ev.imageUrl);

  return (
    <button type="button" onClick={onOpen} className="tessy-home-wide-card" style={{ cursor: 'pointer', padding: 0 }}>
      <HomeMediaColumn
        imageUrl={image}
        fallbackCode={companyInitials(ev.companyName)}
        fallbackTint={companyTint(ev.companyName)}
        topBadge={<span className="tessy-home-wide-card__badge tessy-home-wide-card__badge--top">{eventFormat(ev)}</span>}
        bottomBadge={dateBadge ? (
          <span className="tessy-home-wide-card__badge tessy-home-wide-card__badge--bottom">{dateBadge}</span>
        ) : undefined}
      />
      <div className="tessy-home-wide-card__body">
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
          {ev.category || 'Evento'}
        </div>
        <div className="tessy-home-card__title" style={{ marginTop: 5 }}>{ev.title}</div>
        <div className="tessy-home-card__meta" style={{ marginTop: 6 }}>{locationText(ev.location)}</div>
      </div>
      <div className="tessy-home-wide-card__aside">
        {countdown && (
          <span style={{
            padding: '5px 8px',
            borderRadius: 6,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {countdown}
          </span>
        )}
        <span style={{ color: 'var(--muted)', fontSize: 20, lineHeight: 1 }} aria-hidden>›</span>
      </div>
    </button>
  );
}

function PendingConnectionsInbox({ leads }: { leads: Lead[] }) {
  return (
    <section id="pending-connections" style={{ marginBottom: 14, scrollMarginTop: 16 }}>
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 650, color: 'var(--accent-ink)' }}>
        {leads.length} {leads.length === 1 ? 'conexão aguardando sua aprovação' : 'conexões aguardando sua aprovação'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leads.map(lead => (
          <PendingInboxBanner key={lead.id} lead={lead} total={1} onSeeAll={() => undefined} />
        ))}
      </div>
    </section>
  );
}

function PendingInboxBanner({
  lead,
  total,
  onSeeAll,
}: {
  lead: Lead;
  total: number;
  onSeeAll: () => void;
}) {
  const { user, approveConnection } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function approveNow() {
    if (!user?.whatsapp) {
      openProfileSettings();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await approveConnection(lead.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="pending-connections" style={{ marginBottom: 14, scrollMarginTop: 16 }}>
      <div style={{
        padding: 14,
        borderRadius: 18,
        background: 'linear-gradient(135deg, #F58220 0%, #FF9A4D 100%)',
        color: '#fff',
        boxShadow: '0 14px 34px rgba(245,130,32,0.28)',
      }}>
        <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Ação rápida
        </Mono>
        <div style={{ marginTop: 6, fontSize: 16, fontWeight: 620, lineHeight: 1.2 }}>
          {lead.companyName} quer falar com você
        </div>
        <p style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.35, color: 'rgba(255,255,255,0.92)' }}>
          Sobre: {lead.itemName || 'oportunidade comercial'}. Ao aprovar, a empresa poderá falar com você no WhatsApp.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => { void approveNow(); }}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 12,
              border: 'none',
              background: '#fff',
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 650,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.75 : 1,
            }}
          >
            {busy ? 'Aprovando…' : user?.whatsapp ? 'Aprovar e liberar WhatsApp' : 'Cadastrar WhatsApp'}
          </button>
          {total > 1 && onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              style={{
                minHeight: 42,
                padding: '0 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              +{total - 1}
            </button>
          )}
        </div>
        {error && <p style={{ marginTop: 8, fontSize: 11.5, color: '#fff' }}>{error}</p>}
      </div>
    </section>
  );
}

function SlimProfileBanner({ onFix }: { onFix: () => void }) {
  return (
    <button
      type="button"
      onClick={onFix}
      style={{
        width: '100%',
        marginBottom: 14,
        padding: '11px 12px',
        borderRadius: 14,
        border: '1px solid rgba(245,130,32,0.22)',
        background: 'rgba(245,130,32,0.08)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--accent-ink)' }}>Cadastre seu WhatsApp</div>
      <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--ink-2)' }}>Necessário para aprovar contatos comerciais em 1 toque.</div>
    </button>
  );
}

/* ─── Cards compactos de vitrine ─── */
function ProductMarketCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const hasPrice = /^r\$/i.test(product.price?.trim() ?? '');
  return (
    <MarketCard
      image={visualUrl(product.imageUrl)}
      topLeft={<PhotoBadge color="#1EA97C">Produto</PhotoBadge>}
      highlight={hasPrice ? product.price : undefined}
      title={product.name}
      subtitle={`${product.companyName} • ${product.category}`}
      onClick={onOpen}
    />
  );
}

function EventMarketCard({ ev, onOpen }: { ev: Event; onOpen: () => void }) {
  const countdown = eventCountdown(ev);
  const dateBadge = `${dayNum(ev.date)} ${monthShort(ev.date)}`.trim();
  return (
    <MarketCard
      image={visualUrl(ev.imageUrl)}
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
  const displayDate = courseDisplayDate(course);
  const dateBadge = displayDate ? `${dayNum(displayDate)} ${monthShort(displayDate)}`.trim() : '';
  const countdown = displayDate ? eventCountdown({ date: displayDate, time: course.time }) : '';
  return (
    <MarketCard
      image={visualUrl(course.imageUrl)}
      topLeft={dateBadge ? <PhotoBadge color="#F58220">{dateBadge}</PhotoBadge> : <PhotoBadge color="#F58220">Workshop</PhotoBadge>}
      topRight={<PhotoBadge solid={false}>{modalityText(course.modality)}</PhotoBadge>}
      title={course.title}
      subtitle={`${course.companyName} • ${course.category}`}
      tag={countdown ? <Chip color="#F58220">{countdown}</Chip> : <Chip color="#F58220">Workshop</Chip>}
      onClick={onOpen}
    />
  );
}


/* ─── Representatives view ─── */
function RepresentativesView({
  representatives,
  regionChips,
  regionFilter,
  onRegionChange,
  search,
  onSearchChange,
  doctorRegion,
}: {
  representatives: RepresentativeProfile[];
  regionChips: [string, string][];
  regionFilter: string;
  onRegionChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  doctorRegion: string;
}) {
  const { addLead } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  async function connectRep(rep: RepresentativeProfile) {
    if (busyId) return;
    setBusyId(rep.id);
    setError('');
    setSuccessId(null);
    setSuccessMsg('');
    try {
      const result = await connectWithRepresentative(rep.companyId, rep.companyName, rep.whatsapp, addLead);
      setSuccessId(rep.id);
      setSuccessMsg(result.message);
    } catch (err) {
      setError(formatLeadError(err instanceof Error ? err.message : ''));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <MarketHead title="Representantes" subtitle={`Encontre representantes por região · ${doctorRegion}`} count={representatives.length} countWord="representante" />
      <SearchBar value={search} onChange={onSearchChange} placeholder="Buscar representante, empresa ou especialidade..." />
      <FilterBar chips={regionChips} active={regionFilter} onChange={onRegionChange} />
      {error && (
        <div style={{
          marginBottom: 12,
          padding: '10px 12px',
          borderRadius: 12,
          background: 'rgba(242,92,84,0.08)',
          border: '1px solid rgba(242,92,84,0.18)',
          color: '#F25C54',
          fontSize: 12,
          lineHeight: 1.4,
        }}>
          {error}
        </div>
      )}
      {representatives.length === 0 ? (
        <Empty text="Nenhum representante na sua região ainda." hint="Empresas com eventos, produtos ou representantes cadastrados aparecem aqui." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {representatives.map(rep => (
            <article key={rep.id} style={{
              padding: 16,
              borderRadius: 20,
              background: '#fff',
              border: '1px solid rgba(216,222,236,0.92)',
              boxShadow: '0 10px 26px rgba(85,96,130,0.05)',
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <RepAvatar rep={rep} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Mono style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Representante Comercial</Mono>
                  <div style={{ marginTop: 4, fontSize: 16, fontWeight: 620, color: 'var(--ink)' }}>{representativeDisplayName(rep)}</div>
                  <div style={{ marginTop: 2, fontSize: 12.5, color: 'var(--muted)' }}>{rep.companyName}</div>
                  {representativeOfferSummary(rep) && (
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                      {representativeOfferSummary(rep)}
                    </div>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Chip color="#B9C1EA">{rep.specialty}</Chip>
                    {rep.regionLabel && <Chip color="#F58220">{rep.regionLabel}</Chip>}
                  </div>
                </div>
              </div>
              <button type="button" disabled={busyId === rep.id} onClick={() => { void connectRep(rep); }} style={{
                marginTop: 14,
                width: '100%',
                padding: '11px 12px',
                borderRadius: 12,
                border: '1.5px solid var(--accent)',
                background: '#fff',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 650,
                cursor: busyId === rep.id ? 'not-allowed' : 'pointer',
              }}>
                {busyId === rep.id ? 'Enviando...' : successId === rep.id ? 'Interesse enviado ✓' : 'Avisar interesse'}
              </button>
              {successId === rep.id && successMsg && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: '#1EA97C', lineHeight: 1.35 }}>{successMsg}</div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Companies view ─── */
function CompaniesView({
  companies,
  companyLogos,
  search,
  onSearchChange,
  onOpenProducts,
  onOpenEvents,
}: {
  companies: CompanyMatch[];
  companyLogos: Record<string, string>;
  search: string;
  onSearchChange: (value: string) => void;
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
      <MarketHead title="Empresas" subtitle="Perfis comerciais e vitrine completa." count={companies.length} countWord="empresa" />
      <SearchBar value={search} onChange={onSearchChange} placeholder="Buscar empresa, produto ou evento..." />
      {companies.length === 0 ? (
        <Empty text="Nenhuma empresa encontrada." hint="Complete seu perfil para melhorar as sugestões." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {companies.map(co => (
              <article key={co.id} style={{
                padding: 16,
                borderRadius: 20,
                background: '#fff',
                border: '1px solid rgba(216,222,236,0.92)',
                boxShadow: '0 10px 26px rgba(85,96,130,0.05)',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <CompanyAvatar name={co.name} avatarUrl={companyLogos[co.id]} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 620, color: 'var(--ink)' }}>{co.name}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {co.products.length > 0 && <Chip color="#1EA97C">{co.products.length} produto{co.products.length > 1 ? 's' : ''}</Chip>}
                      {co.events.length > 0 && <Chip color="var(--accent)">{co.events.length} evento{co.events.length > 1 ? 's' : ''}</Chip>}
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleSaved(co.id)} style={{
                    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18,
                    color: saved.has(co.id) ? 'var(--accent)' : 'var(--muted)',
                  }}>{saved.has(co.id) ? '★' : '☆'}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  <button type="button" onClick={() => onOpenProducts(co.name)} style={companyMiniBtn}>Produtos</button>
                  <button type="button" onClick={() => onOpenEvents(co.name)} style={companyMiniBtn}>Eventos</button>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}

const companyMiniBtn: React.CSSProperties = {
  padding: '10px 8px',
  borderRadius: 12,
  border: '1px solid rgba(216,222,236,0.92)',
  background: '#fff',
  color: 'var(--accent)',
  fontSize: 12.5,
  fontWeight: 650,
  cursor: 'pointer',
};


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
  const code = companyInitials(ev.companyName);

  async function handleInterest() {
    if ((full && !registered) || busy) return;
    setBusy(true);
    setErr('');
    try {
      if (registered) return;
      const result = await addLead({
        companyId: ev.companyId,
        companyName: ev.companyName,
        itemType: 'event',
        itemId: ev.id,
        itemName: ev.title,
        intent: 'event_interest',
        message: `Médico demonstrou interesse no evento ${ev.title}.`,
      });
      try {
        await registerInterest(ev.id);
      } catch (countErr) {
        console.warn('Interesse registrado, mas a contagem de vagas não foi atualizada.', countErr);
      }
      if (result.pointsAwarded > 0) {
        setErr('');
      }
    } catch (e) {
      setErr(formatLeadError(e instanceof Error ? e.message : ''));
    } finally {
      setBusy(false);
    }
  }

  const btnLabel = busy ? '...' : registered ? 'Interesse enviado' : full ? 'Esgotado' : `Avisar empresa (+${POINTS_PER_INTEREST} pts)`;
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
      imageUrl={visualUrl(ev.imageUrl)}
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

      <div style={{ marginTop: 14 }}>
        <button
          onClick={handleInterest}
          disabled={(full && !registered) || busy || registered}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 12, border: btnBorder,
            background: btnBg, color: btnColor,
            fontSize: 13, fontWeight: 560, cursor: btnCursor,
            transition: 'all 0.2s',
          }}
        >
          {btnLabel}
        </button>
      </div>
    </BannerCard>
  );
}

/* ─── ProductCard ─── */
function ProductCard({ product }: { product: Product }) {
  const { addLead, leads } = useAuth();
  const [leadSent, setLeadSent] = useState(false);
  const [tint1] = categoryTint(product.category);
  const code = companyInitials(product.companyName);
  const interestSent = leadSent || hasLeadInterest(leads, 'product', product.id, 'sample_request');

  const [leadError, setLeadError] = useState('');

  async function sendProductInterest() {
    if (interestSent) return;
    setLeadError('');
    setLeadSent(true);
    try {
      const result = await addLead({
        companyId: product.companyId,
        companyName: product.companyName,
        itemType: 'product',
        itemId: product.id,
        itemName: product.name,
        intent: 'sample_request',
        message: 'Médico pediu amostra, material científico e condições comerciais.',
      });
      if (result.pointsAwarded > 0) {
        setLeadError('');
      }
    } catch (e) {
      setLeadSent(false);
      setLeadError(e instanceof Error ? e.message : 'Erro ao registrar interesse.');
    }
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
        background: visualUrl(product.imageUrl)
          ? `linear-gradient(135deg, rgba(18,24,40,0.38), rgba(74,168,255,0.18)), url(${visualUrl(product.imageUrl)}) center/cover`
          : 'linear-gradient(135deg, rgba(245,130,32,0.16), rgba(185,193,234,0.24))',
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

        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            disabled={interestSent}
            onClick={() => { void sendProductInterest(); }}
            style={{
              width: '100%',
              padding: '13px 12px', borderRadius: 12, border: 'none',
              background: interestSent ? 'rgba(30,169,124,0.10)' : 'var(--accent)',
              color: interestSent ? '#1EA97C' : '#fff',
              fontSize: 14, fontWeight: 650,
              cursor: interestSent ? 'default' : 'pointer',
            }}>
            {interestSent ? 'Interesse enviado' : `Avisar empresa (+${POINTS_PER_INTEREST} pts)`}
          </button>
          <p style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.35, color: 'var(--muted)' }}>
            A empresa recebe seu interesse e pode pedir permissão para WhatsApp.
          </p>
        </div>
        {leadError && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#F25C54', lineHeight: 1.35 }}>{leadError}</div>
        )}
      </div>
    </div>
  );
}

/* ─── CourseCard (full) ─── */
function CourseCard({ course }: { course: Course }) {
  const { addLead, leads } = useAuth();
  const [tint1, tint2] = categoryTint(course.category);
  const [sent, setSent] = useState(false);
  const code = companyInitials(course.companyName);
  const displayDate = courseDisplayDate(course);
  const schedule = { date: displayDate, time: course.time };
  const dateLabel = displayDate ? eventDateLabel(schedule) : 'Data a confirmar';
  const countdown = displayDate ? eventCountdown(schedule) : '';
  const placeLabel = course.location?.trim() || (course.modality === 'online' ? 'Online' : 'Local a confirmar');
  const formatLabel = modalityText(course.modality);
  const bannerLabel = course.category === 'Outros' ? 'CAPACITAÇÃO' : course.category;
  const interestSent = sent || hasLeadInterest(leads, 'course', course.id, 'course_interest');

  const [leadError, setLeadError] = useState('');

  async function sendCourseInterest() {
    if (interestSent) return;
    setLeadError('');
    setSent(true);
    try {
      await addLead({
        companyId: course.companyId,
        companyName: course.companyName,
        itemType: 'course',
        itemId: course.id,
        itemName: course.title,
        intent: 'course_interest',
        message: `Médico demonstrou interesse em ${course.title}.`,
      });
    } catch (e) {
      setSent(false);
      setLeadError(e instanceof Error ? e.message : 'Erro ao registrar interesse.');
    }
  }

  return (
    <BannerCard
      tint1={tint1}
      tint2={tint2}
      month={displayDate ? monthShort(displayDate) : undefined}
      day={displayDate ? dayNum(displayDate) : undefined}
      format={bannerLabel}
      imageUrl={visualUrl(course.imageUrl)}
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
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          disabled={interestSent}
          onClick={() => {
            void sendCourseInterest();
          }}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 12, border: 'none',
            background: interestSent
              ? 'rgba(30,169,124,0.10)'
              : 'linear-gradient(135deg, var(--accent-ink) 0%, var(--accent) 100%)',
            color: interestSent ? '#1EA97C' : '#fff',
            fontSize: 13, fontWeight: 560,
            cursor: interestSent ? 'not-allowed' : 'pointer',
          }}>
          {interestSent ? 'Interesse enviado' : `Avisar empresa (+${POINTS_PER_INTEREST} pts)`}
        </button>
        {leadError && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#F25C54', lineHeight: 1.35, textAlign: 'center' }}>{leadError}</div>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── Shared ─── */
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 17, fontWeight: 650, color: 'var(--accent-ink)' }}>{title}</span>
      {onSeeAll && (
        <button type="button" className="tessy-section-link" onClick={onSeeAll}>
          Ver todas
        </button>
      )}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
        width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="5.5"/><path d="M11 11l3.5 3.5" strokeLinecap="round"/>
      </svg>
      <input
        type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
          borderRadius: 'var(--r-md)', background: '#fff', border: '1px solid var(--line)',
          color: 'var(--accent-ink)', fontSize: 14, outline: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--line)'; }}
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
