import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processDigests } from '../server/email/processDigests.mjs';

const claim={id:'dispatch-1',token:'token-1',email:'doctor@example.invalid',items:[{id:'p1',type:'product',title:'Produto',companyName:'Exemplo'}]};
function fixture({verifyError=false,sendError=false,empty=false,persistError=false}={}) {
  const calls=[];
  let claimed=false;
  const db={rpc:async(name,args)=>{
    calls.push({name,args});
    if(name==='claim_doctor_email_digest') {
      const data=claimed?null:{...claim,items:empty?[]:claim.items};claimed=true;
      return {data,error:null};
    }
    return {error:persistError?new Error('Database unavailable'):null};
  }};
  const transport={verify:async()=>{if(verifyError)throw Error('SMTP unavailable');},sendMail:async(mail)=>{
    calls.push({name:'send',mail});if(sendError)throw Error('Connection lost');return {accepted:[claim.email]};
  }};
  return {db,transport,calls};
}
test('SMTP failure cannot reserve or consume any updates',async()=>{
  const f=fixture({verifyError:true});await assert.rejects(processDigests(f.db,f.transport));assert.deepEqual(f.calls,[]);
});
test('empty digest cannot reach the mail server',async()=>{
  const f=fixture({empty:true});await assert.rejects(processDigests(f.db,f.transport),/Empty digest/);
  assert.ok(!f.calls.some(c=>c.name==='send'));
});
test('uncertain delivery is recorded and processing stops without retrying',async()=>{
  const f=fixture({sendError:true});await assert.rejects(processDigests(f.db,f.transport));
  assert.equal(f.calls.filter(c=>c.name==='send').length,1);
  assert.deepEqual(f.calls.at(-1),{name:'finish_doctor_email_digest',args:{p_id:claim.id,p_status:'uncertain'}});
});
test('accepted message includes cancellation and stable message ID',async()=>{
  const f=fixture();assert.deepEqual(await processDigests(f.db,f.transport),{accepted:1});
  const mail=f.calls.find(c=>c.name==='send').mail;
  assert.equal(mail.to,claim.email);assert.equal(mail.messageId,'<digest-dispatch-1@tessybr.com>');
  assert.match(mail.headers['List-Unsubscribe'],/email-unsubscribe/);
  assert.equal(f.calls.find(c=>c.name==='finish_doctor_email_digest').args.p_status,'accepted');
});
test('failure to save delivery status stops further processing',async()=>{
  const f=fixture({persistError:true});await assert.rejects(processDigests(f.db,f.transport),/Status persistence failed/);
  assert.equal(f.calls.filter(c=>c.name==='claim_doctor_email_digest').length,1);
});
