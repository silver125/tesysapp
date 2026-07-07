/** Versão da política — incremente ao alterar o texto. */
export const PRIVACY_POLICY_VERSION = '2026-07-07';

export const LEGAL_CONTACT_EMAIL = 'contato@tessybr.com';

export const privacyPolicySections = [
  {
    title: '1. Quem somos',
    body:
      'A Tessy.app (“Tessy”, “nós”) é uma plataforma digital que conecta médicos e empresas de saúde para oportunidades comerciais, eventos, produtos e representantes. ' +
      'Esta Política de Privacidade descreve como tratamos dados pessoais de usuários cadastrados, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
  },
  {
    title: '2. Dados que coletamos',
    body:
      'No cadastro e uso da plataforma, podemos tratar: nome, e-mail, senha (armazenada de forma segura pelo provedor de autenticação), CRM e UF (médicos), especialidade, ' +
      'nome da empresa e WhatsApp (empresas), foto de perfil, interesses em produtos/eventos e histórico de conexões entre médicos e empresas.',
  },
  {
    title: '3. Finalidade do tratamento',
    body:
      'Utilizamos seus dados para: criar e autenticar sua conta; personalizar sua experiência na plataforma; permitir que empresas publiquem oportunidades e que médicos manifestem interesse; ' +
      'facilitar conexões comerciais; enviar comunicações relacionadas ao serviço (como recuperação de senha); cumprir obrigações legais; e melhorar a segurança da plataforma.',
  },
  {
    title: '4. Compartilhamento de WhatsApp e CRM',
    body:
      'Dados sensíveis de contato profissional (WhatsApp e CRM) não são públicos na plataforma. ' +
      'O WhatsApp do médico só é compartilhado com uma empresa após conexão aprovada pelo médico. ' +
      'Empresas visualizam informações de médicos apenas quando existe interesse registrado (lead) entre as partes.',
  },
  {
    title: '5. Base legal (LGPD)',
    body:
      'O tratamento baseia-se, conforme o caso, em: execução de contrato ou procedimentos preliminares (cadastro e uso da plataforma); consentimento (compartilhamento de WhatsApp após aprovação de conexão); ' +
      'e legítimo interesse (segurança, prevenção a fraudes e melhoria do serviço), sempre respeitando seus direitos.',
  },
  {
    title: '6. Retenção e exclusão',
    body:
      'Mantemos os dados enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais. ' +
      'Você pode solicitar a exclusão da conta nas configurações do perfil; nesse caso, removemos seu perfil e dados associados na medida do possível.',
  },
  {
    title: '7. Seus direitos',
    body:
      'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação ou revogação de consentimento, nos termos da LGPD. ' +
      `Entre em contato pelo e-mail ${LEGAL_CONTACT_EMAIL}.`,
  },
  {
    title: '8. Segurança',
    body:
      'Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo controle de acesso, criptografia em trânsito e políticas de privacidade no banco de dados. ' +
      'Nenhum sistema é 100% inviolável; em caso de incidente relevante, notificaremos conforme exigido pela lei.',
  },
  {
    title: '9. Alterações',
    body:
      'Podemos atualizar esta política. A data da versão vigente aparece no topo desta página. ' +
      'Alterações relevantes podem ser comunicadas por e-mail ou aviso na plataforma.',
  },
  {
    title: '10. Contato',
    body:
      `Controlador: Tessy.app — ${LEGAL_CONTACT_EMAIL}. ` +
      'Para dúvidas sobre privacidade ou exercício de direitos, escreva para este endereço.',
  },
] as const;

export const termsOfUseSections = [
  {
    title: '1. Aceitação',
    body:
      'Ao criar uma conta na Tessy.app, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não utilize a plataforma.',
  },
  {
    title: '2. Elegibilidade',
    body:
      'Médicos devem informar CRM válido. Empresas devem representar organizações legítimas do setor de saúde. ' +
      'É proibido criar contas falsas, duplicadas ou com dados de terceiros sem autorização.',
  },
  {
    title: '3. Uso permitido',
    body:
      'A Tessy destina-se a conexões comerciais profissionais entre médicos e empresas de saúde. ' +
      'É vedado publicar conteúdo ilegal, enganoso, ofensivo ou que viole regulamentação sanitária ou publicitária.',
  },
  {
    title: '4. Responsabilidades',
    body:
      'Você é responsável pela veracidade dos dados informados e pela confidencialidade da sua senha. ' +
      'Empresas são responsáveis pelo conteúdo que publicam (produtos, eventos, representantes). ' +
      'A Tessy não garante resultados comerciais decorrentes das conexões.',
  },
  {
    title: '5. Conexões e WhatsApp',
    body:
      'O compartilhamento de WhatsApp entre médico e empresa ocorre somente após aprovação explícita da conexão pelo médico. ' +
      'O uso do WhatsApp fora da plataforma é de responsabilidade das partes.',
  },
  {
    title: '6. Encerramento de conta',
    body:
      'Você pode excluir sua conta a qualquer momento nas configurações. ' +
      'A Tessy pode suspender ou encerrar contas que violem estes termos ou representem risco à plataforma ou a terceiros.',
  },
  {
    title: '7. Limitação de responsabilidade',
    body:
      'A plataforma é fornecida “como está”. Não nos responsabilizamos por danos indiretos decorrentes do uso ou impossibilidade de uso, ' +
      'na extensão permitida pela legislação aplicável.',
  },
  {
    title: '8. Contato',
    body: `Dúvidas sobre estes termos: ${LEGAL_CONTACT_EMAIL}.`,
  },
] as const;
