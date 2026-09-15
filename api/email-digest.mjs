import { emailReady,emailDatabase,privateEmailTransport } from '../server/email/privateEmail.mjs';
import { processDigests } from '../server/email/processDigests.mjs';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).end();
 if(!process.env.CRON_SECRET || req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({error:'Unauthorized'});
 if(!emailReady())return res.status(200).json({status:'disabled'});
 const db=emailDatabase();const transport=privateEmailTransport();
 try {
  const result=await processDigests(db,transport);
  return res.status(200).json(result);
 }catch {console.error('Doctor email digest failed; inspect private dispatch statuses before retrying.');return res.status(500).json({error:'Email processing failed'});}
 finally {transport.close();}
}
