export type ConnectionFilter = 'all' | 'none' | 'requested' | 'approved';
export const connectionStages = [
  { key: 'none', label: 'Novos interesses', hint: 'Solicite uma conexão' },
  { key: 'requested', label: 'Aguardando aprovação', hint: 'O médico decide quando conectar' },
  { key: 'approved', label: 'Conexões aprovadas', hint: 'Continue a conversa' },
] as const;
