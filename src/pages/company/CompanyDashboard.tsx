import { useState } from 'react';
import Layout from '../../components/Layout';
import type { NavItem } from '../../components/Layout';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, Mono, Chip, ModalityBadge, WaIcon,
} from '../../components/ui';
import { buildWhatsappLink, categoryTint, companyTint } from '../../lib/uiHelpers';
import type { Event, Product, Course, CourseModality, Lead } from '../../types';

type Tab = 'home' | 'events' | 'create' | 'products' | 'courses' | 'leads';

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
function IcoLeads(a: boolean) {
  const c = a ? '#2E7BFF' : '#6F7A90';
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6"><path d="M6.5 10.5a3.5 3.5 0 117 0M3 18a7 7 0 0114 0"/><path d="M2.5 5.5h3M14.5 5.5h3M4 2.5l2 2M16 2.5l-2 2" strokeLinecap="round"/></svg>;
}
function IcoBigCreate() {
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
  { key: 'create',   label: '',         icon: () => <IcoBigCreate />, big: true },
  { key: 'products', label: 'Produtos', icon: IcoBox },
  { key: 'leads',    label: 'Leads',    icon: IcoLeads },
  { key: 'courses',  label: 'Cursos',   icon: IcoBook },
];

const EVENT_CATS   = ['Congresso', 'Workshop', 'Simpósio', 'Webinar', 'Treinamento'];
const PRODUCT_CATS = ['Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria', 'Dermatologia', 'Endocrinologia', 'Outros'];
const COURSE_CATS  = [
  'Nutrologia', 'Endocrinologia', 'Dermatologia', 'Cirurgia Plástica',
  'Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria',
  'Gastroenterologia', 'Ginecologia', 'Oftalmologia', 'Psiquiatria',
  'Reumatologia', 'Urologia', 'Pneumologia', 'Clínica Médica', 'Outros',
];
const MODALITIES: { value: CourseModality; label: string; icon: string }[] = [
  { value: 'online',     label: 'Online',     icon: '◎' },
  { value: 'presencial', label: 'Presencial', icon: '📍' },
  { value: 'hibrido',    label: 'Híbrido',    icon: '⚡' },
];

function fmt(d: string) {
  if (!d) return '';
  const [, m, dd] = d.split('-');
  return `${dd}/${m}`;
}

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatDisplayPhone(raw: string) {
  // stored as 5511999999999 → (11) 99999-9999
  const d = raw.replace(/\D/g, '');
  const local = d.startsWith('55') ? d.slice(2) : d;
  return fmtPhone(local);
}

