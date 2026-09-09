/** Mapeia abas internas (sem item na barra) para o destaque correto na navegação. */
export function companyNavActiveKey(tab: string): string {
  if (tab === 'team') return 'profile';
  if (tab === 'create' || tab === 'locations' || tab === 'representatives' || tab === 'listings') return 'profile';
  if (tab === 'courses' || tab === 'events' || tab === 'products' || tab === 'home') return 'leads';
  return tab;
}
