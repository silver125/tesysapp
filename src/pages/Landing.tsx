import { Link } from 'react-router-dom';
import { WaIcon } from '../components/ui';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--ink)' }}>
      <header style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,14,22,0.85)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg,#2E7BFF 0%,#5F2C82 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Tessy<span style={{ color: '#2E7BFF' }}>.</span>
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
        }}>
          Entrar
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(46,123,255,0.1)', border: '1px solid rgba(46,123,255,0.25)',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1EA97C', flexShrink: 0 }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6FA4FF', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              plataforma médica
            </span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ink)' }}>
            Médicos e empresas
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #2E7BFF 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              conectados.
            </span>
          </h1>

          <p style={{ marginTop: 16, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 320, margin: '16px auto 0' }}>
            Eventos, produtos e cursos das melhores empresas da saúde. Fale direto pelo WhatsApp, sem burocracia.
          </p>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/cadastro" style={{
              display: 'block', padding: '15px 24px', borderRadius: 14,
              background: '#2E7BFF', color: '#fff',
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              textDecoration: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 8px 32px rgba(46,123,255,0.35)',
            }}>
              Criar conta grátis →
            </Link>
            <Link to="/entrar" style={{
              display: 'block', padding: '15px 24px', borderRadius: 14,
              background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink-2)',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
              textDecoration: 'none',
            }}>
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 400, width: '100%' }}>
          {[
            { icon: '📅', title: 'Eventos', desc: 'Congressos e workshops' },
            { icon: '💊', title: 'Produtos', desc: 'Catálogo farmacêutico' },
            { icon: '🎓', title: 'Cursos', desc: 'Para médicos professores' },
          ].map(f => (
            <div key={f.title} style={{
              padding: '14px 10px', borderRadius: 16,
              background: 'var(--card)', border: '1px solid var(--line)', textAlign: 'left',
            }}>
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
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'rgba(37,211,102,0.12)',
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
