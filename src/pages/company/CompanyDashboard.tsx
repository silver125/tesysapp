import { useState, type Dispatch, type SetStateAction } from 'react';
import Layout, { type NavItem } from '../../components/Layout';
import { openProfileSettings } from '../../lib/profileSettingsEvents';
import { useAuth } from '../../context/useAuth';
import {
  CompanyMark, Mono, Chip, ModalityBadge, WaIcon,
} from '../../components/ui';
import { buildWhatsappLink, categoryTint, companyInitials, companyTint } from '../../lib/uiHelpers';
import { MarketGrid, MarketCard, PhotoBadge, Sheet, Breadcrumb } from '../../components/market';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Event, Product, Course, CourseModality, Lead, Location, LocationType } from '../../types';

type Tab = 'home' | 'events' | 'create' | 'products' | 'courses' | 'leads' | 'locations';

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'ponto_venda',  label: 'Ponto de venda' },
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'clinica',      label: 'Clínica parceira' },
  { value: 'farmacia',     label: 'Farmácia' },
  { value: 'loja',         label: 'Loja' },
  { value: 'outro',        label: 'Outro' },
];

function locationTypeLabel(type: LocationType) {
  return LOCATION_TYPES.find(t => t.value === type)?.label ?? 'Local';
}

const EVENT_DATE_MIN = '2026-01-01';
const EVENT_DATE_MAX = '2030-12-31';
const OPPORTUNITY_IMAGE_BUCKET = 'opportunity-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isEventDateInAllowedRange(date: string) {
  return date >= EVENT_DATE_MIN && date <= EVENT_DATE_MAX;
}

function formatEventOccupancy(registered: number, total: number) {
  if (registered === 1) return `1 vaga de ${total} preenchida`;
  return `${registered} de ${total} vagas preenchidas`;
}

