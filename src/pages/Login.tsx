import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'medico' | 'empresa'>('medico');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(role === 'medico' ? '/medico' : '/empresa');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    }
  };

  const fillDemo = () => {
    if (role === 'medico') {
      setEmail('medico@teste.com');
      setPassword('123456');
    } else {
      setEmail('empresa@teste.com');
      setPassword('123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 40%, #2563EB 100%)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S6 21.52 6 16 10.48 6 16 6zm-1 4v5h-5v2h5v5h2v-5h5v-2h-5V10h-2z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tessy</h1>
          <p className="text-blue-200 mt-1 text-sm">Plataforma de oportunidades médicas</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Role tabs */}
          <div className="flex">
            <button
              type="button"
              onClick={() => { setRole('medico'); setError(''); }}
              className="flex-1 py-4 text-sm font-semibold transition-colors"
              style={{
                background: role === 'medico' ? '#2563EB' : '#F8FAFC',
                color: role === 'medico' ? 'white' : '#64748B',
                borderBottom: role === 'medico' ? 'none' : '2px solid #E2E8F0',
              }}
            >
              Sou Médico
            </button>
            <button
              type="button"
              onClick={() => { setRole('empresa'); setError(''); }}
              className="flex-1 py-4 text-sm font-semibold transition-colors"
              style={{
                background: role === 'empresa' ? '#7C3AED' : '#F8FAFC',
                color: role === 'empresa' ? 'white' : '#64748B',
                borderBottom: role === 'empresa' ? 'none' : '2px solid #E2E8F0',
              }}
            >
              Sou Empresa
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              {role === 'medico' ? 'Acesso do Médico' : 'Acesso da Empresa'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {role === 'medico'
                ? 'Visualize eventos e oportunidades de empresas parceiras'
                : 'Gerencie eventos e produtos para médicos'}
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'medico' ? 'medico@teste.com' : 'empresa@teste.com'}
                  className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-colors"
                  style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }}
                  onFocus={e => (e.target.style.borderColor = role === 'medico' ? '#2563EB' : '#7C3AED')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-colors"
                  style={{ border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }}
                  onFocus={e => (e.target.style.borderColor = role === 'medico' ? '#2563EB' : '#7C3AED')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity mt-2"
                style={{
                  background: role === 'medico'
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #F1F5F9' }}>
              <p className="text-xs text-slate-400 text-center mb-2">Demonstração</p>
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: '#F1F5F9', color: '#475569' }}
              >
                Preencher credenciais de demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          © 2025 Tessy — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
