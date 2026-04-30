import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { WaIcon } from '../components/ui';
import type { UserRole } from '../types';

type FormData = {
  role: UserRole | null;
  name: string;
  crm: string;
  crmState: string;
  specialty: string;
  company: string;
  whatsapp: string;
  email: string;
  password: string;
};

const INITIAL: FormData = {
  role: null, name: '', crm: '', crmState: '', specialty: '', company: '', whatsapp: '', email: '', password: '',
};

const BR_STATES = [
  'SP','AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ',
  'RN','RS','RO','RR','SC','SE','TO',
];

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
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('perfil');
  const initialRole: UserRole | null = roleParam === 'medico' || roleParam === 'empresa' ? roleParam : null;
  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [data, setData] = useState<FormData>({ ...INITIAL, role: initialRole });
  const [error, setError] = useState('');

  const totalSteps = 3;
  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(prev => ({ ...prev, [k]: v }));

  const canAdvance = () => {
    if (step === 0) return data.role !== null;
    if (step === 1) {
      if (data.role === 'medico')
        return data.name.trim().length > 2 && data.crm.trim().length >= 4 && data.crmState !== '';
      return data.company.trim().length > 2 && normalizePhone(data.whatsapp).length >= 12;
    }
    if (step === 2) return /^\S+@\S+\.\S+$/.test(data.email) && data.password.length >= 6;
    return false;
  };

  const next = () => { setError(''); if (step < totalSteps - 1) setStep(s => s + 1); };
  const back = () => { setError(''); if (step > 0) setStep(s => s - 1); };

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
        crm: data.role === 'medico' ? data.crm.trim() : undefined,
        crmState: data.role === 'medico' ? data.crmState : undefined,
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

  const ready = canAdvance() && !isLoading;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      color: 'var(--ink)', background: 'var(--bg)',
    }}>

      {/* ── Header ── */}
      <header style={{
        padding: '16px clamp(20px, 5vw, 72px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(247,248,255,0.92)', backdropFilter: 'blur(14px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step > 0 && (
            <button onClick={back} style={{
              width: 38, height: 38, borderRadius: 8,
              background: '#fff', border: '1px solid var(--line)', cursor: 'pointer',
              color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, marginRight: 2,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4L6 10L12 16" />
              </svg>
            </button>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: 'var(--deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 560, fontSize: 18,
            }}>T</div>
            <div>
              <div style={{ fontWeight: 560, fontSize: 19, letterSpacing: 0, lineHeight: 1, color: 'var(--accent-ink)' }}>
                Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
                saúde + negócios
              </div>
            </div>
          </Link>
        </div>
        <Link to="/entrar" style={{ fontSize: 14, fontWeight: 560, color: 'var(--accent-ink)', textDecoration: 'none' }}>
          Entrar
        </Link>
      </header>

      {/* ── Step dots ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 20 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            height: 4, borderRadius: 999,
            width: i === step ? 24 : 8,
            background: i <= step ? 'var(--accent)' : 'rgba(26,27,46,0.10)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Content ── */}
      <main className="tessy-register-main" style={{ flex: 1, maxWidth: 460, width: '100%', margin: '0 auto', padding: '34px 24px 28px' }}>

        {/* Title */}
        <div style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 560, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Etapa {step + 1} de {totalSteps} · {stepLabels[step]}
          </p>
          <h1 className="tessy-auth-title" style={{ fontSize: 38, fontWeight: 560, letterSpacing: 0, lineHeight: 1.08, color: 'var(--accent-ink)' }}>
            {step === 0 && <>Escolha seu perfil<span style={{ color: 'var(--accent)' }}>.</span></>}
            {step === 1 && data.role === 'medico' && <>Dados profissionais<span style={{ color: 'var(--accent)' }}>.</span></>}
            {step === 1 && data.role === 'empresa' && <>Dados comerciais<span style={{ color: 'var(--accent)' }}>.</span></>}
            {step === 2 && <>Crie seu acesso<span style={{ color: 'var(--accent)' }}>.</span></>}
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            {step === 0 && 'O Tessy adapta a experiência para médicos e empresas.'}
            {step === 1 && data.role === 'medico' && 'Esses dados ajudam empresas a entenderem seu perfil profissional.'}
            {step === 1 && data.role === 'empresa' && 'Configure o contato que médicos usarão para falar com seu representante.'}
            {step === 2 && 'Use um e-mail profissional para acessar sua conta com segurança.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '13px 14px', borderRadius: 8,
            background: 'rgba(232,69,69,0.08)', border: '1px solid rgba(232,69,69,0.22)',
            color: 'var(--danger)', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* ── STEP 0: Role ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {([
              { role: 'medico' as UserRole, code: 'M', title: 'Sou médico', desc: 'Acesso a eventos, produtos e representantes' },
              { role: 'empresa' as UserRole, code: 'E', title: 'Sou empresa', desc: 'Publique produtos, eventos e receba leads médicos' },
            ]).map(opt => {
              const active = data.role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => pickRole(opt.role)}
                  style={{
                    textAlign: 'left', padding: '18px 16px',
                    borderRadius: 8, border: `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                    background: active ? 'var(--accent-soft)' : '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'border-color 0.15s, background 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: active ? '0 12px 28px rgba(74,168,255,0.10)' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 8, flexShrink: 0,
                    background: active ? 'var(--accent-ink)' : 'var(--chip)',
                    color: active ? '#fff' : 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 560,
                  }}>
                    {opt.code}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 560, color: 'var(--accent-ink)' }}>{opt.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: active ? 'var(--accent)' : 'transparent',
                    border: `2px solid ${active ? 'var(--accent)' : 'rgba(26,27,46,0.14)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 560,
                    transition: 'all 0.15s',
                  }}>
                    {active && '✓'}
                  </div>
                </button>
              );
            })}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#777487', marginTop: 4 }}>
              Selecione para continuar
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
              placeholder="Dra. Ana Silva"
              autoComplete="name"
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>
                  CRM <span style={{ color: 'var(--danger)', fontSize: 12 }}>*</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.crm}
                  onChange={e => update('crm', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="123456"
                  style={{
                    width: '100%', padding: '13px 14px', borderRadius: 8,
                    border: '1.5px solid var(--line)', background: '#fff',
                    color: 'var(--ink)', fontSize: 16, outline: 'none',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ width: 90 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>
                  Estado <span style={{ color: 'var(--danger)', fontSize: 12 }}>*</span>
                </div>
                <select
                  value={data.crmState}
                  onChange={e => update('crmState', e.target.value)}
                  style={{
                    width: '100%', padding: '13px 8px', borderRadius: 8,
                    border: '1.5px solid var(--line)', background: '#fff',
                    color: data.crmState ? 'var(--ink)' : 'var(--muted)',
                    fontSize: 15, fontWeight: 560, outline: 'none',
                    appearance: 'none', textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                >
                  <option value="">UF</option>
                  {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>
                Especialidade <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPECIALTIES.map(s => {
                  const sel = data.specialty === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('specialty', sel ? '' : s)}
                      style={{
                        padding: '8px 14px', borderRadius: 999,
                        border: `1.5px solid ${sel ? 'var(--accent)' : 'rgba(26,27,46,0.10)'}`,
                        background: sel ? '#EEF4FF' : '#fff',
                        color: sel ? 'var(--accent)' : 'var(--ink-2)',
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
                    borderRadius: 8, border: '1.5px solid var(--line)',
                    background: '#fff', color: 'var(--ink)',
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
          padding: '8px 24px 34px',
          background: 'transparent',
        }}>
          <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={step < totalSteps - 1 ? next : submit}
              disabled={!ready}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 8, border: 'none',
                background: ready ? 'var(--accent-ink)' : '#EEF0F6',
                color: ready ? '#fff' : 'var(--muted)',
                fontSize: 16, fontWeight: 560,
                cursor: ready ? 'pointer' : 'not-allowed',
                boxShadow: ready ? '0 10px 24px rgba(52,57,73,0.18)' : 'none',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isLoading ? 'Criando sua conta...' : step < totalSteps - 1 ? 'Continuar' : 'Criar conta'}
            </button>
            {step === totalSteps - 1 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                Já tem conta?{' '}
                <Link to="/entrar" style={{ color: 'var(--accent-ink)', fontWeight: 560, textDecoration: 'none' }}>Entrar</Link>
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
            <Link to="/entrar" style={{ color: 'var(--accent-ink)', fontWeight: 560, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      )}
    </div>
  );
}

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
          width: '100%', padding: '13px 14px', borderRadius: 8,
          border: '1.5px solid var(--line)', background: '#fff',
          color: 'var(--ink)', fontSize: 16, outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(74,168,255,0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(26,27,46,0.12)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {hint && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{hint}</div>
      )}
    </div>
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
  if (d.startsWith('55')) return d;
  return `55${d}`;
}
