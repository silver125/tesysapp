import { normalized } from './segments';
export const BRAZIL_STATES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};
export const BRAZIL_REGIONS: Record<string, string[]> = {
  Norte: ['AC','AP','AM','PA','RO','RR','TO'], Nordeste: ['AL','BA','CE','MA','PB','PE','PI','RN','SE'],
  'Centro-Oeste': ['DF','GO','MT','MS'], Sudeste: ['ES','MG','RJ','SP'], Sul: ['PR','RS','SC'],
};
export function statesInRegion(value: string): string[] {
  const text = normalized(value);
  const states = new Set<string>();
  // Only expand exact macro-region labels: "Sul de MG" is not the South region.
  for (const chunk of text.split(/[,;|/]+/)) {
    const region = Object.keys(BRAZIL_REGIONS).find(name => normalized(name) === chunk.trim().replace(/^regiao\s+/, ''));
    if (region) BRAZIL_REGIONS[region].forEach(uf => states.add(uf.toLowerCase()));
  }
  let remaining = ` ${text} `;
  for (const [uf, name] of Object.entries(BRAZIL_STATES).sort((a,b) => b[1].length-a[1].length)) {
    const pattern = new RegExp(`(^|[^a-z])${normalized(name)}(?=$|[^a-z])`, 'g');
    if (pattern.test(remaining)) { states.add(uf.toLowerCase()); remaining = remaining.replace(pattern,' '); }
  }
  remaining.split(/[^a-z]+/).filter(token => token.toUpperCase() in BRAZIL_STATES).forEach(uf => states.add(uf));
  return [...states];
}
export function isNational(keys: string[]): boolean {
  return keys.some(key => /^(brasil|nacional|todo o brasil|todo brasil|atendimento nacional|online|on-line|webinar)$/.test(normalized(key)));
}
export function matchesGeography(keys: string[], region = 'all', state = 'all'): boolean {
  if (region === 'all' && state === 'all') return true;
  const regionStates = region === 'all' ? Object.keys(BRAZIL_STATES) : BRAZIL_REGIONS[region];
  if (!regionStates || (state !== 'all' && !regionStates.includes(state.toUpperCase()))) return false;
  if (isNational(keys)) return true;
  const covered = new Set(keys.flatMap(statesInRegion));
  return state !== 'all' ? covered.has(state.toLowerCase()) : regionStates.some(uf => covered.has(uf.toLowerCase()));
}
export function stateAfterRegionChange(region: string, state: string): string {
  return region === 'all' || BRAZIL_REGIONS[region]?.includes(state.toUpperCase()) ? state : 'all';
}
