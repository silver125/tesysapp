export type ConnectionFilter = 'all' | 'none' | 'requested' | 'approved';
export const connectionStages = [
  { key: 'none', label: 'Novos interesses', hint: 'Aceite e inicie o contato' },
  { key: 'requested', label: 'Aguardando aprovação', hint: 'O médico decide quando conectar' },
  { key: 'approved', label: 'Conexões aprovadas', hint: 'Continue a conversa' },
] as const;
