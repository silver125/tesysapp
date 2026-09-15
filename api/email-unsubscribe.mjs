import { emailDatabase } from '../server/email/privateEmail.mjs';
const page=body=>`<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Avisos Tessy</title><body style="font-family:Arial,sans-serif;padding:32px;max-width:480px;margin:auto"><h1>Avisos por e-mail</h1>${body}</body></html>`;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Type','text/html; charset=utf-8');
 const token=typeof req.query.token==='string'?req.query.token:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))return res.status(400).send(page('<p>Link inválido.</p>'));
 if(req.method==='GET')return res.status(200).send(page('<p>Deseja parar de receber novidades da Tessy?</p><form method="post"><button style="background:#ff4f00;color:white;border:0;padding:14px">Cancelar avisos</button></form>'));
 if(req.method!=='POST')return res.status(405).end();
 try{const {error}=await emailDatabase().rpc('unsubscribe_doctor_email',{p_token:token});if(error)throw error;return res.status(200).send(page('<p>Avisos desativados. Você pode ativá-los novamente no seu perfil.</p><a href="/medico">Voltar à Tessy</a>'));}catch{return res.status(503).send(page('<p>Não foi possível atualizar. Tente novamente ou desative os avisos no seu perfil.</p>'));}
}
