import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TessyMark } from '../components/ui';

const waitlistHref =
  'mailto:contato@tessybr.com?subject=Acesso%20antecipado%20Tessy&body=Ol%C3%A1%2C%20quero%20acesso%20antecipado%20%C3%A0%20Tessy.';

const clients = [
  { name: 'Round Lab', src: '/clients/round-lab.svg' },
  { name: 'TIRTIR', src: '/clients/tirtir.svg' },
  { name: 'd’Alba', src: '/clients/dalba.svg' },
  { name: 'VT Cosmetics', src: '/clients/vt-cosmetics.svg' },
  { name: 'Torriden', src: '/clients/torriden.svg' },
  { name: 'SKIN1004', src: '/clients/skin1004.svg' },
  { name: 'Dr. Althea', src: '/clients/dr-althea.svg' },
];

const features = [
  {
    title: 'Representantes',
    text: 'Contatos comerciais da sua região, sem spam e sem grupos barulhentos.',
    icon: 'R',
    tone: 'blue',
  },
  {
    title: 'Eventos',
    text: 'Congressos, aulas e imersões alinhadas à sua especialidade.',
    icon: 'E',
    tone: 'coral',
  },
  {
    title: 'Cursos',
    text: 'Formações práticas para evoluir sua rotina clínica.',
    icon: 'C',
    tone: 'mauve',
  },
  {
    title: 'Produtos',
    text: 'Tecnologias e soluções curadas para a prática médica.',
    icon: 'P',
    tone: 'orange',
  },
];

const steps = [
  {
    n: '01',
    title: 'Crie sua conta',
    text: 'Cadastro exclusivo para médicos, com CRM e especialidade.',
  },
  {
    n: '02',
    title: 'Explore oportunidades',
    text: 'Veja representantes, eventos, cursos e produtos relevantes.',
  },
  {
    n: '03',
    title: 'Conecte com intenção',
    text: 'Avise interesse e converse quando fizer sentido para você.',
  },
];

