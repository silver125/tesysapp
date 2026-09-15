import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
export function emailReady(env=process.env) {
 return env.EMAIL_DIGEST_ENABLED==='true' && Boolean(env.SMTP_PASSWORD && env.CRON_SECRET && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
export function emailDatabase() {
 return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function privateEmailTransport() {
 return nodemailer.createTransport({host:'mail.privateemail.com',port:465,secure:true,auth:{user:'contato@tessybr.com',pass:process.env.SMTP_PASSWORD},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:10000});
}
