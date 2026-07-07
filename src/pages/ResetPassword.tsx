import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { TessyMark } from '../components/ui';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function hasRecoveryHash(): boolean {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(hash);
  return params.get('type') === 'recovery' || Boolean(params.get('access_token'));
}

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    async function bootstrapRecovery() {
      if (hasRecoveryHash()) {
        if (!cancelled) setReady(true);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get('token_hash');
      if (tokenHash && searchParams.get('type') === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (verifyError) {
          if (!cancelled) {
            setError('Link inválido ou expirado. Solicite um novo e-mail de recuperação.');
          }
          return;
        }
        if (!cancelled) setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session && !cancelled) setReady(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });

    void bootstrapRecovery();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      navigate('/entrar', { replace: true, state: { message: 'Senha atualizada. Faça login com a nova senha.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar a nova senha.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--ink)', background: 'var(--bg)' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <TessyMark size={34} />
          <span style={{ fontWeight: 560, color: 'var(--accent-ink)' }}>Tessy.app</span>
        </Link>
      </header>

      <main style={{ maxWidth: 460, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 560, color: 'var(--accent-ink)' }}>
          Nova senha<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        {error && !ready && (
          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 8,
            background: 'rgba(232,69,69,0.07)',
            border: '1px solid rgba(232,69,69,0.22)',
            color: 'var(--danger)',
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {!ready ? (
          <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Abra o link que enviamos por e-mail para redefinir sua senha aqui.
            Use sempre o site{' '}
            <a href="https://www.tessybr.com/esqueci-senha" style={{ color: 'var(--accent-ink)', fontWeight: 560 }}>
              tessybr.com/esqueci-senha
            </a>{' '}
            para solicitar o e-mail — links antigos com <b>localhost</b> não funcionam.
            Se expirou, solicite outro em{' '}
            <Link to="/esqueci-senha" style={{ color: 'var(--accent-ink)', fontWeight: 560 }}>Recuperar acesso</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{
            marginTop: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: 22,
          }}>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
            <label style={{ fontSize: 13, fontWeight: 560 }}>
              Nova senha
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 8, border: '1.5px solid var(--line)' }}
              />
            </label>
            <label style={{ fontSize: 13, fontWeight: 560 }}>
              Confirmar senha
              <input
                required
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 8, border: '1.5px solid var(--line)' }}
              />
            </label>
            <button type="submit" disabled={busy} style={{
              padding: '14px 18px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--accent-ink)',
              color: '#fff',
              fontWeight: 560,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}>
              {busy ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
