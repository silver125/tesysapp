import { test } from 'node:test';
import assert from 'node:assert/strict';
import digest from '../api/email-digest.mjs';
import unsubscribe from '../api/email-unsubscribe.mjs';
import { emailReady } from '../server/email/privateEmail.mjs';

function response() {
  return { code: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; },
    status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; },
    send(body) { this.body=body; return this; }, end() { return this; } };
}
test('sending requires explicit activation and all server credentials', () => {
  assert.equal(emailReady({}), false);
  const env={EMAIL_DIGEST_ENABLED:'true',SMTP_PASSWORD:'test',CRON_SECRET:'test',SUPABASE_URL:'test',SUPABASE_SERVICE_ROLE_KEY:'test'};
  assert.equal(emailReady(env),true);
  for (const key of Object.keys(env)) assert.equal(emailReady({...env,[key]:undefined}),false);
});
test('unauthenticated cron cannot reach SMTP or database', async () => {
  const res=response(); await digest({method:'GET',headers:{}},res);
  assert.equal(res.code,401);
});
test('unsubscribe GET is only confirmation, so email scanners cannot opt out', async () => {
  const res=response();
  await unsubscribe({method:'GET',query:{token:'00000000-0000-4000-8000-000000000001'}},res);
  assert.equal(res.code,200); assert.match(res.body, /form method="post"/);
  assert.equal(res.headers['Referrer-Policy'],'no-referrer');
});
test('malformed unsubscribe token is rejected before database access', async () => {
  const res=response();await unsubscribe({method:'POST',query:{token:'invalid'}},res);
  assert.equal(res.code,400);
});
