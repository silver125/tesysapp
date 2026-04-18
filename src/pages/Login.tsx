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
      await login(email, password);
      navigate('/', { replace: true });
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
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">T</div>
          <span className="font-semibold text-slate-800 text-lg">Tessy</span>
        </Link>
        <Link to="/cadastro" className="text-sm font-medium text-blue-600">Criar conta</Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
          <p className="text-slate-500 text-sm mt-1">Acesse sua conta Tessy.</p>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-70"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Usar conta de demonstração</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('medico')}
                className="py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Médico
              </button>
              <button
                type="button"
                onClick={() => fillDemo('empresa')}
                className="py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Empresa
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Novo no Tessy?{' '}
            <Link to="/cadastro" className="font-medium text-blue-600">Criar conta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
