import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('medico');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    try {
      await register({
        name,
        email,
        password,
        role,
        specialty: role === 'medico' ? extra || undefined : undefined,
        company: role === 'empresa' ? extra || undefined : undefined,
      });
      navigate(role === 'medico' ? '/medico' : '/empresa', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">T</div>
          <span className="font-semibold text-slate-800 text-lg">Tessy</span>
        </Link>
        <Link to="/entrar" className="text-sm font-medium text-blue-600">Entrar</Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
          <p className="text-slate-500 text-sm mt-1">Leva menos de 1 minuto.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('medico')}
              className={`py-2.5 rounded-lg text-sm font-medium transition ${
                role === 'medico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sou médico
            </button>
            <button
              type="button"
              onClick={() => setRole('empresa')}
              className={`py-2.5 rounded-lg text-sm font-medium transition ${
                role === 'empresa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sou empresa
            </button>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field
              label={role === 'medico' ? 'Nome completo' : 'Nome da empresa'}
              value={name}
              onChange={setName}
              placeholder={role === 'medico' ? 'Ex: Dr. João Silva' : 'Ex: Pharma Brasil'}
              autoComplete="name"
            />
            <Field
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
            <Field
              label={role === 'medico' ? 'Especialidade (opcional)' : 'Razão social (opcional)'}
              value={extra}
              onChange={setExtra}
              placeholder={role === 'medico' ? 'Ex: Cardiologia' : 'Ex: Pharma Brasil Ltda.'}
              required={false}
            />
            <Field
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-70"
            >
              {isLoading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-medium text-blue-600">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, required = true, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
      />
    </div>
  );
}
