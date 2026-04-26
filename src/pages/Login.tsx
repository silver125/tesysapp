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
    <div style={{ minHeight: '100vh', color: 'var(--ink)', background: '#FBFAFD' }}>
      <AuthHeader actionLabel="Criar conta" actionTo="/cadastro" />

      <main className="tessy-auth-grid">
        <section style={{
          position: 'relative',
          minHeight: 520,
          overflow: 'hidden',
          borderRadius: 8,
          background: '#17142F',
        }} className="tessy-auth-visual">
          <img
            src={authImage}
            alt="Ambiente médico profissional"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.86 }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(23,20,47,0.12) 0%, rgba(23,20,47,0.78) 100%)',
          }} />
          <div style={{ position: 'absolute', left: 28, right: 28, bottom: 28, color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9FC5FF' }}>
              Tessy para saúde
            </div>
            <h2 style={{ marginTop: 10, fontSize: 32, lineHeight: 1.05, letterSpacing: 0, fontWeight: 900 }}>
              Acesso direto entre médicos e empresas.
            </h2>
            <p style={{ marginTop: 12, maxWidth: 430, color: 'rgba(255,255,255,0.76)', fontSize: 15, lineHeight: 1.55 }}>
              Produtos, eventos e representantes em um fluxo simples, comercial e objetivo.
            </p>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 430 }}>
            <div style={{ marginBottom: 26 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 11px',
                borderRadius: 999,
                background: '#EEF4FF',
                color: '#285DE8',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 18,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: '#2E7BFF' }} />
                Área restrita
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: 0, lineHeight: 1.02, color: '#17142F' }}>
                Entrar no Tessy<span style={{ color: '#2E7BFF' }}>.</span>
              </h1>
              <p style={{ marginTop: 12, fontSize: 16, color: '#666477', lineHeight: 1.55 }}>
                Acesse sua conta para gerenciar conexões, produtos, eventos e contatos salvos.
              </p>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: 8,
              border: '1px solid rgba(26,27,46,0.10)',
              padding: 22,
              boxShadow: '0 18px 42px rgba(23,20,47,0.08)',
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
                  background: '#2E7BFF',
                  color: '#fff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: 15,
                  fontWeight: 800,
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 10px 24px rgba(46,123,255,0.24)',
                }}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>

            <p style={{ fontSize: 14, color: '#666477', marginTop: 18 }}>
              Novo no Tessy?{' '}
              <Link to="/cadastro" style={{ color: '#2E7BFF', fontWeight: 800, textDecoration: 'none' }}>
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
      borderBottom: '1px solid rgba(26,27,46,0.08)',
      background: 'rgba(251,250,253,0.92)',
      backdropFilter: 'blur(14px)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: '#17142F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
        }}>T</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: 0, lineHeight: 1, color: 'var(--ink)' }}>
            Tessy<span style={{ color: '#2E7BFF' }}>.</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
            saúde + negócios
          </div>
        </div>
      </Link>
      <Link to={actionTo} style={{
        padding: '11px 16px',
        borderRadius: 8,
        background: '#2E7BFF',
        color: '#fff',
        fontSize: 14,
        fontWeight: 800,
        textDecoration: 'none',
        boxShadow: '0 10px 24px rgba(46,123,255,0.20)',
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
        color: '#4F4D61',
        fontWeight: 800,
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
          background: '#FBFAFD',
          border: '1.5px solid rgba(26,27,46,0.12)',
          color: '#17142F',
          fontSize: 15,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#2E7BFF';
          e.target.style.boxShadow = '0 0 0 3px rgba(46,123,255,0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(26,27,46,0.12)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
