import { privateEmailTransport } from '../server/email/privateEmail.mjs';

// Run in a protected server environment. This never sends mail or enables digests.
if (!process.env.SMTP_PASSWORD) {
  console.error('SMTP_PASSWORD ausente. Configure a credencial no ambiente protegido.');
  process.exitCode=1;
} else {
  const transport=privateEmailTransport();
  try {
    await transport.verify();
    console.log('Conexão SMTP autenticada. Nenhum e-mail enviado; entrega e autenticação do domínio ainda precisam de validação.');
  } catch {
    console.error('Não foi possível autenticar no SMTP. Confira a credencial e a disponibilidade do provedor.');
    process.exitCode=1;
  } finally {transport.close();}
}
