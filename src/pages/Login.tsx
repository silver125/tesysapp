import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const fillDemo = (kind: 'medico' | 'empresa') => {
    setEmail(kind === 'medico' ? 'medico@teste.com' : 'empresa@teste.com');
    setPassword('123456');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      <header style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(247,245,250,0.88)', backdropFilter: 'blur(14px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#5B6EF5 0%,#A855F7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>T</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Tessy<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </Link>
        <Link to="/cadastro" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
          Criar conta
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Bem-vinda de volta<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-2)' }}>Entre na sua conta Tessy.</p>
          </div>

          <div style={{
            background: 'var(--card)', borderRadius: 20, border: '1px solid var(--line)',
            padding: '24px 20px',
            boxShadow: '0 4px 20px rgba(90,80,130,0.08)',
          }}>
            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 14px', borderRadius: 10,
                background: 'rgba(232,69,69,0.08)', border: '1px solid rgba(232,69,69,0.25)',
                color: 'var(--danger)', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="E-MAIL" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
              <Field label="SENHA" type="password" value={password} onChange={setPassword} placeholder="••••••" autoComplete="current-password" />

              <button type="submit" disabled={isLoading} style={{
                marginTop: 4, padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #5B6EF5 0%, #A855F7 100%)',
                color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700, opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 6px 20px rgba(91,110,245,0.28)',
              }}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase',
                textAlign: 'center', marginBottom: 10,
              }}>
                Conta de demonstração
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['medico', 'empresa'] as const).map(kind => (
                  <button key={kind} type="button" onClick={() => fillDemo(kind)} style={{
                    padding: '10px', borderRadius: 10,
                    background: 'var(--chip)', border: '1px solid var(--line)',
                    color: 'var(--ink-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {kind === 'medico' ? '🩺 Médico' : '🏢 Empresa'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', marginTop: 20 }}>
            Novo no Tessy?{' '}
            <Link to="/cadastro" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Criar conta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {label}
      </div>
      <input
        required type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: 'var(--bg)', border: '1.5px solid var(--line)',
          color: 'var(--ink)', fontSize: 14, outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
    </div>
  );
}
