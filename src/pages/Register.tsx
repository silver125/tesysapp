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
  'Nutrologia', 'Endocrinologia', 'Dermatologia', 'Cirurgia Plástica',
  'Cardiologia', 'Oncologia', 'Neurologia', 'Ortopedia',
  'Pediatria', 'Gastroenterologia', 'Ginecologia', 'Oftalmologia',
  'Psiquiatria', 'Reumatologia', 'Urologia', 'Pneumologia',
  'Clínica Médica', 'Outra',
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

  // Step 0: select role → auto-advance
  const pickRole = (r: UserRole) => {
    update('role', r);
    setError('');
    setTimeout(() => setStep(1), 120);
  };

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

  const stepLabels = [
    'Quem é você?',
    data.role === 'empresa' ? 'Sua empresa' : 'Seus dados',
    'Acesso',
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      color: 'var(--ink)', background: 'var(--bg)',
    }}>

      {/* ── Header ── */}
      <header style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,14,22,0.9)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step > 0 && (
            <button onClick={back} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-2)', display: 'flex', alignItems: 'center',
              padding: '4px 0', marginRight: 4,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4L6 10L12 16" />
              </svg>
            </button>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg,#2E7BFF 0%,#5F2C82 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>T</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Tessy<span style={{ color: '#2E7BFF' }}>.</span>
            </span>
          </Link>
        </div>
        <Link to="/entrar" style={{ fontSize: 13, fontWeight: 600, color: '#6FA4FF', textDecoration: 'none' }}>
          Entrar
        </Link>
      </header>

      {/* ── Step dots ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 20 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            height: 4, borderRadius: 999,
            width: i === step ? 24 : 8,
            background: i <= step ? '#2E7BFF' : 'var(--line)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Content ── */}
      <main style={{ flex: 1, maxWidth: 420, width: '100%', margin: '0 auto', padding: '28px 24px 120px' }}>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em' }}>
            Etapa {step + 1} de {totalSteps} · {stepLabels[step]}
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {step === 0 && <>Como você<br />quer entrar<span style={{ color: '#2E7BFF' }}>?</span></>}
            {step === 1 && data.role === 'medico' && <>Seus dados<br />profissionais<span style={{ color: '#2E7BFF' }}>.</span></>}
            {step === 1 && data.role === 'empresa' && <>Dados da<br />empresa<span style={{ color: '#2E7BFF' }}>.</span></>}
            {step === 2 && <>Quase<br />pronto<span style={{ color: '#2E7BFF' }}>!</span></>}
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '14px 16px', borderRadius: 12,
            background: 'rgba(242,92,84,0.1)', border: '1px solid rgba(242,92,84,0.25)',
            color: '#F25C54', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* ── STEP 0: Role ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {([
              { role: 'medico' as UserRole, emoji: '🩺', title: 'Sou médico', desc: 'Acesso a eventos, produtos e cursos' },
              { role: 'empresa' as UserRole, emoji: '🏢', title: 'Sou empresa', desc: 'Publique conteúdo para profissionais de saúde' },
            ]).map(opt => {
              const active = data.role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => pickRole(opt.role)}
                  style={{
                    textAlign: 'left', padding: '20px 18px',
                    borderRadius: 18, border: `2px solid ${active ? '#2E7BFF' : 'var(--line)'}`,
                    background: active ? 'rgba(46,123,255,0.09)' : 'var(--card)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'border-color 0.15s, background 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: active ? 'rgba(46,123,255,0.15)' : 'var(--chip)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>
                    {opt.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{opt.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: active ? '#2E7BFF' : 'transparent',
                    border: `2px solid ${active ? '#2E7BFF' : 'var(--line)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 800,
                    transition: 'all 0.15s',
                  }}>
                    {active && '✓'}
                  </div>
                </button>
              );
            })}
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Toque para selecionar e avançar automaticamente
            </p>
          </div>
        )}

        {/* ── STEP 1: Medico ── */}
        {step === 1 && data.role === 'medico' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <BigField
              label="Nome completo"
              type="text"
              value={data.name}
              onChange={v => update('name', v)}
              placeholder="Dr. João Silva"
              autoComplete="name"
            />

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>
                Especialidade <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span>
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
              }}>
                {SPECIALTIES.map(s => {
                  const sel = data.specialty === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('specialty', sel ? '' : s)}
                      style={{
                        padding: '8px 14px', borderRadius: 999,
                        border: `1.5px solid ${sel ? '#2E7BFF' : 'var(--line)'}`,
                        background: sel ? 'rgba(46,123,255,0.12)' : 'var(--chip)',
                        color: sel ? '#6FA4FF' : 'var(--ink-2)',
                        fontSize: 13, fontWeight: sel ? 700 : 500, cursor: 'pointer',
                        transition: 'all 0.15s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Empresa ── */}
        {step === 1 && data.role === 'empresa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <BigField
              label="Nome da empresa"
              type="text"
              value={data.company}
              onChange={v => update('company', v)}
              placeholder="Pharma Brasil"
              autoComplete="organization"
            />

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>
                WhatsApp de contato
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  color: '#25D366', display: 'flex', alignItems: 'center',
                }}>
                  <WaIcon size={18} />
                </span>
                <input
                  type="tel"
                  value={data.whatsapp}
                  onChange={e => update('whatsapp', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  style={{
                    width: '100%', padding: '18px 16px 18px 46px',
                    borderRadius: 14, border: '1.5px solid var(--line)',
                    background: 'var(--card)', color: 'var(--ink)',
                    fontSize: 16, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#25D366'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Médicos clicam no seu card e abrem o chat direto.
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Credentials ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <BigField
              label="E-mail"
              type="email"
              value={data.email}
              onChange={v => update('email', v)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
            <BigField
              label="Senha"
              type="password"
              value={data.password}
              onChange={v => update('password', v)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              hint={data.password.length > 0 && data.password.length < 6 ? 'Mínimo 6 caracteres' : undefined}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Ao criar conta você concorda com os Termos de Uso e Política de Privacidade da Tessy.
            </p>
          </div>
        )}
      </main>

      {/* ── Sticky bottom CTA ── */}
      {step > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: '16px 24px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: 'rgba(11,14,22,0.97)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--line)',
        }}>
          <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={step < totalSteps - 1 ? next : submit}
              disabled={!canAdvance() || isLoading}
              style={{
                width: '100%', padding: '18px', borderRadius: 16, border: 'none',
                background: canAdvance() && !isLoading ? '#2E7BFF' : 'var(--chip)',
                color: canAdvance() && !isLoading ? '#fff' : 'var(--muted)',
                fontSize: 16, fontWeight: 700, cursor: canAdvance() && !isLoading ? 'pointer' : 'not-allowed',
                boxShadow: canAdvance() ? '0 8px 32px rgba(46,123,255,0.35)' : 'none',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isLoading ? 'Criando sua conta...' : step < totalSteps - 1 ? 'Continuar' : 'Criar conta'}
            </button>
            {step === totalSteps - 1 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                Já tem conta?{' '}
                <Link to="/entrar" style={{ color: '#6FA4FF', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Footer link on step 0 ── */}
      {step === 0 && (
        <div style={{ textAlign: 'center', padding: '0 24px 32px', marginTop: 'auto' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Já tem conta?{' '}
            <Link to="/entrar" style={{ color: '#6FA4FF', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Big input field ── */
function BigField({ label, type = 'text', value, onChange, placeholder, autoComplete, hint }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; hint?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>
        {label}
      </div>
      <input
        required type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{
          width: '100%', padding: '18px 16px', borderRadius: 14,
          border: '1.5px solid var(--line)', background: 'var(--card)',
          color: 'var(--ink)', fontSize: 16, outline: 'none',
          transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#2E7BFF'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
      {hint && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#F25C54' }}>{hint}</div>
      )}
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
