import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, Event, Product, Course, Lead, LeadInput } from '../types';
import { assertSupabaseConfigured, isSupabaseConfigured, supabase, upsertProfileWithToken } from '../lib/supabase';
import { AuthContext } from './authContextValue';
import type { AuthContextType, RegisterInput } from './authContextValue';

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

function isMissingDbColumnError(error: unknown, columns: string[]) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? '');

  return columns.some(column => {
    const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:'${escaped}' column|column .*${escaped}|${escaped}.* column|${escaped}.*schema cache)`, 'i').test(message);
  });
}

function omitDbColumns<T extends Record<string, unknown>>(payload: T, columns: string[]) {
  const next: Record<string, unknown> = { ...payload };
  columns.forEach(column => {
    delete next[column];
  });
  return next;
}

// ── Helpers de conversão DB → App ────────────────────────────────────────────
function dbToUser(profile: Record<string, unknown>, email: string): User {
  // Suporta tanto schema novo (name, company) quanto existente (first_name, company_name)
  const name = (profile.name ?? profile.first_name ?? '') as string;
  const lastName = (profile.last_name ?? '') as string;
  const fullName = lastName ? `${name} ${lastName}`.trim() : name;
  const company = (profile.company ?? profile.company_name ?? undefined) as string | undefined;
  // Normaliza role: "doctor" → "medico"
  const rawRole = profile.role as string;
  const role: UserRole = rawRole === 'doctor' ? 'medico' : rawRole as UserRole;
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
    onboardingCompletedAt: profile.onboarding_completed_at as string | null | undefined,
  };
}

function dbToEvent(row: Record<string, unknown>): Event {
  return {
    id:               row.id               as string,
    title:            row.title            as string,
    description:      row.description      as string,
    date:             row.date             as string,
    time:             row.time             as string,
    location:         row.location         as string,
    category:         row.category         as string,
    maxParticipants:  row.max_participants  as number,
    registeredCount:  row.registered_count as number,
    companyId:        row.company_id       as string,
    companyName:      row.company_name     as string,
    companyWhatsapp:  row.company_whatsapp as string | undefined,
    website:          row.website          as string | undefined,
    imageUrl:         row.image_url        as string | undefined,
    createdAt:        row.created_at       as string,
  };
}

function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id:              row.id              as string,
    name:            row.name            as string,
    description:     row.description     as string,
    category:        row.category        as string,
    price:           row.price           as string | undefined,
    companyId:       row.company_id      as string,
    companyName:     row.company_name    as string,
    companyWhatsapp: row.company_whatsapp as string | undefined,
    website:         row.website         as string | undefined,
    imageUrl:        row.image_url       as string | undefined,
    availableFor:    row.available_for   as string,
    createdAt:       row.created_at      as string,
  };
}

function dbToCourse(row: Record<string, unknown>): Course {
  return {
    id:              row.id               as string,
    title:           row.title            as string,
    description:     row.description      as string,
    category:        row.category         as string,
    imageUrl:        row.image_url        as string | undefined,
    modality:        row.modality         as 'online' | 'presencial' | 'hibrido',
    date:            row.date             as string | undefined,
    time:            row.time             as string | undefined,
    location:        row.location         as string | undefined,
    duration:        row.duration         as string,
    instructor:      row.instructor       as string,
    price:           row.price            as string | undefined,
    companyId:       row.company_id       as string,
    companyName:     row.company_name     as string,
    companyWhatsapp: row.company_whatsapp as string | undefined,
    website:         row.website          as string | undefined,
    createdAt:       row.created_at       as string,
  };
}

function dbToLead(row: Record<string, unknown>): Lead {
  return {
    id:              row.id               as string,
    companyId:       row.company_id       as string,
    companyName:     row.company_name     as string,
    doctorId:        row.doctor_id        as string,
    doctorName:      row.doctor_name      as string,
    doctorSpecialty: row.doctor_specialty as string | undefined,
    doctorWhatsapp:  row.doctor_whatsapp  as string | undefined,
    itemType:        row.item_type        as Lead['itemType'],
    itemId:          row.item_id          as string | undefined,
    itemName:        row.item_name        as string,
    intent:          row.intent           as Lead['intent'],
    message:         row.message          as string | undefined,
    connectionStatus: (row.connection_status as Lead['connectionStatus'] | undefined) ?? 'none',
    connectionRequestedAt: row.connection_requested_at as string | undefined,
    connectionApprovedAt:  row.connection_approved_at  as string | undefined,
    createdAt:       row.created_at       as string,
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

    const query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await (user.role === 'empresa'
      ? query.eq('company_id', userId)
      : query.eq('doctor_id', userId));

    if (error) {
      setLeads(local);
      return;
    }

    const remote = (data ?? []).map(r => dbToLead(r as Record<string, unknown>));
    const remoteIds = new Set(remote.map(l => l.id));
    const merged = [...remote, ...local.filter(l => !remoteIds.has(l.id))];
    setLeads(merged.filter((lead, index, arr) => arr.findIndex(other => isSameLead(other, lead)) === index));
  }, [userId, user?.role]);

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
    const [evRes, prRes, coRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
    ]);
    if (evRes.data) {
      const mappedEvents = evRes.data.map(r => dbToEvent(r as Record<string, unknown>));
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
    }
    if (prRes.data) setProducts(prRes.data.map(r => dbToProduct(r as Record<string, unknown>)));
    if (coRes.data) setCourses(coRes.data.map(r => dbToCourse(r as Record<string, unknown>)));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const eventsChannel = supabase
      .channel('tessy-events-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
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
    }, 2000);

    return () => window.clearInterval(interval);
  }, [refreshData, refreshLeads, user?.role]);

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
      if (!data.user) throw new Error('Erro ao entrar. Tente novamente.');
      // Busca perfil já dentro do login para poder navegar direto ao dashboard
      const u = await fetchProfile(data.user.id, data.user.email ?? '');
      if (!u) throw new Error('Perfil não encontrado. Entre em contato com o suporte.');
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Cadastro ──
  const register = async (input: RegisterInput): Promise<User> => {
    assertSupabaseConfigured();
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

      // Se email confirmation está ativo no Supabase, não há sessão imediata
      if (!authData.session) {
        throw new Error(
          'Confirme seu e-mail antes de continuar — verifique sua caixa de entrada.'
        );
      }

      const uid = authData.user.id;

      // 2. Salva perfil via REST direto para evitar qualquer lock interno do Auth.
      try {
        await withTimeout(
          upsertProfileWithToken(authData.session.access_token, {
          id:           uid,
          name:         input.name.trim(),
          role:         input.role,
          specialty:    input.specialty ?? null,
          crm:          input.crm ?? null,
          crm_state:    input.crmState ?? null,
          company:      input.company ?? null,
          whatsapp:     input.whatsapp ?? null,
          whatsapp_connection_only: input.whatsappConnectionOnly ?? true,
          bio:          input.bio ?? null,
          }),
          12000,
          'Salvar perfil',
        );
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : 'Tente novamente.';
        throw new Error('Erro ao salvar perfil: ' + message);
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
    setUser(null);
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
  const updateProfile = async (data: { name?: string; company?: string; whatsapp?: string; whatsappConnectionOnly?: boolean }) => {
    if (!user) return;
    assertSupabaseConfigured();
    const updates: Record<string, string | boolean | undefined> = {};
    if (data.name)      { updates.name    = data.name;    }
    if (data.company)   { updates.company = data.company; updates.name = data.company; }
    if (data.whatsapp !== undefined) { updates.whatsapp = data.whatsapp; }
    if (data.whatsappConnectionOnly !== undefined) { updates.whatsapp_connection_only = data.whatsappConnectionOnly; }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw new Error(error.message);
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  // ── Eventos ──
  const addEvent = async (data: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => {
    assertSupabaseConfigured();
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
    assertSupabaseConfigured();
    await supabase.from('events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // ── Atualizar evento (título, data, hora, local, vagas, etc.) ──
  const updateEvent: AuthContextType['updateEvent'] = async (id, patch) => {
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

    let result = await supabase.from('events').update(dbPatch).eq('id', id);
    if (result.error && isMissingDbColumnError(result.error, ['image_url'])) {
      const fallbackPatch = omitDbColumns(dbPatch, ['image_url']);
      if (Object.keys(fallbackPatch).length > 0) {
        console.warn('Coluna image_url ausente em events. Salvando edição sem imagem.', result.error.message);
        result = await supabase.from('events').update(fallbackPatch).eq('id', id);
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
    if (current >= max) throw new Error('Evento esgotado.');

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
    const payload = {
      name:             data.name,
      description:      data.description,
      category:         data.category,
      price:            data.price ?? null,
      company_id:       data.companyId,
      company_name:     data.companyName,
      company_whatsapp: data.companyWhatsapp ?? null,
      available_for:    data.availableFor,
      website:          data.website ?? null,
      image_url:        data.imageUrl ?? null,
    };

    let result = await withTimeout(
      supabase.from('products').insert(payload),
      12000,
      'Publicar produto',
    );
    if (result.error && isMissingDbColumnError(result.error, ['image_url'])) {
      console.warn('Coluna image_url ausente em products. Publicando produto sem imagem.', result.error.message);
      result = await withTimeout(
        supabase.from('products').insert(omitDbColumns(payload, ['image_url'])),
        12000,
        'Publicar produto',
      );
    }
    const { error } = result;
    if (error) throw new Error(error.message);
    refreshData(); // background, não bloqueia
  };

  const deleteProduct = async (id: string) => {
    assertSupabaseConfigured();
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Cursos ──
  const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    assertSupabaseConfigured();
    const basePayload = {
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
    };
    const schedulePayload = {
      ...basePayload,
      date:             data.date ?? null,
      time:             data.time ?? null,
      location:         data.location ?? null,
      image_url:        data.imageUrl ?? null,
    };

    const result = await withTimeout(
      supabase.from('courses').insert(schedulePayload),
      12000,
      'Publicar curso',
    );
    let error = result.error;
    if (error && isMissingDbColumnError(error, ['date', 'time', 'location', 'image_url'])) {
      const fallback = await withTimeout(
        supabase.from('courses').insert(basePayload),
        12000,
        'Publicar curso',
      );
      error = fallback.error;
    }
    if (error) throw new Error(error.message);
    refreshData(); // background, não bloqueia
  };

  const deleteCourse = async (id: string) => {
    assertSupabaseConfigured();
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addLead = async (input: LeadInput) => {
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

    const local = readLocalLeads(lead.companyId);
    if (local.some(existing => isSameLead(existing, lead))) {
      return;
    }

    if (!isSupabaseConfigured) {
      writeLocalLead(lead);
      return;
    }

    let existingQuery = supabase
      .from('leads')
      .select('id')
      .eq('company_id', lead.companyId)
      .eq('doctor_id', lead.doctorId)
      .eq('item_type', lead.itemType)
      .eq('intent', lead.intent)
      .limit(1);

    existingQuery = lead.itemId ? existingQuery.eq('item_id', lead.itemId) : existingQuery.is('item_id', null);

    const { data: existing } = await existingQuery;
    if (existing && existing.length > 0) {
      writeLocalLead(lead);
      if (
        (user.role === 'empresa' && lead.companyId === user.id)
        || (user.role === 'medico' && lead.doctorId === user.id)
      ) {
        setLeads(prev => prev.some(l => isSameLead(l, lead)) ? prev : [lead, ...prev]);
      }
      return;
    }

    const { error } = await supabase.from('leads').insert({
      id: lead.id,
      company_id: lead.companyId,
      company_name: lead.companyName,
      doctor_id: lead.doctorId,
      doctor_name: lead.doctorName,
      doctor_specialty: lead.doctorSpecialty ?? null,
      doctor_whatsapp: null,
      item_type: lead.itemType,
      item_id: lead.itemId ?? null,
      item_name: lead.itemName,
      intent: lead.intent,
      message: lead.message ?? null,
      created_at: lead.createdAt,
    });

    if (error) {
      throw new Error(error.message);
    }

    writeLocalLead(lead);
    if (
      (user.role === 'empresa' && lead.companyId === user.id)
      || (user.role === 'medico' && lead.doctorId === user.id)
    ) {
      setLeads(prev => prev.some(l => isSameLead(l, lead)) ? prev : [lead, ...prev]);
    }
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
    const now = new Date().toISOString();
    setLeads(prev => prev.map(lead => lead.id === leadId
      ? { ...lead, connectionStatus: 'approved', connectionApprovedAt: now, doctorWhatsapp: user.whatsapp }
      : lead,
    ));

    if (!isSupabaseConfigured) return;

    const { error } = await supabase.rpc('approve_lead_connection', { p_lead_id: leadId });
    if (error) {
      await refreshLeads();
      throw new Error(error.message);
    }
    await refreshLeads();
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, authReady,
      login, register, logout, completeOnboarding, updateProfile,
      events, products, courses, leads,
      addEvent, addProduct, addCourse, addLead,
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
