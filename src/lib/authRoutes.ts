import type { UserRole } from '../types';

/** Normaliza valores legados do banco/trigger para os papéis do app. */
export function normalizeUserRole(raw: unknown): UserRole | null {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'medico' || value === 'doctor') return 'medico';
  if (value === 'empresa' || value === 'company') return 'empresa';
  return null;
}

export function dashboardPathForRole(role: UserRole | null): '/medico' | '/empresa' | null {
  if (role === 'medico') return '/medico';
  if (role === 'empresa') return '/empresa';
  return null;
}
