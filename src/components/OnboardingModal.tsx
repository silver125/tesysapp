import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useAuth } from '../context/useAuth';
import { readDoctorPreferences, writeDoctorPreferencesLocal } from '../lib/doctorPreferences';
import type { User } from '../types';
import { Mono, TessyMark, WaIcon } from './ui';

type Step = {
  title: string;
  body: string;
};

const COMPANY_STEPS: Step[] = [
  {
    title: 'Publique oportunidades claras.',
    body: 'Produtos, eventos, workshops e amostras aparecem para médicos com perfil compatível.',
  },
  {
    title: 'Receba interesse médico.',
    body: 'Cada clique vira sinal comercial para sua empresa responder com contexto.',
  },
  {
    title: 'Converse pelo WhatsApp.',
    body: 'A Tessy aproxima a relação, mas a conversa acontece no canal que o mercado já usa.',
  },
];

const DOCTOR_INTERESTS = [
  { label: 'Produtos', hint: 'novidades para sua prática' },
  { label: 'Eventos', hint: 'aulas, workshops e imersões' },
  { label: 'Representantes', hint: 'contato direto por região' },
  { label: 'Amostras', hint: 'testes e materiais' },
  { label: 'Serviços', hint: 'parceiros para clínica' },
  { label: 'Workshops', hint: 'capacitações médicas' },
];

const DOCTOR_STEPS = [
  'interesses',
  'contato',
  'privacidade',
  'pronto',
] as const;

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 80,
  padding: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(23,27,42,0.34)',
  backdropFilter: 'blur(14px)',
};

const panelStyle: CSSProperties = {
  width: 'min(440px, 100%)',
  maxHeight: 'calc(100vh - 36px)',
  overflowY: 'auto',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.97)',
  border: '1px solid rgba(227,231,242,0.95)',
  boxShadow: '0 28px 90px rgba(52,57,73,0.22)',
  padding: 22,
  color: 'var(--ink)',
};

const primaryButton: CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #4A86F7 0%, #8F83C8 52%, #FF7254 100%)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 560,
  cursor: 'pointer',
  boxShadow: '0 14px 34px rgba(74,134,247,0.22)',
};

const secondaryButton: CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: '1px solid var(--line)',
  background: 'var(--chip)',
  color: 'var(--ink-2)',
  fontSize: 14,
  fontWeight: 560,
  cursor: 'pointer',
};

