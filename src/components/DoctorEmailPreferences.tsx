import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
type Frequency = 'off' | 'daily' | 'weekly';
export default function DoctorEmailPreferences({ userId }: {userId:string}) {
 const [frequency,setFrequency]=useState<Frequency>('off');
 const [available,setAvailable]=useState(false);
 const [subscribed,setSubscribed]=useState(false);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{let active=true;setLoading(true);setAvailable(false);setSubscribed(false);setFeedback('');setError('');void (async()=>{try{
  const status=await fetch('/api/email-status').then(response=>response.ok?response.json():{available:false}).catch(()=>({available:false}));
  const {data,error}=await supabase.from('doctor_email_preferences').select('frequency').eq('doctor_id',userId).maybeSingle();
  if(error)throw error;
  if(active){setAvailable(status.available===true);setSubscribed(Boolean(data&&data.frequency!=='off'));setFrequency(data?.frequency || 'off');}
 }catch{ /* Keep unavailable settings hidden until the service can persist them. */ }
 finally{if(active)setLoading(false);}})();return()=>{active=false;};},[userId]);
 async function save(){if(!available&&frequency!=='off')return;setBusy(true);setError('');setFeedback('');try{const {error}=await supabase.rpc('set_doctor_email_frequency',{p_frequency:frequency});if(error)throw error;setSubscribed(frequency!=='off');setFeedback(frequency==='off'?'Avisos desativados.':'Preferência salva. Enviaremos apenas quando houver novidades nos seus interesses.');}catch{setError('Não foi possível salvar. Tente novamente.');}finally{setBusy(false);}}
 if(loading||(!available&&!subscribed&&!feedback))return null;
 return <section style={{border:'1px solid var(--line)',padding:16,marginTop:20}} aria-labelledby="doctor-email-title">
  <h3 id="doctor-email-title" style={{fontSize:16,margin:0}}>Novidades por e-mail</h3>
  <p style={{fontSize:12,lineHeight:1.5,color:'var(--ink-2)'}}>Até três novidades dos seus interesses, enviadas por contato@tessybr.com. Cancele quando quiser.</p>
  {!available&&<p role="status" style={{fontSize:12}}>Os envios estão pausados. Você pode desativar seus avisos abaixo.</p>}
  <label htmlFor="doctor-email-frequency" style={{display:'block',fontSize:13,marginBottom:8}}>Frequência máxima</label>
  <select id="doctor-email-frequency" value={frequency} onChange={e=>{setFrequency(e.target.value as Frequency);setFeedback('');}} disabled={busy} style={{width:'100%',padding:12,border:'1px solid var(--line)',background:'#fff',fontSize:16}}>
   <option value="off">Não receber</option><option value="weekly" disabled={!available}>Uma vez por semana</option><option value="daily" disabled={!available}>Uma vez por dia</option>
  </select>
  <button type="button" disabled={busy||(!available&&frequency!=='off')} onClick={()=>void save()} style={{marginTop:12,padding:12,width:'100%',background:'var(--accent)',border:0,color:'#fff',fontWeight:600}}>{busy?'Salvando…':'Salvar preferência de e-mail'}</button>
  {feedback&&<p role="status" style={{fontSize:12}}>{feedback}</p>}{error&&<p role="alert" style={{fontSize:12}}>{error}</p>}
 </section>;
}
