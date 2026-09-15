import { renderDoctorDigest } from './doctorDigest.mjs';

// Dependencies are injected so failure paths can be tested without sending email.
export async function processDigests(db, transport) {
  // Verify SMTP before reserving an email. Never log addresses or SMTP responses.
  await transport.verify();
  let accepted=0;
  for(let i=0;i<3;i++) {
   const {data,error}=await db.rpc('claim_doctor_email_digest');if(error)throw Error('Claim failed');if(!data)break;
   let status='uncertain';
   try {
    const mail=renderDoctorDigest({items:data.items,unsubscribeUrl:`https://www.tessybr.com/api/email-unsubscribe?token=${data.token}`});
    if(!mail)throw Error('Empty digest');
    const info=await transport.sendMail({...mail,to:data.email,messageId:`<digest-${data.id}@tessybr.com>`,headers:{'List-Unsubscribe':`<https://www.tessybr.com/api/email-unsubscribe?token=${data.token}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}});
    if(!info.accepted?.length)throw Error('SMTP did not accept message');
    status='accepted';accepted++;
   } finally {
    const {error}=await db.rpc('finish_doctor_email_digest',{p_id:data.id,p_status:status});if(error)throw Error('Status persistence failed');
   }
  }
  return {accepted};
}
