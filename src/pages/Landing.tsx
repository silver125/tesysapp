import { Link } from 'react-router-dom';
import { WaIcon } from '../components/ui';

const heroImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1800&q=85';

const categories = [
  {
    title: 'Congressos',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Nutrologia',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Produtos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Cursos',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&q=80',
  },
];

const featuredEvents = [
  {
    tag: 'Em alta',
    title: 'Jornada de Nutrologia e Performance Metabólica',
    date: 'Qui, 21 Mai · 19:00',
    place: 'São Paulo, SP',
    company: 'Tessy Health',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=82',
  },
  {
    tag: 'Workshop',
    title: 'Imersão em Procedimentos Estéticos Avançados',
    date: 'Sáb, 30 Mai · 09:00',
    place: 'Rio de Janeiro, RJ',
    company: 'Derma Lab',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=82',
  },
  {
    tag: 'Online',
    title: 'Marketing Médico Ético para Clínicas',
    date: 'Ter, 02 Jun · 20:00',
    place: 'Evento online',
    company: 'Med Growth',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=82',
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
            Descubra eventos, cursos e produtos para médicos.
          </h1>

          <p style={{
            maxWidth: 560,
            marginTop: 22,
            fontSize: 18,
            lineHeight: 1.55,
            color: '#5C5B6E',
          }}>
            Uma vitrine profissional para empresas de saúde apresentarem oportunidades relevantes, com contato direto pelo WhatsApp.
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
              <span style={{ color: '#777487', fontSize: 15 }}>Buscar por evento, especialidade ou empresa</span>
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
              ['120+', 'oportunidades'],
              ['CRM', 'perfil médico'],
              ['WhatsApp', 'contato direto'],
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
              Encontro de Inovação Médica e Novas Terapias
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#5C5B6E' }}>
              Quinta, 19:00 · São Paulo · Vagas limitadas
            </div>
          </div>
        </div>
      </section>

      <main style={{ padding: '42px clamp(20px, 5vw, 72px) 64px' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.1, letterSpacing: 0, color: '#17142F', fontWeight: 900 }}>
                Explore o que está em alta na saúde
              </h2>
              <p style={{ marginTop: 8, fontSize: 15, color: '#666477' }}>
                Categorias para médicos encontrarem conteúdo relevante mais rápido.
              </p>
            </div>
            <Link to="/cadastro" style={{ color: '#2E7BFF', fontSize: 14, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Ver tudo
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18 }} className="tessy-category-grid">
            {categories.map(category => (
              <Link key={category.title} to="/cadastro" style={{ textAlign: 'center', textDecoration: 'none', color: '#17142F' }}>
                <img
                  src={category.image}
                  alt={category.title}
                  style={{
                    width: 132,
                    height: 132,
                    maxWidth: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 16px 40px rgba(23,20,47,0.12)',
                  }}
                />
                <div style={{ marginTop: 12, fontSize: 16, fontWeight: 800 }}>{category.title}</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 58 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 18, marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.1, letterSpacing: 0, color: '#285DE8', fontWeight: 900 }}>
                Eventos mais procurados
              </h2>
              <p style={{ marginTop: 8, fontSize: 15, color: '#666477' }}>
                Uma prévia da experiência que médicos terão dentro do Tessy.
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
                <img
                  src={event.image}
                  alt={event.title}
                  style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '18px 18px 20px' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '6px 10px',
                    borderRadius: 7,
                    background: '#EEF4FF',
                    color: '#285DE8',
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}>
                    {event.tag}
                  </span>
                  <h3 style={{ fontSize: 21, lineHeight: 1.18, color: '#3B394C', fontWeight: 900, letterSpacing: 0 }}>
                    {event.title}
                  </h3>
                  <div style={{ marginTop: 12, color: '#3B394C', fontSize: 15, fontWeight: 800 }}>{event.date}</div>
                  <div style={{ marginTop: 8, color: '#777487', fontSize: 14 }}>{event.place}</div>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
