import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, VerifiedDot, Mono, BannerCard, RowCard, Chip, ModalityBadge,
  WaIcon,
} from '../../components/ui';
import { buildWhatsappLink, categoryTint, companyTint } from '../../lib/uiHelpers';
import type { Event, Product, Course } from '../../types';

type Tab = 'home' | 'events' | 'products' | 'courses' | 'connect';

function IcoHome(a: boolean) {
  const c = a ? '#2E7BFF' : '#6F7A90';
  return <svg width="20" height="19" viewBox="0 0 20 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M2 9l8-7 8 7v9H13v-5H7v5H2z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoCalendar(a: boolean) {
  const c = a ? '#2E7BFF' : '#6F7A90';
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><rect x="1.5" y="3.5" width="16" height="14" rx="2"/><path d="M13.5 2v3M5.5 2v3M1.5 8.5h16" strokeLinecap="round"/></svg>;
}
function IcoBox(a: boolean) {
  const c = a ? '#2E7BFF' : '#6F7A90';
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6"><path d="M17.5 13.5V6.5a1.5 1.5 0 00-.8-1.3l-6-3.3a1.5 1.5 0 00-1.4 0l-6 3.3A1.5 1.5 0 002.5 6.5v7a1.5 1.5 0 00.8 1.3l6 3.3a1.5 1.5 0 001.4 0l6-3.3a1.5 1.5 0 00.8-1.3z"/><path d="M2.8 5.8L10 10l7.2-4.2M10 18V10" strokeLinecap="round"/></svg>;
}
function IcoBook(a: boolean) {
  const c = a ? '#2E7BFF' : '#6F7A90';
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M3.5 16A2 2 0 015.5 14H17"/><path d="M5.5 1H17v17H5.5A2 2 0 013.5 16V3a2 2 0 012-2z"/></svg>;
}
function IcoBigConnect() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="26" fill="#2E7BFF"/>
      <path d="M26 14v24M14 26h24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Início',   icon: IcoHome },
  { key: 'events',   label: 'Eventos',  icon: IcoCalendar },
  { key: 'connect',  label: '',         icon: () => <IcoBigConnect />, big: true },
  { key: 'products', label: 'Produtos', icon: IcoBox },
  { key: 'courses',  label: 'Cursos',   icon: IcoBook },
];

function monthShort(d: string) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
}
function dayNum(d: string) { return d ? d.split('-')[2] : ''; }

