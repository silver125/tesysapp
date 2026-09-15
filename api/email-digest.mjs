import { emailReady,emailDatabase,privateEmailTransport } from '../server/email/privateEmail.mjs';
import { renderDoctorDigest } from '../server/email/doctorDigest.mjs';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).end();
 if(!process.env.CRON_SECRET || req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({error:'Unauthorized'});
 if(!emailReady())return res.status(200).json({status:'disabled'});
 const db=emailDatabase();const transport=privateEmailTransport();
 try {
  // Verify SMTP before reserving an email. Never log addresses or SMTP responses.
  await transport.verify();
  let accepted=0;
  for(let i=0;i<3;i++) {
   const {data,error}=await db.rpc('claim_doctor_email_digest');if(error)throw Error('Claim failed');if(!data)break;
   let status='uncertain';
   try {
    const mail=renderDoctorDigest({items:data.items,unsubscribeUrl:`https://www.tessybr.com/api/email-unsubscribe?token=${data.token}`});
    const info=await transport.sendMail({...mail,to:data.email,messageId:`<digest-${data.id}@tessybr.com>`,headers:{'List-Unsubscribe':`<https://www.tessybr.com/api/email-unsubscribe?token=${data.token}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}});
    if(!info.accepted?.length)throw Error('SMTP did not accept message');
    status='accepted';accepted++;
   } finally {
    const {error}=await db.rpc('finish_doctor_email_digest',{p_id:data.id,p_status:status});if(error)throw Error('Status persistence failed');
   }
  }
  return res.status(200).json({accepted});
 }catch {console.error('Doctor email digest failed; inspect private dispatch statuses before retrying.');return res.status(500).json({error:'Email processing failed'});}
 finally {transport.close();}
}
