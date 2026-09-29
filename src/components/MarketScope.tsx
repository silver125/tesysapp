import { SlidersHorizontal, CaretDown } from '@phosphor-icons/react';
import { BRAZIL_REGIONS, BRAZIL_STATES } from '../lib/geography';
import { MEDICAL_SEGMENTS } from '../lib/segments';

type MarketScopeProps = {
  segment: string;
  region: string;
  state: string;
  onSegment: (value: string) => void;
  onRegion: (value: string) => void;
  onState: (value: string) => void;
};

export default function MarketScope({ segment, region, state, onSegment, onRegion, onState }: MarketScopeProps) {
  const states = region === 'all' ? Object.keys(BRAZIL_STATES) : BRAZIL_REGIONS[region] ?? [];
  const location = state !== 'all' ? state : region !== 'all' ? region : 'Brasil';
  return (
    <details className="market-scope market-scope--compact" open={!segment || undefined}>
      <summary><SlidersHorizontal size={19} aria-hidden="true" /><span>{segment || 'Escolher especialidade'}<small>{location}</small></span><CaretDown size={16} aria-hidden="true" /><span className="sr-only">Alterar filtros</span></summary>
      <div className="market-scope__fields">
        <label>Especialidade<select value={segment} onChange={e => onSegment(e.target.value)}><option value="">Selecione</option>{MEDICAL_SEGMENTS.map(s => <option key={s}>{s}</option>)}</select></label>
        <label>Região<select value={region} onChange={e => onRegion(e.target.value)}><option value="all">Todo o Brasil</option>{Object.keys(BRAZIL_REGIONS).map(r => <option key={r}>{r}</option>)}</select></label>
        <label>Estado<select value={state} onChange={e => onState(e.target.value)}><option value="all">Todos os estados</option>{[...states].sort().map(uf => <option key={uf} value={uf}>{uf} · {BRAZIL_STATES[uf]}</option>)}</select></label>
      </div>
    </details>
  );
}
