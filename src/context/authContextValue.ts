import { createContext } from 'react';
import type { Course, Event, Lead, LeadInput, Product, User, UserRole } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; company?: string; whatsapp?: string }) => Promise<void>;
  events: Event[];
  products: Product[];
  courses: Course[];
  leads: Lead[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  addLead: (lead: LeadInput) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateEvent: (id: string, patch: Partial<Omit<Event, 'id' | 'createdAt' | 'companyId' | 'companyName' | 'registeredCount'>>) => Promise<void>;
  refreshData: () => Promise<void>;
  registerInterest: (eventId: string) => Promise<void>;
  registeredEventIds: Set<string>;
}

export interface RegisterInput {
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

export const AuthContext = createContext<AuthContextType | null>(null);
