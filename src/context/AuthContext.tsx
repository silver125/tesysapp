import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, Event, Product, Course, Lead, LeadInput, Location, Representative, AddLeadResult } from '../types';
import { assertSupabaseConfigured, isSupabaseConfigured, supabase, upsertProfileWithToken } from '../lib/supabase';
import { AuthContext } from './authContextValue';
import type { AuthContextType, RegisterInput } from './authContextValue';
import { POINTS_PER_CONNECTION, POINTS_PER_INTEREST } from '../lib/gamification';
import { normalizeUserRole } from '../lib/authRoutes';
import { isMissingDbColumnError, isMissingRpcError, omitDbColumns } from '../lib/dbSchema';
import { insertLeadResilient } from '../lib/leadInsert';
import { publishProduct } from '../lib/publishProduct';
import { clearLocalTessyData } from '../lib/clearLocalTessyData';
import { getPasswordResetUrl } from '../lib/appUrl';
import {
  clearPendingRegistration,
  EMAIL_CONFIRMATION_REQUIRED,
  readPendingRegistration,
  savePendingRegistration,
} from '../lib/pendingRegistration';
import { PRIVACY_POLICY_VERSION } from '../lib/legalContent';

// Helper: timeout para evitar travas infinitas em chamadas Supabase
// Aceita PromiseLike para suportar o query builder do supabase-js (thenable)
function withTimeout<T>(p: PromiseLike<T>, ms: number, label = 'Servidor'): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} demorou para responder. Verifique sua conexão e tente novamente.`)),
        ms,
      ),
    ),
  ]);
}

type CompanyOwnedTable = 'events' | 'products' | 'courses' | 'locations' | 'representatives';

async function deleteCompanyOwnedRow(
  table: CompanyOwnedTable,
  id: string,
  companyId: string,
  label: string,
) {
  const { data, error } = await withTimeout(
    supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)
      .select('id'),
    12000,
    `Excluir ${label}`,
  );
  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(`Não foi possível excluir ${label.toLowerCase()}. Tente novamente.`);
  }
}

async function cleanupLeadsForDeletedItem(
  companyId: string,
  itemId: string,
  itemType: 'event' | 'product' | 'course',
) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('company_id', companyId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);
  if (error && !/policy|permission|42501/i.test(error.message)) {
    console.warn(`Não foi possível limpar leads do ${itemType} excluído:`, error.message);
  }
}

// ── Helpers de conversão DB → App ────────────────────────────────────────────
function dbText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim() || fallback;
  if (value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function dbToUser(profile: Record<string, unknown>, email: string): User {
  // Suporta tanto schema novo (name, company) quanto existente (first_name, company_name)
  const name = (profile.name ?? profile.first_name ?? '') as string;
  const lastName = (profile.last_name ?? '') as string;
  const fullName = lastName ? `${name} ${lastName}`.trim() : name;
  const company = (profile.company ?? profile.company_name ?? undefined) as string | undefined;
  const role = normalizeUserRole(profile.role) ?? 'medico';
  return {
    id:        profile.id        as string,
    name:      fullName,
    email,
    role,
    specialty: profile.specialty as string | undefined,
    crm:       profile.crm       as string | undefined,
    crmState:  profile.crm_state as string | undefined,
    company,
    whatsapp:  profile.whatsapp  as string | undefined,
    whatsappConnectionOnly: profile.whatsapp_connection_only !== false,
    bio:       profile.bio       as string | undefined,
    avatarUrl: profile.avatar_url as string | undefined,
    doctorInterests: Array.isArray(profile.doctor_interests)
      ? (profile.doctor_interests as string[])
      : undefined,
    onboardingCompletedAt: profile.onboarding_completed_at as string | null | undefined,
    points:    typeof profile.points === 'number' ? profile.points : Number(profile.points ?? 0) || 0,
  };
}

function dbToLocation(row: Record<string, unknown>): Location {
  return {
    id:          row.id           as string,
    companyId:   row.company_id   as string,
    companyName: dbText(row.company_name, 'Empresa'),
    name:        dbText(row.name, 'Local'),
    type:        (row.type as Location['type']) ?? 'ponto_venda',
    address:     row.address      as string | undefined,
    city:        row.city         as string | undefined,
    state:       row.state        as string | undefined,
    whatsapp:    row.whatsapp     as string | undefined,
    phone:       row.phone        as string | undefined,
    website:     row.website      as string | undefined,
    notes:       row.notes        as string | undefined,
    createdAt:   row.created_at   as string,
  };
}

function dbToRepresentative(row: Record<string, unknown>): Representative {
  return {
    id:          row.id           as string,
    companyId:   row.company_id   as string,
    companyName: dbText(row.company_name, 'Empresa'),
    name:        dbText(row.name, 'Representante'),
    specialty:   row.specialty    as string | undefined,
    region:      row.region       as string | undefined,
    city:        row.city         as string | undefined,
    state:       row.state        as string | undefined,
    whatsapp:    row.whatsapp     as string | undefined,
    email:       row.email        as string | undefined,
    bio:         row.bio          as string | undefined,
    photoUrl:    row.photo_url    as string | undefined,
    createdAt:   row.created_at   as string,
  };
}

function dbToEvent(row: Record<string, unknown>): Event {
  return {
    id:               row.id               as string,
    title:            dbText(row.title, 'Evento'),
    description:      dbText(row.description),
    date:             dbText(row.date),
    time:             dbText(row.time),
    location:         dbText(row.location),
    category:         dbText(row.category, 'Outros'),
    maxParticipants:  Number(row.max_participants ?? 100) || 100,
    registeredCount:  Number(row.registered_count ?? 0) || 0,
    companyId:        row.company_id       as string,
    companyName:      dbText(row.company_name, 'Empresa'),
    companyWhatsapp:  row.company_whatsapp as string | undefined,
    website:          row.website          as string | undefined,
    imageUrl:         row.image_url        as string | undefined,
    createdAt:        row.created_at       as string,
  };
}

function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id:              row.id              as string,
    name:            dbText(row.name, 'Produto'),
    description:     dbText(row.description),
    category:        dbText(row.category, 'Outros'),
    price:           row.price           as string | undefined,
    companyId:       row.company_id      as string,
    companyName:     dbText(row.company_name, 'Empresa'),
    companyWhatsapp: row.company_whatsapp as string | undefined,
    website:         row.website         as string | undefined,
    imageUrl:        row.image_url       as string | undefined,
    availableFor:    row.available_for   as string,
    anvisaRegularized: row.anvisa_regularized === true,
    commerciallyAvailable: row.commercially_available === true,
    createdAt:       row.created_at      as string,
  };
}

function dbToCourse(row: Record<string, unknown>): Course {
  return {
    id:              row.id               as string,
    title:           dbText(row.title, 'Workshop'),
    description:     dbText(row.description),
    category:        dbText(row.category, 'Outros'),
    imageUrl:        row.image_url        as string | undefined,
    modality:        (row.modality as 'online' | 'presencial' | 'hibrido') ?? 'online',
    date:            row.date             as string | undefined,
    time:            row.time             as string | undefined,
    location:        row.location         as string | undefined,
    duration:        dbText(row.duration, 'A confirmar'),
    instructor:      dbText(row.instructor, 'Instrutor'),
    price:           row.price            as string | undefined,
    companyId:       row.company_id       as string,
    companyName:     dbText(row.company_name, 'Empresa'),
    companyWhatsapp: row.company_whatsapp as string | undefined,
    website:         row.website          as string | undefined,
    createdAt:       row.created_at       as string,
  };
}

function dbToLead(row: Record<string, unknown>): Lead {
  const intent = String(row.intent ?? 'representative_contact') as Lead['intent'];
  const doctorProfile = row.doctor as Record<string, unknown> | null | undefined;
  const doctorAvatarUrl = (doctorProfile?.avatar_url as string | undefined)
    ?? (row.doctor_avatar_url as string | undefined);
  return {
    id:              row.id               as string,
    companyId:       row.company_id       as string,
    companyName:     (row.company_name as string | null) || 'Empresa',
    doctorId:        row.doctor_id        as string,
    doctorName:      (row.doctor_name as string | null)
      || (doctorProfile?.name as string | undefined)
      || [doctorProfile?.first_name, doctorProfile?.last_name].filter(Boolean).join(' ').trim()
      || 'Médico',
    doctorSpecialty: row.doctor_specialty as string | undefined,
    doctorWhatsapp:  row.doctor_whatsapp  as string | undefined,
    doctorAvatarUrl: doctorAvatarUrl || undefined,
    itemType:        (row.item_type as Lead['itemType']) ?? 'company',
    itemId:          row.item_id          as string | undefined,
    itemName:        (row.item_name as string | null) || 'Interesse',
    intent,
    message:         row.message          as string | undefined,
    connectionStatus: (row.connection_status as Lead['connectionStatus'] | undefined) ?? 'none',
    connectionRequestedAt: row.connection_requested_at as string | undefined,
    connectionApprovedAt:  row.connection_approved_at  as string | undefined,
    createdAt:       (row.created_at as string | null) || new Date().toISOString(),
  };
}

function readLocalLeads(companyId: string): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(`tessy-leads-${companyId}`) ?? '[]') as Lead[];
  } catch {
    return [];
  }
}

function notifyLocalLeadsChanged(companyId: string) {
  try {
    window.dispatchEvent(new CustomEvent('tessy-leads-changed', { detail: { companyId } }));
  } catch {
    /* ignore */
  }
}

function writeLocalLead(lead: Lead) {
  try {
    const prev = readLocalLeads(lead.companyId);
    const exists = prev.some(l => isSameLead(l, lead));
    localStorage.setItem(`tessy-leads-${lead.companyId}`, JSON.stringify(exists ? prev : [lead, ...prev]));
    notifyLocalLeadsChanged(lead.companyId);
  } catch {
    /* ignore */
  }
}

function removeLocalEventLead(companyId: string, eventId: string, doctorId: string, eventName?: string) {
  try {
    const next = readLocalLeads(companyId).filter(lead => !(
      lead.doctorId === doctorId
      && lead.itemType === 'event'
      && (lead.itemId === eventId || (eventName ? lead.itemName === eventName : false))
      && lead.intent === 'event_interest'
    ));
    localStorage.setItem(`tessy-leads-${companyId}`, JSON.stringify(next));
    notifyLocalLeadsChanged(companyId);
  } catch {
    /* ignore */
  }
}

const LOCAL_PRODUCTS_KEY = 'tessy-local-products';

function readLocalProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) ?? '[]') as Product[];
  } catch {
    return [];
  }
}

function removeLocalProduct(id: string) {
  try {
    localStorage.setItem(
      LOCAL_PRODUCTS_KEY,
      JSON.stringify(readLocalProducts().filter(product => product.id !== id)),
    );
  } catch {
    /* ignore */
  }
}

function mergeLocalProducts(
  remoteProducts: Product[],
  viewer?: { role?: User['role']; companyId?: string },
) {
  // Só a própria empresa vê rascunhos locais; médicos e visitantes só veem o Supabase.
  if (viewer?.role !== 'empresa' || !viewer.companyId) {
    return [...remoteProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const hasRemoteEquivalent = (local: Product) => remoteProducts.some(remote => (
    remote.companyId === local.companyId
    && remote.name.trim().toLowerCase() === local.name.trim().toLowerCase()
    && (remote.imageUrl ?? '') === (local.imageUrl ?? '')
  ));
  const byId = new Map(remoteProducts.map(product => [product.id, product]));
  for (const product of readLocalProducts()) {
    if (product.companyId !== viewer.companyId) continue;
    if (hasRemoteEquivalent(product)) continue;
    if (!byId.has(product.id)) byId.set(product.id, product);
  }
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function isSameLead(a: Pick<Lead, 'companyId' | 'doctorId' | 'itemType' | 'itemId' | 'intent'>, b: Pick<Lead, 'companyId' | 'doctorId' | 'itemType' | 'itemId' | 'intent'>) {
  return a.companyId === b.companyId
    && a.doctorId === b.doctorId
    && a.itemType === b.itemType
    && (a.itemId ?? '') === (b.itemId ?? '')
    && a.intent === b.intent;
}

function markLocalOnboardingDone(userId: string, completedAt: string) {
  try {
    localStorage.setItem(`tessy-onboarding-done-${userId}`, completedAt);
    localStorage.removeItem(`tessy-onboarding-pending-${userId}`);
  } catch {
    /* ignore */
  }
}

async function syncEventRegistrationCount(eventId: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.rpc('sync_event_registered_count', { p_event_id: eventId });
  if (error) {
    return null;
  }

  const count = typeof data === 'number' ? data : Number(data);
  return Number.isFinite(count) ? count : null;
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  // Ref para bloquear o listener de auth durante o cadastro,
  // evitando que o trigger do Supabase (role: 'doctor') sobrescreva o role correto
  const isRegistering = useRef(false);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const userId = user?.id;

  const refreshLeads = useCallback(async () => {
    if (!userId || !user?.role) {
      setLeads([]);
      return;
    }

    const local = user.role === 'empresa' ? readLocalLeads(userId) : [];
    if (!isSupabaseConfigured) {
      setLeads(local);
      return;
    }

    const baseQuery = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    let { data, error } = await (user.role === 'empresa'
      ? baseQuery.eq('company_id', userId)
      : baseQuery.eq('doctor_id', userId));

    if (error) {
      const plainQuery = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      ({ data, error } = await (user.role === 'empresa'
        ? plainQuery.eq('company_id', userId)
        : plainQuery.eq('doctor_id', userId)));
      if (error) {
        setLeads(local);
        return;
      }
    }

    const remote = (data ?? []).map(r => dbToLead(r as Record<string, unknown>));
    const remoteIds = new Set(remote.map(l => l.id));
    const merged = [...remote, ...local.filter(l => !remoteIds.has(l.id))];
    setLeads(merged.filter((lead, index, arr) => arr.findIndex(other => isSameLead(other, lead)) === index));
  }, [userId, user?.role]);

  // Relê o perfil do usuário logado (pontos, whatsapp) para manter o saldo em dia.
  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      let result = await supabase
        .from('profiles')
        .select('points, whatsapp')
        .eq('id', userId)
        .single();

      if (result.error && isMissingDbColumnError(result.error, ['points'])) {
        result = await supabase
          .from('profiles')
          .select('whatsapp')
          .eq('id', userId)
          .single();
      }

      const { data, error } = result;
      if (error || !data) return;

      const row = data as Record<string, unknown>;
      const freshPoints = typeof row.points === 'number'
        ? row.points
        : Number(row.points ?? NaN);
      setUser(prev => {
        if (!prev) return prev;
        const points = Number.isFinite(freshPoints) ? freshPoints : prev.points;
        const whatsapp = (row.whatsapp as string | undefined) ?? prev.whatsapp;
        if (points === prev.points && whatsapp === prev.whatsapp) return prev;
        return { ...prev, points, whatsapp };
      });
    } catch {
      /* silencioso: mantém o valor atual */
    }
  }, [userId]);

  // Carrega IDs de eventos em que o usuário já clicou "Tenho interesse" (localStorage)
  useEffect(() => {
    if (!userId) { setRegisteredEventIds(new Set()); return; }
    try {
      const stored = localStorage.getItem(`tessy-registered-${userId}`);
      if (stored) setRegisteredEventIds(new Set(JSON.parse(stored)));
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  // Carrega eventos/produtos/cursos públicos
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const [evRes, prRes, coRes, loRes, reRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*').order('created_at', { ascending: false }),
      supabase.from('representatives').select('*').order('created_at', { ascending: false }),
    ]);

    if (prRes.error) {
      console.error('[Tessy] Erro ao carregar produtos:', prRes.error.message);
    }

    const mappedEvents = (evRes.data ?? []).map(r => dbToEvent(r as Record<string, unknown>));
    const mappedProducts = (prRes.data ?? []).map(r => dbToProduct(r as Record<string, unknown>));
    const mappedCourses = (coRes.data ?? []).map(r => dbToCourse(r as Record<string, unknown>));
    const mappedLocations = (loRes.data ?? []).map(r => dbToLocation(r as Record<string, unknown>));
    const mappedReps = (reRes.data ?? []).map(r => dbToRepresentative(r as Record<string, unknown>));

    const platformEmpty =
      mappedProducts.length === 0
      && mappedEvents.length === 0
      && mappedCourses.length === 0
      && mappedReps.length === 0
      && mappedLocations.length === 0;

    if (platformEmpty) {
      clearLocalTessyData();
      setEvents([]);
      setProducts([]);
      setCourses([]);
      setLocations([]);
      setRepresentatives([]);
      return;
    }

    setEvents(mappedEvents);
    void Promise.all(
      mappedEvents.map(async event => {
        const count = await syncEventRegistrationCount(event.id);
        return count === null ? null : { id: event.id, count };
      }),
    ).then(results => {
      const countByEvent = new Map(
        results
          .filter((result): result is { id: string; count: number } => result !== null)
          .map(result => [result.id, result.count]),
      );

      if (countByEvent.size === 0) return;
      setEvents(prev => prev.map(event => {
        const count = countByEvent.get(event.id);
        return count === undefined || event.registeredCount === count
          ? event
          : { ...event, registeredCount: count };
      }));
    });

    setProducts(mergeLocalProducts(mappedProducts, user ? { role: user.role, companyId: user.id } : undefined));
    setCourses(mappedCourses);
    setLocations(mappedLocations);
    setRepresentatives(mappedReps);
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const liveTables = ['events', 'products', 'courses', 'locations', 'representatives'] as const;
    const channels = liveTables.map(table =>
      supabase
        .channel(`tessy-${table}-live`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          refreshData();
        })
        .subscribe(),
    );

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [refreshData]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.role) return;

    const leadsChannel = supabase
      .channel(`tessy-leads-live-${user.role}-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `${user.role === 'empresa' ? 'company_id' : 'doctor_id'}=eq.${user.id}`,
      }, () => {
        refreshLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, [refreshLeads, user?.id, user?.role]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.role) return;

    const interval = window.setInterval(() => {
      refreshData();
      refreshLeads();
    }, 8000);

    // Saldo de pontos pode mudar no banco (ao aprovar conexões) — relê com folga.
    const profileInterval = window.setInterval(() => {
      refreshProfile();
    }, 15000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(profileInterval);
    };
  }, [refreshData, refreshLeads, refreshProfile, user?.role]);

  useEffect(() => {
    if (user?.role !== 'empresa') return;

    const handleLocalLeadChange = (event: globalThis.Event) => {
      if (event instanceof StorageEvent && event.key !== `tessy-leads-${user.id}`) return;
      if (event instanceof CustomEvent && event.detail?.companyId !== user.id) return;
      refreshLeads();
    };

    window.addEventListener('storage', handleLocalLeadChange);
    window.addEventListener('tessy-leads-changed', handleLocalLeadChange);

    return () => {
      window.removeEventListener('storage', handleLocalLeadChange);
      window.removeEventListener('tessy-leads-changed', handleLocalLeadChange);
    };
  }, [refreshLeads, user?.id, user?.role]);

  // Busca perfil do usuário autenticado (com timeout de 8s)
  async function fetchProfile(userId: string, email: string): Promise<User | null> {
    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        8000,
        'Perfil',
      );
      if (error || !data) return null;
      return dbToUser(data as Record<string, unknown>, email);
    } catch {
      return null;
    }
  }

  // Inicializa sessão e ouve mudanças de auth
  useEffect(() => {
    refreshData();

    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    // Timeout de segurança: se Supabase não responder em 5s, libera o app
    const timeout = setTimeout(() => setAuthReady(true), 5000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        const u = await fetchProfile(session.user.id, session.user.email ?? '');
        setUser(u);
      }
      setAuthReady(true);
    }).catch(() => {
      clearTimeout(timeout);
      setAuthReady(true);
    });

    let cancelled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Durante o cadastro, ignorar — o register() vai setar o user correto
        if (isRegistering.current) return;
        setTimeout(async () => {
          if (cancelled) return;
          if (session?.user) {
            const u = await fetchProfile(session.user.id, session.user.email ?? '');
            if (!cancelled && u) setUser(u);
          } else {
            setUser(null);
          }
        }, 0);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshData]);

  async function ensureUserProfile(userId: string, email: string, accessToken: string): Promise<User | null> {
    let u = await fetchProfile(userId, email);
    if (u) return u;

    const pending = readPendingRegistration(userId, email);
    if (!pending) return null;

    try {
      await withTimeout(
        upsertProfileWithToken(accessToken, pending.profile),
        12000,
        'Salvar perfil',
      );
      clearPendingRegistration();
      u = await fetchProfile(userId, email);
      return u;
    } catch {
      return null;
    }
  }

  // ── Login ──
  const login = async (email: string, password: string): Promise<User> => {
    assertSupabaseConfigured();
    setIsLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        12000,
        'Login',
      );
      if (error) throw new Error('E-mail ou senha incorretos.');
      if (!data.user || !data.session) throw new Error('Erro ao entrar. Tente novamente.');
      const u = await ensureUserProfile(data.user.id, data.user.email ?? '', data.session.access_token);
      if (!u) throw new Error('Perfil não encontrado. Entre em contato com o suporte.');
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    assertSupabaseConfigured();
    const redirectTo = getPasswordResetUrl();
    const { error } = await withTimeout(
      supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo }),
      12000,
      'Recuperação de senha',
    );
    if (error) throw new Error(error.message || 'Não foi possível enviar o e-mail de recuperação.');
  };

  const updatePassword = async (password: string) => {
    assertSupabaseConfigured();
    const { error } = await withTimeout(
      supabase.auth.updateUser({ password }),
      12000,
      'Nova senha',
    );
    if (error) throw new Error(error.message || 'Não foi possível atualizar a senha.');
  };

  // ── Cadastro ──
  const register = async (input: RegisterInput): Promise<User> => {
    assertSupabaseConfigured();
    if (!input.privacyAccepted) {
      throw new Error('É necessário aceitar a Política de Privacidade e os Termos de Uso.');
    }
    isRegistering.current = true;
    setIsLoading(true);
    try {
      // 1. Cria usuário no Supabase Auth
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signUp({
          email: input.email,
          password: input.password,
        }),
        15000,
        'Cadastro',
      );

      if (authError) {
        const msg = authError.message.toLowerCase().includes('already registered')
          ? 'Este e-mail já está cadastrado. Faça login.'
          : authError.message || 'Erro ao criar conta.';
        throw new Error(msg);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta. Tente novamente.');
      }

      const uid = authData.user.id;
      const acceptedAt = new Date().toISOString();
      const profilePayload = {
        id: uid,
        name: input.name.trim(),
        role: input.role,
        specialty: input.specialty ?? null,
        crm: input.crm ?? null,
        crm_state: input.crmState ?? null,
        company: input.company ?? null,
        whatsapp: input.whatsapp ?? null,
        whatsapp_connection_only: input.whatsappConnectionOnly ?? true,
        bio: input.bio ?? null,
        privacy_accepted_at: acceptedAt,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
      };

      // Se confirmação de e-mail está ativa, guarda perfil localmente até o primeiro login.
      if (!authData.session) {
        savePendingRegistration({
          userId: uid,
          email: input.email,
          profile: profilePayload,
        });
        const err = new Error(EMAIL_CONFIRMATION_REQUIRED);
        throw err;
      }

      // 2. Salva perfil via REST direto para evitar qualquer lock interno do Auth.
      try {
        await withTimeout(
          upsertProfileWithToken(authData.session.access_token, profilePayload),
          12000,
          'Salvar perfil',
        );
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : 'Tente novamente.';
        if (/privacy_accepted_at|privacy_policy_version/i.test(message)) {
          const { privacy_accepted_at: _a, privacy_policy_version: _v, ...legacyPayload } = profilePayload;
          await withTimeout(
            upsertProfileWithToken(authData.session.access_token, legacyPayload),
            12000,
            'Salvar perfil',
          );
        } else {
          throw new Error('Erro ao salvar perfil: ' + message);
        }
      }

      const newUser: User = {
        id: uid,
        name: input.name.trim(),
        email: input.email,
        role: input.role,
        specialty: input.specialty,
        crm: input.crm,
        crmState: input.crmState,
        company: input.company,
        whatsapp: input.whatsapp,
        whatsappConnectionOnly: input.whatsappConnectionOnly ?? true,
        onboardingCompletedAt: null,
      };
      try {
        localStorage.setItem(`tessy-onboarding-pending-${uid}`, '1');
      } catch {
        /* ignore */
      }
      setUser(newUser);
      return newUser;
    } finally {
      isRegistering.current = false;
      setIsLoading(false);
    }
  };

  // ── Logout ──
  const logout = async () => {
    assertSupabaseConfigured();
    await supabase.auth.signOut();
    clearLocalTessyData();
    setUser(null);
    setEvents([]);
    setProducts([]);
    setCourses([]);
    setLocations([]);
    setRepresentatives([]);
    setLeads([]);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const completedAt = new Date().toISOString();
    markLocalOnboardingDone(user.id, completedAt);
    setUser(prev => prev ? { ...prev, onboardingCompletedAt: completedAt } : prev);

    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed_at: completedAt })
      .eq('id', user.id);

    if (error) {
      // Se a coluna ainda não foi criada no Supabase, o fallback local evita repetir o modal.
      console.warn('Não foi possível salvar onboarding no Supabase:', error.message);
    }
  };

  // ── Atualizar perfil ──
  const updateProfile = async (data: {
    name?: string;
    company?: string;
    whatsapp?: string;
    whatsappConnectionOnly?: boolean;
    specialty?: string;
    crm?: string;
    crmState?: string;
    avatarUrl?: string | null;
    doctorInterests?: string[];
  }) => {
    if (!user) return;
    assertSupabaseConfigured();
    const updates: Record<string, string | string[] | boolean | null | undefined> = {};
    if (data.name) { updates.name = data.name; }
    if (data.company) {
      updates.company = data.company;
      if (user.role === 'empresa') updates.name = data.company;
    }
    if (data.whatsapp !== undefined) { updates.whatsapp = data.whatsapp; }
    if (data.whatsappConnectionOnly !== undefined) { updates.whatsapp_connection_only = data.whatsappConnectionOnly; }
    if (data.specialty !== undefined) { updates.specialty = data.specialty; }
    if (data.crm !== undefined) { updates.crm = data.crm; }
    if (data.crmState !== undefined) { updates.crm_state = data.crmState; }
    if (data.avatarUrl !== undefined) { updates.avatar_url = data.avatarUrl || null; }
    if (data.doctorInterests !== undefined) { updates.doctor_interests = data.doctorInterests; }

    let { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (error && isMissingDbColumnError(error, ['avatar_url'])) {
      ({ error } = await supabase.from('profiles').update(omitDbColumns(updates, ['avatar_url'])).eq('id', user.id));
      if (data.avatarUrl !== undefined && data.avatarUrl) {
        console.warn('Coluna avatar_url ausente em profiles. Foto salva localmente até rodar a migração SQL.');
      }
    }

    if (error && isMissingDbColumnError(error, ['whatsapp_connection_only'])) {
      ({ error } = await supabase.from('profiles').update(omitDbColumns(updates, ['whatsapp_connection_only'])).eq('id', user.id));
    }

    if (error && isMissingDbColumnError(error, ['doctor_interests'])) {
      ({ error } = await supabase.from('profiles').update(omitDbColumns(updates, ['doctor_interests'])).eq('id', user.id));
      if (data.doctorInterests !== undefined) {
        console.warn('Coluna doctor_interests ausente em profiles. Interesses salvos localmente até rodar a migração SQL.');
      }
    }

    if (error && isMissingDbColumnError(error, ['company', 'name'])) {
      const legacy = { ...omitDbColumns(updates, ['company', 'name', 'avatar_url']) } as Record<string, string | boolean | null | undefined>;
      if (data.company) legacy.company_name = data.company;
      if (data.name) {
        const parts = data.name.trim().split(/\s+/);
        legacy.first_name = parts[0] ?? data.name;
        if (parts.length > 1) legacy.last_name = parts.slice(1).join(' ');
      }
      ({ error } = await supabase.from('profiles').update(legacy).eq('id', user.id));
    }

    if (error) throw new Error(error.message);
    setUser(prev => prev ? {
      ...prev,
      ...data,
      avatarUrl: data.avatarUrl === null ? undefined : (data.avatarUrl ?? prev.avatarUrl),
      doctorInterests: data.doctorInterests ?? prev.doctorInterests,
    } : prev);
  };

  const deleteAccount = async () => {
    if (!user) return;
    assertSupabaseConfigured();

    const { error: rpcError } = await supabase.rpc('delete_own_account');
    if (rpcError) {
      if (isMissingRpcError(rpcError, 'delete_own_account')) {
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profileError) throw new Error(profileError.message);
      } else {
        throw new Error(rpcError.message);
      }
    }

    clearLocalTessyData();
    await supabase.auth.signOut();
    setUser(null);
    setEvents([]);
    setProducts([]);
    setCourses([]);
    setLocations([]);
    setRepresentatives([]);
    setLeads([]);
  };

  // ── Eventos ──
  const addEvent = async (data: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => {
    assertSupabaseConfigured();
    const rpcPayload = {
      title: data.title,
      description: data.description ?? '',
      date: data.date,
      time: data.time ?? '',
      location: data.location ?? '',
      category: data.category ?? '',
      max_participants: String(data.maxParticipants ?? 100),
      company_name: data.companyName,
      company_whatsapp: data.companyWhatsapp ?? '',
      website: data.website ?? '',
      image_url: data.imageUrl ?? '',
    };

    const rpcResult = await withTimeout(
      supabase.rpc('publish_company_event', { payload: rpcPayload }),
      12000,
      'Publicar evento',
    );
    if (!rpcResult.error) {
      refreshData();
      return;
    }
    if (!isMissingRpcError(rpcResult.error, 'publish_company_event')) {
      throw new Error(rpcResult.error.message);
    }

    const payload = {
      title:            data.title,
      description:      data.description,
      date:             data.date,
      time:             data.time,
      location:         data.location,
      category:         data.category,
      max_participants: data.maxParticipants,
      registered_count: 0,
      company_id:       data.companyId,
      company_name:     data.companyName,
      company_whatsapp: data.companyWhatsapp ?? null,
      website:          data.website ?? null,
      image_url:        data.imageUrl ?? null,
    };

    let result = await withTimeout(
      supabase.from('events').insert(payload),
      12000,
      'Publicar evento',
    );
    if (result.error && isMissingDbColumnError(result.error, ['image_url'])) {
      console.warn('Coluna image_url ausente em events. Publicando evento sem imagem.', result.error.message);
      result = await withTimeout(
        supabase.from('events').insert(omitDbColumns(payload, ['image_url'])),
        12000,
        'Publicar evento',
      );
    }
    const { error } = result;
    if (error) throw new Error(error.message);
    refreshData(); // background, não bloqueia
  };

  const deleteEvent = async (id: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem excluir eventos.');
    assertSupabaseConfigured();
    await deleteCompanyOwnedRow('events', id, user.id, 'evento');
    await cleanupLeadsForDeletedItem(user.id, id, 'event');
    setEvents(prev => prev.filter(e => e.id !== id));
    setLeads(prev => prev.filter(lead => !(lead.companyId === user.id && lead.itemId === id && lead.itemType === 'event')));
    await Promise.all([refreshData(), refreshLeads()]);
  };

  // ── Atualizar evento (título, data, hora, local, vagas, etc.) ──
  const updateEvent: AuthContextType['updateEvent'] = async (id, patch) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem editar eventos.');
    assertSupabaseConfigured();
    // Mapeia camelCase do app → snake_case do banco
    const dbPatch: Record<string, unknown> = {};
    if (patch.title           !== undefined) dbPatch.title             = patch.title;
    if (patch.description     !== undefined) dbPatch.description       = patch.description;
    if (patch.date            !== undefined) dbPatch.date              = patch.date;
    if (patch.time            !== undefined) dbPatch.time              = patch.time;
    if (patch.location        !== undefined) dbPatch.location          = patch.location;
    if (patch.category        !== undefined) dbPatch.category          = patch.category;
    if (patch.maxParticipants !== undefined) dbPatch.max_participants  = patch.maxParticipants;
    if (patch.companyWhatsapp !== undefined) dbPatch.company_whatsapp  = patch.companyWhatsapp;
    if (patch.website         !== undefined) dbPatch.website           = patch.website ?? null;
    if (patch.imageUrl        !== undefined) dbPatch.image_url         = patch.imageUrl ?? null;

    let result = await supabase.from('events').update(dbPatch).eq('id', id).eq('company_id', user.id);
    if (result.error && isMissingDbColumnError(result.error, ['image_url'])) {
      const fallbackPatch = omitDbColumns(dbPatch, ['image_url']);
      if (Object.keys(fallbackPatch).length > 0) {
        console.warn('Coluna image_url ausente em events. Salvando edição sem imagem.', result.error.message);
        result = await supabase.from('events').update(fallbackPatch).eq('id', id).eq('company_id', user.id);
      } else {
        console.warn('Coluna image_url ausente em events. Ignorando atualização isolada de imagem.', result.error.message);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch, imageUrl: e.imageUrl } as Event : e));
        return;
      }
    }
    const { error } = result;
    if (error) throw new Error(error.message);

    // Atualização otimista local
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } as Event : e));
  };

  // ── Registrar interesse em evento (incrementa registered_count) ──
  const registerInterest = async (eventId: string) => {
    if (!user) throw new Error('Você precisa estar logado.');
    assertSupabaseConfigured();
    if (registeredEventIds.has(eventId)) return; // já inscrito

    // Busca contagem atual
    const { data: row, error: fetchErr } = await supabase
      .from('events')
      .select('registered_count, max_participants')
      .eq('id', eventId)
      .single();
    if (fetchErr || !row) throw new Error('Evento não encontrado.');
    const current = (row.registered_count as number) ?? 0;
    const max = (row.max_participants as number) ?? 0;
    if (max > 0 && current >= max) throw new Error('Evento esgotado.');

    let newCount = await syncEventRegistrationCount(eventId);

    if (newCount === null) {
      newCount = current + 1;
      const { error: updErr } = await supabase
        .from('events')
        .update({ registered_count: newCount })
        .eq('id', eventId);
      if (updErr) {
        // Algumas políticas RLS podem bloquear update do evento para médicos.
        // A conexão principal é registrada em leads; a contagem local continua otimista.
        console.warn('Não foi possível atualizar a contagem remota do evento:', updErr.message);
      }
    }

    // Atualiza estado local + persiste inscrição no localStorage
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: newCount } : e));
    const next = new Set(registeredEventIds);
    next.add(eventId);
    setRegisteredEventIds(next);
    try {
      localStorage.setItem(`tessy-registered-${user.id}`, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  // ── Cancelar interesse em evento (decrementa registered_count) ──
  const cancelEventInterest = async (eventId: string) => {
    if (!user) throw new Error('Você precisa estar logado.');
    assertSupabaseConfigured();
    if (!registeredEventIds.has(eventId)) return;

    const { data: row, error: fetchErr } = await supabase
      .from('events')
      .select('registered_count, company_id, title')
      .eq('id', eventId)
      .single();
    if (fetchErr || !row) throw new Error('Evento não encontrado.');

    const eventName = (row.title as string) || events.find(e => e.id === eventId)?.title;
    const companyId = (row.company_id as string) || events.find(e => e.id === eventId)?.companyId;
    if (companyId) {
      removeLocalEventLead(companyId, eventId, user.id, eventName);
      setLeads(prev => prev.filter(lead => !(
        lead.companyId === companyId
        && lead.doctorId === user.id
        && lead.itemType === 'event'
        && (lead.itemId === eventId || (eventName ? lead.itemName === eventName : false))
        && lead.intent === 'event_interest'
      )));

      await supabase
        .from('leads')
        .delete()
        .eq('company_id', companyId)
        .eq('doctor_id', user.id)
        .eq('item_type', 'event')
        .eq('item_id', eventId)
        .eq('intent', 'event_interest');

      if (eventName) {
        await supabase
          .from('leads')
          .delete()
          .eq('company_id', companyId)
          .eq('doctor_id', user.id)
          .eq('item_type', 'event')
          .eq('item_name', eventName)
          .eq('intent', 'event_interest');
      }
    }

    const current = (row.registered_count as number) ?? 0;
    let newCount = await syncEventRegistrationCount(eventId);

    if (newCount === null) {
      newCount = Math.max(0, current - 1);
      const { error: updErr } = await supabase
        .from('events')
        .update({ registered_count: newCount })
        .eq('id', eventId);
      if (updErr) {
        console.warn('Não foi possível atualizar a contagem remota do evento:', updErr.message);
      }
    }

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: newCount } : e));
    const next = new Set(registeredEventIds);
    next.delete(eventId);
    setRegisteredEventIds(next);
    try {
      localStorage.setItem(`tessy-registered-${user.id}`, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  // ── Produtos ──
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    assertSupabaseConfigured();
    const listingType = data.listingType ?? 'product';

    await publishProduct({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      companyId: data.companyId,
      companyName: data.companyName,
      companyWhatsapp: data.companyWhatsapp,
      availableFor: data.availableFor,
      website: data.website,
      imageUrl: data.imageUrl,
      listingType,
    });
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem excluir produtos.');
    assertSupabaseConfigured();
    if (id.startsWith('local-product-')) {
      removeLocalProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }
    await deleteCompanyOwnedRow('products', id, user.id, 'produto');
    await cleanupLeadsForDeletedItem(user.id, id, 'product');
    setProducts(prev => prev.filter(p => p.id !== id));
    setLeads(prev => prev.filter(lead => !(lead.companyId === user.id && lead.itemId === id && lead.itemType === 'product')));
    await Promise.all([refreshData(), refreshLeads()]);
  };

  // ── Cursos ──
  const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    assertSupabaseConfigured();
    const rpcPayload = {
      title: data.title,
      description: data.description ?? '',
      category: data.category ?? '',
      modality: data.modality ?? 'online',
      duration: data.duration ?? '',
      instructor: data.instructor ?? '',
      price: data.price ?? '',
      company_name: data.companyName,
      company_whatsapp: data.companyWhatsapp ?? '',
      website: data.website ?? '',
      date: data.date ?? '',
      time: data.time ?? '',
      location: data.location ?? '',
      image_url: data.imageUrl ?? '',
    };

    const rpcResult = await withTimeout(
      supabase.rpc('publish_company_course', { payload: rpcPayload }),
      12000,
      'Publicar workshop',
    );
    if (!rpcResult.error) {
      refreshData();
      return;
    }
    if (!isMissingRpcError(rpcResult.error, 'publish_company_course')) {
      throw new Error(rpcResult.error.message);
    }

    const basePayload: Record<string, unknown> = {
      title:            data.title,
      description:      data.description,
      category:         data.category,
      modality:         data.modality,
      duration:         data.duration,
      instructor:       data.instructor,
      price:            data.price ?? null,
      company_id:       data.companyId,
      company_name:     data.companyName,
      company_whatsapp: data.companyWhatsapp ?? null,
      website:          data.website ?? null,
      image_url:        data.imageUrl ?? null,
    };
    const schedulePayload: Record<string, unknown> = {
      ...basePayload,
      date:     data.date ?? null,
      time:     data.time ?? null,
      location: data.location ?? null,
    };

    let result = await withTimeout(
      supabase.from('courses').insert(schedulePayload),
      12000,
      'Publicar workshop',
    );
    if (result.error && isMissingDbColumnError(result.error, ['date', 'time', 'location'])) {
      result = await withTimeout(
        supabase.from('courses').insert(basePayload),
        12000,
        'Publicar workshop',
      );
    }
    if (result.error && isMissingDbColumnError(result.error, ['image_url'])) {
      const withoutImage = omitDbColumns(schedulePayload, ['image_url']);
      result = await withTimeout(
        supabase.from('courses').insert(withoutImage),
        12000,
        'Publicar workshop',
      );
      if (result.error && isMissingDbColumnError(result.error, ['date', 'time', 'location'])) {
        result = await withTimeout(
          supabase.from('courses').insert(omitDbColumns(basePayload, ['image_url'])),
          12000,
          'Publicar workshop',
        );
      }
    }
    const { error } = result;
    if (error) throw new Error(error.message);
    refreshData();
  };

  const deleteCourse = async (id: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem excluir workshops.');
    assertSupabaseConfigured();
    await deleteCompanyOwnedRow('courses', id, user.id, 'workshop');
    await cleanupLeadsForDeletedItem(user.id, id, 'course');
    setCourses(prev => prev.filter(c => c.id !== id));
    setLeads(prev => prev.filter(lead => !(lead.companyId === user.id && lead.itemId === id && lead.itemType === 'course')));
    await Promise.all([refreshData(), refreshLeads()]);
  };

  // ── Locais de atendimento / distribuição ──
  const addLocation = async (data: Omit<Location, 'id' | 'createdAt'>) => {
    assertSupabaseConfigured();
    const payload = {
      company_id:   data.companyId,
      company_name: data.companyName,
      name:         data.name,
      type:         data.type,
      address:      data.address ?? null,
      city:         data.city ?? null,
      state:        data.state ?? null,
      whatsapp:     data.whatsapp ?? null,
      phone:        data.phone ?? null,
      website:      data.website ?? null,
      notes:        data.notes ?? null,
    };

    const { error } = await withTimeout(
      supabase.from('locations').insert(payload),
      12000,
      'Publicar local',
    );
    if (error) {
      if (/locations.*(does not exist|schema cache)/i.test(error.message)) {
        throw new Error('Tabela de locais ainda não criada. Rode supabase/create_locations_table.sql no Supabase.');
      }
      throw new Error(error.message);
    }
    refreshData(); // background, não bloqueia
  };

  const deleteLocation = async (id: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem excluir locais.');
    assertSupabaseConfigured();
    await deleteCompanyOwnedRow('locations', id, user.id, 'local');
    setLocations(prev => prev.filter(l => l.id !== id));
    await refreshData();
  };

  // ── Representantes comerciais ──
  const addRepresentative = async (data: Omit<Representative, 'id' | 'createdAt'>) => {
    assertSupabaseConfigured();
    const payload = {
      company_id:   data.companyId,
      company_name: data.companyName,
      name:         data.name,
      specialty:    data.specialty ?? null,
      region:       data.region ?? null,
      city:         data.city ?? null,
      state:        data.state ?? null,
      whatsapp:     data.whatsapp ?? null,
      email:        data.email ?? null,
      bio:          data.bio ?? null,
      photo_url:    data.photoUrl ?? null,
    };

    const { error } = await withTimeout(
      supabase.from('representatives').insert(payload),
      12000,
      'Cadastrar representante',
    );
    if (error) {
      if (/representatives.*(does not exist|schema cache)/i.test(error.message)) {
        throw new Error('Tabela de representantes ainda não criada. Rode supabase/create_representatives_table.sql no Supabase.');
      }
      throw new Error(error.message);
    }
    refreshData(); // background, não bloqueia
  };

  const updateRepresentative = async (
    id: string,
    patch: Partial<Pick<Representative, 'name' | 'specialty' | 'region' | 'city' | 'state' | 'whatsapp' | 'email' | 'bio' | 'photoUrl'>>,
  ) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem editar representantes.');
    assertSupabaseConfigured();

    const payload: Record<string, string | null> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.specialty !== undefined) payload.specialty = patch.specialty ?? null;
    if (patch.region !== undefined) payload.region = patch.region ?? null;
    if (patch.city !== undefined) payload.city = patch.city ?? null;
    if (patch.state !== undefined) payload.state = patch.state ?? null;
    if (patch.whatsapp !== undefined) payload.whatsapp = patch.whatsapp ?? null;
    if (patch.email !== undefined) payload.email = patch.email ?? null;
    if (patch.bio !== undefined) payload.bio = patch.bio ?? null;
    if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl ?? null;

    if (Object.keys(payload).length === 0) return;

    const { error } = await withTimeout(
      supabase.from('representatives').update(payload).eq('id', id).eq('company_id', user.id),
      12000,
      'Atualizar representante',
    );
    if (error) throw new Error(error.message);

    setRepresentatives(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    await refreshData();
  };

  const deleteRepresentative = async (id: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem excluir representantes.');
    assertSupabaseConfigured();
    await deleteCompanyOwnedRow('representatives', id, user.id, 'representante');
    setRepresentatives(prev => prev.filter(r => r.id !== id));
    await refreshData();
  };

  const addLead = async (input: LeadInput): Promise<AddLeadResult> => {
    if (!user) throw new Error('Você precisa estar logado.');
    const lead: Lead = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      ...input,
      doctorId: user.id,
      doctorName: user.name,
      doctorSpecialty: user.specialty,
      doctorWhatsapp: undefined,
      connectionStatus: 'none',
      createdAt: new Date().toISOString(),
    };

    const mergeLeadInState = (nextLead: Lead) => {
      if (
        (user.role === 'empresa' && nextLead.companyId === user.id)
        || (user.role === 'medico' && nextLead.doctorId === user.id)
      ) {
        setLeads(prev => prev.some(l => isSameLead(l, nextLead)) ? prev : [nextLead, ...prev]);
      }
    };

    const existingResult = async (leadId: string): Promise<AddLeadResult> => {
      let pointsAwarded = 0;
      if (user.role === 'medico') {
        pointsAwarded = await awardInterestPoints(leadId);
        void refreshLeads();
      }
      return { created: false, leadId, pointsAwarded };
    };

    const awardInterestPoints = async (leadId: string): Promise<number> => {
      const { data: awarded, error: pointsError } = await supabase.rpc(
        'award_doctor_interest_points',
        { p_lead_id: leadId },
      );
      if (!pointsError) {
        const points = typeof awarded === 'number' && awarded > 0 ? awarded : 0;
        if (points > 0) {
          setUser(prev => prev ? { ...prev, points: (prev.points ?? 0) + points } : prev);
          void refreshProfile();
        }
        return points;
      }
      if (isMissingRpcError(pointsError, 'award_doctor_interest_points')) {
        console.warn('RPC award_doctor_interest_points ausente — pontos não alterados no cliente.');
        return 0;
      }
      console.warn('Não foi possível registrar pontos de interesse:', pointsError.message);
      return 0;
    };

    const local = readLocalLeads(lead.companyId);
    const localMatch = local.find(existing => isSameLead(existing, lead));
    if (localMatch) {
      mergeLeadInState(localMatch);
      return existingResult(localMatch.id);
    }

    if (!isSupabaseConfigured) {
      writeLocalLead(lead);
      mergeLeadInState(lead);
      const pointsAwarded = user.role === 'medico' ? POINTS_PER_INTEREST : 0;
      if (pointsAwarded > 0) {
        setUser(prev => prev ? { ...prev, points: (prev.points ?? 0) + pointsAwarded } : prev);
      }
      return { created: true, leadId: lead.id, pointsAwarded };
    }

    const findExistingLeadId = async (): Promise<string | null> => {
      const base = () => supabase
        .from('leads')
        .select('id')
        .eq('company_id', lead.companyId)
        .eq('doctor_id', lead.doctorId)
        .eq('item_type', lead.itemType)
        .eq('intent', lead.intent)
        .limit(1);

      if (lead.itemId) {
        const withItemId = await base().eq('item_id', lead.itemId);
        if (!withItemId.error && withItemId.data?.length) {
          return withItemId.data[0].id as string;
        }
        if (withItemId.error && isMissingDbColumnError(withItemId.error, ['item_id'])) {
          const byName = await base().eq('item_name', lead.itemName);
          if (!byName.error && byName.data?.length) {
            return byName.data[0].id as string;
          }
        }
        return null;
      }

      const withoutItemId = await base().is('item_id', null);
      if (!withoutItemId.error && withoutItemId.data?.length) {
        return withoutItemId.data[0].id as string;
      }
      if (withoutItemId.error && isMissingDbColumnError(withoutItemId.error, ['item_id'])) {
        const plain = await base();
        if (!plain.error && plain.data?.length) {
          return plain.data[0].id as string;
        }
      }
      return null;
    };

    const existingLeadId = await findExistingLeadId();
    if (existingLeadId) {
      const persisted = { ...lead, id: existingLeadId };
      writeLocalLead(persisted);
      mergeLeadInState(persisted);
      return existingResult(existingLeadId);
    }

    const { error: insertError } = await insertLeadResilient(supabase, lead);

    if (insertError) {
      const duplicate = insertError.code === '23505'
        || /duplicate key|unique constraint/i.test(insertError.message);
      if (duplicate) {
        const dupId = await findExistingLeadId();
        const leadId = dupId ?? lead.id;
        const persisted = { ...lead, id: leadId };
        writeLocalLead(persisted);
        mergeLeadInState(persisted);
        return existingResult(leadId);
      }
      throw new Error(insertError.message);
    }

    writeLocalLead(lead);
    mergeLeadInState(lead);

    const pointsAwarded = user.role === 'medico'
      ? await awardInterestPoints(lead.id)
      : 0;
    if (user.role === 'medico') void refreshLeads();

    return { created: true, leadId: lead.id, pointsAwarded };
  };

  const requestConnection = async (leadId: string) => {
    if (!user || user.role !== 'empresa') throw new Error('Apenas empresas podem solicitar conexão.');
    const now = new Date().toISOString();
    setLeads(prev => prev.map(lead => lead.id === leadId
      ? { ...lead, connectionStatus: 'requested', connectionRequestedAt: now }
      : lead,
    ));

    if (!isSupabaseConfigured) return;

    const { error } = await supabase.rpc('request_lead_connection', { p_lead_id: leadId });
    if (error) {
      await refreshLeads();
      throw new Error(error.message);
    }
    await refreshLeads();
  };

  const approveConnection = async (leadId: string) => {
    if (!user || user.role !== 'medico') throw new Error('Apenas médicos podem aprovar conexão.');
    const target = leads.find(lead => lead.id === leadId);
    // Só premia pontos na primeira vez que a conexão é concretizada.
    const awardsPoints = Boolean(target) && target?.connectionStatus !== 'approved';
    const now = new Date().toISOString();
    setLeads(prev => prev.map(lead => lead.id === leadId
      ? { ...lead, connectionStatus: 'approved', connectionApprovedAt: now, doctorWhatsapp: user.whatsapp }
      : lead,
    ));
    if (awardsPoints) {
      setUser(prev => prev ? { ...prev, points: (prev.points ?? 0) + POINTS_PER_CONNECTION } : prev);
    }

    if (!isSupabaseConfigured) return;

    const { error } = await supabase.rpc('approve_lead_connection', { p_lead_id: leadId });
    if (error) {
      if (awardsPoints) {
        setUser(prev => prev ? { ...prev, points: Math.max(0, (prev.points ?? 0) - POINTS_PER_CONNECTION) } : prev);
      }
      await refreshLeads();
      throw new Error(error.message);
    }
    await refreshLeads();
    // Recarrega o total autoritativo de pontos do perfil.
    const fresh = await fetchProfile(user.id, user.email);
    if (fresh) setUser(prev => prev ? { ...prev, points: fresh.points ?? prev.points } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, authReady,
      login, requestPasswordReset, updatePassword, register, logout, completeOnboarding, updateProfile, deleteAccount,
      events, products, courses, leads, locations, representatives,
      addEvent, addProduct, addCourse, addLead,
      addLocation, deleteLocation,
      addRepresentative, updateRepresentative, deleteRepresentative,
      requestConnection, approveConnection,
      deleteEvent, deleteProduct, deleteCourse,
      updateEvent,
      refreshData,
      registerInterest, cancelEventInterest, registeredEventIds,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
