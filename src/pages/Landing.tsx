import { Link } from 'react-router-dom';
import { WaIcon } from '../components/ui';

const heroImage = '/hero-clinic-premium.png';

const pillars = [
  {
    title: 'Representantes por região',
    desc: 'Contato direto com quem atende sua praça, sem intermediação desnecessária.',
  },
  {
    title: 'Produtos com intenção médica',
    desc: 'Indicação, diferencial, público ideal, amostras, materiais e proposta de parceria.',
  },
  {
    title: 'Eventos comerciais',
    desc: 'Imersões, lançamentos, workshops e demonstrações para médicos selecionados.',
  },
  {
    title: 'Leads qualificados',
    desc: 'Cada clique de interesse vira sinal comercial para a empresa agir rápido.',
  },
];

const featuredEvents = [
  {
    tag: 'Saúde premium',
    title: 'Demonstração privada para novas soluções médicas',
    date: 'Qui, 21 Mai · 19:00',
    place: 'São Paulo, SP',
    company: 'Empresa parceira',
    audience: 'Médicos e clínicas selecionadas',
    signal: 'Amostras + representante regional',
  },
  {
    tag: 'Lançamento',
    title: 'Nova linha de skin quality com treinamento comercial',
    date: 'Sáb, 30 Mai · 09:00',
    place: 'Rio de Janeiro, RJ',
    company: 'Derma Lab',
    audience: 'Médicos com agenda estética ativa',
    signal: 'Evento + material científico',
  },
  {
    tag: 'Parceria',
    title: 'Campanha com médicos para divulgação educativa',
    date: 'Ter, 02 Jun · 20:00',
    place: 'Evento online',
    company: 'Med Growth',
    audience: 'Médicos com presença no Instagram',
    signal: 'Briefing + WhatsApp do representante',
  },
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
        background: 'rgba(251,250,253,0.92)',
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
            padding: '10px 14px',
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
            boxShadow: '0 10px 24px rgba(46,123,255,0.24)',
          }}>
            Criar conta
          </Link>
        </nav>
      </header>

      <section style={{
        minHeight: 'min(680px, calc(100vh - 70px))',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.04fr) minmax(420px, 0.96fr)',
        alignItems: 'stretch',
        overflow: 'hidden',
      }} className="tessy-hero-grid">
        <div style={{
          padding: 'clamp(42px, 8vw, 92px) clamp(22px, 6vw, 86px)',
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
            Comunidade médica selecionada
          </div>

          <h1 style={{
            maxWidth: 680,
            marginTop: 24,
            fontSize: 'clamp(46px, 7vw, 82px)',
            lineHeight: 0.94,
            letterSpacing: 0,
            fontWeight: 900,
            color: '#17142F',
          }}>
            Conexões comerciais para médicos de alto valor.
          </h1>

          <p style={{
            maxWidth: 560,
            marginTop: 22,
            fontSize: 18,
            lineHeight: 1.55,
            color: '#5C5B6E',
          }}>
            O Tessy conecta médicos, clínicas e empresas premium de saúde com produtos, eventos e representantes certos.
          </p>

          <div style={{
            marginTop: 34,
            maxWidth: 680,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 10,
            padding: 8,
            borderRadius: 10,
            background: '#fff',
            border: '1px solid rgba(26,27,46,0.10)',
            boxShadow: '0 22px 60px rgba(23,20,47,0.12)',
          }} className="tessy-search-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#777487" strokeWidth="2">
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <span style={{ color: '#777487', fontSize: 15 }}>Buscar empresa, produto, procedimento ou representante</span>
            </div>
            <Link to="/cadastro" style={{
              padding: '14px 20px',
              borderRadius: 8,
              background: '#2E7BFF',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              Explorar agora
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 26, marginTop: 34, flexWrap: 'wrap' }}>
            {[
              ['CRM', 'curadoria médica'],
              ['B2B', 'saúde premium'],
              ['WhatsApp', 'representante direto'],
            ].map(([value, label]) => (
              <div key={value}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#17142F' }}>{value}</div>
                <div style={{ marginTop: 2, fontSize: 12, color: '#777487', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: 460 }}>
          <img
            src={heroImage}
            alt="Profissionais de saúde em ambiente médico"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(251,250,253,0.95) 0%, rgba(251,250,253,0.05) 34%, rgba(23,20,47,0.18) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            left: 28,
            right: 28,
            bottom: 28,
            padding: 18,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 20px 50px rgba(23,20,47,0.20)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2E7BFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Destaque da semana
            </div>
            <div style={{ marginTop: 7, fontSize: 20, fontWeight: 900, color: '#17142F', lineHeight: 1.2 }}>
              Encontro de inovação médica e novas terapias
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#5C5B6E' }}>
              Quinta, 19:00 · São Paulo · Médicos selecionados
            </div>
          </div>
        </div>
      </section>

      <main style={{ padding: '42px clamp(20px, 5vw, 72px) 64px' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.1, letterSpacing: 0, color: '#17142F', fontWeight: 900 }}>
                Menos feed. Mais ponte comercial.
              </h2>
              <p style={{ marginTop: 8, fontSize: 15, color: '#666477' }}>
                Uma experiência desenhada para médicos e empresas que precisam gerar relacionamento, amostras, eventos e oportunidades reais.
              </p>
            </div>
            <Link to="/cadastro" style={{ color: '#2E7BFF', fontSize: 14, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Começar
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }} className="tessy-category-grid">
            {pillars.map((pillar, index) => (
              <div key={pillar.title} style={{
                minHeight: 178,
                padding: 18,
                borderRadius: 8,
                background: '#fff',
                border: '1px solid rgba(26,27,46,0.08)',
                boxShadow: '0 14px 34px rgba(23,20,47,0.06)',
              }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: index === 0 ? '#17142F' : '#EEF4FF',
                  color: index === 0 ? '#fff' : '#2E7BFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 900,
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 style={{ marginTop: 16, fontSize: 18, lineHeight: 1.15, color: '#17142F', fontWeight: 900, letterSpacing: 0 }}>
                  {pillar.title}
                </h3>
                <p style={{ marginTop: 10, color: '#666477', fontSize: 13, lineHeight: 1.5 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 58 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.1, letterSpacing: 0, color: '#285DE8', fontWeight: 900 }}>
                Oportunidades selecionadas
              </h2>
              <p style={{ marginTop: 8, fontSize: 15, color: '#666477' }}>
                Uma prévia do que médicos encontram dentro do Tessy: produto, intenção e contato comercial direto.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button aria-label="Anterior" style={arrowButtonStyle}>‹</button>
              <button aria-label="Próximo" style={{ ...arrowButtonStyle, color: '#17142F' }}>›</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 22 }} className="tessy-event-grid">
            {featuredEvents.map(event => (
              <article key={event.title} style={{
                background: '#fff',
                borderRadius: 8,
                border: '1px solid rgba(26,27,46,0.08)',
                overflow: 'hidden',
                boxShadow: '0 18px 42px rgba(23,20,47,0.08)',
              }}>
                <div style={{
                  minHeight: 142,
                  padding: 18,
                  background: 'linear-gradient(135deg, #17142F 0%, #253E73 100%)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '6px 10px',
                    borderRadius: 7,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 800,
                    width: 'fit-content',
                  }}>
                    {event.tag}
                  </span>
                  <h3 style={{ marginTop: 22, fontSize: 21, lineHeight: 1.18, color: '#fff', fontWeight: 900, letterSpacing: 0 }}>
                    {event.title}
                  </h3>
                </div>
                <div style={{ padding: '18px 18px 20px' }}>
                  <div style={{ marginTop: 12, color: '#3B394C', fontSize: 15, fontWeight: 800 }}>{event.date}</div>
                  <div style={{ marginTop: 8, color: '#777487', fontSize: 14 }}>{event.place}</div>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(26,27,46,0.08)' }}>
                    <div style={{ color: '#17142F', fontSize: 14, fontWeight: 800 }}>{event.audience}</div>
                    <div style={{ marginTop: 6, color: '#777487', fontSize: 13 }}>{event.signal}</div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: '#777487', fontSize: 14 }}>{event.company}</span>
                    <Link to="/cadastro" style={{
                      color: '#285DE8',
                      fontSize: 13,
                      fontWeight: 900,
                      textDecoration: 'none',
                    }}>
                      Participar
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{
          marginTop: 58,
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
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0 }}>Empresas falam direto com médicos interessados.</div>
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.70)', fontSize: 15 }}>
              Publique eventos, produtos e cursos em poucos minutos.
            </div>
          </div>
          <Link to="/cadastro" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px 18px',
            borderRadius: 8,
            background: '#25D366',
            color: '#082713',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}>
            <WaIcon size={17} /> Começar agora
          </Link>
        </section>
      </main>
    </div>
  );
}

const arrowButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: '2px solid #D9D6E3',
  background: '#fff',
  color: '#B7B2C2',
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 700,
  cursor: 'pointer',
};
