import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const authImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=84';

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const u = await login(email, password);
      navigate(u.role === 'medico' ? '/medico' : '/empresa', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--ink)', background: 'var(--bg)' }}>
      <AuthHeader actionLabel="Criar conta" actionTo="/cadastro" />

      <main className="tessy-auth-grid">
        <section style={{
          position: 'relative',
          minHeight: 520,
          overflow: 'hidden',
          borderRadius: 8,
          background: 'var(--deep)',
        }} className="tessy-auth-visual">
          <img
            src={authImage}
            alt="Ambiente médico profissional"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.86 }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(23,27,42,0.06) 0%, rgba(23,27,42,0.72) 100%)',
          }} />
          <div style={{ position: 'absolute', left: 28, right: 28, bottom: 28, color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 560, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D9DEF6' }}>
              Tessy para saúde
            </div>
            <h2 style={{ marginTop: 10, fontSize: 32, lineHeight: 1.08, letterSpacing: 0, fontWeight: 560 }}>
              Acesso direto entre médicos e empresas.
            </h2>
            <p style={{ marginTop: 12, maxWidth: 430, color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.55 }}>
              Produtos, eventos e representantes em um fluxo simples, comercial e objetivo.
            </p>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tessy-auth-panel">
            <div style={{ marginBottom: 26 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 11px',
                borderRadius: 999,
                background: 'var(--accent-soft)',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 560,
                marginBottom: 18,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)' }} />
                Área restrita
              </div>
              <h1 className="tessy-auth-title" style={{ fontSize: 42, fontWeight: 560, letterSpacing: 0, lineHeight: 1.08, color: 'var(--accent-ink)' }}>
                Entrar no Tessy<span style={{ color: 'var(--accent)' }}>.</span>
              </h1>
              <p style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                Acesse sua conta para gerenciar conexões, produtos, eventos e contatos salvos.
              </p>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: 8,
              border: '1px solid var(--line)',
              padding: 22,
              boxShadow: 'var(--shadow-md)',
            }}>
              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(232,69,69,0.07)',
                  border: '1px solid rgba(232,69,69,0.22)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
                <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Sua senha" autoComplete="current-password" />

                <button type="submit" disabled={isLoading} style={{
                  marginTop: 4,
                  padding: '14px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent-ink)',
                  color: '#fff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  fontWeight: 560,
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 10px 24px rgba(52,57,73,0.18)',
                }}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>

            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 18 }}>
              Novo no Tessy?{' '}
              <Link to="/cadastro" style={{ color: 'var(--accent-ink)', fontWeight: 560, textDecoration: 'none' }}>
                Criar conta
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function AuthHeader({ actionLabel, actionTo }: { actionLabel: string; actionTo: string }) {
  return (
    <header style={{
      padding: '16px clamp(20px, 5vw, 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--line)',
      background: 'rgba(247,248,255,0.92)',
      backdropFilter: 'blur(14px)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: 'var(--deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 560,
          fontSize: 18,
        }}>T</div>
        <div>
          <div style={{ fontWeight: 560, fontSize: 19, letterSpacing: 0, lineHeight: 1, color: 'var(--accent-ink)' }}>
            Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
            saúde + negócios
          </div>
        </div>
      </Link>
      <Link to={actionTo} className="tessy-auth-action" style={{
        padding: '11px 16px',
        borderRadius: 8,
      background: 'var(--accent-ink)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 560,
        textDecoration: 'none',
        boxShadow: '0 10px 24px rgba(52,57,73,0.16)',
      }}>
        {actionLabel}
      </Link>
    </header>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <div style={{
        fontSize: 13,
        color: 'var(--ink-2)',
        fontWeight: 560,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <input
        required
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '13px 14px',
          borderRadius: 8,
          background: '#fff',
          border: '1.5px solid var(--line)',
          color: 'var(--accent-ink)',
          fontSize: 15,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(74,168,255,0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--line)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
