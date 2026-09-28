import { BRAZIL_REGIONS, BRAZIL_STATES } from '../lib/geography';
import { MEDICAL_SEGMENTS } from '../lib/segments';
export default function MarketScope({segment,region,state,onSegment,onRegion,onState}: {
 segment:string;region:string;state:string;onSegment:(v:string)=>void;onRegion:(v:string)=>void;onState:(v:string)=>void;
}) {
 const states = region === 'all' ? Object.keys(BRAZIL_STATES) : BRAZIL_REGIONS[region] ?? [];
 return <section className="market-scope" aria-label="Filtros do catálogo"><div className="market-scope__intro"><strong>Explore sua especialidade</strong><p>O mesmo segmento e local valem para representantes, eventos e produtos.</p></div><div className="market-scope__fields"><label>Segmento médico<select value={segment} onChange={e=>onSegment(e.target.value)}><option value="">Selecione um segmento</option>{MEDICAL_SEGMENTS.map(s=><option key={s}>{s}</option>)}</select></label><label>Região<select value={region} onChange={e=>onRegion(e.target.value)}><option value="all">Todas as regiões</option>{Object.keys(BRAZIL_REGIONS).map(r=><option key={r}>{r}</option>)}</select></label><label>Estado<select value={state} onChange={e=>onState(e.target.value)}><option value="all">Todos os estados</option>{states.sort().map(uf=><option key={uf} value={uf}>{uf} · {BRAZIL_STATES[uf]}</option>)}</select></label></div>{!segment && <p role="status">Escolha o segmento para ver conteúdos relevantes para você.</p>}</section>;
}
