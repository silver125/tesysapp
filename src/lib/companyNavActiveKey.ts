/** Mapeia abas internas (sem item na barra) para o destaque correto na navegação. */
export function companyNavActiveKey(tab: string): string {
  if (tab === 'create' || tab === 'locations' || tab === 'representatives') return 'listings';
  if (tab === 'courses') return 'events';
  return tab;
}