export default function CompanyDashboard() {
  const { user, events, products, courses, leads, addEvent, addProduct, addCourse, deleteEvent, deleteProduct, deleteCourse, updateProfile, updateEvent } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [createKind, setCreateKind] = useState<'event' | 'product' | 'course'>('event');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editWa, setEditWa] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const myEvents   = events.filter(e => e.companyId === user?.id);
  const myProducts = products.filter(p => p.companyId === user?.id);
  const myCourses  = courses.filter(c => c.companyId === user?.id);
  const myLeads    = leads.filter(l => l.companyId === user?.id);
  const tint = companyTint(user?.company ?? user?.name ?? '');
  const code = (user?.company ?? user?.name ?? 'EM').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const companyInfo = { id: user?.id ?? '', name: user?.company ?? user?.name ?? '', whatsapp: user?.whatsapp };

  function goTab(k: string) {
    if (k === 'create') { setTab('create'); return; }
    setTab(k as Tab);
  }

  const editingEvent = events.find(e => e.id === editingEventId) ?? null;

  return (
    <>
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={goTab}>

      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          {/* Company header */}
          <div style={{ marginBottom: 24, padding: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <CompanyMark code={code} tint={tint} size={60} />
              {!editingProfile ? (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {user?.company ?? user?.name}<span style={{ color: '#2E7BFF' }}>.</span>
                  </h1>
                  {user?.whatsapp ? (
                    <a
                      href={buildWhatsappLink(user.whatsapp)}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, color: '#25D366', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                    >
                      <WaIcon size={14} /> {user.whatsapp}
                    </a>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>WhatsApp não configurado</div>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                      NOME DA EMPRESA
                    </div>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Nome da empresa"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        background: 'var(--bg)', border: '1.5px solid #2E7BFF',
                        color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                      WHATSAPP
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#25D366', display: 'flex' }}>
                        <WaIcon size={14} />
                      </span>
                      <input
                        value={editWa}
                        onChange={e => setEditWa(fmtPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        type="tel"
                        style={{
                          width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
                          background: 'var(--bg)', border: '1.5px solid #25D366',
                          color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setEditingProfile(false)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8,
                        background: 'var(--chip)', border: '1px solid var(--line)',
                        color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >Cancelar</button>
                    <button
                      onClick={() => {
                        const trimName = editName.trim();
                        const rawWa = editWa.replace(/\D/g, '');
                        if (trimName.length > 1) {
                          updateProfile({
                            name: trimName, company: trimName,
                            whatsapp: rawWa ? (rawWa.startsWith('55') ? rawWa : `55${rawWa}`) : user?.whatsapp,
                          });
                        }
                        setEditingProfile(false);
                      }}
                      style={{
                        flex: 2, padding: '9px', borderRadius: 8, border: 'none',
                        background: '#2E7BFF', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(46,123,255,0.3)',
                      }}
                    >Salvar</button>
                  </div>
                </div>
              )}

              {/* Edit toggle */}
              {!editingProfile && (
                <button
                  onClick={() => {
                    setEditName(user?.company ?? user?.name ?? '');
                    setEditWa(user?.whatsapp ? formatDisplayPhone(user.whatsapp) : '');
                    setEditingProfile(true);
                  }}
                  title="Editar perfil"
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: 'var(--chip)', border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--muted)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10.5 1.5L13.5 4.5L5 13H2V10L10.5 1.5Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', marginBottom: 20, overflow: 'hidden' }}>
            {[
              { v: myEvents.length, l: 'eventos' },
              { v: myProducts.length, l: 'produtos' },
              { v: myLeads.length, l: 'leads' },
            ].map((s, i) => (
              <div key={s.l} style={{
                flex: 1, textAlign: 'center', padding: '16px 8px',
                borderRight: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{s.v}</div>
                <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.l}</Mono>
              </div>
            ))}
          </div>

          {/* Commercial pipeline */}
          <div style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(46,123,255,0.10) 0%, rgba(30,169,124,0.08) 100%)',
            border: '1px solid rgba(46,123,255,0.16)',
          }}>
            <Mono style={{ fontSize: 9, color: '#2E7BFF', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Ponte comercial
            </Mono>
            <div style={{ marginTop: 8, fontSize: 18, color: 'var(--ink)', fontWeight: 700, lineHeight: 1.2 }}>
              Leads médicos qualificados
            </div>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
              Veja médicos que pediram representante, amostra, evento ou parceria de divulgação.
            </p>
            <button onClick={() => setTab('leads')} style={{
              marginTop: 12,
              width: '100%',
              padding: '11px 12px',
              borderRadius: 12,
              border: 'none',
              background: '#2E7BFF',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              Abrir leads
            </button>
          </div>

          {/* Quick create */}
          <div style={{ marginBottom: 24 }}>
            <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Criar novo
            </Mono>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {(['event', 'product', 'course'] as const).map(k => {
                const cfg = { event: { icon: '📅', label: 'Evento' }, product: { icon: '💊', label: 'Produto' }, course: { icon: '🎓', label: 'Curso' } }[k];
                return (
                  <button key={k} onClick={() => { setCreateKind(k); setTab('create'); }} style={{
                    padding: '16px 8px', borderRadius: 14,
                    background: 'var(--card)', border: '1px solid var(--line)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent events timeline */}
          {myEvents.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Meus eventos</span>
                <button onClick={() => setTab('events')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  color: '#2E7BFF', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>ver todos →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myEvents.slice(0, 3).map(e => <EventRowCompany key={e.id} ev={e} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <ListTab
          title="Meus eventos"
          onAdd={() => { setCreateKind('event'); setTab('create'); }}
          empty={myEvents.length === 0}
          emptyText="Nenhum evento criado ainda."
        >
          {myEvents.map(e => <EventCardCompany key={e.id} ev={e} onDelete={() => deleteEvent(e.id)} onEdit={() => setEditingEventId(e.id)} />)}
        </ListTab>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <ListTab
          title="Meus produtos"
          onAdd={() => { setCreateKind('product'); setTab('create'); }}
          empty={myProducts.length === 0}
          emptyText="Nenhum produto criado ainda."
        >
          {myProducts.map(p => <ProductCardCompany key={p.id} product={p} onDelete={() => deleteProduct(p.id)} />)}
        </ListTab>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <ListTab
          title="Meus cursos"
          onAdd={() => { setCreateKind('course'); setTab('create'); }}
          empty={myCourses.length === 0}
          emptyText="Nenhum curso criado ainda."
        >
          {myCourses.map(c => <CourseCardCompany key={c.id} course={c} onDelete={() => deleteCourse(c.id)} />)}
        </ListTab>
      )}

      {/* ── LEADS ── */}
      {tab === 'leads' && (
        <LeadInbox leads={myLeads} />
      )}

      {/* ── CREATE WIZARD ── */}
      {tab === 'create' && (
        <CreateWizard
          kind={createKind}
          setKind={setCreateKind}
          company={companyInfo}
          onSaveEvent={async data => { await addEvent(data); setTab('events'); }}
          onSaveProduct={async data => { await addProduct(data); setTab('products'); }}
          onSaveCourse={async data => { await addCourse(data); setTab('courses'); }}
          onCancel={() => setTab('home')}
        />
      )}
    </Layout>

    {/* ── EDIT EVENT MODAL ── */}
    {editingEvent && (
      <EditEventModal
        event={editingEvent}
        onClose={() => setEditingEventId(null)}
        onSave={async patch => {
          await updateEvent(editingEvent.id, patch);
          setEditingEventId(null);
        }}
      />
    )}
    </>
  );
}

/* ─── Create wizard ─── */
function CreateWizard({ kind, setKind, company, onSaveEvent, onSaveProduct, onSaveCourse, onCancel }: {
  kind: 'event' | 'product' | 'course';
  setKind: (k: 'event' | 'product' | 'course') => void;
  company: { id: string; name: string; whatsapp?: string };
  onSaveEvent: (e: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  onSaveProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onSaveCourse: (c: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Event state
  const [ev, setEv] = useState({ title: '', description: '', date: '', time: '09:00', location: '', category: EVENT_CATS[0], maxParticipants: '100', website: '' });
  // Product state
  const [pr, setPr] = useState({
    name: '',
    description: '',
    category: PRODUCT_CATS[0],
    availableFor: 'Representante envia amostra, materiais e condições comerciais para médicos interessados.',
    price: 'Parceria sob consulta',
    website: '',
  });
  // Course state
  const [co, setCo] = useState({ title: '', description: '', instructor: '', category: COURSE_CATS[0], modality: 'online' as CourseModality, duration: '', price: '', website: '' });

  const totalSteps = kind === 'event' ? 3 : kind === 'course' ? 3 : 2;

  // Validate required fields before advancing / finishing
  function validate(): string {
    if (step === 0) return ''; // kind selection, always valid
    if (kind === 'event') {
      if (step === 1 && !ev.title.trim()) return 'Informe o título do evento.';
      if (step === 2 && !ev.date) return 'Selecione a data do evento.';
      if (step === 2 && !ev.location.trim()) return 'Informe o local do evento.';
    }
    if (kind === 'product') {
      if (step === 1 && !pr.name.trim()) return 'Informe o nome do produto.';
      if (step === 1 && !pr.description.trim()) return 'Informe a descrição do produto.';
    }
    if (kind === 'course') {
      if (step === 1 && !co.title.trim()) return 'Informe o título do curso.';
      if (step === 1 && !co.instructor.trim()) return 'Informe o nome do instrutor.';
      if (step === 2 && !co.duration.trim()) return 'Informe a duração do curso.';
    }
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError('');
    setStep(s => s + 1);
  }

  // Normaliza URL do site: adiciona https:// se faltando, vazio → undefined
  function normalizeUrl(raw: string): string | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function handleFinish() {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError('');
    setSaving(true);
    try {
      if (kind === 'event') {
        await onSaveEvent({
          ...ev,
          maxParticipants: Number(ev.maxParticipants) || 100,
          website: normalizeUrl(ev.website),
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      } else if (kind === 'product') {
        await onSaveProduct({
          ...pr,
          website: normalizeUrl(pr.website),
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      } else {
        await onSaveCourse({
          ...co,
          website: normalizeUrl(co.website),
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setSaveError(`Erro ao publicar: ${msg}`);
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          width: 40, height: 40, borderRadius: 12, border: '1px solid var(--line)',
          background: 'var(--card)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18,
        }}>×</button>
        <Mono style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          novo {kind === 'event' ? 'evento' : kind === 'product' ? 'produto' : 'curso'} · etapa {step + 1} de {totalSteps}
        </Mono>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#2E7BFF' : 'var(--line)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step 0: choose kind */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            O que você quer criar<span style={{ color: '#2E7BFF' }}>?</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            Médicos verão no app deles imediatamente.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['event', 'product', 'course'] as const).map(k => {
              const cfg = {
                event:   { icon: '📅', title: 'Evento', desc: 'Congresso, workshop, webinar' },
                product: { icon: '💊', title: 'Produto', desc: 'Produto, amostra, representante' },
                course:  { icon: '🎓', title: 'Curso', desc: 'Para médicos professores' },
              }[k];
              return (
                <button key={k} onClick={() => setKind(k)} style={{
                  padding: '16px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                  background: kind === k ? 'rgba(46,123,255,0.08)' : 'var(--card)',
                  border: `2px solid ${kind === k ? '#2E7BFF' : 'var(--line)'}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
                  }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{cfg.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{cfg.desc}</div>
                  </div>
                  {kind === k && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2E7BFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Event steps */}
      {kind === 'event' && step === 1 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Sobre o evento<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WField label="TÍTULO" value={ev.title} onChange={v => setEv(p => ({ ...p, title: v }))} placeholder="Ex: Simpósio de Cardiologia 2025" />
            <WField label="DESCRIÇÃO" value={ev.description} onChange={v => setEv(p => ({ ...p, description: v }))} placeholder="Descreva o evento..." as="textarea" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="CATEGORIA" value={ev.category} onChange={v => setEv(p => ({ ...p, category: v }))} as="select" options={EVENT_CATS} />
              <WField label="VAGAS" value={ev.maxParticipants} onChange={v => setEv(p => ({ ...p, maxParticipants: v }))} type="number" />
            </div>
          </div>
        </div>
      )}
      {kind === 'event' && step === 2 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Data e local<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="DATA" value={ev.date} onChange={v => setEv(p => ({ ...p, date: v }))} type="date" />
              <WField label="HORA" value={ev.time} onChange={v => setEv(p => ({ ...p, time: v }))} type="time" />
            </div>
            <WField label="LOCAL" value={ev.location} onChange={v => setEv(p => ({ ...p, location: v }))} placeholder="São Paulo, SP" />
            <WField label="WEBSITE (opcional)" value={ev.website} onChange={v => setEv(p => ({ ...p, website: v }))} placeholder="www.seusite.com.br" type="url" />
          </div>
        </div>
      )}

      {/* Product steps */}
      {kind === 'product' && step === 1 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Produto e representante<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 16 }}>
            Publique uma oportunidade clara para o médico chamar o representante.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WField label="NOME DO PRODUTO" value={pr.name} onChange={v => setPr(p => ({ ...p, name: v }))} placeholder="Ex: SkinBiome Serum" />
            <WField label="RESUMO CLÍNICO / COMERCIAL" value={pr.description} onChange={v => setPr(p => ({ ...p, description: v }))} placeholder="O que é, para quem é e por que vale uma conversa." as="textarea" />
            <WField label="CATEGORIA" value={pr.category} onChange={v => setPr(p => ({ ...p, category: v }))} as="select" options={PRODUCT_CATS} />
            <WField label="PRÓXIMO PASSO PARA O MÉDICO" value={pr.availableFor} onChange={v => setPr(p => ({ ...p, availableFor: v }))} placeholder="Ex: Solicitar amostra, falar com representante, receber material científico." as="textarea" />
            <WField label="CONDIÇÕES" value={pr.price} onChange={v => setPr(p => ({ ...p, price: v }))} placeholder="Ex: Amostra disponível, sob consulta, parceria regional..." />
            <WField label="SITE OU MATERIAL (opcional)" value={pr.website} onChange={v => setPr(p => ({ ...p, website: v }))} placeholder="www.empresa.com.br/produto" type="url" />
          </div>
        </div>
      )}

      {/* Course steps */}
      {kind === 'course' && step === 1 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Sobre o curso<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WField label="TÍTULO" value={co.title} onChange={v => setCo(p => ({ ...p, title: v }))} placeholder="Ex: Atualização em ECG" />
            <WField label="INSTRUTOR / PROFESSOR" value={co.instructor} onChange={v => setCo(p => ({ ...p, instructor: v }))} placeholder="Dr. João Silva" />
            <WField label="DESCRIÇÃO" value={co.description} onChange={v => setCo(p => ({ ...p, description: v }))} placeholder="Descreva o curso..." as="textarea" />
            <WField label="CATEGORIA" value={co.category} onChange={v => setCo(p => ({ ...p, category: v }))} as="select" options={COURSE_CATS} />
          </div>
        </div>
      )}
      {kind === 'course' && step === 2 && (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Formato e preço<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>MODALIDADE</Mono>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {MODALITIES.map(m => (
                  <button key={m.value} onClick={() => setCo(p => ({ ...p, modality: m.value }))} style={{
                    padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                    background: co.modality === m.value ? 'rgba(46,123,255,0.08)' : 'var(--card)',
                    border: `1.5px solid ${co.modality === m.value ? '#2E7BFF' : 'var(--line)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: co.modality === m.value ? '#6FA4FF' : 'var(--ink-2)',
                  }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="DURAÇÃO" value={co.duration} onChange={v => setCo(p => ({ ...p, duration: v }))} placeholder="Ex: 20 horas" />
              <WField label="PREÇO" value={co.price} onChange={v => setCo(p => ({ ...p, price: v }))} placeholder="R$ 490" />
            </div>
            <WField label="WEBSITE (opcional)" value={co.website} onChange={v => setCo(p => ({ ...p, website: v }))} placeholder="www.seusite.com.br" type="url" />
          </div>
        </div>
      )}

      {/* Validation / save error */}
      {saveError && (
        <div style={{
          marginTop: 16, padding: '12px 14px', borderRadius: 10,
          background: 'rgba(242,92,84,0.1)', border: '1px solid rgba(242,92,84,0.3)',
          color: '#F25C54', fontSize: 13,
        }}>
          {saveError}
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {step > 0 && (
          <button onClick={() => { setSaveError(''); setStep(s => s - 1); }} disabled={saving} style={{
            width: 52, height: 52, borderRadius: 14, border: '1px solid var(--line)',
            background: 'var(--card)', cursor: saving ? 'not-allowed' : 'pointer',
            color: 'var(--ink)', fontSize: 20, opacity: saving ? 0.5 : 1,
          }}>←</button>
        )}
        {step < totalSteps - 1 ? (
          <button onClick={handleNext} style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: '#2E7BFF', color: '#fff', cursor: 'pointer',
            fontSize: 15, fontWeight: 700,
            boxShadow: '0 6px 24px rgba(46,123,255,0.3)',
          }}>
            Continuar →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving} style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: saving ? '#1a5cbf' : '#2E7BFF', color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 700, opacity: saving ? 0.8 : 1,
            boxShadow: '0 6px 24px rgba(46,123,255,0.3)',
          }}>
            {saving
              ? 'Publicando...'
              : `Publicar ${kind === 'event' ? 'evento' : kind === 'product' ? 'produto' : 'curso'} ✓`}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── List tab wrapper ─── */
function ListTab({ title, onAdd, empty, emptyText, children }: {
  title: string; onAdd: () => void; empty: boolean; emptyText: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {title}<span style={{ color: '#2E7BFF' }}>.</span>
        </h1>
        <button onClick={onAdd} style={{
          padding: '8px 16px', borderRadius: 10, border: 'none',
          background: '#2E7BFF', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>+ Novo</button>
      </div>
      {empty
        ? <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 14 }}>{emptyText}</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
      }
    </div>
  );
}

/* ─── Company view cards ─── */
function EventRowCompany({ ev }: { ev: Event }) {
  const [tint1, tint2] = categoryTint(ev.category);
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--line)' }}>
      <div style={{
        width: 50, flexShrink: 0, borderRadius: 10,
        background: `linear-gradient(135deg, ${tint1} 0%, ${tint2} 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700 }}>{ev.date ? ev.date.split('-')[1] : ''}</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{ev.date ? ev.date.split('-')[2] : ''}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{ev.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ev.location}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <Chip color="#2E7BFF">{ev.registeredCount}/{ev.maxParticipants}</Chip>
          <Mono style={{ fontSize: 10, color: '#1EA97C', fontWeight: 700 }}>✓ ATIVO</Mono>
        </div>
      </div>
    </div>
  );
}

function EventCardCompany({ ev, onDelete, onEdit }: { ev: Event; onDelete: () => void; onEdit: () => void }) {
  const [tint1, tint2] = categoryTint(ev.category);
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${tint1}, ${tint2})` }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Chip color={tint1}>{ev.category}</Chip>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, color: 'var(--ink)' }}>{ev.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{fmt(ev.date)} · {ev.location}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Mono style={{ fontSize: 10, color: 'var(--ink-2)' }}>👥 {ev.registeredCount}/{ev.maxParticipants} inscritos</Mono>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 10, flexShrink: 0 }}>
            <button onClick={onEdit} style={{
              background: 'rgba(91,110,245,0.10)', border: '1px solid rgba(91,110,245,0.25)',
              borderRadius: 8, cursor: 'pointer',
              color: 'var(--accent)', fontSize: 12, fontWeight: 600, padding: '5px 10px',
            }}>Editar</button>
            <button onClick={onDelete} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '4px 0',
            }}>Excluir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadInbox({ leads }: { leads: Lead[] }) {
  const intentLabel: Record<Lead['intent'], { label: string; color: string }> = {
    representative_contact: { label: 'Representante', color: '#2E7BFF' },
    sample_request: { label: 'Amostra', color: '#1EA97C' },
    instagram_partnership: { label: 'Instagram', color: '#E63E8C' },
    event_interest: { label: 'Evento', color: '#5F2C82' },
    course_interest: { label: 'Curso', color: '#F58220' },
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Mono style={{ fontSize: 10, color: '#2E7BFF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Relacionamento médico
        </Mono>
        <h1 style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Leads qualificados<span style={{ color: '#2E7BFF' }}>.</span>
        </h1>
        <p style={{ marginTop: 6, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45 }}>
          Pedidos de amostra, contato com representante, interesse em eventos e propostas de divulgação.
        </p>
      </div>

      {leads.length === 0 ? (
        <div style={{ padding: 24, borderRadius: 18, background: 'var(--card)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 700 }}>Nenhum lead ainda.</div>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Quando um médico clicar em representante, amostra, evento ou divulgação, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.map(lead => {
            const intent = intentLabel[lead.intent];
            const waLink = buildWhatsappLink(
              lead.doctorWhatsapp,
              `Olá ${lead.doctorName}, vi seu interesse no Tessy sobre "${lead.itemName}". Posso te passar mais detalhes?`,
            );
            return (
              <div key={lead.id} style={{
                padding: 16,
                borderRadius: 18,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: '0 2px 10px rgba(90,80,130,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <Chip color={intent.color}>{intent.label}</Chip>
                    <div style={{ marginTop: 10, fontSize: 16, color: 'var(--ink)', fontWeight: 700 }}>
                      {lead.doctorName}
                    </div>
                    <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12 }}>
                      {lead.doctorSpecialty || 'Especialidade não informada'}
                    </div>
                  </div>
                  <Mono style={{ fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </Mono>
                </div>

                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>{lead.itemName}</div>
                  {lead.message && (
                    <div style={{ marginTop: 5, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      {lead.message}
                    </div>
                  )}
                </div>

                {waLink ? (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '11px 12px',
                    borderRadius: 12,
                    background: 'rgba(37,211,102,0.12)',
                    color: '#25D366',
                    border: '1px solid rgba(37,211,102,0.32)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                  }}>
                    <WaIcon size={14} /> Falar com médico
                  </a>
                ) : (
                  <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12 }}>
                    Médico sem WhatsApp no perfil.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductCardCompany({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const [tint1, tint2] = categoryTint(product.category);
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${tint1}, ${tint2})` }} />
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip color={tint1}>{product.category}</Chip>
            <Chip color="#25D366">Representante</Chip>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, color: 'var(--ink)' }}>{product.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{product.description}</div>
          {product.availableFor && (
            <div style={{
              marginTop: 9,
              padding: '9px 10px',
              borderRadius: 10,
              background: 'rgba(46,123,255,0.06)',
              border: '1px solid rgba(46,123,255,0.14)',
              color: 'var(--ink-2)',
              fontSize: 12,
              lineHeight: 1.4,
            }}>
              {product.availableFor}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {product.price && <Chip color="#1EA97C">{product.price}</Chip>}
            {product.website && <Chip color="#5F2C82">Material</Chip>}
          </div>
        </div>
        <button onClick={onDelete} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '0 0 0 10px', flexShrink: 0,
        }}>Excluir</button>
      </div>
    </div>
  );
}

function CourseCardCompany({ course, onDelete }: { course: Course; onDelete: () => void }) {
  const [tint1, tint2] = categoryTint(course.category);
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${tint1}, ${tint2})` }} />
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip color={tint1}>{course.category}</Chip>
            <ModalityBadge modality={course.modality} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, color: 'var(--ink)' }}>{course.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>🎓 {course.instructor} · ⏱ {course.duration}</div>
          {course.price && <div style={{ marginTop: 8 }}><Chip color="#1EA97C">{course.price}</Chip></div>}
        </div>
        <button onClick={onDelete} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '0 0 0 10px', flexShrink: 0,
        }}>Excluir</button>
      </div>
    </div>
  );
}

/* ─── Wizard field ─── */
function WField({ label, value, onChange, type = 'text', placeholder, as = 'input', options }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; as?: 'input' | 'textarea' | 'select'; options?: string[];
}) {
  const base = {
    width: '100%', padding: '12px 0', border: 'none', borderBottom: '2px solid var(--line)',
    background: 'transparent', color: 'var(--ink)', fontSize: 16, fontWeight: 500,
    outline: 'none', fontFamily: "'Inter', sans-serif",
  } as const;
  return (
    <div>
      <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
        {label}
      </Mono>
      {as === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, resize: 'none' }} onFocus={e => e.target.style.borderBottomColor = '#2E7BFF'} onBlur={e => e.target.style.borderBottomColor = 'var(--line)'} />
        : as === 'select'
          ? <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={e => e.target.style.borderBottomColor = '#2E7BFF'} onBlur={e => e.target.style.borderBottomColor = 'var(--line)'} />
      }
    </div>
  );
}

/* ─── Edit event modal ─── */
function EditEventModal({ event, onSave, onClose }: {
  event: Event;
  onSave: (patch: Partial<Omit<Event, 'id' | 'createdAt' | 'companyId' | 'companyName' | 'registeredCount'>>) => Promise<void>;
  onClose: () => void;
}) {
  const [title,           setTitle]           = useState(event.title);
  const [description,     setDescription]     = useState(event.description);
  const [date,            setDate]            = useState(event.date);
  const [time,            setTime]            = useState(event.time);
  const [location,        setLocation]        = useState(event.location);
  const [category,        setCategory]        = useState(event.category);
  const [maxParticipants, setMaxParticipants] = useState(String(event.maxParticipants));
  const [website,         setWebsite]         = useState(event.website ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  function normalizeUrl(raw: string): string | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function handleSave() {
    if (!title.trim())    { setErr('Informe o título do evento.'); return; }
    if (!date)            { setErr('Selecione a data.');           return; }
    if (!location.trim()) { setErr('Informe o local.');            return; }
    const max = Number(maxParticipants) || 100;
    if (max < event.registeredCount) {
      setErr(`Vagas não podem ser menores que o nº de inscritos (${event.registeredCount}).`);
      return;
    }
    setErr('');
    setSaving(true);
    try {
      await onSave({
        title:           title.trim(),
        description:     description.trim(),
        date,
        time,
        location:        location.trim(),
        category,
        maxParticipants: max,
        website:         normalizeUrl(website),
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao salvar.');
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,18,30,0.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)', borderRadius: 20, border: '1px solid var(--line)',
          width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto',
          padding: 24, boxShadow: '0 30px 80px rgba(15,18,30,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Editar evento<span style={{ color: '#2E7BFF' }}>.</span>
          </h2>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)',
            background: 'var(--bg)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18,
          }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WField label="TÍTULO" value={title} onChange={setTitle} placeholder="Título do evento" />
          <WField label="DESCRIÇÃO" value={description} onChange={setDescription} as="textarea" placeholder="Descreva o evento..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <WField label="DATA" value={date} onChange={setDate} type="date" />
            <WField label="HORA" value={time} onChange={setTime} type="time" />
          </div>
          <WField label="LOCAL" value={location} onChange={setLocation} placeholder="São Paulo, SP" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <WField label="CATEGORIA" value={category} onChange={setCategory} as="select" options={EVENT_CATS} />
            <WField label="VAGAS" value={maxParticipants} onChange={setMaxParticipants} type="number" />
          </div>
          <WField label="WEBSITE (opcional)" value={website} onChange={setWebsite} type="url" placeholder="www.seusite.com.br" />

          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(91,110,245,0.06)', border: '1px solid rgba(91,110,245,0.18)',
            fontSize: 12, color: 'var(--ink-2)',
          }}>
            👥 <b>{event.registeredCount}</b> {event.registeredCount === 1 ? 'médico inscrito' : 'médicos inscritos'} —
            o número de vagas não pode ficar abaixo desse total.
          </div>
        </div>

        {err && (
          <div style={{
            marginTop: 14, padding: '10px 12px', borderRadius: 10,
            background: 'rgba(242,92,84,0.10)', border: '1px solid rgba(242,92,84,0.30)',
            color: '#F25C54', fontSize: 13,
          }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={saving} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            background: 'var(--chip)', border: '1px solid var(--line)',
            color: 'var(--ink-2)', fontSize: 14, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
          }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: '12px', borderRadius: 12, border: 'none',
            background: saving ? '#1a5cbf' : '#2E7BFF', color: '#fff',
            fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(46,123,255,0.30)',
          }}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
