import { useMemo, useState } from 'react';
import { useAuth } from '../context/useAuth';
import type { User, UserRole } from '../types';
import { Mono, TessyMark } from './ui';

type Step = {
  title: string;
  body: string;
};

const STEPS: Record<UserRole, Step[]> = {
  medico: [
    {
      title: 'Encontre oportunidades reais.',
      body: 'Produtos, eventos e empresas alinhados ao seu perfil médico.',
    },
    {
      title: 'Fale direto com representantes.',
      body: 'Use o WhatsApp para conversar sem chat interno ou espera.',
    },
    {
      title: 'Participe sem perder tempo.',
      body: 'Entre em eventos, peça materiais e solicite amostras em poucos toques.',
    },
    {
      title: 'Seu perfil melhora as sugestões.',
      body: 'Especialidade, região e contato ajudam a Tessy filtrar o que importa.',
    },
  ],
  empresa: [
    {
      title: 'Cadastre produtos com intenção.',
      body: 'Mostre indicação, diferencial, material e próximo passo comercial.',
    },
    {
      title: 'Crie eventos para médicos certos.',
      body: 'Aulas, workshops, lançamentos e demonstrações com vagas controladas.',
    },
    {
      title: 'Receba leads qualificados.',
      body: 'Cada interesse médico aparece no dashboard da empresa.',
    },
    {
      title: 'Responda rápido pelo WhatsApp.',
      body: 'Transforme interesse em conversa com o representante certo.',
    },
  ],
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

export default function OnboardingModal() {
  const { user, completeOnboarding } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const steps = useMemo(() => user ? STEPS[user.role] : [], [user]);
  const current = steps[step];
  const last = step === steps.length - 1;
  const open = Boolean(user && !dismissed && shouldShowOnboarding(user));

  async function closeAndSave() {
    await completeOnboarding();
    setDismissed(true);
  }

  if (!open || !user || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tessy-onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(23,27,42,0.34)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          width: 'min(430px, 100%)',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(227,231,242,0.95)',
          boxShadow: '0 28px 90px rgba(52,57,73,0.22)',
          padding: 22,
          color: 'var(--ink)',
        }}
      >
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
            onClick={closeAndSave}
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

        <div style={{ marginTop: 24 }}>
          <Mono style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase' }}>
            passo {step + 1} de {steps.length}
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

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 7 }}>
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              aria-label={`Ir para passo ${index + 1}`}
              style={{
                height: 5,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: index <= step ? 'var(--accent)' : 'rgba(146,153,168,0.20)',
                transition: 'background 180ms ease',
              }}
            />
          ))}
        </div>

        <div style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: step === 0 ? '1fr 1.5fr' : '0.9fr 1.5fr',
          gap: 10,
        }}>
          <button
            type="button"
            onClick={step === 0 ? closeAndSave : () => setStep(prev => Math.max(0, prev - 1))}
            style={{
              height: 50,
              borderRadius: 14,
              border: '1px solid var(--line)',
              background: 'var(--chip)',
              color: 'var(--ink-2)',
              fontSize: 14,
              fontWeight: 560,
              cursor: 'pointer',
            }}
          >
            {step === 0 ? 'Pular' : 'Voltar'}
          </button>
          <button
            type="button"
            onClick={last ? closeAndSave : () => setStep(prev => Math.min(steps.length - 1, prev + 1))}
            style={{
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: 'var(--accent-ink)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 560,
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(52,57,73,0.22)',
            }}
          >
            {last ? 'Ir para o dashboard' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
