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
    <div className="min-h-screen flex flex-col text-slate-100">
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#1F2A44]/70 backdrop-blur-sm sticky top-0 z-10 bg-[#0A0F1F]/70">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B73FF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#4F8CFF]/30">T</div>
          <span className="font-bold tracking-tight text-lg">Tessy</span>
        </Link>
        <Link to="/cadastro" className="text-sm font-medium text-[#6FA4FF]">Criar conta</Link>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-slate-400 text-sm mt-1">Entre na sua conta Tessy.</p>

            {error && (
              <div className="mt-5 px-4 py-3 rounded-lg text-sm bg-red-500/10 text-red-300 border border-red-500/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
              <Input label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••" autoComplete="current-password" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition disabled:opacity-70 glow"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#1F2A44]">
              <p className="text-xs text-slate-500 text-center mb-2">Ou use uma conta de demonstração</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('medico')}
                  className="py-2.5 rounded-lg text-sm font-medium bg-[#1B2540] text-slate-200 border border-[#2B3A5C] hover:border-[#4F8CFF] transition"
                >
                  Médico
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('empresa')}
                  className="py-2.5 rounded-lg text-sm font-medium bg-[#1B2540] text-slate-200 border border-[#2B3A5C] hover:border-[#4F8CFF] transition"
                >
                  Empresa
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Novo por aqui?{' '}
            <Link to="/cadastro" className="font-semibold text-[#6FA4FF]">Criar conta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Input({
  label, type = 'text', value, onChange, placeholder, autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 bg-[#0F172A] border border-[#2B3A5C] focus:border-[#4F8CFF] focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/30 transition"
      />
    </div>
  );
}
