import { Link } from 'react-router-dom';

const SERIF = "'Fraunces', Georgia, serif";
const MONO  = "'JetBrains Mono', monospace";

/* Logo T — moderno original (gradient vibrante + glow) */
function LogoT({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: 'linear-gradient(135deg, #6478FF 0%, #B469FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.52,
      fontFamily: "'Inter', sans-serif",
      letterSpacing: '-0.04em',
      boxShadow: '0 6px 18px rgba(91,110,245,0.40), inset 0 1px 0 rgba(255,255,255,0.30)',
      border: '1px solid rgba(255,255,255,0.18)',
      flexShrink: 0,
    }}>T</div>
  );
}

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      color: 'var(--ink)',
      background: `
        radial-gradient(800px 500px at 10% 0%, #F4EEFF 0%, transparent 55%),
        radial-gradient(800px 600px at 100% 100%, #FFE9F3 0%, transparent 55%),
        #FFFFFF
      `,
    }}>

      {/* ═════════ HEADER (light, minimal) ═════════ */}
      <header className="lp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoT size={34} />
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Tessy<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <Link to="/entrar" style={{
          padding: '8px 16px', borderRadius: 10,
          border: '1px solid var(--line)',
          background: '#fff',
          color: 'var(--ink-2)',
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          textDecoration: 'none',
        }}>
          Entrar
        </Link>
      </header>

      {/* ═════════ HERO ═════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(40px, 9vw, 80px) clamp(20px, 5vw, 32px) clamp(48px, 10vw, 88px)',
        textAlign: 'center',
        flex: '1 0 auto',
      }}>
        {/* Blobs decorativos suaves */}
        <div className="float-slow" aria-hidden style={{
          position: 'absolute', top: -80, left: -100,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,181,253,0.50) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
        }} />
        <div className="float-slow" aria-hidden style={{
          position: 'absolute', top: 120, right: -120,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,207,232,0.50) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
          animationDelay: '1s',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 560, margin: '0 auto' }}>

          {/* Eyebrow */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid var(--line)',
            marginBottom: 24,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px rgba(91,110,245,0.50)', flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
              CRM verificado · Convite
            </span>
          </div>

          {/* Headline — compacta */}
          <h1 className="fade-up delay-1" style={{
            fontSize: 'clamp(28px, 7.5vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.030em',
            lineHeight: 1.08,
            color: 'var(--ink)',
            wordBreak: 'normal',
            overflowWrap: 'break-word',
          }}>
            Médicos e a{' '}
            <span style={{
              fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500,
              background: 'linear-gradient(90deg, #7C5CFF 0%, #C084FC 50%, #F472B6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}>
              indústria da saúde
            </span>
            , conectados.
          </h1>

          {/* Subhead — curto e direto */}
          <p className="fade-up delay-2" style={{
            marginTop: 18,
            fontSize: 'clamp(14px, 3.6vw, 16px)',
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            maxWidth: 440,
            margin: '18px auto 0',
          }}>
            Acesso por convite e por CRM.
          </p>

          {/* CTAs */}
          <div className="fade-up delay-3" style={{
            marginTop: 28,
            display: 'flex', flexDirection: 'column', gap: 10,
            maxWidth: 320, margin: '28px auto 0',
          }}>
            <Link to="/cadastro" style={{
              padding: '15px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, #5B6EF5 0%, #A855F7 100%)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 14px 32px rgba(91,110,245,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
              border: '1px solid rgba(255,255,255,0.20)',
            }}>
              Solicitar acesso →
            </Link>
            <Link to="/entrar" style={{
              padding: '13px 24px', borderRadius: 14,
              background: '#fff',
              border: '1px solid var(--line)',
              color: 'var(--ink-2)',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
            }}>
              Já sou membro
            </Link>
          </div>

          {/* 3 trust chips minimalistas */}
          <div className="fade-up delay-4" style={{
            marginTop: 36,
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
          }}>
            {['CRM verificado', 'Empresas selecionadas', 'Ambiente seguro'].map(t => (
              <div key={t} style={{
                padding: '7px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.80)',
                border: '1px solid var(--line)',
                fontSize: 12, color: 'var(--ink-2)', fontWeight: 600,
                backdropFilter: 'blur(6px)',
              }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ CTA FINAL ═════════ */}
      <section style={{ padding: '0 clamp(20px, 5vw, 32px) clamp(40px, 8vw, 64px)' }}>
        <div className="fade-up" style={{
          maxWidth: 560, margin: '0 auto',
          padding: '28px 24px', borderRadius: 22,
          background: 'linear-gradient(165deg, #FFFFFF 0%, #F4F0FE 60%, #FCE7F3 100%)',
          border: '1px solid var(--line)',
          boxShadow: '0 16px 40px rgba(90,80,130,0.10)',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden style={{
            position: 'absolute', top: -60, right: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)',
            filter: 'blur(28px)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <LogoT size={44} />
            </div>
            <h2 style={{
              fontSize: 'clamp(20px, 5vw, 24px)',
              fontWeight: 700, letterSpacing: '-0.02em',
              lineHeight: 1.25, color: 'var(--ink)',
            }}>
              Faça parte do{' '}
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, color: 'var(--accent-ink)' }}>
                círculo médico privado.
              </span>
            </h2>
            <Link to="/cadastro" style={{
              display: 'inline-block', marginTop: 18,
              padding: '13px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #5B6EF5 0%, #A855F7 100%)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 10px 24px rgba(91,110,245,0.35)',
              border: '1px solid rgba(255,255,255,0.20)',
            }}>
              Solicitar acesso →
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════ FOOTER minimal ═════════ */}
      <footer style={{
        padding: '20px 20px 28px', textAlign: 'center',
        fontFamily: MONO, fontSize: 10,
        color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase',
        borderTop: '1px solid var(--line)',
      }}>
        © 2025 Tessy<span style={{ color: 'var(--accent)' }}>.</span>app
      </footer>

      {/* ═════════ STYLES (mobile-first) ═════════ */}
      <style>{`
        .lp-header {
          padding: 12px 18px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 30;
          background: rgba(255,255,255,0.80);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
        }
        @media (min-width: 720px) {
          .lp-header { padding: 14px 24px; }
        }
      `}</style>
    </div>
  );
}