export default function DoctorDashboard() {
  const { user, events, products, courses, refreshData } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [search, setSearch] = useState('');
  const [evFilter, setEvFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Refresh data every time the doctor switches tabs so new items from companies appear
  useEffect(() => {
    refreshData();
  }, [tab, refreshData]);

  const q = search.toLowerCase();
  const filtEvents   = events.filter(e => !q || e.title.toLowerCase().includes(q) || e.companyName.toLowerCase().includes(q));
  const filtProducts = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q));
  const filtCourses  = courses.filter(c => {
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q);
    const matchCat = courseFilter === 'all' || c.category.toLowerCase() === courseFilter.toLowerCase();
    return matchQ && matchCat;
  });

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace('.', '').toUpperCase();

  const firstNameGreet = user?.name?.split(' ')[0] ?? 'Doutor';

  function goTab(k: string) { setTab(k as Tab); setSearch(''); }

  return (
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={goTab}>

      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <Mono style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {today}
            </Mono>
            <h1 style={{ marginTop: 10, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Olá, {firstNameGreet}<span style={{ color: '#2E7BFF' }}>.</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
              <b style={{ color: 'var(--ink)' }}>{events.length}</b> eventos disponíveis para você esta semana.
            </p>
          </div>

          {/* Stats chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatChip label="Eventos" value={events.length} onClick={() => setTab('events')} />
            <StatChip label="Produtos" value={products.length} onClick={() => setTab('products')} />
            <StatChip label="Cursos" value={courses.length} onClick={() => setTab('courses')} />
          </div>

          {/* Featured event */}
          {events.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Em destaque" onSeeAll={() => setTab('events')} />
              <EventCard ev={events[0]} />
            </div>
          )}

          {/* For you — compact rows */}
          {events.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Mais eventos" onSeeAll={() => setTab('events')} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {events.slice(1, 4).map(e => <EventRow key={e.id} ev={e} />)}
              </div>
            </div>
          )}

          {/* Courses highlight */}
          {courses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Cursos para professores" onSeeAll={() => setTab('courses')} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {courses.slice(0, 2).map(c => <CourseRow key={c.id} course={c} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Eventos<span style={{ color: '#2E7BFF' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            <b style={{ color: '#2E7BFF' }}>{events.length}</b> eventos disponíveis.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar eventos..." />
          <FilterChips
            tabs={[['all','TODOS'],['congresso','CONGRESSO'],['workshop','WORKSHOP'],['online','ONLINE']]}
            active={evFilter} onChange={setEvFilter}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtEvents.length === 0
              ? <Empty text="Nenhum evento encontrado." />
              : filtEvents.map(e => <EventCard key={e.id} ev={e} />)
            }
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Parcerias com produtos<span style={{ color: '#2E7BFF' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            Conecte-se com startups e representantes que buscam médicos para apresentar produtos nas redes.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar produtos..." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtProducts.length === 0
              ? <Empty text="Nenhum produto encontrado." />
              : filtProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Cursos<span style={{ color: '#2E7BFF' }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            Para médicos professores e especialistas.
          </p>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar cursos..." />
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
              ? <Empty text="Nenhum curso encontrado." />
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
          onOpenProducts={company => { setTab('products'); setSearch(company); }}
          onOpenEvents={company => { setTab('events'); setSearch(company); }}
        />
      )}
    </Layout>
  );
}

