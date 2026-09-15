# Resumos opcionais por e-mail

Remetente: `Tessy <contato@tessybr.com>`. SMTP Private Email, TLS na porta 465.

O envio e o controle no perfil ficam desativados até configurar, **apenas no servidor da Vercel**, `SMTP_PASSWORD`, `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `EMAIL_DIGEST_ENABLED=true`. Nunca usar prefixo VITE para esses segredos. Não salvar senha no repositório ou na conversa. Confirmar autenticação SMTP e autenticação do domínio no provedor antes da ativação; configuração presente não comprova entrega.

O médico precisa optar explicitamente por frequência diária ou semanal. O padrão é não receber. O resumo contém até três novas publicações dos tipos de interesse escolhidos; não há ainda filtro geográfico ou por especialidade. Itens anteriores à inscrição, eventos vencidos, interesses já demonstrados e itens reservados anteriormente são excluídos. Sem novidades, não há envio. O link de cancelamento funciona sem login; GET confirma e POST cancela (inclui suporte a List-Unsubscribe).

O cron executa às 12:00 UTC diariamente. Esta primeira versão tem limite operacional de três destinatários por execução e dez tentativas em 24 horas no banco. As preferências indicam frequência máxima, não uma promessa de horário. Revisar capacidade e limites do plano SMTP antes de ampliar. A varredura gira entre destinatários para evitar que perfis sem novidades bloqueiem os demais.

Reservas atômicas no banco impedem dois processos de enviar o mesmo resumo. Como SMTP não garante idempotência, uma tentativa com resultado incerto não é repetida automaticamente; revisar `private.doctor_email_dispatches`. `accepted` significa aceito pelo servidor SMTP, não entregue na caixa de entrada. A autenticação SMTP é verificada antes de reservar destinatários.

Validação local: `node --test tests/doctor-digest.test.mjs tests/email-endpoints.test.mjs` e `npm run build`. O teste SQL `tests/doctor-email-preferences.sql` exige transação com ROLLBACK e ambiente sem outras assinaturas ativas; usa somente registros sintéticos. Não é teste de entrega real.
