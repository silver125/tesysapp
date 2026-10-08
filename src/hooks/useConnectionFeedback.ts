import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ConnectionFeedback } from '../lib/connectionFeedback';
export function useConnectionFeedback(userId: string | undefined) {
  const [items,setItems]=useState<ConnectionFeedback[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [version,setVersion]=useState(0);
  const reload=useCallback(()=>setVersion(v=>v+1),[]);
  useEffect(()=>{
    let active=true;
    if(!userId)return;
    supabase.from('connection_feedback').select('lead_id,company_id,received_reply,useful,updated_at').eq('doctor_id',userId).then(({data,error})=>{
      if(!active)return;
      setError(error?'Não foi possível carregar suas avaliações.':'');
      setItems(error?[]:(data || []));setLoading(false);
    });
    return()=>{active=false;};
  },[userId,version]);
  return {items,loading,error,reload};
}