const faqs = [
  [
    'A Tessy é só para estética?',
    'Não. A Tessy conecta médicos de diversas áreas — estética, dermatologia, cirurgia, medicina premium e outras especialidades estratégicas. O foco é quem busca oportunidades comerciais e de atualização com qualidade, independentemente da área.',
  ],
  [
    'Quem pode se cadastrar?',
    'O cadastro é exclusivo para médicos. Empresas e marcas entram por atendimento dedicado: agendamos uma reunião para entender o perfil e liberar o acesso.',
  ],
  [
    'O médico precisa pagar para usar?',
    'O acesso inicial pode ser gratuito para perfis aprovados. Conforme a plataforma evolui, algumas funcionalidades poderão ter planos — sempre com transparência antes de qualquer cobrança.',
  ],
  [
    'Como empresas e marcas entram na Tessy?',
    'Não há auto-cadastro para empresas. O onboarding é feito por reunião com nosso time. Conheça a página Para Empresas ou escreva para contato@tessybr.com.',
  ],
  [
    'Quando vou ter acesso?',
    'Liberamos por fases, conforme perfil profissional e ordem da waitlist. Quem se cadastra agora entra na fila de convites com prioridade para as próximas aberturas.',
  ],
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lv">
      <style>{css}</style>

      <header className="lv-nav">
        <div className="lv-nav__inner">
          <Link to="/" className="lv-brand" aria-label="Tessy.app">
            <TessyMark size={34} />
            <span>
              Tessy<span>.app</span>
            </span>
          </Link>

          <nav className="lv-nav__links" aria-label="Principal">
            <Link to="/para-empresas">Para empresas</Link>
            <a href="#clientes">Clientes</a>
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="lv-nav__actions">
            <Link to="/entrar" className="lv-btn lv-btn--ghost">
              Entrar
            </Link>
            <Link to="/cadastro" className="lv-btn lv-btn--primary">
              Médico, crie sua conta
            </Link>
          </div>

          <button
            type="button"
            className="lv-burger"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {menuOpen && (
          <div className="lv-drawer">
            <Link to="/para-empresas" onClick={() => setMenuOpen(false)}>Para empresas</Link>
            <a href="#clientes" onClick={() => setMenuOpen(false)}>Clientes</a>
            <a href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <Link to="/entrar" onClick={() => setMenuOpen(false)}>Entrar</Link>
            <Link to="/cadastro" className="lv-btn lv-btn--primary" onClick={() => setMenuOpen(false)}>
              Médico, crie sua conta
            </Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero — Lovable SaaS pattern: copy + visual */}
        <section className="lv-hero">
          <div className="lv-hero__glow" aria-hidden="true" />
          <div className="lv-container lv-hero__grid">
            <div className="lv-hero__copy">
              <p className="lv-badge">Exclusivo para médicos</p>
              <h1>
                Médico, crie sua conta
                <span> na Tessy.</span>
              </h1>
              <p className="lv-lead">
                Encontre representantes, eventos e cursos em um ambiente simples —
                feito para a rotina de quem vive medicina.
              </p>
              <div className="lv-hero__cta">
                <Link to="/cadastro" className="lv-btn lv-btn--primary lv-btn--lg">
                  Criar conta gratuita
                  <span aria-hidden="true">→</span>
                </Link>
                <a href={waitlistHref} className="lv-btn lv-btn--soft lv-btn--lg">
                  Entrar na lista
                </a>
              </div>
              <ul className="lv-hero__pills">
                <li>Sem spam</li>
                <li>Curadoria por especialidade</li>
                <li>Conexão com intenção</li>
              </ul>
            </div>

            <div className="lv-hero__visual">
              <div className="lv-hero__frame">
                <img
                  src="/hero-clinic-premium.png"
                  alt="Clínica moderna com ambiente premium"
                  width={1622}
                  height={970}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="lv-float lv-float--a">
                <span>Representante</span>
                <strong>Agenda disponível hoje</strong>
              </div>
              <div className="lv-float lv-float--b">
                <span>Evento</span>
                <strong>Workshop na sua região</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Clients / brands that already joined */}
        <section className="lv-clients" id="clientes" aria-label="Empresas que já aderiram">
          <div className="lv-container">
            <div className="lv-clients__head">
              <p className="lv-eyebrow">Empresas que já aderiram</p>
              <h2>Marcas na Tessy.</h2>
            </div>
          </div>
          <div className="lv-clients__rail" role="list">
            {[...clients, ...clients].map((c, i) => (
              <div className="lv-clients__item" role="listitem" key={`${c.name}-${i}`}>
                <img src={c.src} alt={c.name} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="lv-section" id="recursos">
          <div className="lv-container">
            <div className="lv-section__head">
              <p className="lv-eyebrow">O que você encontra</p>
              <h2>Tudo em um só lugar.</h2>
              <p>
                Em vez de grupos, mensagens soltas ou indicações perdidas, a Tessy
                organiza oportunidades para a sua prática.
              </p>
            </div>

            <div className="lv-feature-grid">
              {features.map(f => (
                <article key={f.title} className={`lv-feature lv-feature--${f.tone}`}>
                  <div className="lv-feature__icon" aria-hidden="true">
                    {f.icon}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="lv-showcase">
          <div className="lv-container lv-showcase__grid">
            <div className="lv-showcase__media">
              <img
                src="/hero-bg.jpg"
                alt="Consulta em clínica moderna"
                width={1440}
                height={1589}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="lv-showcase__copy">
              <p className="lv-eyebrow">Para médicos</p>
              <h2>Menos ruído. Mais relevância.</h2>
              <p>
                Veja conexões alinhadas à sua especialidade, região e rotina —
                sem feed público e sem spam.
              </p>
              <ul className="lv-checklist">
                <li>Produtos para sua área</li>
                <li>Representantes da sua região</li>
                <li>Eventos e cursos médicos</li>
              </ul>
              <Link to="/cadastro" className="lv-btn lv-btn--primary">
                Médico, crie sua conta
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="lv-section lv-section--soft" id="como-funciona">
          <div className="lv-container">
            <div className="lv-section__head">
              <p className="lv-eyebrow">Como funciona</p>
              <h2>Três passos simples.</h2>
            </div>
            <div className="lv-steps">
              {steps.map(s => (
                <article key={s.n} className="lv-step">
                  <span className="lv-step__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="lv-cta-band">
          <div className="lv-cta-band__media" aria-hidden="true">
            <img src="/hero-clinic-premium.png" alt="" loading="lazy" decoding="async" />
            <div className="lv-cta-band__scrim" />
          </div>
          <div className="lv-container lv-cta-band__copy">
            <p className="lv-eyebrow lv-eyebrow--light">Exclusividade</p>
            <h2>Waitlist selecionada.</h2>
            <p>Convites limitados por fase. Cadastro exclusivo para médicos.</p>
            <div className="lv-hero__cta">
              <Link
                to="/cadastro"
                className="lv-btn lv-btn--light lv-btn--lg"
                style={{ color: '#1c1f26', WebkitTextFillColor: '#1c1f26' }}
              >
                Criar conta
              </Link>
              <a href={waitlistHref} className="lv-btn lv-btn--outline-light lv-btn--lg">
                Solicitar convite
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lv-section" id="faq">
          <div className="lv-container lv-faq">
            <div className="lv-section__head lv-section__head--left">
              <p className="lv-eyebrow">FAQ</p>
              <h2>Perguntas frequentes.</h2>
            </div>
            <div className="lv-faq__list">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lv-footer">
        <div className="lv-container lv-footer__inner">
          <div>
            <strong>Tessy.app</strong>
            <p>A nova infraestrutura comercial da saúde.</p>
            <a href="mailto:contato@tessybr.com">contato@tessybr.com</a>
          </div>
          <nav aria-label="Rodapé">
            <Link to="/para-empresas">Para empresas</Link>
            <a href="https://instagram.com/tessybr" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://linkedin.com/company/tessybr" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="mailto:contato@tessybr.com">Contato</a>
            <Link to="/termos">Termos</Link>
            <Link to="/privacidade">Privacidade</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const css = `
.lv {
  --ink: #1c1f26;
  --ink-2: #4a505c;
  --muted: #8a909c;
  --line: rgba(28, 31, 38, 0.10);
  --paper: #f5f5f6;
  --card: #ffffff;
  --accent: #2a2f3a;
  --accent-soft: #5c6370;
  --grad: linear-gradient(145deg, #2f3440 0%, #1c1f26 100%);
  --shadow: 0 16px 40px rgba(28, 31, 38, 0.07);
  --shadow-lg: 0 24px 60px rgba(28, 31, 38, 0.12);
  --r: 22px;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  background:
    radial-gradient(800px 380px at 10% -8%, rgba(28,31,38,0.04), transparent 55%),
    radial-gradient(640px 320px at 100% 0%, rgba(28,31,38,0.03), transparent 50%),
    var(--paper);
  color: var(--ink-2);
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.lv *,
.lv *::before,
.lv *::after { box-sizing: border-box; }

.lv a { color: inherit; text-decoration: none; }

.lv h1, .lv h2, .lv h3 {
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--ink);
  letter-spacing: -0.03em;
  font-weight: 550;
  margin: 0;
}

.lv-container {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
}

/* Nav */
.lv-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  background: rgba(245,245,246,0.88);
  border-bottom: 1px solid rgba(255,255,255,0.65);
}

.lv-nav__inner {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.lv-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.2rem;
  font-weight: 550;
  color: var(--ink);
}

.lv-brand span span { color: var(--accent-soft); }

.lv-nav__links {
  display: none;
  gap: 28px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-2);
}

.lv-nav__actions {
  display: none;
  align-items: center;
  gap: 10px;
}

.lv-burger {
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  display: grid;
  align-content: center;
  justify-items: end;
  gap: 5px;
  cursor: pointer;
  padding: 0;
}

.lv-burger span {
  width: 22px;
  height: 2.5px;
  border-radius: 999px;
  background: var(--ink);
}

.lv-drawer {
  display: grid;
  gap: 4px;
  padding: 8px 20px 18px;
  border-top: 1px solid var(--line);
  background: rgba(255,255,255,0.96);
}

.lv-drawer a {
  padding: 12px 10px;
  border-radius: 12px;
  font-weight: 560;
  color: var(--ink);
}

/* Buttons */
.lv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s var(--ease), box-shadow 0.15s var(--ease), background 0.15s var(--ease);
}

.lv-btn:active { transform: scale(0.98); }
.lv-btn--lg { min-height: 52px; padding: 0 22px; font-size: 15px; }

.lv-btn--primary {
  background: var(--grad);
  color: #fff !important;
  box-shadow: 0 12px 28px rgba(28,31,38,0.18);
}

.lv a.lv-btn--primary,
.lv a.lv-btn--primary span {
  color: #fff !important;
}

.lv-btn--ghost {
  background: transparent;
  color: var(--ink);
}

.lv-btn--soft {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
  box-shadow: 0 8px 20px rgba(28,36,56,0.05);
}

.lv-btn--light {
  background: #fff;
  color: #1c1f26 !important;
  -webkit-text-fill-color: #1c1f26 !important;
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
}

.lv a.lv-btn--light,
.lv .lv-cta-band a.lv-btn--light,
.lv a.lv-btn--light span {
  color: #1c1f26 !important;
  -webkit-text-fill-color: #1c1f26 !important;
}

.lv-btn--outline-light {
  background: transparent;
  border-color: rgba(255,255,255,0.45);
  color: #fff;
}

/* Hero */
.lv-hero {
  position: relative;
  padding: 48px 0 72px;
  overflow: hidden;
}

.lv-hero__glow {
  position: absolute;
  inset: auto auto -20% 40%;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(28,31,38,0.06), transparent 68%);
  pointer-events: none;
}

.lv-hero__grid {
  display: grid;
  gap: 40px;
  align-items: center;
}

.lv-badge {
  display: inline-flex;
  margin: 0 0 16px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(28,31,38,0.06);
  border: 1px solid rgba(28,31,38,0.10);
  color: var(--accent-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.lv-hero h1 {
  font-size: clamp(2.4rem, 7vw, 4.2rem);
  line-height: 1.05;
  max-width: 14ch;
}

.lv-hero h1 span { color: var(--accent-soft); }

.lv-lead {
  margin: 18px 0 0;
  max-width: 42ch;
  font-size: 1.08rem;
  line-height: 1.55;
  color: var(--ink-2);
}

.lv-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.lv-hero__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.lv-hero__pills li {
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  border: 1px solid var(--line);
  font-size: 12.5px;
  font-weight: 560;
  color: var(--ink-2);
}

.lv-hero__visual {
  position: relative;
  min-height: 320px;
}

.lv-hero__frame {
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255,255,255,0.7);
  aspect-ratio: 4 / 3;
  background: #ddd;
  animation: lv-rise 0.8s var(--ease) both;
}

.lv-hero__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  display: block;
}

.lv-float {
  position: absolute;
  z-index: 2;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.94);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  animation: lv-float 6s ease-in-out infinite;
}

.lv-float span {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-soft);
}

.lv-float strong {
  display: block;
  margin-top: 4px;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--ink);
}

.lv-float--a { left: -8px; bottom: 18%; }
.lv-float--b { right: -6px; top: 14%; animation-delay: -2s; }

@keyframes lv-rise {
  from { opacity: 0; transform: translateY(22px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

@keyframes lv-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Clients logo wall */
.lv-clients {
  padding: 28px 0 56px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,0.55);
  overflow: hidden;
}

.lv-clients__head {
  text-align: center;
  margin-bottom: 28px;
}

.lv-clients__head h2 {
  margin-top: 8px;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
}

.lv-clients__rail {
  display: flex;
  align-items: center;
  gap: 48px;
  width: max-content;
  padding: 8px 24px;
  animation: lv-marquee 32s linear infinite;
}

.lv-clients__item {
  flex: 0 0 auto;
  height: 36px;
  display: flex;
  align-items: center;
  opacity: 0.88;
  filter: grayscale(1) contrast(1.15);
}

.lv-clients__item img {
  height: 28px;
  width: auto;
  max-width: 160px;
  object-fit: contain;
  display: block;
}

@keyframes lv-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .lv-clients__rail { animation: none; flex-wrap: wrap; width: 100%; justify-content: center; }
}

/* Sections */
.lv-section {
  padding: 72px 0;
}

.lv-section--soft {
  background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.2));
}

.lv-section__head {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 36px;
}

.lv-section__head--left {
  text-align: left;
  margin: 0 0 24px;
}

.lv-section__head h2 {
  font-size: clamp(1.8rem, 4.5vw, 2.6rem);
  margin-top: 8px;
}

.lv-section__head p:not(.lv-eyebrow) {
  margin: 12px 0 0;
  line-height: 1.55;
  color: var(--muted);
}

.lv-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-soft);
}

.lv-eyebrow--light { color: rgba(255,255,255,0.8); }

/* Features */
.lv-feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.lv-feature {
  padding: 22px;
  border-radius: var(--r);
  background: var(--card);
  border: 1px solid var(--line);
  box-shadow: 0 10px 28px rgba(28,36,56,0.04);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.lv-feature:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.lv-feature__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.2rem;
  font-weight: 550;
  margin-bottom: 14px;
}

.lv-feature--blue .lv-feature__icon,
.lv-feature--coral .lv-feature__icon,
.lv-feature--mauve .lv-feature__icon,
.lv-feature--orange .lv-feature__icon {
  background: linear-gradient(145deg, #4a505c, #2a2f3a);
}

.lv-feature h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.lv-feature p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--muted);
}

/* Showcase */
.lv-showcase {
  padding: 24px 0 72px;
}

.lv-showcase__grid {
  display: grid;
  gap: 28px;
  align-items: center;
  padding: 18px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}

.lv-showcase__media {
  border-radius: 20px;
  overflow: hidden;
  min-height: 260px;
  background: #e8ecf4;
}

.lv-showcase__media img {
  width: 100%;
  height: 100%;
  min-height: 260px;
  object-fit: cover;
  object-position: center 20%;
  display: block;
}

.lv-showcase__copy {
  padding: 8px 8px 12px;
}

.lv-showcase__copy h2 {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  margin: 8px 0 12px;
}

.lv-showcase__copy > p {
  margin: 0;
  line-height: 1.55;
  color: var(--muted);
}

.lv-checklist {
  margin: 18px 0 24px;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.lv-checklist li {
  position: relative;
  padding-left: 28px;
  font-weight: 560;
  color: var(--ink);
}

.lv-checklist li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--grad);
  box-shadow: inset 0 0 0 4px rgba(255,255,255,0.25);
}

/* Steps */
.lv-steps {
  display: grid;
  gap: 14px;
}

.lv-step {
  padding: 24px;
  border-radius: var(--r);
  background: #fff;
  border: 1px solid var(--line);
}

.lv-step__n {
  display: inline-block;
  font-family: JetBrains Mono, ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--accent-soft);
  margin-bottom: 10px;
}

.lv-step h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.lv-step p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}

/* CTA band */
.lv-cta-band {
  position: relative;
  margin: 20px auto 40px;
  width: min(1120px, calc(100% - 40px));
  border-radius: 28px;
  overflow: hidden;
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #fff;
}

.lv-cta-band__media {
  position: absolute;
  inset: 0;
}

.lv-cta-band__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.lv-cta-band__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(20,22,28,0.82), rgba(42,47,58,0.72));
}

.lv-cta-band__copy {
  position: relative;
  z-index: 1;
  padding: 48px 20px;
}

.lv-cta-band h2 {
  color: #fff;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  margin: 8px 0 10px;
}

.lv-cta-band p {
  margin: 0 auto;
  max-width: 42ch;
  color: rgba(255,255,255,0.88);
  line-height: 1.5;
}

.lv-cta-band .lv-hero__cta {
  justify-content: center;
}

/* FAQ */
.lv-faq {
  display: grid;
  gap: 24px;
}

.lv-faq__list {
  display: grid;
  gap: 10px;
}

.lv-faq details {
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--line);
}

.lv-faq summary {
  cursor: pointer;
  font-weight: 650;
  color: var(--ink);
  list-style: none;
}

.lv-faq summary::-webkit-details-marker { display: none; }

.lv-faq details p {
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Footer */
.lv-footer {
  border-top: 1px solid var(--line);
  padding: 36px 0 48px;
  background: rgba(255,255,255,0.55);
}

.lv-footer__inner {
  display: grid;
  gap: 20px;
}

.lv-footer strong {
  display: block;
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.15rem;
  color: var(--ink);
}

.lv-footer p {
  margin: 6px 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.lv-footer a {
  color: var(--ink-2);
  font-size: 0.92rem;
}

.lv-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
}

@media (min-width: 768px) {
  .lv-nav__links,
  .lv-nav__actions { display: flex; }
  .lv-burger { display: none; }
  .lv-drawer { display: none !important; }

  .lv-hero__grid {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 48px;
  }

  .lv-feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .lv-showcase__grid {
    grid-template-columns: 1.05fr 0.95fr;
    padding: 22px;
    gap: 32px;
  }

  .lv-showcase__media,
  .lv-showcase__media img {
    min-height: 420px;
  }

  .lv-steps {
    grid-template-columns: repeat(3, 1fr);
  }

  .lv-faq {
    grid-template-columns: 0.7fr 1.3fr;
    align-items: start;
  }

  .lv-footer__inner {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
}

@media (min-width: 1024px) {
  .lv-feature-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .lv-hero {
    padding: 64px 0 96px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lv-hero__frame,
  .lv-float,
  .lv-clients__rail {
    animation: none !important;
  }
}
`;
