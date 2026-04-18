import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

type FormData = {
  role: UserRole | null;
  name: string;
  specialty: string;
  company: string;
  whatsapp: string;
  email: string;
  password: string;
};

const INITIAL: FormData = {
  role: null,
  name: '',
  specialty: '',
  company: '',
  whatsapp: '',
  email: '',
  password: '',
};

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [error, setError] = useState('');

  const totalSteps = 3;

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData(prev => ({ ...prev, [k]: v }));
  };

  const canAdvance = () => {
    if (step === 0) return data.role !== null;
    if (step === 1) {
      if (data.role === 'medico') return data.name.trim().length > 2;
      return data.company.trim().length > 2 && normalizePhone(data.whatsapp).length >= 10;
    }
    if (step === 2) return /^\S+@\S+\.\S+$/.test(data.email) && data.password.length >= 6;
    return false;
  };

  const next = () => {
    setError('');
    if (step < totalSteps - 1) setStep(s => s + 1);
  };
  const back = () => {
    setError('');
    if (step > 0) setStep(s => s - 1);
  };

  const submit = async () => {
    setError('');
    if (data.role === 'empresa' && data.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    try {
      await register({
        name: data.role === 'medico' ? data.name : data.company,
        email: data.email,
        password: data.password,
        role: data.role!,
        specialty: data.role === 'medico' ? data.specialty || undefined : undefined,
        company: data.role === 'empresa' ? data.company : undefined,
        whatsapp: data.role === 'empresa' ? normalizePhone(data.whatsapp) : undefined,
      });
      navigate(data.role === 'medico' ? '/medico' : '/empresa', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#1F2A44]/70 sticky top-0 bg-[#0A0F1F]/70 backdrop-blur-sm z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B73FF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#4F8CFF]/30">T</div>
          <span className="font-bold tracking-tight text-lg">Tessy</span>
        </Link>
        <Link to="/entrar" className="text-sm font-medium text-[#6FA4FF]">Entrar</Link>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-5 py-6">
        <div className="w-full max-w-md">
          <Stepper current={step} total={totalSteps} />

          <div className="mt-5 bg-[#131B2E] border border-[#1F2A44] rounded-2xl p-6 sm:p-8">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-500/10 text-red-300 border border-red-500/30">
                {error}
              </div>
            )}

            {step === 0 && <StepRole value={data.role} onChange={r => update('role', r)} />}

            {step === 1 && data.role === 'medico' && (
              <StepMedico
                name={data.name}
                specialty={data.specialty}
                onName={v => update('name', v)}
                onSpecialty={v => update('specialty', v)}
              />
            )}

            {step === 1 && data.role === 'empresa' && (
              <StepEmpresa
                company={data.company}
                whatsapp={data.whatsapp}
                onCompany={v => update('company', v)}
                onWhatsapp={v => update('whatsapp', v)}
              />
            )}

            {step === 2 && (
              <StepCredentials
                email={data.email}
                password={data.password}
                onEmail={v => update('email', v)}
                onPassword={v => update('password', v)}
              />
            )}

            <div className="mt-6 flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={back}
                  className="flex-1 py-3.5 rounded-xl bg-[#1B2540] border border-[#2B3A5C] text-slate-200 font-semibold text-sm hover:border-[#4F8CFF] transition"
                >
                  Voltar
                </button>
              )}
              {step < totalSteps - 1 && (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance()}
                  className="flex-[2] py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition disabled:opacity-40 disabled:cursor-not-allowed glow"
                >
                  Continuar
                </button>
              )}
              {step === totalSteps - 1 && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canAdvance() || isLoading}
                  className="flex-[2] py-3.5 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-[#6FA4FF] transition disabled:opacity-40 disabled:cursor-not-allowed glow"
                >
                  {isLoading ? 'Criando...' : 'Criar conta'}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-5">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-semibold text-[#6FA4FF]">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Stepper({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-medium">Etapa {current + 1} de {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1B2540] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#8B73FF] transition-all duration-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StepRole({ value, onChange }: { value: UserRole | null; onChange: (r: UserRole) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Quem é você?</h1>
      <p className="text-slate-400 text-sm mt-1">Vamos personalizar sua experiência.</p>

      <div className="mt-6 grid gap-3">
        <RoleCard
          active={value === 'medico'}
          emoji="🩺"
          title="Sou médico"
          desc="Buscando eventos, produtos e cursos"
          onClick={() => onChange('medico')}
        />
        <RoleCard
          active={value === 'empresa'}
          emoji="🏢"
          title="Sou empresa"
          desc="Quero oferecer para profissionais da saúde"
          onClick={() => onChange('empresa')}
        />
      </div>
    </div>
  );
}

function RoleCard({
  active, emoji, title, desc, onClick,
}: {
  active: boolean; emoji: string; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border-2 transition"
      style={{
        borderColor: active ? '#4F8CFF' : '#2B3A5C',
        background: active ? 'rgba(79,140,255,0.08)' : '#1B2540',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center text-2xl">
          {emoji}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{title}</p>
          <p className="text-sm text-slate-400">{desc}</p>
        </div>
        {active && (
          <div className="w-6 h-6 rounded-full bg-[#4F8CFF] flex items-center justify-center text-white text-xs">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}

function StepMedico({
  name, specialty, onName, onSpecialty,
}: {
  name: string; specialty: string; onName: (v: string) => void; onSpecialty: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Seus dados profissionais</h1>
      <p className="text-slate-400 text-sm mt-1">Só o essencial.</p>

      <div className="mt-6 space-y-4">
        <Field label="Nome completo" value={name} onChange={onName} placeholder="Dr. João Silva" />
        <Field label="Especialidade (opcional)" value={specialty} onChange={onSpecialty} placeholder="Cardiologia" required={false} />
      </div>
    </div>
  );
}

function StepEmpresa({
  company, whatsapp, onCompany, onWhatsapp,
}: {
  company: string; whatsapp: string; onCompany: (v: string) => void; onWhatsapp: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dados da empresa</h1>
      <p className="text-slate-400 text-sm mt-1">Médicos vão falar com você pelo WhatsApp.</p>

      <div className="mt-6 space-y-4">
        <Field label="Nome da empresa" value={company} onChange={onCompany} placeholder="Pharma Brasil" />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">WhatsApp de contato</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#25D366]">
              <WhatsIcon />
            </span>
            <input
              required
              type="tel"
              value={whatsapp}
              onChange={e => onWhatsapp(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 bg-[#0F172A] border border-[#2B3A5C] focus:border-[#25D366] focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 transition"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Com DDD. Médicos clicam e abrem o chat direto.</p>
        </div>
      </div>
    </div>
  );
}

function StepCredentials({
  email, password, onEmail, onPassword,
}: {
  email: string; password: string; onEmail: (v: string) => void; onPassword: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Quase lá</h1>
      <p className="text-slate-400 text-sm mt-1">Crie seu acesso.</p>

      <div className="mt-6 space-y-4">
        <Field label="E-mail" value={email} onChange={onEmail} type="email" placeholder="voce@exemplo.com" autoComplete="email" />
        <Field label="Senha" value={password} onChange={onPassword} type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Ao criar conta você concorda com os Termos e Política de Privacidade.
      </p>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, required = true, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        required={required}
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

function WhatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if (d.startsWith('55')) return d;
  return d;
}