const MONTHS_PT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function parseLocalDate(date?: string) {
  if (!date) return null;
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function eventDateParts(date?: string) {
  const parsed = parseLocalDate(date);
  if (!parsed || Number.isNaN(parsed.getTime())) return { day: '--', month: 'DATA' };
  return {
    day: String(parsed.getDate()).padStart(2, '0'),
    month: MONTHS_PT[parsed.getMonth()] ?? 'DATA',
  };
}

function eventSchedule(ev: Event) {
  const parsed = parseLocalDate(ev.date);
  if (!parsed || Number.isNaN(parsed.getTime())) return 'Data a confirmar';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = MONTHS_PT[parsed.getMonth()] ?? '';
  const hour = ev.time ? ` • ${ev.time.replace(':', 'H')}` : '';
  return `${day} ${month}${hour}`;
}

function eventCity(location?: string) {
  const value = location?.trim();
  if (!value) return 'Local a confirmar';
  return value.split(',')[0]?.trim() || value;
}

function availableSpots(ev: Event) {
  return Math.max(0, ev.maxParticipants - ev.registeredCount);
}

function eventStatusLabel(ev: Event) {
  const parsed = parseLocalDate(ev.date);
  if (!parsed) return 'ATIVO';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime() < today.getTime() ? 'ENCERRADO' : 'ATIVO';
}

function visualImage(src?: string) {
  return src?.trim() || '';
}

function cardPhotoBackground(src?: string) {
  const url = visualImage(src);
  if (!url) {
    return 'linear-gradient(135deg, rgba(245,130,32,0.16), rgba(185,193,234,0.24))';
  }
  return `linear-gradient(135deg, rgba(18,24,40,0.42), rgba(245,130,32,0.20)), url(${url}) center/cover`;
}

async function uploadOpportunityImage(file: File, companyId: string, folder: 'events' | 'products' | 'courses') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado para upload de imagem.');
  }
  if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error('Envie uma imagem em PNG, JPG, WebP ou HEIC.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter até 5MB.');
  }

  const extFromName = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const extFromType = file.type.split('/')[1]?.replace('jpeg', 'jpg');
  const ext = extFromName || extFromType || 'jpg';
  const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  const path = `${companyId}/${folder}/${uniqueId}.${ext}`;
  const contentType = file.type || (ext === 'heic' || ext === 'heif' ? 'image/heic' : 'image/jpeg');
  const { error } = await supabase.storage
    .from(OPPORTUNITY_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(OPPORTUNITY_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function isMissingImageBucketError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.toLowerCase().includes('bucket not found')
    || message.toLowerCase().includes('bucket de imagens');
}

async function uploadOpportunityImageRequired(
  file: File | null,
  companyId: string,
  folder: 'events' | 'products' | 'courses',
) {
  if (!file) {
    throw new Error('Adicione uma foto — anúncios com imagem recebem muito mais contatos.');
  }
  try {
    const url = await uploadOpportunityImage(file, companyId, folder);
    if (!url?.trim()) {
      throw new Error('A foto não foi enviada. Tente novamente.');
    }
    return url;
  } catch (error) {
    if (isMissingImageBucketError(error)) {
      throw new Error(
        'Upload de imagens indisponível. Rode supabase/fix_course_images.sql no Supabase e tente de novo.',
      );
    }
    throw error instanceof Error ? error : new Error('Erro ao enviar imagem.');
  }
}

function leadDoctorKey(lead: Lead) {
  return lead.doctorId || `${safeDoctorName(lead.doctorName)}-${lead.doctorSpecialty ?? ''}`;
}

function safeDoctorName(name?: string | null) {
  return name?.trim() || 'Médico';
}

function leadIntentMeta(intent: Lead['intent'] | string | null | undefined) {
  const labels: Record<string, { label: string; color: string }> = {
    representative_contact: { label: 'Representante', color: 'var(--accent)' },
    sample_request: { label: 'Amostra', color: '#1EA97C' },
    instagram_partnership: { label: 'Instagram', color: '#E63E8C' },
    event_interest: { label: 'Evento', color: 'var(--accent-ink)' },
    course_interest: { label: 'Workshop', color: '#F58220' },
  };
  return labels[intent ?? ''] ?? { label: 'Interesse', color: 'var(--accent)' };
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
function IcoBook(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6"><path d="M3.5 16A2 2 0 015.5 14H17"/><path d="M5.5 1H17v17H5.5A2 2 0 013.5 16V3a2 2 0 012-2z"/></svg>;
}

function OpportunityIcon({ type }: { type: 'event' | 'product' | 'course' | 'partnership' | 'location' }) {
  const c = 'var(--accent)';
  if (type === 'event') return IcoCalendar(true);
  if (type === 'product') return IcoBox(true);
  if (type === 'course') return IcoBook(true);
  if (type === 'location') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.6">
        <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" strokeLinejoin="round" />
        <circle cx="10" cy="8" r="2.2" />
      </svg>
    );
  }
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" stroke={c} strokeWidth="1.6">
      <path d="M7.5 11.8l-1.2 1.2a3 3 0 01-4.2-4.2l2.4-2.4a3 3 0 014.2 0l.4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 9.2l1.2-1.2a3 3 0 014.2 4.2l-2.4 2.4a3 3 0 01-4.2 0l-.4-.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13l5-5" strokeLinecap="round" />
    </svg>
  );
}
function IcoSearch(a: boolean) {
  const c = a ? 'var(--accent)' : '#6F7A90';
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Início',   icon: IcoHome },
  { key: 'events',   label: 'Eventos',  icon: IcoCalendar },
  { key: 'create',   label: 'Comece por aqui', icon: () => null, big: true },
  { key: 'products', label: 'Produtos', icon: IcoBox },
  { key: 'leads',    label: 'Buscar',   icon: IcoSearch },
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

function dateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function courseDisplayDate(course: Course) {
  if (course.date) return course.date;
  const created = course.createdAt ? new Date(course.createdAt) : new Date();
  if (Number.isNaN(created.getTime())) return '';
  created.setDate(created.getDate() + 30);
  return dateToIso(created);
}

function modalityLabel(modality: CourseModality) {
  const labels: Record<CourseModality, string> = {
    online: 'Online',
    presencial: 'Presencial',
    hibrido: 'Híbrido',
  };
  return labels[modality] ?? modality;
}

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const CONNECTION_RANK: Record<NonNullable<Lead['connectionStatus']>, number> = {
  none: 0,
  requested: 1,
  approved: 2,
};

function latestLeadByDoctor(leads: Lead[]) {
  const ordered = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const byDoctor = new Map<string, Lead>();

  // Mantém o lead mais recente por médico, mas preserva o status de conexão
  // mais forte (e o WhatsApp liberado) que ele já tenha em qualquer interesse.
  for (const lead of ordered) {
    const doctorKey = leadDoctorKey(lead);
    const current = byDoctor.get(doctorKey);
    if (!current) {
      byDoctor.set(doctorKey, lead);
      continue;
    }
    const bestStatus = CONNECTION_RANK[lead.connectionStatus ?? 'none'] > CONNECTION_RANK[current.connectionStatus ?? 'none']
      ? lead.connectionStatus
      : current.connectionStatus;
    byDoctor.set(doctorKey, {
      ...current,
      connectionStatus: bestStatus,
      doctorWhatsapp: current.doctorWhatsapp || lead.doctorWhatsapp,
      doctorAvatarUrl: current.doctorAvatarUrl || lead.doctorAvatarUrl,
    });
  }

  return [...byDoctor.values()];
}

function eventLeadDoctorCount(event: Event, leads: Lead[]) {
  const doctors = new Set<string>();

  leads.forEach(lead => {
    if (lead.itemType !== 'event' || lead.intent !== 'event_interest') return;
    const sameEvent = lead.itemId === event.id || lead.itemName === event.title;
    if (!sameEvent) return;
    doctors.add(leadDoctorKey(lead));
  });

  return doctors.size;
}

export default function CompanyDashboard() {
  const { user, events, products, courses, leads, locations, addEvent, addProduct, addCourse, addLocation, deleteLocation, deleteEvent, deleteProduct, deleteCourse, updateEvent, requestConnection } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [createKind, setCreateKind] = useState<'event' | 'product' | 'course'>('event');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const companyLeads = (leads ?? []).filter(l => l.companyId === user?.id);
  const myEvents = (events ?? [])
    .filter(e => e.companyId === user?.id)
    .map(event => {
      const leadCount = eventLeadDoctorCount(event, companyLeads);
      const registeredCount = Math.max(event.registeredCount, leadCount);
      return registeredCount === event.registeredCount ? event : { ...event, registeredCount };
    });
  const myProducts = (products ?? []).filter(p => p.companyId === user?.id);
  const myCourses  = (courses ?? []).filter(c => c.companyId === user?.id);
  const myLocations = (locations ?? []).filter(l => l.companyId === user?.id);
  const eventById = new Map(myEvents.map(event => [event.id, event]));
  const eventByName = new Map(myEvents.map(event => [event.title, event]));
  const activeLeads = companyLeads.filter(lead => {
    if (lead.itemType !== 'event' || lead.intent !== 'event_interest') return true;
    const event = (lead.itemId ? eventById.get(lead.itemId) : undefined) ?? eventByName.get(lead.itemName);
    return Boolean(event);
  });
  const myLeads = latestLeadByDoctor(activeLeads);
  const tint = companyTint(user?.company ?? user?.name ?? '');
  const code = companyInitials(user?.company ?? user?.name ?? 'EM');
  const [createSkipType, setCreateSkipType] = useState(false);
  const companyInfo = { id: user?.id ?? '', name: user?.company ?? user?.name ?? '', whatsapp: user?.whatsapp };
  const activeOpportunities = myEvents.length + myProducts.length + myCourses.length;
  const conversationsStarted = myLeads.filter(lead => lead.connectionStatus === 'requested' || lead.connectionStatus === 'approved').length;
  const suggestedDoctors = myLeads.slice(0, 4);

  function goTab(k: string) {
    if (k === 'create') {
      setCreateSkipType(false);
      setTab('create');
      return;
    }
    setTab(k as Tab);
  }

  function openCreate(target: 'event' | 'product' | 'course' | 'location') {
    if (target === 'location') { setTab('locations'); return; }
    setCreateKind(target);
    setCreateSkipType(true);
    setTab('create');
  }

  async function handleDeleteItem(
    kind: 'event' | 'product' | 'course',
    id: string,
    close: () => void,
  ) {
    setDeleteError('');
    setDeletingId(id);
    try {
      if (kind === 'event') await deleteEvent(id);
      if (kind === 'product') await deleteProduct(id);
      if (kind === 'course') await deleteCourse(id);
      close();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir.');
    } finally {
      setDeletingId(null);
    }
  }

  function shareEvent(ev: Event) {
    const text = `${ev.title} · ${eventSchedule(ev)} · ${eventCity(ev.location)}`;
    const url = ev.website ?? (typeof window !== 'undefined' ? window.location.origin : '');
    const nav = typeof navigator !== 'undefined'
      ? navigator as Navigator & { share?: (data: ShareData) => Promise<void>; clipboard?: Clipboard }
      : undefined;
    if (nav?.share) {
      nav.share({ title: ev.title, text, url }).catch(() => undefined);
      return;
    }
    if (nav?.clipboard) {
      nav.clipboard.writeText(`${text}${url ? `\n${url}` : ''}`).catch(() => undefined);
    }
  }

  const editingEvent = events.find(e => e.id === editingEventId) ?? null;

  return (
    <>
    <Layout navItems={NAV_ITEMS} activeKey={tab} onNavChange={goTab}>

      {/* ── HOME ── */}
      {tab === 'home' && (
        <div>
          {/* Welcome hero */}
          <div style={{
            marginBottom: 12,
            padding: '14px 14px 12px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, #F58220 0%, #FF9A4D 52%, #FFB366 100%)',
            boxShadow: '0 16px 40px rgba(245,130,32,0.28)',
            color: '#fff',
          }}>
            <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Vitrine comercial Tessy
            </Mono>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 620, lineHeight: 1.15, letterSpacing: -0.2 }}>
              Sua marca na mão de médicos qualificados
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.92)' }}>
              {activeOpportunities === 0
                ? 'Publique eventos, produtos ou workshops e receba interesses reais.'
                : `${activeOpportunities} oportunidade${activeOpportunities === 1 ? '' : 's'} ativa${activeOpportunities === 1 ? '' : 's'} · ${myLeads.length} médico${myLeads.length === 1 ? '' : 's'} interessado${myLeads.length === 1 ? '' : 's'}`}
            </p>
            <button
              onClick={() => openCreate('product')}
              style={{
                marginTop: 14,
                padding: '10px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 620,
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(80,40,0,0.14)',
              }}
            >
              {activeOpportunities === 0 ? 'Publicar primeira oportunidade →' : 'Publicar nova oportunidade →'}
            </button>
          </div>

          {/* Company header */}
          <div style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,247,240,0.88))',
            border: '1px solid rgba(245,130,32,0.12)',
            boxShadow: '0 12px 34px rgba(85,96,130,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <CompanyMark code={code} tint={tint} size={60} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Mono style={{ display: 'block', fontSize: 8.5, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>
                  Perfil comercial
                </Mono>
                <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: 0, lineHeight: 1.08 }}>
                  {user?.company ?? user?.name}<span style={{ color: 'var(--accent)' }}>.</span>
                </h1>
                <p style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                  Perfil visível para médicos na vitrine Tessy
                </p>
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
              <button
                onClick={() => openProfileSettings()}
                title="Editar perfil"
                style={{
                  width: 38, height: 38, borderRadius: 13, flexShrink: 0,
                  background: '#fff', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--muted)',
                  boxShadow: '0 8px 18px rgba(80,90,120,0.07)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.5 1.5L13.5 4.5L5 13H2V10L10.5 1.5Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="tessy-stat-grid" style={{ marginBottom: 14 }}>
            {[
              { v: activeOpportunities, l: 'oportunidades', go: 'events' as Tab, accent: true },
              { v: myLeads.length, l: 'interessados', go: 'leads' as Tab, accent: myLeads.length > 0 },
              { v: conversationsStarted, l: 'conversas', go: 'leads' as Tab, accent: conversationsStarted > 0 },
            ].map((s) => (
              <button key={s.l} onClick={() => setTab(s.go)} style={{
                minHeight: 74,
                textAlign: 'left',
                padding: '10px 8px',
                borderRadius: 16,
                border: s.accent ? '1px solid rgba(245,130,32,0.22)' : '1px solid var(--line)',
                background: s.accent
                  ? 'linear-gradient(135deg, rgba(245,130,32,0.14), rgba(255,255,255,0.92))'
                  : 'rgba(255,255,255,0.84)',
                cursor: 'pointer',
                boxShadow: s.accent ? '0 10px 26px rgba(245,130,32,0.10)' : '0 8px 22px rgba(85,96,130,0.05)',
              }}>
                <div style={{ fontSize: 24, fontWeight: 620, color: s.accent ? 'var(--accent-ink)' : 'var(--ink)', letterSpacing: 0, lineHeight: 1 }}>{s.v}</div>
                <Mono style={{ display: 'block', marginTop: 6, fontSize: 8, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>{s.l}</Mono>
              </button>
            ))}
          </div>

          {/* Quick create */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <Mono style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Comece por aqui
                </Mono>
                <div style={{ fontSize: 18, fontWeight: 560, color: 'var(--ink)', lineHeight: 1.15 }}>
                  O que sua empresa quer divulgar hoje?
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { key: 'event', target: 'event', label: 'Evento', desc: 'Congressos e encontros' },
                { key: 'product', target: 'product', label: 'Produto', desc: 'Tecnologia e materiais' },
                { key: 'course', target: 'course', label: 'Workshop', desc: 'Capacitações médicas' },
                { key: 'partnership', target: 'product', label: 'Parceria', desc: 'Relacionamento comercial' },
                { key: 'location', target: 'location', label: 'Local', desc: 'Pontos de atendimento' },
              ].map(item => {
                const key = item.key as 'event' | 'product' | 'course' | 'partnership' | 'location';
                const target = item.target as 'event' | 'product' | 'course' | 'location';
                return (
                  <button key={key} onClick={() => openCreate(target)} style={{
                    padding: '12px 10px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.92)', border: '1px solid var(--line)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
                    textAlign: 'left',
                    boxShadow: '0 8px 20px rgba(85,96,130,0.04)',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: 'rgba(245,130,32,0.10)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <OpportunityIcon type={key} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 620, color: 'var(--ink)', lineHeight: 1.2 }}>{item.label}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.2 }}>{item.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo emphasis banner */}
          <div style={{
            marginBottom: 18,
            padding: '12px 14px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(245,130,32,0.10), rgba(255,255,255,0.92))',
            border: '1px solid rgba(245,130,32,0.20)',
            display: 'flex', alignItems: 'center', gap: 11,
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>📸</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--accent-ink)' }}>
                Anúncios com foto recebem muito mais contatos
              </div>
              <div style={{ marginTop: 2, fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                Toda publicação na vitrine pede uma imagem — capriche na primeira foto.
              </div>
            </div>
          </div>

          {/* Leads access */}
          <button
            onClick={() => setTab('leads')}
            style={{
              width: '100%',
              marginBottom: 24,
              padding: 15,
              borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(245,130,32,0.16), rgba(255,112,81,0.12))',
              border: '1px solid rgba(245,130,32,0.22)',
              boxShadow: '0 14px 36px rgba(85,96,130,0.08)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ minWidth: 0, display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <Mono style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  Ponte comercial
                </Mono>
                <div style={{ marginTop: 8, fontSize: 19, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.16 }}>
                  {myLeads.length} {myLeads.length === 1 ? 'médico interessado' : 'médicos interessados'}
                </div>
                <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                  Veja os perfis e inicie uma conversa pelo WhatsApp.
                </div>
              </div>
              <div style={{
                minWidth: 40,
                height: 40,
                borderRadius: 13,
                background: 'var(--card)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 560,
                boxShadow: '0 8px 22px rgba(80,100,150,0.08)',
              }}>
                {myLeads.length}
              </div>
            </div>
            <span style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px 14px',
              borderRadius: 12,
              background: myLeads.length > 0 ? 'var(--ink)' : 'var(--accent)',
              color: '#fff',
              fontSize: 12.5,
              fontWeight: 560,
            }}>
              {myLeads.length > 0 ? 'Ver médicos →' : 'Aguardando interesses'}
            </span>
          </button>

          {/* Suggested doctors */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle title="Médicos para sua empresa conhecer" />
            {suggestedDoctors.length === 0 ? (
              <div style={{
                padding: 16,
                borderRadius: 18,
                background: 'var(--card)',
                border: '1px solid var(--line)',
              }}>
                <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 560 }}>Ainda sem médicos sugeridos.</div>
                <p style={{ margin: '5px 0 0', fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>
                  Publique uma oportunidade para a Tessy aproximar médicos com interesse real.
                </p>
                <button
                  onClick={() => openCreate('event')}
                  style={{
                    marginTop: 12,
                    padding: '9px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 12.5,
                    fontWeight: 620,
                    cursor: 'pointer',
                  }}
                >
                  Criar primeiro evento →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
                {suggestedDoctors.map(lead => (
                  <DoctorSuggestionCard key={lead.id} lead={lead} onRequestConnection={requestConnection} />
                ))}
              </div>
            )}
          </div>

          {/* Tessy suggestions */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle title="Sugestões da Tessy" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { text: 'Publique um produto para aumentar sua visibilidade na vitrine.', cta: 'Criar produto', action: () => openCreate('product') },
                { text: 'Complete seu perfil com WhatsApp para médicos iniciarem conversa.', cta: 'Editar perfil', action: () => openProfileSettings() },
                { text: 'Convide médicos interessados para o seu próximo evento.', cta: 'Criar evento', action: () => openCreate('event') },
              ].map(item => (
                <button key={item.text} onClick={item.action} style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <span style={{ color: 'var(--ink-2)', fontSize: 12.5, lineHeight: 1.35 }}>{item.text}</span>
                  <span style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 620,
                    color: 'var(--accent)',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.cta} →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent events timeline */}
          {myEvents.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 560 }}>Meus eventos</span>
                <button onClick={() => setTab('events')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>ver todos →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myEvents.slice(0, 3).map(e => (
                  <EventRowCompany
                    key={e.id}
                    ev={e}
                    interestedCount={eventLeadDoctorCount(e, companyLeads)}
                    onViewInterested={() => setTab('leads')}
                    onShare={() => shareEvent(e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Workshops list access */}
          {myCourses.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 560 }}>Meus workshops</span>
                <button onClick={() => setTab('courses')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>ver todos →</button>
              </div>
              <MarketGrid>
                {myCourses.slice(0, 4).map(c => (
                  <CourseCompactCard key={c.id} course={c} onOpen={() => setOpenCourseId(c.id)} />
                ))}
              </MarketGrid>
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <>
        <Breadcrumb items={['início', 'eventos']} />
        <ListTab
          title="Meus eventos"
          onAdd={() => openCreate('event')}
          empty={myEvents.length === 0}
          emptyText="Nenhum evento criado ainda."
          grid
        >
          {myEvents.map(e => (
            <EventCompactCard
              key={e.id}
              ev={e}
              interestedCount={eventLeadDoctorCount(e, companyLeads)}
              onOpen={() => setOpenEventId(e.id)}
            />
          ))}
        </ListTab>
        </>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <>
        <Breadcrumb items={['início', 'produtos']} />
        <ListTab
          title="Meus produtos"
          onAdd={() => openCreate('product')}
          empty={myProducts.length === 0}
          emptyText="Nenhum produto criado ainda."
          grid
        >
          {myProducts.map(p => <ProductCompactCard key={p.id} product={p} onOpen={() => setOpenProductId(p.id)} />)}
        </ListTab>
        </>
      )}

      {/* ── COURSES ── */}
      {tab === 'courses' && (
        <>
        <Breadcrumb items={['início', 'workshops']} />
        <ListTab
          title="Minhas capacitações"
          onAdd={() => openCreate('course')}
          empty={myCourses.length === 0}
          emptyText="Nenhuma capacitação criada ainda."
          grid
        >
          {myCourses.map(c => <CourseCompactCard key={c.id} course={c} onOpen={() => setOpenCourseId(c.id)} />)}
        </ListTab>
        </>
      )}

      {/* ── LEADS ── */}
      {tab === 'leads' && (
        <LeadInbox
          leads={myLeads}
          onRequestConnection={requestConnection}
          onStartPublishing={() => openCreate('product')}
        />
      )}

      {/* ── LOCATIONS ── */}
      {tab === 'locations' && (
        <LocationsManager
          locations={myLocations}
          company={companyInfo}
          onAdd={addLocation}
          onDelete={deleteLocation}
        />
      )}

      {/* ── CREATE WIZARD ── */}
      {tab === 'create' && (
        <CreateWizard
          key={`${createKind}-${createSkipType ? 'direct' : 'menu'}`}
          kind={createKind}
          setKind={setCreateKind}
          skipTypeStep={createSkipType}
          company={companyInfo}
          onSaveEvent={async data => { await addEvent(data); setCreateSkipType(false); setTab('events'); }}
          onSaveProduct={async data => { await addProduct(data); setCreateSkipType(false); setTab('products'); }}
          onSaveCourse={async data => { await addCourse(data); setCreateSkipType(false); setTab('courses'); }}
          onCancel={() => { setCreateSkipType(false); setTab('home'); }}
        />
      )}
    </Layout>

    {deleteError && (
      <div style={{
        position: 'fixed',
        left: '50%',
        bottom: 96,
        transform: 'translateX(-50%)',
        zIndex: 130,
        width: 'min(440px, calc(100vw - 28px))',
        padding: '11px 14px',
        borderRadius: 14,
        background: 'rgba(242,92,84,0.96)',
        color: '#fff',
        fontSize: 12.5,
        lineHeight: 1.4,
        boxShadow: '0 14px 36px rgba(80,40,40,0.22)',
      }}>
        {deleteError}
      </div>
    )}

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

    {/* ── MANAGE SHEETS (vitrine) ── */}
    <Sheet open={openEventId !== null} onClose={() => setOpenEventId(null)}>
      {(() => {
        const ev = events.find(e => e.id === openEventId);
        if (!ev) return null;
        return (
          <div style={{ padding: '4px 16px 8px' }}>
            <EventCardCompany
              ev={ev}
              interestedCount={eventLeadDoctorCount(ev, companyLeads)}
              onViewInterested={() => { setOpenEventId(null); setTab('leads'); }}
              onEdit={() => { setOpenEventId(null); setEditingEventId(ev.id); }}
              onShare={() => shareEvent(ev)}
              onDelete={() => { void handleDeleteItem('event', ev.id, () => setOpenEventId(null)); }}
            />
          </div>
        );
      })()}
    </Sheet>

    <Sheet open={openProductId !== null} onClose={() => setOpenProductId(null)}>
      {(() => {
        const p = products.find(x => x.id === openProductId);
        if (!p) return null;
        return (
          <div style={{ padding: '4px 16px 8px' }}>
            <ProductCardCompany
              product={p}
              deleting={deletingId === p.id}
              onDelete={() => { void handleDeleteItem('product', p.id, () => setOpenProductId(null)); }}
            />
          </div>
        );
      })()}
    </Sheet>

    <Sheet open={openCourseId !== null} onClose={() => setOpenCourseId(null)}>
      {(() => {
        const c = courses.find(x => x.id === openCourseId);
        if (!c) return null;
        return (
          <div style={{ padding: '4px 16px 8px' }}>
            <CourseCardCompany
              course={c}
              deleting={deletingId === c.id}
              onDelete={() => { void handleDeleteItem('course', c.id, () => setOpenCourseId(null)); }}
            />
          </div>
        );
      })()}
    </Sheet>
    </>
  );
}

/* ─── Create wizard ─── */
function CreateWizard({ kind, setKind, skipTypeStep, company, onSaveEvent, onSaveProduct, onSaveCourse, onCancel }: {
  kind: 'event' | 'product' | 'course';
  setKind: (k: 'event' | 'product' | 'course') => void;
  skipTypeStep?: boolean;
  company: { id: string; name: string; whatsapp?: string };
  onSaveEvent: (e: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  onSaveProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onSaveCourse: (c: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(skipTypeStep ? 1 : 0);
  const [selectedChoice, setSelectedChoice] = useState<'event' | 'product' | 'course' | 'partnership'>(kind);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Event state
  const [ev, setEv] = useState({ title: '', description: '', date: dateInDays(30), time: '19:00', location: '', category: EVENT_CATS[1], maxParticipants: '100', website: '' });
  const [evImage, setEvImage] = useState<{ file: File | null; preview: string }>({ file: null, preview: '' });
  // Product state
  const [pr, setPr] = useState({
    name: '',
    description: '',
    category: PRODUCT_CATS[0],
    availableFor: 'Representante envia amostra, materiais e condições comerciais para médicos interessados.',
    price: 'Parceria sob consulta',
    website: '',
  });
  const [prImage, setPrImage] = useState<{ file: File | null; preview: string }>({ file: null, preview: '' });
  // Course state
  const [co, setCo] = useState({
    title: '',
    description: '',
    instructor: '',
    category: COURSE_CATS[0],
    modality: 'presencial' as CourseModality,
    date: dateInDays(30),
    time: '19:00',
    location: '',
    duration: '',
    price: '',
    website: '',
  });
  const [coImage, setCoImage] = useState<{ file: File | null; preview: string }>({ file: null, preview: '' });
  const [anvisaConfirmed, setAnvisaConfirmed] = useState(false);
  const [commercialConfirmed, setCommercialConfirmed] = useState(false);
  const [partnershipConfirmed, setPartnershipConfirmed] = useState(false);

  const isPartnership = selectedChoice === 'partnership';

  const totalSteps = skipTypeStep ? 1 : 2;

  // Validate required fields before advancing / finishing
  function validate(): string {
    if (step === 0) return '';
    if (kind === 'event') {
      if (!company.name.trim()) return 'Complete o nome da empresa no perfil antes de publicar.';
      if (!evImage.file) return 'Adicione uma foto de capa — anúncios com foto recebem muito mais contatos.';
      if (!ev.title.trim()) return 'Informe o título do evento.';
      if (!ev.date) return 'Selecione a data do evento.';
      if (!isEventDateInAllowedRange(ev.date)) return 'Selecione uma data entre 2026 e 2030.';
      if (!ev.location.trim()) return 'Informe o local do evento.';
    }
    if (kind === 'product') {
      if (!company.name.trim()) return 'Complete o nome da empresa no perfil antes de publicar.';
      if (!prImage.file) return 'Adicione uma foto do produto — anúncios com foto recebem muito mais contatos.';
      if (!pr.name.trim()) return 'Informe o nome do produto.';
      if (isPartnership && !partnershipConfirmed) return 'Confirme a autorização para divulgar esta parceria.';
      if (!isPartnership && !anvisaConfirmed) return 'Confirme a regularização vigente na Anvisa.';
      if (!isPartnership && !commercialConfirmed) return 'Confirme a disponibilidade comercial do produto.';
    }
    if (kind === 'course') {
      if (!company.name.trim()) return 'Complete o nome da empresa no perfil antes de publicar.';
      if (!coImage.file) return 'Adicione uma imagem — anúncios com foto recebem muito mais contatos.';
      if (!co.title.trim()) return 'Informe o título da capacitação.';
      if (!co.instructor.trim()) return 'Informe o nome do instrutor.';
      if (!co.date) return 'Selecione a data.';
      if (!co.location.trim()) return 'Informe o local ou cidade.';
      if (!co.duration.trim()) return 'Informe a duração da capacitação.';
    }
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setSaveError(err); return; }
    setSaveError('');
    setStep(s => s + 1);
  }

  function setImageDraft(
    setter: Dispatch<SetStateAction<{ file: File | null; preview: string }>>,
    file: File | null,
  ) {
    setter(prev => {
      if (prev.preview.startsWith('blob:')) URL.revokeObjectURL(prev.preview);
      return {
        file,
        preview: file ? URL.createObjectURL(file) : '',
      };
    });
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
        const imageUrl = await uploadOpportunityImageRequired(evImage.file, company.id, 'events');
        await onSaveEvent({
          ...ev,
          maxParticipants: Number(ev.maxParticipants) || 100,
          website: normalizeUrl(ev.website),
          imageUrl,
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      } else if (kind === 'product') {
        const imageUrl = await uploadOpportunityImageRequired(prImage.file, company.id, 'products');
        await onSaveProduct({
          ...pr,
          website: normalizeUrl(pr.website),
          imageUrl,
          listingType: isPartnership ? 'partnership' : 'product',
          anvisaRegularized: isPartnership ? true : anvisaConfirmed,
          commerciallyAvailable: isPartnership ? true : commercialConfirmed,
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      } else {
        const imageUrl = await uploadOpportunityImageRequired(coImage.file, company.id, 'courses');
        await onSaveCourse({
          ...co,
          website: normalizeUrl(co.website),
          imageUrl,
          companyId: company.id, companyName: company.name, companyWhatsapp: company.whatsapp,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      setSaveError(`Erro ao publicar: ${msg}`);
    } finally {
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
          {skipTypeStep
            ? `publicar ${kind === 'event' ? 'evento' : kind === 'product' ? 'produto' : 'workshop'}`
            : `novo ${kind === 'event' ? 'evento' : kind === 'product' ? 'produto' : 'workshop'} · etapa ${step + 1} de ${totalSteps}`}
        </Mono>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress */}
      <div className="tessy-wizard-progress">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step 0: choose kind */}
      {step === 0 && (
        <div>
          <h2 className="tessy-page-title" style={{ marginBottom: 8 }}>
            O que você quer criar<span style={{ color: 'var(--accent)' }}>?</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            Médicos verão no app deles imediatamente.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'event', target: 'event', title: 'Evento', desc: 'Congresso, workshop, webinar' },
              { id: 'product', target: 'product', title: 'Produto', desc: 'Produto, tecnologia ou material científico' },
              { id: 'course', target: 'course', title: 'Workshop', desc: 'Eventos e capacitações médicas' },
              { id: 'partnership', target: 'product', title: 'Parceria', desc: 'Divulgação, relacionamento ou ação comercial' },
            ].map(option => {
              const id = option.id as 'event' | 'product' | 'course' | 'partnership';
              const target = option.target as 'event' | 'product' | 'course';
              const selected = selectedChoice === id;
              return (
                <button key={id} onClick={() => {
                  setSelectedChoice(id);
                  setKind(target);
                  if (id === 'partnership') {
                    setPr(p => ({
                      ...p,
                      availableFor: 'Representante apresenta briefing, condições e proposta de parceria.',
                      price: 'Parceria sob consulta',
                    }));
                    setAnvisaConfirmed(false);
                    setCommercialConfirmed(false);
                    setPartnershipConfirmed(false);
                  } else if (target === 'product') {
                    setPartnershipConfirmed(false);
                  }
                  setSaveError('');
                  setStep(1);
                }} style={{
                  padding: '16px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                  background: selected ? 'rgba(245,130,32,0.10)' : 'var(--card)',
                  border: `2px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: selected ? 'rgba(245,130,32,0.14)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}><OpportunityIcon type={id} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 560, color: 'var(--ink)' }}>{option.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{option.desc}</div>
                  </div>
                  {selected && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Event — single screen */}
      {kind === 'event' && step === 1 && (
        <div>
          <h2 className="tessy-page-title" style={{ marginBottom: 8 }}>
            Publicar evento<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Foto + dados essenciais. Médicos veem na vitrine em segundos.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ImageUploadField
              label="FOTO DE CAPA"
              preview={evImage.preview}
              onChange={file => setImageDraft(setEvImage, file)}
            />
            <WField label="TÍTULO" value={ev.title} onChange={v => setEv(p => ({ ...p, title: v }))} placeholder="Ex: Simpósio de Cardiologia 2026" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="DATA" value={ev.date} onChange={v => setEv(p => ({ ...p, date: v }))} type="date" min={EVENT_DATE_MIN} max={EVENT_DATE_MAX} />
              <WField label="HORA" value={ev.time} onChange={v => setEv(p => ({ ...p, time: v }))} type="time" />
            </div>
            <WField label="LOCAL" value={ev.location} onChange={v => setEv(p => ({ ...p, location: v }))} placeholder="São Paulo, SP" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="CATEGORIA" value={ev.category} onChange={v => setEv(p => ({ ...p, category: v }))} as="select" options={EVENT_CATS} />
              <WField label="VAGAS" value={ev.maxParticipants} onChange={v => setEv(p => ({ ...p, maxParticipants: v }))} type="number" min="1" inputMode="numeric" />
            </div>
            <WField label="DESCRIÇÃO (opcional)" value={ev.description} onChange={v => setEv(p => ({ ...p, description: v }))} placeholder="Descreva o evento..." as="textarea" />
            <WField label="WEBSITE (opcional)" value={ev.website} onChange={v => setEv(p => ({ ...p, website: v }))} placeholder="www.seusite.com.br" type="url" />
          </div>
        </div>
      )}

      {/* Product — single screen */}
      {kind === 'product' && step === 1 && (
        <div>
          <h2 className="tessy-page-title" style={{ marginBottom: 8 }}>
            {isPartnership ? 'Parceria comercial' : 'Produto e representante'}<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 16 }}>
            {isPartnership
              ? 'Foto + proposta clara. Um toque para publicar.'
              : 'Foto + resumo. Médicos entram em contato direto.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ImageUploadField
              label={isPartnership ? 'FOTO DA PARCERIA' : 'FOTO DO PRODUTO'}
              preview={prImage.preview}
              onChange={file => setImageDraft(setPrImage, file)}
            />
            <WField label={isPartnership ? 'NOME DA PARCERIA' : 'NOME DO PRODUTO'} value={pr.name} onChange={v => setPr(p => ({ ...p, name: v }))} placeholder={isPartnership ? 'Ex: Parceria de divulgação científica' : 'Ex: SkinBiome Serum'} />
            <WField label="RESUMO (opcional)" value={pr.description} onChange={v => setPr(p => ({ ...p, description: v }))} placeholder="O que é, para quem é e por que vale uma conversa." as="textarea" />
            <WField label="CATEGORIA" value={pr.category} onChange={v => setPr(p => ({ ...p, category: v }))} as="select" options={PRODUCT_CATS} />
            <WField label="PRÓXIMO PASSO PARA O MÉDICO" value={pr.availableFor} onChange={v => setPr(p => ({ ...p, availableFor: v }))} placeholder="Ex: Solicitar amostra, falar com representante..." as="textarea" />
            <WField label="CONDIÇÕES (opcional)" value={pr.price} onChange={v => setPr(p => ({ ...p, price: v }))} placeholder="Ex: Sob consulta, parceria regional..." />
            <WField label="SITE (opcional)" value={pr.website} onChange={v => setPr(p => ({ ...p, website: v }))} placeholder="www.empresa.com.br/produto" type="url" />

            <div style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(245,130,32,0.06)',
              border: '1px solid rgba(245,130,32,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--accent-ink)' }}>
                {isPartnership ? 'Declaração comercial (obrigatória)' : 'Declaração regulatória (obrigatória)'}
              </div>
              {isPartnership ? (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={partnershipConfirmed}
                    onChange={e => setPartnershipConfirmed(e.target.checked)}
                    style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                    Confirmo autorização para <b>divulgar esta parceria comercial</b> a médicos no Tessy.
                  </span>
                </label>
              ) : (
                <>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={anvisaConfirmed}
                      onChange={e => setAnvisaConfirmed(e.target.checked)}
                      style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      Confirmo que o produto possui <b>regularização vigente na Anvisa</b> (ou categoria isenta aplicável).
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={commercialConfirmed}
                      onChange={e => setCommercialConfirmed(e.target.checked)}
                      style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      Confirmo a <b>disponibilidade comercial</b> do produto para divulgação a médicos.
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workshop — single screen */}
      {kind === 'course' && step === 1 && (
        <div>
          <h2 className="tessy-page-title" style={{ marginBottom: 8 }}>
            Publicar workshop<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Foto + agenda. Tudo em uma tela.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ImageUploadField
              label="FOTO DO WORKSHOP"
              preview={coImage.preview}
              onChange={file => setImageDraft(setCoImage, file)}
            />
            <WField label="TÍTULO" value={co.title} onChange={v => setCo(p => ({ ...p, title: v }))} placeholder="Ex: Atualização em ECG" />
            <WField label="INSTRUTOR" value={co.instructor} onChange={v => setCo(p => ({ ...p, instructor: v }))} placeholder="Dr. João Silva" />
            <div>
              <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>MODALIDADE</Mono>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {MODALITIES.map(m => (
                  <button key={m.value} onClick={() => setCo(p => ({ ...p, modality: m.value }))} style={{
                    padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                    background: co.modality === m.value ? 'rgba(245,130,32,0.10)' : 'var(--card)',
                    border: `1.5px solid ${co.modality === m.value ? 'var(--accent)' : 'var(--line)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: co.modality === m.value ? '#6FA4FF' : 'var(--ink-2)',
                  }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="DATA" value={co.date} onChange={v => setCo(p => ({ ...p, date: v }))} type="date" min={EVENT_DATE_MIN} max={EVENT_DATE_MAX} />
              <WField label="HORA" value={co.time} onChange={v => setCo(p => ({ ...p, time: v }))} type="time" />
            </div>
            <WField label="LOCAL / CIDADE" value={co.location} onChange={v => setCo(p => ({ ...p, location: v }))} placeholder={co.modality === 'online' ? 'Online' : 'São Paulo, SP'} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <WField label="DURAÇÃO" value={co.duration} onChange={v => setCo(p => ({ ...p, duration: v }))} placeholder="Ex: 4 horas" />
              <WField label="PREÇO (opcional)" value={co.price} onChange={v => setCo(p => ({ ...p, price: v }))} placeholder="R$ 490" />
            </div>
            <WField label="CATEGORIA" value={co.category} onChange={v => setCo(p => ({ ...p, category: v }))} as="select" options={COURSE_CATS} />
            <WField label="DESCRIÇÃO (opcional)" value={co.description} onChange={v => setCo(p => ({ ...p, description: v }))} placeholder="Descreva o workshop..." as="textarea" />
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
        {step > 0 && !skipTypeStep && (
          <button onClick={() => { setSaveError(''); setStep(s => s - 1); }} disabled={saving} style={{
            width: 52, height: 52, borderRadius: 14, border: '1px solid var(--line)',
            background: 'var(--card)', cursor: saving ? 'not-allowed' : 'pointer',
            color: 'var(--ink)', fontSize: 20, opacity: saving ? 0.5 : 1,
          }}>←</button>
        )}
        {step < totalSteps - 1 ? (
          <button onClick={handleNext} style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            fontSize: 15, fontWeight: 560,
            boxShadow: '0 6px 24px rgba(245,130,32,0.32)',
          }}>
            Continuar →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving} style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: saving ? '#1a5cbf' : 'var(--accent)', color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 560, opacity: saving ? 0.8 : 1,
            boxShadow: '0 6px 24px rgba(245,130,32,0.32)',
          }}>
            {saving
              ? 'Publicando...'
              : `Publicar ${isPartnership ? 'parceria' : kind === 'event' ? 'evento' : kind === 'product' ? 'produto' : 'capacitação'} ✓`}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── List tab wrapper ─── */
function ListTab({ title, onAdd, empty, emptyText, grid = false, children }: {
  title: string; onAdd: () => void; empty: boolean; emptyText: string; grid?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 560, letterSpacing: 0 }}>
          {title}<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <button onClick={onAdd} style={{
          padding: '8px 16px', borderRadius: 10, border: 'none',
          background: 'var(--accent)', color: '#fff', fontWeight: 560, fontSize: 13, cursor: 'pointer',
        }}>+ Novo</button>
      </div>
      {empty
        ? <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 14 }}>{emptyText}</div>
        : grid
          ? <MarketGrid>{children}</MarketGrid>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
      }
    </div>
  );
}

/* ─── Company view cards ─── */
function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <h2 style={{ fontSize: 16, fontWeight: 560, color: 'var(--ink)', letterSpacing: 0 }}>
        {title}<span style={{ color: 'var(--accent)' }}>.</span>
      </h2>
    </div>
  );
}

function EventRowCompany({ ev, interestedCount, onViewInterested, onShare }: {
  ev: Event;
  interestedCount: number;
  onViewInterested: () => void;
  onShare: () => void;
}) {
  const [tint1, tint2] = categoryTint(ev.category);
  const dateParts = eventDateParts(ev.date);
  const status = eventStatusLabel(ev);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '82px minmax(0, 1fr)',
      gap: 12,
      padding: 10,
      background: 'rgba(255,255,255,0.88)',
      borderRadius: 18,
      border: '1px solid var(--line)',
      boxShadow: '0 8px 22px rgba(85,96,130,0.05)',
    }}>
      <div style={{
        minHeight: 92,
        position: 'relative',
        flexShrink: 0,
        borderRadius: 15,
        overflow: 'hidden',
        background: cardPhotoBackground(ev.imageUrl),
      }}>
        <div style={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          width: 40,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${tint1}, ${tint2})`,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 22px rgba(15,22,38,0.18)',
        }}>
          <div style={{ fontSize: 8, fontWeight: 560 }}>{dateParts.month}</div>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1 }}>{dateParts.day}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.18 }}>{ev.title}</div>
          <Mono style={{ fontSize: 9, color: status === 'ATIVO' ? '#1EA97C' : 'var(--muted)', fontWeight: 560, flexShrink: 0 }}>✓ {status}</Mono>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          {eventCity(ev.location)} · {eventSchedule(ev)}
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip color="var(--accent)">{formatEventOccupancy(ev.registeredCount, ev.maxParticipants)}</Chip>
          <Chip color="#1EA97C">{availableSpots(ev)} disponíveis</Chip>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onViewInterested} style={{
            padding: '7px 9px',
            borderRadius: 10,
            background: 'var(--chip)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            fontSize: 11.5,
            fontWeight: 560,
            cursor: 'pointer',
          }}>
            {interestedCount} interessados
          </button>
          <button onClick={onShare} style={{
            padding: '7px 9px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--ink-2)',
            fontSize: 11.5,
            fontWeight: 560,
            cursor: 'pointer',
          }}>
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Compact vitrine cards (grid) ─── */
function EventCompactCard({ ev, interestedCount, onOpen }: {
  ev: Event; interestedCount: number; onOpen: () => void;
}) {
  const dateParts = eventDateParts(ev.date);
  return (
    <MarketCard
      image={visualImage(ev.imageUrl)}
      topLeft={<PhotoBadge color="var(--accent)">{dateParts.day} {dateParts.month}</PhotoBadge>}
      topRight={interestedCount > 0 ? <PhotoBadge color="#1EA97C">{interestedCount} interessados</PhotoBadge> : undefined}
      title={ev.title}
      subtitle={`${eventCity(ev.location)} · ${eventSchedule(ev)}`}
      tag={<Chip color="var(--accent-ink)">{ev.category}</Chip>}
      onClick={onOpen}
    />
  );
}

function ProductCompactCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <MarketCard
      image={visualImage(product.imageUrl)}
      topLeft={<PhotoBadge color="#25D366">Representante</PhotoBadge>}
      title={product.name}
      subtitle={product.description}
      tag={product.price ? <Chip color="#1EA97C">{product.price}</Chip> : <Chip color="var(--accent-ink)">{product.category}</Chip>}
      onClick={onOpen}
    />
  );
}

function CourseCompactCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  const displayDate = courseDisplayDate(course);
  return (
    <MarketCard
      image={visualImage(course.imageUrl)}
      topLeft={<PhotoBadge color="var(--accent)">{modalityLabel(course.modality)}</PhotoBadge>}
      title={course.title}
      subtitle={`${course.instructor}${displayDate ? ` · ${fmt(displayDate)}` : ''}`}
      tag={<Chip color="var(--accent-ink)">{course.category}</Chip>}
      onClick={onOpen}
    />
  );
}

function EventCardCompany({ ev, interestedCount, onDelete, onEdit, onViewInterested, onShare }: {
  ev: Event;
  interestedCount: number;
  onDelete: () => void;
  onEdit: () => void;
  onViewInterested: () => void;
  onShare: () => void;
}) {
  const [tint1, tint2] = categoryTint(ev.category);
  const dateParts = eventDateParts(ev.date);
  const status = eventStatusLabel(ev);
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{
        height: 72,
        padding: 12,
        background: cardPhotoBackground(ev.imageUrl),
      }}>
        <span style={{
          padding: '5px 9px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.88)',
          color: 'var(--ink)',
          fontSize: 10,
          fontWeight: 560,
        }}>
          {ev.category}
        </span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 48,
            height: 56,
            flexShrink: 0,
            borderRadius: 13,
            background: `linear-gradient(135deg, ${tint1}, ${tint2})`,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 560 }}>{dateParts.month}</div>
            <div style={{ fontSize: 20, fontWeight: 560, lineHeight: 1 }}>{dateParts.day}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Chip color={tint1}>{ev.category}</Chip>
            <div style={{ fontSize: 15, fontWeight: 560, marginTop: 8, color: 'var(--ink)' }}>{ev.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {eventCity(ev.location)} · {eventSchedule(ev)}
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip color="var(--accent)">{formatEventOccupancy(ev.registeredCount, ev.maxParticipants)}</Chip>
              <Chip color="#1EA97C">{availableSpots(ev)} vagas disponíveis</Chip>
              <Chip color="var(--accent-ink)">{interestedCount} médicos interessados</Chip>
              <Mono style={{ fontSize: 10, color: status === 'ATIVO' ? '#1EA97C' : 'var(--muted)', fontWeight: 560 }}>✓ {status}</Mono>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={onViewInterested} style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'var(--chip)',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 560,
                cursor: 'pointer',
              }}>Ver interessados</button>
              <button onClick={onEdit} style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid rgba(91,110,245,0.25)',
                background: 'rgba(91,110,245,0.10)',
                color: 'var(--accent)',
                fontSize: 12,
                fontWeight: 560,
                cursor: 'pointer',
              }}>Editar</button>
              <button onClick={onShare} style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--ink-2)',
                fontSize: 12,
                fontWeight: 560,
                cursor: 'pointer',
              }}>Compartilhar</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 10, flexShrink: 0 }}>
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

function DoctorSuggestionCard({ lead, onRequestConnection }: {
  lead: Lead;
  onRequestConnection: (leadId: string) => Promise<void>;
}) {
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const connectionStatus = lead.connectionStatus ?? 'none';
  const isApproved = connectionStatus === 'approved';
  const isRequested = connectionStatus === 'requested';
  const waLink = isApproved
    ? buildWhatsappLink(
      lead.doctorWhatsapp,
      `Olá ${safeDoctorName(lead.doctorName)}, vi seu interesse no Tessy sobre "${lead.itemName ?? 'sua solicitação'}". Posso te passar mais detalhes?`,
    )
    : '';

  async function handleConnect() {
    if (waLink) return;
    setRequesting(true);
    setRequestError('');
    try {
      await onRequestConnection(lead.id);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Erro ao solicitar conexão.');
    } finally {
      setRequesting(false);
    }
  }

  const buttonText = waLink
    ? 'Conectar no WhatsApp'
    : isRequested
      ? 'Aguardando aprovação'
      : requesting
        ? 'Solicitando...'
        : 'Solicitar conexão';

  const buttonStyle = {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: waLink ? '1px solid rgba(37,211,102,0.32)' : '1px solid var(--ink)',
    background: waLink ? 'rgba(37,211,102,0.12)' : 'var(--ink)',
    color: waLink ? '#25D366' : '#fff',
    fontSize: 12.5,
    fontWeight: 560,
    textDecoration: 'none',
    cursor: isRequested || requesting ? 'not-allowed' : 'pointer',
    opacity: isRequested || requesting ? 0.72 : 1,
    boxSizing: 'border-box',
  } as const;

  return (
    <div style={{
      minWidth: 226,
      maxWidth: 248,
      padding: 13,
      borderRadius: 20,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.84))',
      border: '1px solid rgba(216,222,236,0.92)',
      boxShadow: '0 10px 28px rgba(85,96,130,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 15,
          background: 'linear-gradient(135deg, #4AA8FF, #FF7051)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 560,
          flexShrink: 0,
        }}>
          {safeDoctorName(lead.doctorName).slice(0, 1).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 560, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {safeDoctorName(lead.doctorName)}
          </div>
          <div style={{ marginTop: 2, color: 'var(--muted)', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lead.doctorSpecialty || 'Especialidade não informada'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 11, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip color="var(--accent)">Perfil médico</Chip>
        <Chip color="#1EA97C">{lead.itemType === 'event' ? 'Evento' : lead.itemType === 'product' ? 'Produto' : lead.itemType === 'course' ? 'Workshop' : 'Empresa'}</Chip>
      </div>
      <p style={{ margin: '10px 0 0', color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.38 }}>
        Interesse em {lead.itemName || 'sua solicitação'}.
      </p>
      {requestError && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: '#F25C54', lineHeight: 1.35 }}>{requestError}</div>
      )}
      {waLink ? (
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
          <WaIcon size={14} /> {buttonText}
        </a>
      ) : (
        <button type="button" onClick={handleConnect} disabled={isRequested || requesting} style={buttonStyle}>
          <WaIcon size={14} /> {buttonText}
        </button>
      )}
    </div>
  );
}

function LeadInbox({ leads, onRequestConnection, onStartPublishing }: {
  leads: Lead[];
  onRequestConnection: (leadId: string) => Promise<void>;
  onStartPublishing?: () => void;
}) {
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState('');
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const q = search.trim().toLowerCase();
  const specialties = [...new Set(leads.map(l => l.doctorSpecialty?.trim()).filter(Boolean))] as string[];
  const specialtyChips: [string, string][] = [['all', 'Todas'], ...specialties.slice(0, 6).map(s => [s.toLowerCase(), s] as [string, string])];
  const intentChips: [string, string][] = [
    ['all', 'Todos'],
    ['representative_contact', 'Representante'],
    ['sample_request', 'Amostra'],
    ['event_interest', 'Evento'],
    ['course_interest', 'Workshop'],
  ];

  const filteredLeads = leads.filter(lead => {
    const matchQ = !q
      || safeDoctorName(lead.doctorName).toLowerCase().includes(q)
      || (lead.doctorSpecialty ?? '').toLowerCase().includes(q)
      || (lead.itemName ?? '').toLowerCase().includes(q);
    const matchIntent = intentFilter === 'all' || lead.intent === intentFilter;
    const matchSpec = specialtyFilter === 'all' || (lead.doctorSpecialty ?? '').toLowerCase() === specialtyFilter;
    return matchQ && matchIntent && matchSpec;
  });

  async function requestDoctorConnection(leadId: string) {
    setRequestingId(leadId);
    setRequestError('');
    try {
      await onRequestConnection(leadId);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Erro ao solicitar conexão.');
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Ponte comercial
        </Mono>
        <h1 style={{ marginTop: 8, fontSize: 26, fontWeight: 560, letterSpacing: 0 }}>
          Buscar médicos<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ marginTop: 6, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45 }}>
          Filtre por especialidade, intenção e nome. Perfis que demonstraram interesse comercial.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="7" cy="7" r="5.5"/><path d="M11 11l3.5 3.5" strokeLinecap="round"/>
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar médico, especialidade ou oportunidade..."
          style={{
            width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
            borderRadius: 999, background: '#fff', border: '1px solid rgba(216,222,236,0.92)',
            color: 'var(--ink)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
        {intentChips.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setIntentFilter(key)} style={{
            flexShrink: 0,
            padding: '8px 12px',
            borderRadius: 999,
            border: `1px solid ${intentFilter === key ? 'var(--accent)' : 'var(--line)'}`,
            background: intentFilter === key ? 'rgba(245,130,32,0.10)' : '#fff',
            color: intentFilter === key ? 'var(--accent-ink)' : 'var(--ink-2)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
        {specialtyChips.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setSpecialtyFilter(key)} style={{
            flexShrink: 0,
            padding: '8px 12px',
            borderRadius: 999,
            border: `1px solid ${specialtyFilter === key ? '#4AA8FF' : 'var(--line)'}`,
            background: specialtyFilter === key ? 'rgba(74,168,255,0.10)' : '#fff',
            color: specialtyFilter === key ? '#4AA8FF' : 'var(--ink-2)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {leads.length === 0 ? (
        <div style={{
          padding: 24,
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(245,130,32,0.08), rgba(255,255,255,0.96))',
          border: '1px solid rgba(245,130,32,0.16)',
        }}>
          <div style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 560 }}>Nenhum médico interessado ainda.</div>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Quando um médico demonstrar interesse em evento, produto ou representante, ele aparecerá aqui para você iniciar a conversa.
          </p>
          {onStartPublishing && (
            <button
              type="button"
              onClick={onStartPublishing}
              style={{
                marginTop: 14,
                padding: '10px 16px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 620,
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(245,130,32,0.24)',
              }}
            >
              Publicar oportunidade →
            </button>
          )}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{ padding: 20, borderRadius: 18, background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 13 }}>
          Nenhum médico encontrado com esses filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requestError && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(242,92,84,0.08)',
              border: '1px solid rgba(242,92,84,0.18)',
              color: '#F25C54',
              fontSize: 12,
              lineHeight: 1.4,
            }}>
              {requestError}
            </div>
          )}
          {filteredLeads.map(lead => {
            const intent = leadIntentMeta(lead.intent);
            const connectionStatus = lead.connectionStatus ?? 'none';
            const isApproved = connectionStatus === 'approved';
            const isRequested = connectionStatus === 'requested';
            const waLink = isApproved
              ? buildWhatsappLink(
                lead.doctorWhatsapp,
                `Olá ${safeDoctorName(lead.doctorName)}, vi seu interesse no Tessy sobre "${lead.itemName ?? 'sua solicitação'}". Posso te passar mais detalhes?`,
              )
              : '';
            return (
              <div key={lead.id} style={{
                padding: 16,
                borderRadius: 18,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: '0 2px 10px rgba(90,80,130,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: lead.doctorAvatarUrl
                        ? `url(${lead.doctorAvatarUrl}) center/cover`
                        : 'linear-gradient(135deg, #4AA8FF, #FF7051)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 620,
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {!lead.doctorAvatarUrl && safeDoctorName(lead.doctorName).slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Chip color={intent.color}>{intent.label}</Chip>
                      <div style={{ marginTop: 10, fontSize: 16, color: 'var(--ink)', fontWeight: 560 }}>
                        {safeDoctorName(lead.doctorName)}
                      </div>
                      <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12 }}>
                        {lead.doctorSpecialty || 'Especialidade não informada'}
                      </div>
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
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 560 }}>{lead.itemName}</div>
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
                    fontWeight: 560,
                  }}>
                    <WaIcon size={14} /> Falar no WhatsApp
                  </a>
                ) : isApproved ? (
                  <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12 }}>
                    WhatsApp ainda não informado.
                  </div>
                ) : isRequested ? (
                  <div style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '11px 12px',
                    borderRadius: 12,
                    background: 'var(--chip)',
                    color: 'var(--ink-2)',
                    border: '1px solid var(--line)',
                    fontSize: 13,
                    fontWeight: 560,
                  }}>
                    Aguardando aprovação
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={requestingId === lead.id}
                    onClick={() => { void requestDoctorConnection(lead.id); }}
                    style={{
                      marginTop: 12,
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: 12,
                      background: 'var(--ink)',
                      color: '#fff',
                      border: '1px solid var(--ink)',
                      fontSize: 13,
                      fontWeight: 560,
                      cursor: requestingId === lead.id ? 'not-allowed' : 'pointer',
                      opacity: requestingId === lead.id ? 0.72 : 1,
                    }}
                  >
                    {requestingId === lead.id ? 'Solicitando...' : 'Solicitar conexão'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Locations manager ─── */
function LocationsManager({ locations, company, onAdd, onDelete }: {
  locations: Location[];
  company: { id: string; name: string; whatsapp?: string };
  onAdd: (location: Omit<Location, 'id' | 'createdAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('ponto_venda');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteLocation(id: string) {
    setDeleteError('');
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir local.');
    } finally {
      setDeletingId(null);
    }
  }

  function normalizeUrl(raw: string): string | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function reset() {
    setName(''); setType('ponto_venda'); setAddress('');
    setCity(''); setStateUf(''); setWhatsapp(''); setWebsite(''); setNotes('');
  }

  async function handleSave() {
    if (!name.trim()) { setError('Informe o nome do local.'); return; }
    if (!city.trim() && !address.trim()) { setError('Informe ao menos a cidade ou o endereço.'); return; }
    setError('');
    setSaving(true);
    try {
      const rawWa = whatsapp.replace(/\D/g, '');
      await onAdd({
        companyId: company.id,
        companyName: company.name,
        name: name.trim(),
        type,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: stateUf.trim() || undefined,
        whatsapp: rawWa ? (rawWa.startsWith('55') ? rawWa : `55${rawWa}`) : undefined,
        website: normalizeUrl(website),
        notes: notes.trim() || undefined,
      });
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar local.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Onde encontrar
        </Mono>
        <h1 style={{ marginTop: 8, fontSize: 26, fontWeight: 560, letterSpacing: 0 }}>
          Locais de atendimento<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ marginTop: 6, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45 }}>
          Pontos de venda, distribuidores e clínicas onde seus produtos podem ser encontrados. Médicos veem esses locais ao conhecer sua empresa.
        </p>
      </div>

      {/* Form */}
      <div style={{
        padding: 16, borderRadius: 18, background: 'var(--card)',
        border: '1px solid var(--line)', marginBottom: 18,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <WField label="NOME DO LOCAL" value={name} onChange={setName} placeholder="Ex: Farmácia Central / Distribuidora Sul" />
        <WField
          label="TIPO"
          value={locationTypeLabel(type)}
          onChange={label => {
            const found = LOCATION_TYPES.find(t => t.label === label);
            if (found) setType(found.value);
          }}
          as="select"
          options={LOCATION_TYPES.map(t => t.label)}
        />
        <WField label="ENDEREÇO (opcional)" value={address} onChange={setAddress} placeholder="Rua, número, bairro" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <WField label="CIDADE" value={city} onChange={setCity} placeholder="São Paulo" />
          <WField label="UF" value={stateUf} onChange={v => setStateUf(v.toUpperCase().slice(0, 2))} placeholder="SP" />
        </div>
        <WField label="WHATSAPP (opcional)" value={whatsapp} onChange={v => setWhatsapp(fmtPhone(v))} placeholder="(11) 99999-9999" type="tel" />
        <WField label="WEBSITE (opcional)" value={website} onChange={setWebsite} placeholder="www.local.com.br" type="url" />
        <WField label="OBSERVAÇÕES (opcional)" value={notes} onChange={setNotes} placeholder="Horário, ponto de referência, etc." as="textarea" />

        {error && (
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(242,92,84,0.1)', border: '1px solid rgba(242,92,84,0.3)',
            color: '#F25C54', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: saving ? '#1a5cbf' : 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 560, cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: '0 6px 20px rgba(245,130,32,0.32)',
        }}>
          {saving ? 'Salvando...' : '+ Adicionar local'}
        </button>
      </div>

      {/* List */}
      {deleteError && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(242,92,84,0.1)', color: '#F25C54', fontSize: 12.5 }}>
          {deleteError}
        </div>
      )}
      {locations.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 14 }}>
          Nenhum local cadastrado ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {locations.map(loc => (
            <div key={loc.id} style={{
              padding: 14, borderRadius: 16, background: 'var(--card)',
              border: '1px solid var(--line)',
              display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip color="#F58220">{locationTypeLabel(loc.type)}</Chip>
                  {loc.whatsapp && <Chip color="#25D366">WhatsApp</Chip>}
                </div>
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 560, color: 'var(--ink)' }}>{loc.name}</div>
                <div style={{ marginTop: 3, fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {[loc.address, loc.city, loc.state].filter(Boolean).join(' · ') || 'Sem endereço'}
                </div>
                {loc.notes && (
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4 }}>{loc.notes}</div>
                )}
              </div>
              <button onClick={() => { void handleDeleteLocation(loc.id); }} disabled={deletingId === loc.id} style={{
                background: 'none', border: 'none', cursor: deletingId === loc.id ? 'not-allowed' : 'pointer',
                color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '0 0 0 10px', flexShrink: 0,
                opacity: deletingId === loc.id ? 0.6 : 1,
              }}>{deletingId === loc.id ? '...' : 'Excluir'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCardCompany({ product, onDelete, deleting = false }: {
  product: Product;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [tint1] = categoryTint(product.category);
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{
        height: 72,
        padding: 12,
        background: cardPhotoBackground(product.imageUrl),
      }}>
        <span style={{
          padding: '5px 9px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.88)',
          color: 'var(--ink)',
          fontSize: 10,
          fontWeight: 560,
        }}>
          Produto
        </span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip color={tint1}>{product.category}</Chip>
            <Chip color="#25D366">Representante</Chip>
          </div>
          <div style={{ fontSize: 15, fontWeight: 560, marginTop: 8, color: 'var(--ink)' }}>{product.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{product.description}</div>
          {product.availableFor && (
            <div style={{
              marginTop: 9,
              padding: '9px 10px',
              borderRadius: 10,
              background: 'rgba(245,130,32,0.08)',
              border: '1px solid rgba(245,130,32,0.16)',
              color: 'var(--ink-2)',
              fontSize: 12,
              lineHeight: 1.4,
            }}>
              {product.availableFor}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {product.price && <Chip color="#1EA97C">{product.price}</Chip>}
            {product.website && <Chip color="var(--accent-ink)">Material</Chip>}
          </div>
        </div>
        <button onClick={onDelete} disabled={deleting} style={{
          background: 'none', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
          color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '0 0 0 10px', flexShrink: 0,
          opacity: deleting ? 0.6 : 1,
        }}>{deleting ? 'Excluindo…' : 'Excluir'}</button>
      </div>
    </div>
  );
}

function CourseCardCompany({ course, onDelete, deleting = false }: {
  course: Course;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [tint1] = categoryTint(course.category);
  const displayDate = courseDisplayDate(course);
  const placeLabel = course.location?.trim() || (course.modality === 'online' ? 'Online' : 'Local a definir');
  return (
    <div style={{ background: 'var(--card)', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{
        height: 72,
        padding: 12,
        background: cardPhotoBackground(course.imageUrl),
      }}>
        <span style={{
          padding: '5px 9px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.88)',
          color: 'var(--ink)',
          fontSize: 10,
          fontWeight: 560,
        }}>
          Workshop
        </span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip color={tint1}>{course.category}</Chip>
            <ModalityBadge modality={course.modality} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 560, marginTop: 8, color: 'var(--ink)' }}>{course.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {displayDate ? `${fmt(displayDate)} · ${course.time || '19:00'} · ` : ''}
            {placeLabel} · {modalityLabel(course.modality)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3 }}>
            {course.instructor} · {course.duration}
          </div>
          {course.price && <div style={{ marginTop: 8 }}><Chip color="#1EA97C">{course.price}</Chip></div>}
        </div>
        <button onClick={onDelete} disabled={deleting} style={{
          background: 'none', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
          color: '#F25C54', fontSize: 12, fontWeight: 600, padding: '0 0 0 10px', flexShrink: 0,
          opacity: deleting ? 0.6 : 1,
        }}>{deleting ? 'Excluindo…' : 'Excluir'}</button>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  preview,
  onChange,
  showRemove = true,
}: {
  label: string;
  preview: string;
  onChange: (file: File | null) => void;
  showRemove?: boolean;
}) {
  return (
    <div>
      <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
        {label}
      </Mono>
      <div style={{ margin: '-3px 0 8px', fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
        Toque para tirar foto ou escolher da galeria. Máx. 5 MB.
      </div>
      <label style={{
        position: 'relative',
        display: 'block',
        minHeight: 148,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        border: preview ? '2px solid var(--accent)' : '1px dashed rgba(245,130,32,0.45)',
        background: preview
          ? `linear-gradient(135deg, rgba(18,24,40,0.34), rgba(245,130,32,0.20), rgba(255,111,77,0.18)), url(${preview}) center/cover`
          : 'linear-gradient(135deg, rgba(245,130,32,0.24), rgba(255,111,77,0.18))',
        boxShadow: '0 8px 24px rgba(90,80,130,0.08)',
      }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={event => onChange(event.target.files?.[0] ?? null)}
          style={{ display: 'none' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,22,38,0.08), rgba(15,22,38,0.48))',
        }} />
        <div style={{
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 560, color: '#fff', lineHeight: 1.15 }}>
              {preview ? 'Foto pronta ✓' : 'Adicionar foto'}
            </div>
            <div style={{ marginTop: 3, fontSize: 11.5, color: 'rgba(255,255,255,0.76)', lineHeight: 1.3 }}>
              {preview ? 'Toque para trocar' : 'Câmera ou galeria · JPG, PNG, HEIC'}
            </div>
          </div>
          <span style={{
            flexShrink: 0,
            padding: '9px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--ink)',
            fontSize: 12,
            fontWeight: 560,
          }}>
            {preview ? 'Trocar' : '📷 Foto'}
          </span>
        </div>
      </label>
      {preview && showRemove && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{
            marginTop: 8,
            padding: '7px 10px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--chip)',
            color: 'var(--ink-2)',
            fontSize: 11.5,
            fontWeight: 560,
            cursor: 'pointer',
          }}
        >
          Remover imagem
        </button>
      )}
    </div>
  );
}

/* ─── Wizard field ─── */
function WField({ label, value, onChange, type = 'text', placeholder, as = 'input', options, min, max, inputMode }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; as?: 'input' | 'textarea' | 'select'; options?: string[];
  min?: string; max?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}) {
  const base = {
    width: '100%', padding: '12px 0', border: 'none', borderBottom: '2px solid var(--line)',
    background: 'transparent', color: 'var(--ink)', fontSize: 16, fontWeight: 500,
    outline: 'none', fontFamily: "var(--font-sans)",
  } as const;
  return (
    <div>
      <Mono style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
        {label}
      </Mono>
      {as === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, resize: 'none' }} onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'} onBlur={e => e.target.style.borderBottomColor = 'var(--line)'} />
        : as === 'select'
          ? <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} inputMode={inputMode} style={base} onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'} onBlur={e => e.target.style.borderBottomColor = 'var(--line)'} />
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
  const [imageFile,       setImageFile]       = useState<File | null>(null);
  const [imagePreview,    setImagePreview]    = useState('');
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
    if (!isEventDateInAllowedRange(date)) {
      setErr('Selecione uma data entre 2026 e 2030.');
      return;
    }
    if (!location.trim()) { setErr('Informe o local.');            return; }
    const max = Number(maxParticipants) || 100;
    if (max < event.registeredCount) {
      setErr(`Vagas não podem ser menores que o nº de inscritos (${event.registeredCount}).`);
      return;
    }
    setErr('');
    setSaving(true);
    try {
      const nextImageUrl = imageFile
        ? await uploadOpportunityImage(imageFile, event.companyId, 'events')
        : event.imageUrl;
      await onSave({
        title:           title.trim(),
        description:     description.trim(),
        date,
        time,
        location:        location.trim(),
        category,
        maxParticipants: max,
        website:         normalizeUrl(website),
        imageUrl:        nextImageUrl,
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
          <h2 style={{ fontSize: 22, fontWeight: 560, letterSpacing: 0 }}>
            Editar evento<span style={{ color: 'var(--accent)' }}>.</span>
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
            <WField label="DATA" value={date} onChange={setDate} type="date" min={EVENT_DATE_MIN} max={EVENT_DATE_MAX} />
            <WField label="HORA" value={time} onChange={setTime} type="time" />
          </div>
          <WField label="LOCAL" value={location} onChange={setLocation} placeholder="São Paulo, SP" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <WField label="CATEGORIA" value={category} onChange={setCategory} as="select" options={EVENT_CATS} />
            <WField label="VAGAS" value={maxParticipants} onChange={setMaxParticipants} type="number" min="1" inputMode="numeric" />
          </div>
          <WField label="WEBSITE (opcional)" value={website} onChange={setWebsite} type="url" placeholder="www.seusite.com.br" />
          <ImageUploadField
            label="IMAGEM DE CAPA"
            preview={imagePreview || event.imageUrl || ''}
            showRemove={!!imagePreview}
            onChange={file => {
              if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
              setImageFile(file);
              setImagePreview(file ? URL.createObjectURL(file) : '');
            }}
          />

          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(91,110,245,0.06)', border: '1px solid rgba(91,110,245,0.18)',
            fontSize: 12, color: 'var(--ink-2)',
          }}>
            👥 <b>{formatEventOccupancy(event.registeredCount, event.maxParticipants)}</b> —
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
            background: saving ? '#1a5cbf' : 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 560,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(245,130,32,0.32)',
          }}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
