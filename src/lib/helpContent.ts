import type { UserRole } from '../types';

export type HelpItem = { question: string; answer: string };

const DOCTOR_FAQ: HelpItem[] = [
  {
    question: 'Como encontro um representante?',
    answer: 'Na aba Buscar, filtre por estado, cidade, categoria (skincare, tecnologias ou parcerias) ou digite o nome, empresa ou marca.',
  },
  {
    question: 'O que é "Solicitar contato"?',
    answer: 'Você notifica o representante/empresa sobre seu interesse. Seu WhatsApp continua privado até você aprovar um pedido de autorização.',
  },
  {
    question: 'Quando meu WhatsApp é liberado?',
    answer: 'Só depois que a conta do representante pede autorização e você aprova em Conexões. Sem aprovação, o número não é compartilhado.',
  },
  {
    question: 'A Tessy tem chat interno?',
    answer: 'Não. Depois da aprovação, a conversa acontece no WhatsApp, fora do app.',
  },
];

const COMPANY_FAQ: HelpItem[] = [
  {
    question: 'Como um médico me encontra?',
    answer: 'Complete Meu perfil (foto, categorias, marcas, regiões e WhatsApp). Perfis incompletos não aparecem na busca.',
  },
  {
    question: 'Preciso cadastrar produto ou evento?',
    answer: 'Não. Produtos, tecnologias e parcerias entram como informações do perfil do representante.',
  },
  {
    question: 'Como falo com o médico?',
    answer: 'Em Interessados, peça autorização para conversar. O médico aprova e só então o WhatsApp dele fica disponível.',
  },
  {
    question: 'Posso cadastrar vários representantes?',
    answer: 'Sim. Use Equipe em Meu perfil ou Conta. Cada interesse identifica o representante escolhido pelo médico.',
  },
];

export function helpItemsForRole(role: UserRole): HelpItem[] {
  return role === 'empresa' ? COMPANY_FAQ : DOCTOR_FAQ;
}

export function helpFlowSummary(role: UserRole): string {
  if (role === 'empresa') {
    return 'Complete o perfil → médico solicita contato → você pede autorização → médico aprova → WhatsApp';
  }
  return 'Busque por região → solicite contato → aprove a autorização → WhatsApp';
}
