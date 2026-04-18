import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Event, Product } from '../types';

const MOCK_USERS: (User & { password: string })[] = [
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
  },
];

const SAMPLE_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Simpósio de Cardiologia 2025',
    description: 'Evento focado nas últimas tendências em cardiologia interventiva, com palestras de especialistas nacionais e internacionais.',
    date: '2025-06-15',
    time: '08:00',
    location: 'São Paulo, SP — Hotel Grand Hyatt',
    category: 'Congresso',
    maxParticipants: 200,
    registeredCount: 87,
    companyId: '2',
    companyName: 'Pharma Brasil',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    title: 'Workshop: Novas Terapias em Oncologia',
    description: 'Workshop prático com foco em imunoterapia e terapias-alvo para oncologistas e clínicos.',
    date: '2025-07-20',
    time: '09:00',
    location: 'Rio de Janeiro, RJ — Centro de Convenções',
    category: 'Workshop',
    maxParticipants: 50,
    registeredCount: 32,
    companyId: '2',
    companyName: 'Pharma Brasil',
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'CardioPlus 10mg',
    description: 'Medicamento para tratamento de hipertensão arterial e insuficiência cardíaca. Indicado para pacientes adultos.',
    category: 'Cardiologia',
    price: 'Sob consulta',
    companyId: '2',
    companyName: 'Pharma Brasil',
    availableFor: 'Médicos credenciados',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'OncoVital Infusion',
    description: 'Solução para infusão em terapias oncológicas de suporte. Formulação estéril de alta pureza.',
    category: 'Oncologia',
    price: 'Sob consulta',
    companyId: '2',
    companyName: 'Pharma Brasil',
    availableFor: 'Oncologistas',
    createdAt: new Date().toISOString(),
  },
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  events: Event[];
  products: Product[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  deleteProduct: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage('tessy_user', null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>(() =>
    loadFromStorage('tessy_events', SAMPLE_EVENTS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('tessy_products', SAMPLE_PRODUCTS)
  );

  useEffect(() => {
    localStorage.setItem('tessy_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('tessy_products', JSON.stringify(products));
  }, [products]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const found = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    setIsLoading(false);
    if (!found) throw new Error('E-mail ou senha incorretos.');
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem('tessy_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tessy_user');
  };

  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `e${Date.now()}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, events, products, addEvent, addProduct, deleteEvent, deleteProduct }}
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
