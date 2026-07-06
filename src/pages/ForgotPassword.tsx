import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { TessyMark } from '../components/ui';

export default function ForgotPassword() {
  const { requestPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar recuperação.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--ink)', background: 'var(--bg)' }}>
      <header style={{
        padding: '16px clamp(20px, 5vw, 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(247,248,255,0.92)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <TessyMark size={38} />
          <div style={{ fontWeight: 560, fontSize: 19, color: 'var(--accent-ink)' }}>
            Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
          </div>
        </Link>
        <Link to="/entrar" style={{ fontSize: 14, fontWeight: 560, color: 'var(--accent-ink)', textDecoration: 'none' }}>
          Voltar ao login
        </Link>
      </header>

      <main style={{ maxWidth: 460, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 560, color: 'var(--accent-ink)' }}>
          Recuperar acesso<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.
        </p>

        <div style={{
          marginTop: 22,
          background: '#fff',
          borderRadius: 8,
          border: '1px solid var(--line)',
          padding: 22,
          boxShadow: 'var(--shadow-md)',
        }}>
          {sent ? (
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Se existir uma conta com <b>{email}</b>, você receberá um e-mail em instantes.
              Abra o link e defina uma nova senha.
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(232,69,69,0.07)',
                  border: '1px solid rgba(232,69,69,0.22)',
                  color: 'var(--danger)',
                  fontSize: 13,
                }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 560, color: 'var(--ink-2)' }}>
                  E-mail
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: '13px 14px',
                      borderRadius: 8,
                      border: '1.5px solid var(--line)',
                      fontSize: 15,
                    }}
                  />
                </label>
                <button type="submit" disabled={isLoading} style={{
                  padding: '14px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent-ink)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 560,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}>
                  {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
