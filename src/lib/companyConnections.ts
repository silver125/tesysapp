export type ConnectionFilter = 'all' | 'none' | 'requested' | 'approved';
export const connectionStages = [
  { key: 'none', label: 'Novos interesses', hint: 'Veja o interesse e o próximo passo' },
  { key: 'requested', label: 'Convites enviados', hint: 'O médico decide quando conectar' },
  { key: 'approved', label: 'Contato autorizado', hint: 'Continue a conversa' },
] as const;
