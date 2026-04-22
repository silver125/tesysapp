export type UserRole = 'medico' | 'empresa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  specialty?: string;
  crm?: string;
  crmState?: string;
  whatsapp?: string;
  bio?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxParticipants: number;
  registeredCount: number;
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  website?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: string;
  imageUrl?: string;
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  website?: string;
  availableFor: string;
  createdAt: string;
}

export type CourseModality = 'online' | 'presencial' | 'hibrido';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: CourseModality;
  duration: string;
  instructor: string;
  price?: string;
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  website?: string;
  createdAt: string;
}
