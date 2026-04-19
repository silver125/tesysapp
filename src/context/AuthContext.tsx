import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, Event, Product, Course } from '../types';

type StoredUser = User & { password: string };

const SEED_USERS: StoredUser[] = [
  {
    id: '1',
    name: 'Dr. Carlos Mendes',
    email: 'medico@teste.com',
    password: '123456',
    role: 'medico',
    specialty: 'Cardiologia',
  },
  {
    id: '2',
    name: 'Pharma Brasil',
    email: 'empresa@teste.com',
    password: '123456',
    role: 'empresa',
    company: 'Pharma Brasil Ltda.',
    whatsapp: '5511999999999',
  },
];

const SEED_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Simpósio de Cardiologia 2025',
    description: 'Palestras com especialistas sobre cardiologia intervencionista.',
    date: '2025-06-15',
    time: '08:00',
    location: 'São Paulo, SP',
    category: 'Congresso',
    maxParticipants: 200,
    registeredCount: 87,
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    title: 'Workshop: Novas Terapias em Oncologia',
    description: 'Imunoterapia e terapias-alvo para oncologistas.',
    date: '2025-07-20',
    time: '09:00',
    location: 'Rio de Janeiro, RJ',
    category: 'Workshop',
    maxParticipants: 50,
    registeredCount: 32,
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    createdAt: new Date().toISOString(),
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'CardioPlus 10mg',
    description: 'Medicamento para hipertensão arterial.',
    category: 'Cardiologia',
    price: 'Sob consulta',
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    availableFor: 'Médicos credenciados',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'OncoVital Infusion',
    description: 'Solução para infusão em terapias oncológicas.',
    category: 'Oncologia',
    price: 'Sob consulta',
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    availableFor: 'Oncologistas',
    createdAt: new Date().toISOString(),
  },
];

const SEED_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Atualização em ECG',
    description: 'Curso prático para leitura e interpretação de eletrocardiogramas. Voltado para médicos professores e residentes.',
    category: 'Cardiologia',
    modality: 'online',
    duration: '20 horas',
    instructor: 'Dra. Ana Paula Souza',
    price: 'R$ 490',
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    title: 'Imunoterapia Aplicada',
    description: 'Curso avançado em imunoterapia oncológica. Certificado ao final.',
    category: 'Oncologia',
    modality: 'hibrido',
    duration: '40 horas',
    instructor: 'Dr. Roberto Lima',
    price: 'R$ 1.290',
    companyId: '2',
    companyName: 'Pharma Brasil',
    companyWhatsapp: '5511999999999',
    createdAt: new Date().toISOString(),
  },
];

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialty?: string;
  company?: string;
  whatsapp?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; company?: string; whatsapp?: string }) => void;
  events: Event[];
  products: Product[];
  courses: Course[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  deleteProduct: (id: string) => void;
  deleteCourse: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => load('tessy_users', SEED_USERS));
  const [user, setUser] = useState<User | null>(() => load<User | null>('tessy_user', null));
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>(() => load('tessy_events', SEED_EVENTS));
  const [products, setProducts] = useState<Product[]>(() => load('tessy_products', SEED_PRODUCTS));
  const [courses, setCourses] = useState<Course[]>(() => load('tessy_courses', SEED_COURSES));

  useEffect(() => { localStorage.setItem('tessy_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('tessy_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('tessy_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('tessy_courses', JSON.stringify(courses)); }, [courses]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    setIsLoading(false);
    if (!found) throw new Error('E-mail ou senha incorretos.');
    const { password: _pw, ...safe } = found;
    void _pw;
    setUser(safe);
    localStorage.setItem('tessy_user', JSON.stringify(safe));
  };

  const register = async (input: RegisterInput): Promise<User> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const exists = users.some(u => u.email.toLowerCase() === input.email.toLowerCase());
    if (exists) {
      setIsLoading(false);
      throw new Error('Este e-mail já está cadastrado.');
    }
    const newUser: StoredUser = {
      id: `u${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      role: input.role,
      specialty: input.specialty,
      company: input.company,
      whatsapp: input.whatsapp,
      bio: input.bio,
    };
    setUsers(prev => [...prev, newUser]);
    const { password: _pw, ...safe } = newUser;
    void _pw;
    setUser(safe);
    localStorage.setItem('tessy_user', JSON.stringify(safe));
    setIsLoading(false);
    return safe;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tessy_user');
  };

  const addEvent = (data: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => {
    setEvents(prev => [
      { ...data, id: `e${Date.now()}`, registeredCount: 0, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    setProducts(prev => [
      { ...data, id: `p${Date.now()}`, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addCourse = (data: Omit<Course, 'id' | 'createdAt'>) => {
    setCourses(prev => [
      { ...data, id: `c${Date.now()}`, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const deleteCourse = (id: string) => setCourses(prev => prev.filter(c => c.id !== id));

  const updateProfile = (data: { name?: string; company?: string; whatsapp?: string }) => {
    if (!user) return;
    const updated: User = {
      ...user,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
    };
    setUser(updated);
    localStorage.setItem('tessy_user', JSON.stringify(updated));
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u));
  };

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, login, register, logout, updateProfile,
        events, products, courses,
        addEvent, addProduct, addCourse,
        deleteEvent, deleteProduct, deleteCourse,
      }}
    >
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
