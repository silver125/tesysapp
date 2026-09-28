/** One medical audience per company. Publication format is a separate field. */
export const MEDICAL_SEGMENTS = [
  'Nutrologia', 'Endocrinologia', 'Dermatologia', 'Cirurgia Plástica',
  'Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia', 'Pediatria',
  'Gastroenterologia', 'Ginecologia', 'Oftalmologia', 'Psiquiatria',
  'Reumatologia', 'Urologia', 'Pneumologia', 'Clínica Médica',
  'Medicina de Família', 'Radiologia', 'Anestesiologia', 'Otorrinolaringologia',
] as const;
export function normalized(value?: string | null): string {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}
export function medicalSegment(value?: string | null): string | undefined {
  return MEDICAL_SEGMENTS.find(segment => normalized(segment) === normalized(value));
}
/** Unknown or generic legacy categories must never become a match for every specialty. */
export function matchesSegment(item: { segment?: string; specialty?: string; category?: string }, selected: string): boolean {
  const segment = medicalSegment(item.segment ?? item.specialty ?? item.category);
  return Boolean(segment && segment === medicalSegment(selected));
}
export function requireCompanySegment(user?: {role: string; specialty?: string} | null, selected?: string): string {
  const segment = medicalSegment(user?.specialty);
  if (user?.role !== 'empresa' || !segment) throw new Error('Defina o segmento médico da empresa em Editar perfil antes de publicar.');
  if (selected !== undefined && medicalSegment(selected) !== segment) throw new Error('O segmento deve ser o mesmo do perfil da empresa.');
  return segment;
}
