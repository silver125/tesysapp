import { useState } from 'react';
import type { Lead } from '../types';
import type { ConnectionFeedback } from '../lib/connectionFeedback';
import { supabase } from '../lib/supabase';
import './connectionHistory.css';

type Props = { leads: Lead[]; feedback: ConnectionFeedback[]; loading: boolean; error: string; onReload: () => void; onOpen: (company: string) => void };
export default function ConnectionHistory({leads,feedback,loading,error,onReload,onOpen}: Props) {
  const [query,setQuery]=useState('');
  const [expanded,setExpanded]=useState(false);
  const [editing,setEditing]=useState<string | null>(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [saveError,setSaveError]=useState('');
  const filtered=[...leads].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).filter(l=>`${l.companyName} ${l.itemName}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  async function save(lead: Lead, received: boolean, useful: boolean | null) {
    if(busy)return;
    setBusy(true);setSaveError('');setNotice('');
    try {
      const {error}=await supabase.rpc('save_connection_feedback',{p_lead_id:lead.id,p_received_reply:received,p_useful:useful});
      if(error)throw error;
      setNotice('Avaliação salva. Você pode alterá-la ou removê-la.');setEditing(null);onReload();
    }catch{setSaveError('Não foi possível salvar. Tente novamente.');}finally{setBusy(false);}
  }
  async function remove(id: string) {
    if(busy)return;setBusy(true);setSaveError('');setNotice('');
    try {const {error}=await supabase.rpc('delete_connection_feedback',{p_lead_id:id});if(error)throw error;onReload();setNotice('Avaliação removida.');setEditing(null);}
    catch{setSaveError('Não foi possível remover. Tente novamente.');}finally{setBusy(false);}
  }
  return <section className="co-section connection-history" aria-labelledby="connection-history-title">
    <div className="co-section-heading"><h2 id="connection-history-title">Meu histórico</h2><span>{leads.length} registros</span></div>
    <p className="co-caption">Reencontre contatos e avalie sua experiência. A conversa no WhatsApp não é registrada aqui.</p>
    {leads.length>0&&<input type="search" aria-label="Buscar no histórico" placeholder="Empresa ou oportunidade" value={query} onChange={e=>{setQuery(e.target.value);setExpanded(false);}} />}
    {error&&<p role="alert">{error} <button onClick={onReload}>Tentar novamente</button></p>}
    {notice&&<p role="status">{notice}</p>}{saveError&&<p role="alert">{saveError}</p>}
    {!filtered.length&&<p className="co-caption">{query?'Nenhum contato encontrado.':'Seus interesses e conexões aparecerão aqui.'}</p>}
    {(expanded?filtered:filtered.slice(0,3)).map(lead=>{
      const rating=feedback.find(f=>f.lead_id===lead.id);
      const approved=lead.connectionStatus==='approved';
      return <article key={lead.id} className="connection-history-row">
        <div className="connection-history-meta"><strong>{lead.companyName}</strong><time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</time></div>
        <p>{lead.itemName}</p><small>{approved?'Conexão aprovada':lead.connectionStatus==='requested'?'Aguardando aprovação':'Interesse registrado'}</small>
        {rating&&<p className="connection-rating">{!rating.received_reply?'Ainda sem retorno':rating.useful?'Conversa útil':'Conversa não foi útil'}</p>}
        <div className="connection-history-actions"><button onClick={()=>onOpen(lead.companyName)}>Ver contato</button>{approved&&<button disabled={busy||loading||Boolean(error)} onClick={()=>{setEditing(editing===lead.id?null:lead.id);setNotice('');setSaveError('');}}>{rating?'Editar avaliação':'Avaliar contato'}</button>}</div>
        {editing===lead.id&&<fieldset disabled={busy}>
          <legend>Você conversou com a empresa?</legend>
          <p className="co-caption">Só avalie o que aconteceu. Sua resposta individual é privada; empresas recebem estatísticas de grupos com pelo menos 5 médicos.</p>
          <div className="connection-history-actions">
            <button onClick={()=>void save(lead,true,true)}>Sim, foi útil</button><button onClick={()=>void save(lead,true,false)}>Sim, não foi útil</button><button onClick={()=>void save(lead,false,null)}>Ainda sem retorno</button>
            {rating&&<button onClick={()=>void remove(lead.id)}>Remover avaliação</button>}
          </div>{busy&&<p role="status">Salvando…</p>}
        </fieldset>}
      </article>;
    })}
    {filtered.length>3&&<button className="co-text-button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Mostrar menos':`Ver todos (${filtered.length})`}</button>}
  </section>;
}
