export function formatLeadError(message: string): string {
  if (/doctor_name|company_name|doctor_specialty|schema cache/i.test(message)) {
    return 'Não foi possível salvar o interesse agora. Tente novamente em instantes.';
  }
  if (/duplicate key|unique constraint/i.test(message)) {
    return 'Você já registrou interesse nesta oportunidade.';
  }
  if (/row-level security|permission|policy/i.test(message)) {
    return 'Sem permissão para registrar interesse. Faça login novamente.';
  }
  return message || 'Erro ao registrar interesse.';
}
