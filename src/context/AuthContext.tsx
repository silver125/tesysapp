import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, Event, Product, Course } from '../types';
import { supabase } from '../lib/supabase';

// ── Tipo do contexto ──────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; company?: string; whatsapp?: string }) => Promise<void>;
  events: Event[];
  products: Product[];
  courses: Course[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialty?: string;
  crm?: string;
  crmState?: string;
  company?: string;
  whatsapp?: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Helpers de conversão DB → App ────────────────────────────────────────────
function dbToUser(profile: Record<string, unknown>, email: string): User {
  return {
    id:        profile.id        as string,
    name:      profile.name      as string,
    email,
    role:      profile.role      as UserRole,
    specialty: profile.specialty as string | undefined,
    crm:       profile.crm       as string | undefined,
    crmState:  profile.crm_state as string | undefined,
    company:   profile.company   as string | undefined,
    whatsapp:  profile.whatsapp  as string | undefined,
    bio:       profile.bio       as string | undefined,
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
    modality:        row.modality         as 'online' | 'presencial' | 'hibrido',
    duration:        row.duration         as string,
    instructor:      row.instructor       as string,
    price:           row.price            as string | undefined,
    companyId:       row.company_id       as string,
    companyName:     row.company_name     as string,
    companyWhatsapp: row.company_whatsapp as string | undefined,
    createdAt:       row.created_at       as string,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);

  // Carrega eventos/produtos/cursos públicos
  const refreshData = useCallback(async () => {
    const [evRes, prRes, coRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
    ]);
    if (evRes.data) setEvents(evRes.data.map(r => dbToEvent(r as Record<string, unknown>)));
    if (prRes.data) setProducts(prRes.data.map(r => dbToProduct(r as Record<string, unknown>)));
    if (coRes.data) setCourses(coRes.data.map(r => dbToCourse(r as Record<string, unknown>)));
  }, []);

  // Busca perfil do usuário autenticado
  async function fetchProfile(userId: string, email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return dbToUser(data as Record<string, unknown>, email);
  }

  // Inicializa sessão e ouve mudanças de auth
  useEffect(() => {
    refreshData();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const u = await fetchProfile(session.user.id, session.user.email ?? '');
          setUser(u);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refreshData]);

  // ── Login ──
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw new Error('E-mail ou senha incorretos.');
  };

  // ── Cadastro ──
  const register = async (input: RegisterInput): Promise<User> => {
    setIsLoading(true);
    // 1. Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (authError || !authData.user) {
      setIsLoading(false);
      throw new Error(authError?.message ?? 'Erro ao criar conta.');
    }

    const uid = authData.user.id;

    // 2. Cria perfil na tabela profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id:        uid,
      name:      input.name.trim(),
      role:      input.role,
      specialty: input.specialty ?? null,
      crm:       input.crm ?? null,
      crm_state: input.crmState ?? null,
      company:   input.company ?? null,
      whatsapp:  input.whatsapp ?? null,
      bio:       input.bio ?? null,
    });

    if (profileError) {
      setIsLoading(false);
      throw new Error('Erro ao salvar perfil: ' + profileError.message);
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
    };
    setUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  // ── Logout ──
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Atualizar perfil ──
  const updateProfile = async (data: { name?: string; company?: string; whatsapp?: string }) => {
    if (!user) return;
    const updates: Record<string, string | undefined> = {};
    if (data.name)      { updates.name    = data.name;    }
    if (data.company)   { updates.company = data.company; updates.name = data.company; }
    if (data.whatsapp !== undefined) { updates.whatsapp = data.whatsapp; }

    await supabase.from('profiles').update(updates).eq('id', user.id);
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  // ── Eventos ──
  const addEvent = async (data: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => {
    const { error } = await supabase.from('events').insert({
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
    });
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // ── Produtos ──
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('products').insert({
      name:             data.name,
      description:      data.description,
      category:         data.category,
      price:            data.price ?? null,
      company_id:       data.companyId,
      company_name:     data.companyName,
      company_whatsapp: data.companyWhatsapp ?? null,
      available_for:    data.availableFor,
    });
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Cursos ──
  const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('courses').insert({
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
    });
    if (error) throw new Error(error.message);
    await refreshData();
  };

  const deleteCourse = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, authReady,
      login, register, logout, updateProfile,
      events, products, courses,
      addEvent, addProduct, addCourse,
      deleteEvent, deleteProduct, deleteCourse,
      refreshData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function buildWhatsappLink(phone: string | undefined, message?: string) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${clean}${msg}`;
}
