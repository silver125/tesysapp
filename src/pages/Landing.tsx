import { Link } from 'react-router-dom';
import { WaIcon } from '../components/ui';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      <header style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(247,245,250,0.88)', backdropFilter: 'blur(14px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg,#5B6EF5 0%,#A855F7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
            boxShadow: '0 4px 12px rgba(91,110,245,0.25)',
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>
              Tessy<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1 }}>
              saúde + negócios
            </div>
          </div>
        </div>
        <Link to="/entrar" style={{
          padding: '8px 16px', borderRadius: 10,
          border: '1px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink-2)',
          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 1px 4px rgba(90,80,130,0.08)',
        }}>
          Entrar
        </Link>
      </header>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blurred blobs */}
        <div style={{
          position: 'absolute', top: -80, left: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(168,85,247,0) 70%)',
          filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 40, right: -80,
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,110,245,0.30) 0%, rgba(91,110,245,0) 70%)',
          filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: '20%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.22) 0%, rgba(244,114,182,0) 70%)',
          filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none',
        }} />

        {/* Conteúdo hero */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 24px 52px', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 400, width: '100%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(91,110,245,0.20)',
              marginBottom: 28,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(90,80,130,0.06)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                plataforma médica
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--ink)' }}>
              Médicos e empresas
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #5B6EF5 0%, #A855F7 50%, #F472B6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}>
                conectados.
              </span>
            </h1>

            <p style={{ marginTop: 18, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 340, margin: '18px auto 0' }}>
              Eventos, produtos e cursos das melhores empresas da saúde. Fale direto pelo WhatsApp, sem burocracia.
            </p>

            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/cadastro" style={{
                display: 'block', padding: '16px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #5B6EF5 0%, #A855F7 100%)',
                color: '#fff',
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
                textDecoration: 'none', letterSpacing: '-0.01em',
                boxShadow: '0 10px 30px rgba(91,110,245,0.35)',
              }}>
                Criar conta grátis →
              </Link>
              <Link to="/entrar" style={{
                display: 'block', padding: '16px 24px', borderRadius: 14,
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--line)',
                color: 'var(--ink-2)',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(90,80,130,0.08)',
              }}>
                Já tenho conta
              </Link>
            </div>

            {/* Trust row */}
            <div style={{
              marginTop: 32, display: 'flex', justifyContent: 'center',
              gap: 20, flexWrap: 'wrap',
            }}>
              {[
                { label: '100%', sub: 'grátis' },
                { label: 'CRM', sub: 'verificado' },
                { label: '24h', sub: 'suporte' },
              ].map(t => (
                <div key={t.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{t.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
                    {t.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px 32px', textAlign: 'center' }}>
        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 400, width: '100%' }}>
          {[
            { icon: '📅', title: 'Eventos', desc: 'Congressos e workshops', accent: '#5B6EF5' },
            { icon: '💊', title: 'Produtos', desc: 'Catálogo farmacêutico', accent: '#A855F7' },
            { icon: '🎓', title: 'Cursos', desc: 'Para professores', accent: '#F472B6' },
          ].map(f => (
            <div key={f.title} style={{
              padding: '14px 10px', borderRadius: 16,
              background: 'var(--card)', border: '1px solid var(--line)', textAlign: 'left',
              boxShadow: '0 2px 10px rgba(90,80,130,0.06)',
              position: 'relative',
            }}>
              <div style={{
                width: 4, height: 20, borderRadius: 2,
                background: f.accent, marginBottom: 8,
              }} />
              <div style={{ fontSize: 22 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, color: 'var(--ink)' }}>{f.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* WhatsApp callout */}
        <div style={{
          marginTop: 16, maxWidth: 400, width: '100%',
          padding: '14px 16px', borderRadius: 16,
          background: 'var(--card)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
          boxShadow: '0 2px 10px rgba(90,80,130,0.06)',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'rgba(37,211,102,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#25D366',
          }}>
            <WaIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Contato direto via WhatsApp</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Clique num card e já abre o chat com a empresa.</div>
          </div>
        </div>
      </main>

      <footer style={{
        padding: '14px 20px', textAlign: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
        borderTop: '1px solid var(--line)',
      }}>
        © 2025 Tessy.app
      </footer>
    </div>
  );
}