/* ─── Connect view ─── */
type CompanyMatch = {
  id: string;
  name: string;
  whatsapp?: string;
  products: Product[];
  events: Event[];
  courses: Course[];
};

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

  const companyMap = new Map<string, CompanyMatch>();
  const ensureCompany = (id: string, name: string, whatsapp?: string) => {
    const ex = companyMap.get(id) ?? { id, name, whatsapp, products: [], events: [], courses: [] };
    companyMap.set(id, { ...ex, whatsapp: ex.whatsapp ?? whatsapp });
    return companyMap.get(id)!;
  };

  events.forEach(e => ensureCompany(e.companyId, e.companyName, e.companyWhatsapp).events.push(e));
  products.forEach(p => ensureCompany(p.companyId, p.companyName, p.companyWhatsapp).products.push(p));
  courses.forEach(c => ensureCompany(c.companyId, c.companyName, c.companyWhatsapp).courses.push(c));

  const companies = [...companyMap.values()].sort((a, b) =>
    (b.products.length * 3 + b.events.length * 2 + b.courses.length) -
    (a.products.length * 3 + a.events.length * 2 + a.courses.length),
  );

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
        background: 'linear-gradient(135deg, rgba(46,123,255,0.12) 0%, rgba(30,169,124,0.10) 100%)',
        border: '1px solid rgba(46,123,255,0.16)',
        marginBottom: 18,
      }}>
        <Mono style={{ fontSize: 10, color: '#2E7BFF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Ponte médico-empresa
        </Mono>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 8 }}>
          Comunidade prática<span style={{ color: '#2E7BFF' }}>.</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.5 }}>
          Encontre empresas com produtos, eventos e treinamentos relevantes. Salve contato ou fale direto com o representante.
        </p>
      </div>

      {companies.length === 0 && <Empty text="Nenhuma empresa publicada ainda." />}

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
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{co.name}</span>
                    <VerifiedDot />
                    {co.whatsapp && <Chip color="#25D366">WhatsApp direto</Chip>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {co.products.length > 0 && <Chip color="#1EA97C">{co.products.length} produto{co.products.length > 1 ? 's' : ''}</Chip>}
                    {co.events.length > 0 && <Chip color="#2E7BFF">{co.events.length} evento{co.events.length > 1 ? 's' : ''}</Chip>}
                    {co.courses.length > 0 && <Chip color="#5F2C82">{co.courses.length} treinamento{co.courses.length > 1 ? 's' : ''}</Chip>}
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
                    {topProduct?.name ?? topEvent?.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 5, lineHeight: 1.45 }}>
                    {topProduct
                      ? topProduct.availableFor || topProduct.description
                      : `${topEvent?.category} · ${topEvent?.location} · ${topEvent?.time}`}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '11px 8px', borderRadius: 12,
                    background: 'rgba(37,211,102,0.12)', color: '#25D366',
                    border: '1px solid rgba(37,211,102,0.32)',
                    textDecoration: 'none', fontWeight: 700, fontSize: 13,
                  }}>
                    <WaIcon size={15} /> WhatsApp
                  </a>
                )}
                <button onClick={() => toggleSaved(co.id)} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: isSaved ? 'rgba(46,123,255,0.10)' : 'var(--chip)',
                  color: isSaved ? '#2E7BFF' : 'var(--ink-2)',
                  border: `1px solid ${isSaved ? 'rgba(46,123,255,0.28)' : 'var(--line)'}`,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                  {isSaved ? 'Contato salvo' : 'Salvar contato'}
                </button>
                <button onClick={() => onOpenProducts(co.name)} disabled={co.products.length === 0} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: co.products.length > 0 ? '#2E7BFF' : 'var(--chip)',
                  color: co.products.length > 0 ? '#fff' : 'var(--muted)',
                  border: 'none',
                  fontWeight: 700, fontSize: 13,
                  cursor: co.products.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                  Ver produtos
                </button>
                <button onClick={() => onOpenEvents(co.name)} disabled={co.events.length === 0} style={{
                  padding: '11px 8px', borderRadius: 12,
                  background: co.events.length > 0 ? '#17142F' : 'var(--chip)',
                  color: co.events.length > 0 ? '#fff' : 'var(--muted)',
                  border: 'none',
                  fontWeight: 700, fontSize: 13,
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
  const { registerInterest, registeredEventIds } = useAuth();
  const [tint1, tint2] = categoryTint(ev.category);
  const pct = Math.min(100, Math.round((ev.registeredCount / ev.maxParticipants) * 100));
  const full = pct >= 100;
  const registered = registeredEventIds.has(ev.id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const waLink = buildWhatsappLink(ev.companyWhatsapp, `Olá! Vi o evento "${ev.title}" no Tessy e tenho interesse.`);
  const code = ev.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  async function handleInterest() {
    if (registered || full || busy) return;
    setBusy(true);
    setErr('');
    try {
      await registerInterest(ev.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao registrar interesse.');
    } finally {
      setBusy(false);
    }
  }

  const btnLabel = busy ? '...' : full ? 'Esgotado' : registered ? 'Inscrito ✓' : 'Tenho interesse';
  const btnBg = full ? 'var(--chip)' : registered ? 'rgba(18,160,108,0.12)' : 'var(--accent)';
  const btnColor = full ? 'var(--muted)' : registered ? 'var(--success)' : '#fff';
  const btnBorder = registered ? '1px solid rgba(18,160,108,0.35)' : 'none';
  const btnCursor = full || registered || busy ? 'not-allowed' : 'pointer';

  return (
    <BannerCard tint1={tint1} tint2={tint2} month={monthShort(ev.date)} day={dayNum(ev.date)} format={ev.category}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CompanyMark code={code} tint={companyTint(ev.companyName)} size={22} radius={6} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ev.companyName}</span>
        <VerifiedDot size={11} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, color: 'var(--ink)' }}>{ev.title}</div>
      {ev.website && <div><WebsiteLink url={ev.website} /></div>}
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{ev.location} · {ev.time}</div>

      {/* seats */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Mono style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vagas</Mono>
          <Mono style={{ fontSize: 10, color: full ? 'var(--danger)' : 'var(--muted)' }}>{ev.registeredCount}/{ev.maxParticipants}</Mono>
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
          disabled={full || registered || busy}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: btnBorder,
            background: btnBg, color: btnColor,
            fontSize: 13, fontWeight: 700, cursor: btnCursor,
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
            fontSize: 13, fontWeight: 700,
          }}>
            <WaIcon size={14} /> WhatsApp
          </a>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── EventRow (compact) ─── */
function EventRow({ ev }: { ev: Event }) {
  const [tint1, tint2] = categoryTint(ev.category);
  return (
    <RowCard>
      <div style={{
        width: 54, flexShrink: 0, borderRadius: 12,
        background: `linear-gradient(135deg, ${tint1} 0%, ${tint2} 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#fff', padding: '6px 0',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>{monthShort(ev.date)}</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{dayNum(ev.date)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: 'var(--ink)' }}>{ev.title}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{ev.companyName} · {ev.location}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
          <Chip color="#2E7BFF">{ev.category}</Chip>
          <Mono style={{ fontSize: 10, color: 'var(--muted)' }}>{ev.registeredCount} inscritos</Mono>
        </div>
      </div>
    </RowCard>
  );
}

/* ─── ProductCard ─── */
function ProductCard({ product }: { product: Product }) {
  const [tint1, tint2] = categoryTint(product.category);
  const code = product.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const repMessage = `Olá! Vi o produto "${product.name}" no Tessy e gostaria de falar com o representante sobre uma possível parceria.`;
  const creatorMessage = `Olá! Sou médico cadastrado no Tessy. Tenho interesse em divulgar o produto "${product.name}" no Instagram e gostaria de entender a proposta, briefing, condições e materiais disponíveis.`;
  const waLink = buildWhatsappLink(product.companyWhatsapp, repMessage);
  const creatorLink = buildWhatsappLink(product.companyWhatsapp, creatorMessage);

  // Prioriza conversa com representante. Se a empresa não cadastrou WhatsApp, cai para o site.
  const repTarget = waLink || product.website || '';
  const creatorTarget = creatorLink || product.website || '';
  const canContactRep = !!repTarget;

  return (
    <BannerCard tint1={tint1} tint2={tint2} format={product.category}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CompanyMark code={code} tint={companyTint(product.companyName)} size={22} radius={6} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{product.companyName}</span>
        <VerifiedDot size={11} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{product.name}</div>
      {product.website && <div><WebsiteLink url={product.website} /></div>}
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{product.description}</div>
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(46,123,255,0.07)',
        border: '1px solid rgba(46,123,255,0.16)',
      }}>
        <Mono style={{ display: 'block', fontSize: 9, color: '#2E7BFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
          Proposta para médicos
        </Mono>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>
          {product.availableFor || 'Contato com representante para briefing, amostras e condições de divulgação.'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip color="#2E7BFF">Instagram</Chip>
        <Chip color="#5F2C82">Representante</Chip>
        {product.price && <Chip color="#1EA97C">{product.price}</Chip>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!canContactRep}
          onClick={() => {
            if (!canContactRep) return;
            window.open(repTarget, '_blank', 'noopener,noreferrer');
          }}
          style={{
            flex: '1 1 160px', padding: '11px 10px', borderRadius: 12, border: 'none',
            background: canContactRep ? '#2E7BFF' : 'var(--chip)',
            color: canContactRep ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 700,
            cursor: canContactRep ? 'pointer' : 'not-allowed',
            opacity: canContactRep ? 1 : 0.7,
          }}>
          Falar com representante
        </button>
        {creatorTarget && (
          <a href={creatorTarget} target="_blank" rel="noopener noreferrer" style={{
            flex: '1 1 160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 10px', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(37,211,102,0.1)', color: '#25D366',
            border: '1px solid rgba(37,211,102,0.3)', fontSize: 13, fontWeight: 700,
          }}>
            <WaIcon size={14} /> Quero divulgar
          </a>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── CourseCard (full) ─── */
function CourseCard({ course }: { course: Course }) {
  const [tint1, tint2] = categoryTint(course.category);
  const code = course.companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const waLink = buildWhatsappLink(course.companyWhatsapp, `Olá! Vi o curso "${course.title}" no Tessy e tenho interesse.`);
  const enrollLink = buildWhatsappLink(course.companyWhatsapp, `Olá! Sou médico cadastrado no Tessy e gostaria de me inscrever no curso "${course.title}". Como faço para garantir minha vaga?`);
  const interestTarget = enrollLink || course.website || '';
  const canShowInterest = !!interestTarget;

  return (
    <BannerCard tint1={tint1} tint2={tint2} format="CURSO">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <CompanyMark code={code} tint={companyTint(course.companyName)} size={22} radius={6} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{course.companyName}</span>
        <ModalityBadge modality={course.modality} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{course.title}</div>
      {course.website && <div><WebsiteLink url={course.website} /></div>}
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 5, lineHeight: 1.5 }}>{course.description}</div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: 'INSTRUTOR', val: course.instructor },
          { label: 'DURAÇÃO', val: course.duration },
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
          disabled={!canShowInterest}
          onClick={() => {
            if (!canShowInterest) return;
            window.open(interestTarget, '_blank', 'noopener,noreferrer');
          }}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
            background: canShowInterest
              ? 'linear-gradient(135deg, #5F2C82 0%, #2E7BFF 100%)'
              : 'var(--chip)',
            color: canShowInterest ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 700,
            cursor: canShowInterest ? 'pointer' : 'not-allowed',
            opacity: canShowInterest ? 1 : 0.7,
          }}>
          Tenho interesse
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(37,211,102,0.1)', color: '#25D366',
            border: '1px solid rgba(37,211,102,0.3)', fontSize: 13, fontWeight: 700,
          }}>
            <WaIcon size={14} /> WhatsApp
          </a>
        )}
      </div>
    </BannerCard>
  );
}

/* ─── CourseRow (compact) ─── */
function CourseRow({ course }: { course: Course }) {
  const [tint1, tint2] = categoryTint(course.category);
  return (
    <RowCard>
      <div style={{
        width: 54, flexShrink: 0, borderRadius: 12,
        background: `linear-gradient(135deg, ${tint1} 0%, ${tint2} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontSize: 24,
      }}>🎓</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: 'var(--ink)' }}>{course.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{course.instructor}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <ModalityBadge modality={course.modality} />
          {course.price && <Chip color="#1EA97C">{course.price}</Chip>}
        </div>
      </div>
    </RowCard>
  );
}

/* ─── Shared ─── */
function StatChip({ label, value, onClick }: { label: string; value: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 14px', borderRadius: 12,
      background: 'var(--card)', border: '1px solid var(--line)',
      cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6,
    }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
      {onSeeAll && (
        <button onClick={onSeeAll} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          color: '#2E7BFF', letterSpacing: '0.1em', textTransform: 'uppercase',
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
        onFocus={e => e.target.style.borderColor = '#2E7BFF'}
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
          background: active === v ? '#2E7BFF' : 'var(--card)',
          border: `1px solid ${active === v ? '#2E7BFF' : 'var(--line)'}`,
          color: active === v ? '#fff' : 'var(--ink-2)',
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', cursor: 'pointer',
        }}>{l}</button>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)',
      color: 'var(--muted)', fontSize: 14,
    }}>
      {text}
    </div>
  );
}
