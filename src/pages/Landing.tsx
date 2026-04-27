import { Link } from 'react-router-dom';

const heroImage = '/hero-clinic-premium.png';

const trustPoints = [
  ['Empresas filtradas', 'Nada de feed aberto.'],
  ['WhatsApp direto', 'Sem chat complexo.'],
  ['Você decide', 'Sem compromisso.'],
];

const steps = [
  ['01', 'Encontre', 'Produtos, eventos e representantes.'],
  ['02', 'Avalie', 'Veja proposta, amostra e contato.'],
  ['03', 'Converse', 'Fale direto quando fizer sentido.'],
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', color: 'var(--ink)', background: '#FBFAFD' }}>
      <header style={{
        padding: '16px clamp(20px, 5vw, 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(26,27,46,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(251,250,253,0.94)',
        backdropFilter: 'blur(14px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: '#17142F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
          }}>T</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: 0, lineHeight: 1, color: 'var(--ink)' }}>
              Tessy<span style={{ color: '#2E7BFF' }}>.</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
              saúde + negócios
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/entrar" style={{
            padding: '10px 12px',
            color: 'var(--ink-2)',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            Entrar
          </Link>
          <Link to="/cadastro" style={{
            padding: '11px 16px',
            borderRadius: 8,
            background: '#2E7BFF',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 10px 24px rgba(46,123,255,0.22)',
          }}>
            Criar conta
          </Link>
        </nav>
      </header>

      <section style={{
        minHeight: 'min(650px, calc(100vh - 70px))',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(420px, 0.9fr)',
        alignItems: 'stretch',
        overflow: 'hidden',
      }} className="tessy-hero-grid">
        <div style={{
          padding: 'clamp(40px, 8vw, 88px) clamp(22px, 6vw, 86px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            width: 'fit-content',
            alignItems: 'center',
            gap: 8,
            padding: '7px 11px',
            borderRadius: 999,
            background: '#EEF4FF',
            color: '#285DE8',
            fontSize: 12,
            fontWeight: 800,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: '#2E7BFF' }} />
            acesso médico
          </div>

          <h1 style={{
            maxWidth: 680,
            marginTop: 22,
            fontSize: 'clamp(44px, 7vw, 78px)',
            lineHeight: 0.96,
            letterSpacing: 0,
            fontWeight: 900,
            color: '#17142F',
          }}>
            Menos ruído. Mais contato certo.
          </h1>

          <p style={{
            maxWidth: 500,
            marginTop: 20,
            fontSize: 18,
            lineHeight: 1.45,
            color: '#5C5B6E',
          }}>
            Produtos, eventos e representantes de saúde em um só lugar. Claro, rápido e direto.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 30, flexWrap: 'wrap' }}>
            <Link to="/cadastro" style={{
              padding: '14px 20px',
              borderRadius: 8,
              background: '#2E7BFF',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 900,
            }}>
              Criar conta
            </Link>
            <Link to="/entrar" style={{
              padding: '14px 18px',
              borderRadius: 8,
              background: '#fff',
              color: '#17142F',
              border: '1px solid rgba(26,27,46,0.12)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 800,
            }}>
              Já tenho acesso
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 34, maxWidth: 620 }} className="tessy-category-grid">
            {trustPoints.map(([title, desc]) => (
              <div key={title} style={{
                padding: 14,
                borderRadius: 8,
                background: '#fff',
                border: '1px solid rgba(26,27,46,0.08)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#17142F', lineHeight: 1.15 }}>{title}</div>
                <div style={{ marginTop: 5, color: '#777487', fontSize: 12, lineHeight: 1.35 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: 420 }}>
          <img
            src={heroImage}
            alt="Clínica médica elegante"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(251,250,253,0.92) 0%, rgba(251,250,253,0.02) 38%, rgba(23,20,47,0.12) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            left: 28,
            right: 28,
            bottom: 28,
            padding: 18,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.94)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 20px 50px rgba(23,20,47,0.18)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#2E7BFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Convite médico
            </div>
            <div style={{ marginTop: 7, fontSize: 20, fontWeight: 900, color: '#17142F', lineHeight: 1.2 }}>
              Dermato, estética e saúde premium
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#5C5B6E' }}>
              Amostras · eventos · representantes
            </div>
          </div>
        </div>
      </section>

      <main style={{ padding: '42px clamp(20px, 5vw, 72px) 64px' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(25px, 4vw, 36px)', lineHeight: 1.1, letterSpacing: 0, color: '#17142F', fontWeight: 900 }}>
                Funciona assim.
              </h2>
            </div>
            <Link to="/cadastro" style={{ color: '#2E7BFF', fontSize: 14, fontWeight: 900, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Começar
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }} className="tessy-event-grid">
            {steps.map(([num, title, desc]) => (
              <div key={num} style={{
                minHeight: 150,
                padding: 18,
                borderRadius: 8,
                background: '#fff',
                border: '1px solid rgba(26,27,46,0.08)',
                boxShadow: '0 14px 34px rgba(23,20,47,0.05)',
              }}>
                <div style={{ fontSize: 12, color: '#2E7BFF', fontWeight: 900 }}>{num}</div>
                <h3 style={{ marginTop: 18, fontSize: 24, lineHeight: 1.05, color: '#17142F', fontWeight: 900, letterSpacing: 0 }}>
                  {title}
                </h3>
                <p style={{ marginTop: 9, color: '#666477', fontSize: 14, lineHeight: 1.4 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          marginTop: 42,
          padding: '24px clamp(18px, 4vw, 34px)',
          borderRadius: 8,
          background: '#17142F',
          color: '#fff',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 18,
        }} className="tessy-cta-band">
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0 }}>Entre, veja, decida.</div>
            <div style={{ marginTop: 7, color: 'rgba(255,255,255,0.70)', fontSize: 14 }}>
              Acesso gratuito para médicas.
            </div>
          </div>
          <Link to="/cadastro" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '13px 18px',
            borderRadius: 8,
            background: '#2E7BFF',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}>
            Criar conta
          </Link>
        </section>
      </main>
    </div>
  );
}
