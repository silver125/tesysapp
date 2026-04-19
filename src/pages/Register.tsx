import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WaIcon } from '../components/ui';
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
  role: null, name: '', specialty: '', company: '', whatsapp: '', email: '', password: '',
};

const SPECIALTIES = [
  'Cardiologia', 'Dermatologia', 'Endocrinologia', 'Gastroenterologia',
  'Ginecologia', 'Neurologia', 'Oftalmologia', 'Oncologia',
  'Ortopedia', 'Pediatria', 'Psiquiatria', 'Reumatologia', 'Urologia', 'Outra',
];

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [error, setError] = useState('');

  const totalSteps = 3;

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(prev => ({ ...prev, [k]: v }));

  const canAdvance = () => {
    if (step === 0) return data.role !== null;
    if (step === 1) {
      if (data.role === 'medico') return data.name.trim().length > 2;
      return data.company.trim().length > 2 && normalizePhone(data.whatsapp).length >= 12;
    }
    if (step === 2) return /^\S+@\S+\.\S+$/.test(data.email) && data.password.length >= 6;
    return false;
  };

  const next = () => { setError(''); if (step < totalSteps - 1) setStep(s => s + 1); };
  const back = () => { setError(''); if (step > 0) setStep(s => s - 1); };

  const submit = async () => {
    setError('');
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

  const pct = Math.round(((step + 1) / totalSteps) * 100);

  const stepTitles = ['Quem é você?', data.role === 'empresa' ? 'Dados da empresa' : 'Dados profissionais', 'Crie seu acesso'];
  const stepSubs = ['Vamos personalizar sua experiência.', data.role === 'empresa' ? 'Médicos vão falar com você pelo WhatsApp.' : 'Só o essencial.', 'Quase lá.'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      {/* Header */}
      <header style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,14,22,0.85)', backdropFilter: 'blur(12px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#2E7BFF 0%,#5F2C82 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>T</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Tessy<span style={{ color: '#2E7BFF' }}>.</span>
          </span>
        </Link>
        <Link to="/entrar" style={{ fontSize: 13, fontWeight: 600, color: '#6FA4FF', textDecoration: 'none' }}>
          Entrar
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 20px 48px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {stepTitles[step]}<span style={{ color: '#2E7BFF' }}>.</span>
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                color: 'var(--muted)', letterSpacing: '0.12em',
              }}>
                {step + 1}/{totalSteps}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>{stepSubs[step]}</p>

            {/* Progress bar */}
            <div style={{ height: 3, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, #2E7BFF 0%, #8B5CF6 100%)',
                width: `${pct}%`,
                transition: 'width 0.35s ease',
              }} />
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--card)', borderRadius: 20, border: '1px solid var(--line)',
            padding: '24px 20px',
          }}>
            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 14px', borderRadius: 10,
                background: 'rgba(242,92,84,0.1)', border: '1px solid rgba(242,92,84,0.3)',
                color: '#F25C54', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {step === 0 && <StepRole value={data.role} onChange={r => update('role', r)} />}

            {step === 1 && data.role === 'medico' && (
              <StepMedico
                name={data.name} specialty={data.specialty}
                onName={v => update('name', v)} onSpecialty={v => update('specialty', v)}
              />
            )}

            {step === 1 && data.role === 'empresa' && (
              <StepEmpresa
                company={data.company} whatsapp={data.whatsapp}
                onCompany={v => update('company', v)} onWhatsapp={v => update('whatsapp', v)}
              />
            )}

            {step === 2 && (
              <StepCredentials
                email={data.email} password={data.password}
                onEmail={v => update('email', v)} onPassword={v => update('password', v)}
              />
            )}

            {/* Nav buttons */}
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              {step > 0 && (
                <button type="button" onClick={back} style={{
                  flex: 1, padding: '13px', borderRadius: 12,
                  background: 'var(--chip)', border: '1px solid var(--line)',
                  color: 'var(--ink-2)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Voltar
                </button>
              )}
              {step < totalSteps - 1 ? (
                <button type="button" onClick={next} disabled={!canAdvance()} style={{
                  flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                  background: '#2E7BFF', color: '#fff', cursor: canAdvance() ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 700, opacity: canAdvance() ? 1 : 0.4,
                  boxShadow: canAdvance() ? '0 6px 24px rgba(46,123,255,0.3)' : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Continuar →
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={!canAdvance() || isLoading} style={{
                  flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                  background: '#2E7BFF', color: '#fff',
                  cursor: canAdvance() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 700, opacity: canAdvance() && !isLoading ? 1 : 0.4,
                  boxShadow: canAdvance() ? '0 6px 24px rgba(46,123,255,0.3)' : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {isLoading ? 'Criando...' : 'Criar conta'}
                </button>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', marginTop: 20 }}>
            Já tem conta?{' '}
            <Link to="/entrar" style={{ color: '#6FA4FF', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/* ── Step 0: Role selection ── */
function StepRole({ value, onChange }: { value: UserRole | null; onChange: (r: UserRole) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {([
        { role: 'medico' as UserRole, emoji: '🩺', title: 'Sou médico', desc: 'Acesso a eventos, produtos e cursos' },
        { role: 'empresa' as UserRole, emoji: '🏢', title: 'Sou empresa', desc: 'Ofereça conteúdo a profissionais da saúde' },
      ]).map(opt => {
        const active = value === opt.role;
        return (
          <button
            key={opt.role}
            type="button"
            onClick={() => onChange(opt.role)}
            style={{
              width: '100%', textAlign: 'left', padding: '16px',
              borderRadius: 14, border: `2px solid ${active ? '#2E7BFF' : 'var(--line)'}`,
              background: active ? 'rgba(46,123,255,0.08)' : 'var(--bg)',
              cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {opt.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{opt.desc}</div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: active ? '#2E7BFF' : 'var(--chip)',
              border: `2px solid ${active ? '#2E7BFF' : 'var(--line)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
              transition: 'background 0.15s, border-color 0.15s',
            }}>
              {active ? '✓' : ''}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Step 1: Doctor info ── */
function StepMedico({ name, specialty, onName, onSpecialty }: {
  name: string; specialty: string;
  onName: (v: string) => void; onSpecialty: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="NOME COMPLETO" type="text" value={name} onChange={onName} placeholder="Dr. João Silva" autoComplete="name" />
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          ESPECIALIDADE <span style={{ opacity: 0.5 }}>(opcional)</span>
        </div>
        <select
          value={specialty}
          onChange={e => onSpecialty(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            background: 'var(--bg)', border: '1.5px solid var(--line)',
            color: specialty ? 'var(--ink)' : 'var(--muted)', fontSize: 14, outline: 'none',
            appearance: 'none', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#2E7BFF'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        >
          <option value="">Selecionar especialidade</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ── Step 1: Company info ── */
function StepEmpresa({ company, whatsapp, onCompany, onWhatsapp }: {
  company: string; whatsapp: string;
  onCompany: (v: string) => void; onWhatsapp: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="NOME DA EMPRESA" type="text" value={company} onChange={onCompany} placeholder="Pharma Brasil" autoComplete="organization" />

      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          WHATSAPP DE CONTATO
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: '#25D366', display: 'flex', alignItems: 'center',
          }}>
            <WaIcon size={16} />
          </span>
          <input
            required
            type="tel"
            value={whatsapp}
            onChange={e => onWhatsapp(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            style={{
              width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10,
              background: 'var(--bg)', border: '1.5px solid var(--line)',
              color: 'var(--ink)', fontSize: 14, outline: 'none',
              transition: 'border-color 0.15s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#25D366'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'}
          />
        </div>
        <div style={{
          marginTop: 6, fontSize: 11, color: 'var(--muted)',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
        }}>
          Médicos clicam e abrem o chat direto.
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Credentials ── */
function StepCredentials({ email, password, onEmail, onPassword }: {
  email: string; password: string;
  onEmail: (v: string) => void; onPassword: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="E-MAIL" type="email" value={email} onChange={onEmail} placeholder="voce@exemplo.com" autoComplete="email" />
      <Field label="SENHA" type="password" value={password} onChange={onPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
      <div style={{
        padding: '12px 14px', borderRadius: 10,
        background: 'rgba(46,123,255,0.06)', border: '1px solid rgba(46,123,255,0.15)',
        fontSize: 11, color: 'var(--muted)', lineHeight: 1.5,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
      }}>
        Ao criar conta você concorda com os Termos e Política de Privacidade da Tessy.
      </div>
    </div>
  );
}

/* ── Shared Field ── */
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
          transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#2E7BFF'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
    </div>
  );
}

/* ── Helpers ── */
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('55')) return d;
  return `55${d}`;
}
