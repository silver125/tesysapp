import type { UserRole } from '../types';

export type HelpItem = { question: string; answer: string };

const DOCTOR_FAQ: HelpItem[] = [
  {
    question: 'O que é "Avisar interesse"?',
    answer: 'Você notifica a empresa sobre seu interesse em um produto, evento ou workshop. Seu WhatsApp continua privado até você aprovar um pedido de contato.',
  },
  {
    question: 'O que é "Pedir permissão para WhatsApp" (lado empresa)?',
    answer: 'Quando você avisa interesse, a empresa pode pedir permissão para falar com você. Você aprova na home — só então seu número é liberado.',
  },
  {
    question: 'A Tessy tem chat interno?',
    answer: 'Não. Depois da aprovação, a conversa acontece no WhatsApp, fora do app.',
  },
  {
    question: 'Qual a diferença entre evento e workshop?',
    answer: 'Eventos são congressos, simpósios e webinars. Workshops são capacitações com instrutor e carga horária. Os dois aparecem em "Eventos e workshops".',
  },
  {
    question: 'Para que servem os pontos?',
    answer: 'Mostram seu engajamento na plataforma. Você ganha pontos ao avisar interesse; conexões aprovadas valem mais.',
  },
  {
    question: 'O que são representantes?',
    answer: 'Contatos comerciais das empresas na sua região. Ao avisar interesse, a empresa é notificada e pode pedir permissão para WhatsApp.',
  },
];

const COMPANY_FAQ: HelpItem[] = [
  {
    question: 'Como um médico me encontra?',
    answer: 'Publique produtos, eventos ou workshops em Meus anúncios. Médicos compatíveis veem na vitrine e podem avisar interesse.',
  },
  {
    question: 'O que aparece em "Médicos"?',
    answer: 'Médicos que clicaram em interesse nos seus anúncios, com especialidade e contexto do item.',
  },
  {
    question: 'Como falo com o médico?',
    answer: 'Clique em "Pedir permissão para WhatsApp". O médico precisa aprovar. Depois, você conversa no WhatsApp dele.',
  },
  {
    question: 'Por que o médico precisa aprovar?',
    answer: 'A Tessy protege o WhatsApp do médico. Sem aprovação, você não vê o número — só o sinal de interesse.',
  },
  {
    question: 'Qual a diferença entre evento e workshop?',
    answer: 'Evento: congresso, webinar ou encontro. Workshop: capacitação com instrutor. Publique em Meus anúncios → criar.',
  },
  {
    question: 'Preciso cadastrar representante?',
    answer: 'Recomendado. Com foto e região, médicos encontram sua empresa mais rápido na aba Representantes.',
  },
];

export function helpItemsForRole(role: UserRole): HelpItem[] {
  return role === 'empresa' ? COMPANY_FAQ : DOCTOR_FAQ;
}

export function helpFlowSummary(role: UserRole): string {
  if (role === 'empresa') {
    return 'Publique → médico avisa interesse → você pede permissão → médico aprova → WhatsApp';
  }
  return 'Descubra → avise interesse → empresa pede permissão → você aprova → WhatsApp';
}
