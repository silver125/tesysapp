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
  whatsappConnectionOnly?: boolean;
  bio?: string;
  avatarUrl?: string;
  onboardingCompletedAt?: string | null;
  points?: number;
}

export type LocationType =
  | 'coworking'
  | 'sala_reuniao'
  | 'consultorio'
  | 'clinica'
  | 'hospital'
  | 'ponto_venda'
  | 'distribuidor'
  | 'farmacia'
  | 'loja'
  | 'outro';

export interface Location {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

export interface Representative {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  specialty?: string;
  region?: string;
  city?: string;
  state?: string;
  whatsapp?: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
  createdAt: string;
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
  anvisaRegularized?: boolean;
  commerciallyAvailable?: boolean;
  listingType?: 'product' | 'partnership';
  createdAt: string;
}

export type LeadIntent =
  | 'representative_contact'
  | 'sample_request'
  | 'instagram_partnership'
  | 'event_interest'
  | 'course_interest';

export type LeadItemType = 'company' | 'product' | 'event' | 'course';

export interface Lead {
  id: string;
  companyId: string;
  companyName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorWhatsapp?: string;
  doctorAvatarUrl?: string;
  itemType: LeadItemType;
  itemId?: string;
  itemName: string;
  intent: LeadIntent;
  message?: string;
  connectionStatus?: 'none' | 'requested' | 'approved';
  connectionRequestedAt?: string;
  connectionApprovedAt?: string;
  createdAt: string;
}

export interface LeadInput {
  companyId: string;
  companyName: string;
  itemType: LeadItemType;
  itemId?: string;
  itemName: string;
  intent: LeadIntent;
  message?: string;
}

/** Resultado idempotente ao registrar interesse comercial. */
export interface AddLeadResult {
  created: boolean;
  leadId: string;
  pointsAwarded: number;
}

export type CourseModality = 'online' | 'presencial' | 'hibrido';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  modality: CourseModality;
  date?: string;
  time?: string;
  location?: string;
  duration: string;
  instructor: string;
  price?: string;
  companyId: string;
  companyName: string;
  companyWhatsapp?: string;
  website?: string;
  createdAt: string;
}