function readLocalFlag(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function shouldShowOnboarding(user: User) {
  const done = readLocalFlag(`tessy-onboarding-done-${user.id}`);
  const pending = readLocalFlag(`tessy-onboarding-pending-${user.id}`);
  return !done && (pending === '1' || !user.onboardingCompletedAt);
}

function displayPhone(raw?: string) {
  const digits = (raw ?? '').replace(/\D/g, '');
  const national = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  return formatPhone(national);
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
  if (!d) return '';
  return d.startsWith('55') ? d : `55${d}`;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

function OnboardingShell({ children, onClose }: { children: ReactNode; onClose: () => void | Promise<void> }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tessy-onboarding-title"
      style={overlayStyle}
    >
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TessyMark size={34} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 560, color: 'var(--accent-ink)', lineHeight: 1 }}>
                Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
              </div>
              <Mono style={{ display: 'block', marginTop: 4, fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>
                primeiro acesso
              </Mono>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar onboarding"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '1px solid var(--line)',
              background: 'var(--chip)',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DoctorOnboarding({ user, onComplete }: { user: User; onComplete: () => Promise<void> }) {
  const { updateProfile } = useAuth();
  const stored = useMemo(
    () => readDoctorPreferences(user.id, user.doctorInterests),
    [user.id, user.doctorInterests],
  );
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>(
    stored?.interests?.length ? stored.interests : ['Produtos', 'Eventos', 'Representantes'],
  );
  const [phone, setPhone] = useState(displayPhone(user.whatsapp));
  const [privateOnly, setPrivateOnly] = useState(user.whatsappConnectionOnly !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const current = DOCTOR_STEPS[step];
  const last = step === DOCTOR_STEPS.length - 1;

  async function finish() {
    setSaving(true);
    setError('');

    try {
      const normalized = normalizePhone(phone);
      const hasInvalidPhone = phone.trim().length > 0 && normalized.replace(/^55/, '').length < 10;
      if (hasInvalidPhone) {
        setError('Informe um WhatsApp brasileiro com DDD.');
        setStep(1);
        return;
      }

      writeDoctorPreferencesLocal(user.id, interests);

      await updateProfile({
        doctorInterests: interests,
        ...(normalized !== (user.whatsapp ?? '') || privateOnly !== (user.whatsappConnectionOnly !== false)
          ? { whatsapp: normalized, whatsappConnectionOnly: privateOnly }
          : {}),
      });

      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o onboarding.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ marginTop: 22 }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase' }}>
          passo {step + 1} de {DOCTOR_STEPS.length}
        </Mono>
        <h2 id="tessy-onboarding-title" style={{
          marginTop: 8,
          color: 'var(--accent-ink)',
          fontSize: 29,
          lineHeight: 1.06,
          letterSpacing: 0,
          fontWeight: 560,
        }}>
          {current === 'interesses' && 'Ajuste suas oportunidades.'}
          {current === 'contato' && 'Seu canal profissional.'}
          {current === 'privacidade' && 'Você controla o contato.'}
          {current === 'pronto' && 'Pronto para usar a Tessy.'}
        </h2>
        <p style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.48 }}>
          {current === 'interesses' && 'Escolha o que você quer ver primeiro. A experiência fica mais direta para sua rotina.'}
          {current === 'contato' && 'Empresas aprovadas podem falar com você por WhatsApp, sem chat interno complicado.'}
          {current === 'privacidade' && 'Seu número não fica aberto publicamente. A conexão precisa ter intenção clara.'}
          {current === 'pronto' && 'Comece pelas oportunidades em destaque e conecte apenas quando fizer sentido.'}
        </p>
      </div>

      {error && (
        <div style={{
          marginTop: 16,
          padding: '11px 12px',
          borderRadius: 14,
          border: '1px solid rgba(232,69,69,0.22)',
          background: 'rgba(232,69,69,0.08)',
          color: 'var(--danger)',
          fontSize: 13,
          lineHeight: 1.4,
        }}>
          {error}
        </div>
      )}

      {current === 'interesses' && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}>
            {DOCTOR_INTERESTS.map(item => {
              const selected = interests.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setInterests(prev => toggleValue(prev, item.label))}
                  style={{
                    minHeight: 78,
                    padding: '13px 12px',
                    textAlign: 'left',
                    borderRadius: 16,
                    border: selected ? '1px solid rgba(74,168,255,0.45)' : '1px solid var(--line)',
                    background: selected ? 'linear-gradient(135deg, rgba(74,168,255,0.12), rgba(255,114,84,0.08))' : '#fff',
                    color: selected ? 'var(--accent-ink)' : 'var(--ink-2)',
                    cursor: 'pointer',
                    boxShadow: selected ? '0 10px 26px rgba(74,168,255,0.10)' : 'none',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 560 }}>{item.label}</span>
                  <span style={{ display: 'block', marginTop: 5, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.3 }}>
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(246,248,255,0.94)',
            border: '1px solid var(--line)',
            color: 'var(--ink-2)',
            fontSize: 12.5,
            lineHeight: 1.45,
          }}>
            {user.specialty ? `Perfil atual: ${user.specialty}.` : 'Complete sua especialidade no perfil para melhorar os matches.'}
          </div>
        </div>
      )}

      {current === 'contato' && (
        <div style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 18,
          background: '#fff',
          border: '1px solid var(--line)',
          boxShadow: '0 12px 36px rgba(52,57,73,0.08)',
        }}>
          <label htmlFor="doctor-onboarding-whatsapp" style={{ display: 'block', fontSize: 13, fontWeight: 560, color: 'var(--ink-2)' }}>
            WhatsApp profissional
          </label>
          <div style={{ position: 'relative', marginTop: 10 }}>
            <span style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#25D366',
              display: 'flex',
            }}>
              <WaIcon size={18} />
            </span>
            <input
              id="doctor-onboarding-whatsapp"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={event => setPhone(formatPhone(event.target.value))}
              placeholder="(11) 99999-9999"
              style={{
                width: '100%',
                height: 48,
                padding: '0 14px 0 44px',
                borderRadius: 14,
                border: '1.5px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <p style={{ marginTop: 9, color: 'var(--muted)', fontSize: 12, lineHeight: 1.45 }}>
            Use um número que possa receber contatos comerciais, convites, eventos e oportunidades da Tessy.
          </p>
        </div>
      )}

      {current === 'privacidade' && (
        <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
          <label style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: 15,
            borderRadius: 18,
            border: '1px solid rgba(74,168,255,0.28)',
            background: 'linear-gradient(135deg, rgba(74,168,255,0.10), rgba(255,255,255,0.92))',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={privateOnly}
              onChange={event => setPrivateOnly(event.target.checked)}
              style={{ marginTop: 3, accentColor: 'var(--accent)' }}
            />
            <span>
              <span style={{ display: 'block', color: 'var(--accent-ink)', fontSize: 15, fontWeight: 560 }}>
                Mostrar WhatsApp apenas para empresas com conexão aprovada.
              </span>
              <span style={{ display: 'block', marginTop: 5, color: 'var(--ink-2)', fontSize: 12.5, lineHeight: 1.45 }}>
                Recomendado para manter controle e evitar abordagem fria.
              </span>
            </span>
          </label>

          {[
            'Empresas veem “Solicitar conexão” antes do contato.',
            'Você decide quando liberar a conversa.',
            'O WhatsApp abre direto quando a conexão for aprovada.',
          ].map(item => (
            <div key={item} style={{
              display: 'flex',
              gap: 9,
              alignItems: 'center',
              padding: '11px 13px',
              borderRadius: 14,
              background: '#fff',
              border: '1px solid var(--line)',
              color: 'var(--ink-2)',
              fontSize: 12.5,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--accent)',
                flexShrink: 0,
              }} />
              {item}
            </div>
          ))}
        </div>
      )}

      {current === 'pronto' && (
        <div style={{
          marginTop: 20,
          borderRadius: 20,
          padding: 18,
          background: 'linear-gradient(135deg, rgba(74,134,247,0.13), rgba(255,114,84,0.12))',
          border: '1px solid rgba(74,168,255,0.24)',
        }}>
          <Mono style={{ color: 'var(--accent)', fontSize: 10, textTransform: 'uppercase' }}>
            próxima ação
          </Mono>
          <h3 style={{ marginTop: 10, color: 'var(--accent-ink)', fontSize: 22, lineHeight: 1.12, fontWeight: 560 }}>
            Veja quem combina com sua prática.
          </h3>
          <p style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.48 }}>
            No dashboard, comece por empresas sugeridas, representantes disponíveis e eventos próximos.
          </p>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {interests.slice(0, 4).map(item => (
              <span key={item} style={{
                padding: '7px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.70)',
                background: 'rgba(255,255,255,0.72)',
                color: 'var(--accent-ink)',
                fontSize: 12,
                fontWeight: 560,
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <ProgressDots total={DOCTOR_STEPS.length} active={step} onClick={setStep} />

      <div style={{
        marginTop: 22,
        display: 'grid',
        gridTemplateColumns: step === 0 ? '1fr 1.45fr' : '0.95fr 1.45fr',
        gap: 10,
      }}>
        <button
          type="button"
          onClick={step === 0 ? onComplete : () => setStep(prev => Math.max(0, prev - 1))}
          disabled={saving}
          style={{ ...secondaryButton, opacity: saving ? 0.68 : 1 }}
        >
          {step === 0 ? 'Depois' : 'Voltar'}
        </button>
        <button
          type="button"
          onClick={last ? finish : () => setStep(prev => Math.min(DOCTOR_STEPS.length - 1, prev + 1))}
          disabled={saving}
          style={{ ...primaryButton, opacity: saving ? 0.72 : 1 }}
        >
          {saving ? 'Salvando...' : last ? 'Ir para o dashboard' : 'Continuar'}
        </button>
      </div>
    </>
  );
}

function CompanyOnboarding({ onComplete }: { onComplete: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const current = COMPANY_STEPS[step];
  const last = step === COMPANY_STEPS.length - 1;

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase' }}>
          passo {step + 1} de {COMPANY_STEPS.length}
        </Mono>
        <h2 id="tessy-onboarding-title" style={{
          marginTop: 8,
          color: 'var(--accent-ink)',
          fontSize: 31,
          lineHeight: 1.06,
          letterSpacing: 0,
          fontWeight: 560,
        }}>
          {current.title}
        </h2>
        <p style={{
          marginTop: 12,
          color: 'var(--ink-2)',
          fontSize: 15,
          lineHeight: 1.52,
        }}>
          {current.body}
        </p>
      </div>

      <ProgressDots total={COMPANY_STEPS.length} active={step} onClick={setStep} />

      <div style={{
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: step === 0 ? '1fr 1.5fr' : '0.9fr 1.5fr',
        gap: 10,
      }}>
        <button
          type="button"
          onClick={step === 0 ? onComplete : () => setStep(prev => Math.max(0, prev - 1))}
          style={secondaryButton}
        >
          {step === 0 ? 'Pular' : 'Voltar'}
        </button>
        <button
          type="button"
          onClick={last ? onComplete : () => setStep(prev => Math.min(COMPANY_STEPS.length - 1, prev + 1))}
          style={{ ...primaryButton, background: 'var(--accent-ink)', boxShadow: '0 12px 30px rgba(52,57,73,0.22)' }}
        >
          {last ? 'Ir para o dashboard' : 'Continuar'}
        </button>
      </div>
    </>
  );
}

function ProgressDots({ total, active, onClick }: { total: number; active: number; onClick: (index: number) => void }) {
  return (
    <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 7 }}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onClick(index)}
          aria-label={`Ir para passo ${index + 1}`}
          style={{
            height: 5,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: index <= active ? 'var(--accent)' : 'rgba(146,153,168,0.20)',
            transition: 'background 180ms ease',
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingModal() {
  const { user, completeOnboarding } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const open = Boolean(user && !dismissed && shouldShowOnboarding(user));

  async function closeAndSave() {
    await completeOnboarding();
    setDismissed(true);
  }

  if (!open || !user) return null;

  return (
    <OnboardingShell onClose={closeAndSave}>
      {user.role === 'medico'
        ? <DoctorOnboarding user={user} onComplete={closeAndSave} />
        : <CompanyOnboarding onComplete={closeAndSave} />}
    </OnboardingShell>
  );
}
