import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TessyMark } from '../components/ui';

const waitlistHref = 'mailto:contato@tessybr.com?subject=Acesso%20antecipado%20Tessy&body=Ol%C3%A1%2C%20quero%20acesso%20antecipado%20%C3%A0%20Tessy.';

const findCards = [
  {
    title: 'Representantes',
    text: 'Veja empresas e contatos da sua região.',
  },
  {
    title: 'Eventos',
    text: 'Encontre congressos, aulas, imersões e encontros médicos.',
  },
  {
    title: 'Workshops',
    text: 'Descubra capacitações alinhadas à sua especialidade.',
  },
  {
    title: 'Produtos',
    text: 'Conheça produtos, tecnologias e soluções para sua prática.',
  },
  {
    title: 'Serviços',
    text: 'Encontre parceiros úteis para o consultório ou clínica.',
  },
];

const doctorBenefits = [
  'Produtos para sua área',
  'Representantes da sua região',
  'Workshops e eventos médicos',
  'Serviços úteis para sua prática',
];

const faqs = [
  ['Para quais áreas?', 'Estética, dermato, cirurgia, medicina premium e áreas estratégicas.'],
  ['Médico paga?', 'O acesso inicial poderá ser gratuito para perfis aprovados.'],
  ['Como empresas entram?', 'Onboarding comercial e validação de categoria.'],
  ['Quando acesso?', 'Por fases, conforme perfil e ordem da waitlist.'],
];

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="tessy-landing">
      <style>{landingCss}</style>

      <section className="tl-hero">
        <div className="tl-ring tl-ring-a" />
        <div className="tl-ring tl-ring-b" />

        <header className="tl-header">
          <Link to="/" className="tl-brand" aria-label="Tessy.app">
            <img src="/tessy-icon-white.png" className="tl-mobile-glyph" alt="" aria-hidden="true" />
            <TessyMark className="tl-brand-mark" />
            <span className="tl-brand-name">Tessy<span>.app</span></span>
          </Link>

          <div className="tl-actions">
            <Link to="/entrar" className="tl-login">ENTRAR</Link>
            <a href={waitlistHref} className="tl-primary">Acesso antecipado</a>
          </div>

          <button
            className="tl-mobile-menu"
            type="button"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`tl-mobile-nav ${isMobileMenuOpen ? 'is-open' : ''}`} aria-label="Menu mobile">
            <Link to="/entrar" onClick={() => setIsMobileMenuOpen(false)}>Entrar</Link>
            <a href={waitlistHref} onClick={() => setIsMobileMenuOpen(false)}>Entrar na lista</a>
            <Link to="/cadastro?perfil=empresa" onClick={() => setIsMobileMenuOpen(false)}>Sou empresa</Link>
          </nav>
        </header>

        <div className="tl-hero-content">
          <h1>
            <span className="tl-desktop-title">Comunidade para quem vive o mundo da medicina.</span>
            <span className="tl-mobile-title">Seja bem vindo<br />a Tessy.</span>
          </h1>

          <p>
            Encontre representantes, eventos, workshops, produtos e serviços. Tessy é a ponte entre médicos e empresas da saúde.
          </p>

          <div className="tl-hero-actions">
            <a href={waitlistHref} className="tl-hero-primary">
              <span>Entrar na lista</span>
              <span className="tl-hero-arrow" aria-hidden="true">→</span>
            </a>
            <Link to="/cadastro?perfil=empresa" className="tl-hero-secondary">Sou empresa</Link>
          </div>
        </div>

        <div className="tl-phone-stage" aria-hidden="true">
          <div className="tl-phone-card tl-phone-card-left">
            <span>Médico</span>
            <strong>Solicitou contato</strong>
            <small>Sculptra · representante em SP</small>
          </div>

          <div className="tl-iphone">
            <div className="tl-island" />
            <div className="tl-phone-screen">
              <div className="tl-phone-status">
                <span>9:41</span>
                <span>••• ▭</span>
              </div>

              <div className="tl-phone-mini-header">
                <span className="tl-phone-mini-logo" aria-hidden="true" />
                <strong>Tessy.app</strong>
                <span className="tl-phone-mini-user">S</span>
                <small>sair</small>
              </div>

              <div className="tl-phone-dashboard">
                <span>SEX, 2 DE MAI.</span>
                <h3>Olá, silvio.</h3>
                <p>1 eventos disponíveis para você esta semana.</p>

                <div className="tl-phone-stats">
                  <span><strong>1</strong> Eventos</span>
                  <span><strong>1</strong> Produtos</span>
                  <span><strong>0</strong> Workshops</span>
                </div>
              </div>

              <div className="tl-phone-sectionbar">
                <strong>Em destaque</strong>
                <span>VER TODOS →</span>
              </div>

              <div className="tl-phone-event">
                <div className="tl-phone-event-visual">
                  <span>Webinar</span>
                  <strong>OUT<br />10</strong>
                </div>
                <div className="tl-phone-event-body">
                  <span>Dermabrand</span>
                  <h3>arquitetura para médicos e clínicos</h3>
                  <p>santos · 10:00</p>
                </div>
              </div>

              <div className="tl-phone-appbar">
                <div>
                  <small>Tessy.app</small>
                  <strong>Oportunidades</strong>
                </div>
                <span>SP</span>
              </div>

              <div className="tl-phone-feature">
                <div>
                  <span>Nova oportunidade</span>
                  <h3>Bioestimulador Sculptra</h3>
                  <p>Material científico, amostra e representante em SP.</p>
                </div>
                <strong>Alta intenção</strong>
              </div>

              <div className="tl-phone-list">
                <div>
                  <span>Representante</span>
                  <strong>Agenda disponível hoje</strong>
                </div>
                <button>Solicitar contato</button>
              </div>

              <div className="tl-phone-list">
                <div>
                  <span>Evento</span>
                  <strong>Demonstração para médicos</strong>
                </div>
                <button>Entrar</button>
              </div>

              <div className="tl-phone-nav">
                <span>Home</span>
                <span>Produtos</span>
                <strong>+</strong>
                <span>Eventos</span>
                <span>Perfil</span>
              </div>
            </div>
          </div>

          <div className="tl-phone-card tl-phone-card-right">
            <span>Empresa</span>
            <strong>Lead qualificado</strong>
            <small>Médico pediu contato comercial</small>
          </div>
        </div>
      </section>

      <section className="tl-mobile-intro">
        <h2>Comunidade para quem vive o mundo da medicina.</h2>
        <p>
          Encontre representantes, eventos, workshops, produtos e serviços. Tessy é a ponte entre médicos e empresas da saúde.
        </p>

        <div className="tl-mobile-hero-actions">
          <a href={waitlistHref} className="tl-mobile-hero-primary">
            <span>Entrar na lista</span>
            <span aria-hidden="true">→</span>
          </a>
          <Link to="/cadastro?perfil=empresa" className="tl-mobile-hero-secondary">Sou empresa</Link>
        </div>
      </section>

      <main>
        <section className="tl-proof">
          <div className="tl-proof-social" aria-label="200 médicos já na waitlist">
            <div className="tl-proof-avatars" aria-hidden="true">
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            <p><strong>200+</strong> médicos já na waitlist</p>
          </div>

          <div className="tl-register-card">
            <h2>Por que se cadastrar?</h2>

            <div className="tl-register-list">
              <div className="tl-register-item">
                <SparkleIcon />
                <div>
                  <h3>Curadoria</h3>
                  <p>Só o que importa para sua especialidade</p>
                </div>
              </div>

              <div className="tl-register-item">
                <NetworkIcon />
                <div>
                  <h3>Networking</h3>
                  <p>Conecte com empresas de confiança</p>
                </div>
              </div>

              <div className="tl-register-item">
                <LockIcon />
                <div>
                  <h3>Privacidade</h3>
                  <p>Seus dados protegidos e seguros</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tl-section" id="como-ajuda">
          <div className="tl-section-copy tl-centered">
            <p className="tl-eyebrow">Como a Tessy ajuda</p>
            <h2>Você encontra mais rápido.</h2>
            <p className="tl-section-subtitle">
              Em vez de procurar em grupos, mensagens soltas ou indicações perdidas, a Tessy organiza as oportunidades em um ambiente simples.
            </p>
          </div>
        </section>

        <section className="tl-section" id="o-que-encontra">
          <div className="tl-section-copy tl-centered">
            <p className="tl-eyebrow">O que você encontra</p>
            <h2>Tudo em um só lugar.</h2>
          </div>

          <div className="tl-solution-grid tl-find-grid">
            {findCards.map(card => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-audience tl-section" id="medicos">
          <div>
            <p className="tl-eyebrow">Para médicos</p>
            <h2>Menos ruído. Mais relevância.</h2>
            <p className="tl-audience-subtitle">
              Veja conexões relevantes para sua especialidade, sua região e sua rotina.
            </p>
            <BenefitList items={doctorBenefits} />
            <Link to="/cadastro?perfil=medico" className="tl-dark-cta">Receber oportunidades</Link>
          </div>

          <div className="tl-audience-panel">
            <span>Onde interesse vira conversa.</span>
            <strong>Produtos alinhados à prática médica, sem feed público e sem spam.</strong>
          </div>
        </section>

        <section className="tl-positioning">
          <h2>Conexão é o novo canal.</h2>
          <p>A ponte entre decisão médica e oportunidade comercial.</p>
        </section>

        <section className="tl-waitlist">
          <div>
            <p className="tl-eyebrow">Exclusividade</p>
            <h2>Waitlist selecionada.</h2>
            <p>Convites limitados por fase.</p>
          </div>
          <a href={waitlistHref}>Solicitar convite</a>
        </section>

        <section className="tl-faq">
          <div className="tl-section-copy">
            <p className="tl-eyebrow">FAQ</p>
            <h2>Dúvidas.</h2>
          </div>
          <div className="tl-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="tl-footer">
        <div>
          <strong>Tessy.app</strong>
          <p>A nova infraestrutura comercial da saúde.</p>
          <a href="mailto:contato@tessybr.com">contato@tessybr.com</a>
        </div>
        <nav aria-label="Rodapé">
          <a href="#top">Instagram</a>
          <a href="#top">LinkedIn</a>
          <a href="mailto:contato@tessybr.com">Contato</a>
          <a href="#top">Termos</a>
          <a href="#top">Privacidade</a>
        </nav>
      </footer>
    </div>
  );
}

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="tl-benefits">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SparkleIcon() {
  return (
    <svg className="tl-register-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M23.4 5.5l4.2 12.1c.3.9 1 1.6 1.9 1.9l12.1 4.2-12.1 4.2c-.9.3-1.6 1-1.9 1.9l-4.2 12.1-4.2-12.1c-.3-.9-1-1.6-1.9-1.9L5.2 23.7l12.1-4.2c.9-.3 1.6-1 1.9-1.9L23.4 5.5Z" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M35.5 3.8v8.4M31.3 8h8.4M8.5 31.8v6.8M5.1 35.2h6.8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg className="tl-register-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M17.5 22.5c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9Z" stroke="currentColor" strokeWidth="3.2" />
      <path d="M3.7 41c1.8-7.1 6.7-11.2 13.8-11.2 3.1 0 5.8.8 8 2.4" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M35 25c3.8 0 6.8-3 6.8-6.8s-3-6.8-6.8-6.8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M31.5 31.1c5.9.5 10.1 4 11.7 9.9" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="tl-register-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M12 21.5h24c2.2 0 4 1.8 4 4V40c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V25.5c0-2.2 1.8-4 4-4Z" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M15 21.5v-6.2C15 9.2 19 5 24 5s9 4.2 9 10.3v6.2" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

const landingCss = `
.tessy-landing {
  --tessy-deep: #171b2a;
  --tessy-graphite: #343949;
  --tessy-steel: #777f95;
  --tessy-lavender: #b9c1ea;
  --tessy-blue: #3f83f1;
  --tessy-coral: #ff6f46;
  --tessy-mauve: #9582ac;
  --tessy-gradient: linear-gradient(115deg, #3f83f1 0%, #8b82b6 48%, #ff6f46 100%);
  --tessy-gradient-soft: linear-gradient(115deg, rgba(63,131,241,0.14) 0%, rgba(139,130,182,0.12) 48%, rgba(255,111,70,0.16) 100%);
  --tessy-paper: #f7f8ff;
  --tessy-soft: #f1f3fa;
  --tessy-heading: #5d6474;
  --tessy-text: #6f7686;
  --tessy-muted: #9299a8;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    linear-gradient(118deg, rgba(63,131,241,0.055) 0%, rgba(149,130,172,0.035) 50%, rgba(255,111,70,0.065) 100%),
    var(--tessy-paper);
  color: var(--tessy-text);
  font-family: "Helvetica Neue", Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tessy-landing *,
.tessy-landing *:before,
.tessy-landing *:after {
  box-sizing: border-box;
}

.tessy-landing a {
  color: inherit;
}

.tl-hero {
  position: relative;
  min-height: 1060px;
  overflow: hidden;
  background:
    linear-gradient(118deg, rgba(63,131,241,0.20) 0%, rgba(149,130,172,0.14) 52%, rgba(255,111,70,0.22) 100%),
    radial-gradient(860px 520px at 50% 26%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 72%),
    linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  border-bottom: 1px solid rgba(119,127,149,0.16);
}

.tl-hero:before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.42) 48%, rgba(255,255,255,0.16) 100%),
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.82) 76%, #ffffff 100%);
}

.tl-ring {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(91,103,142,0.14);
  border-radius: 9999px;
  pointer-events: none;
}

.tl-ring-a { width: 900px; height: 900px; }
.tl-ring-b { width: 1360px; height: 1360px; }

.tl-header {
  position: relative;
  z-index: 4;
  width: calc(100% - 96px);
  max-width: 1540px;
  height: 88px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.tl-brand,
.tl-actions,
.tl-hero-actions,
.tl-footer nav {
  display: flex;
  align-items: center;
}

.tl-brand {
  gap: 12px;
  text-decoration: none;
}

.tl-brand-mark {
  width: 42px;
  height: 42px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.tl-brand-name {
  color: var(--tessy-heading);
  font-size: 34px;
  line-height: 1;
  font-weight: 560;
}

.tl-brand-name span {
  color: transparent;
  background: var(--tessy-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  font-weight: 500;
}

.tl-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(93,100,116,0.88);
  text-decoration: none;
  font-size: 17px;
  font-weight: 520;
  line-height: 1;
  letter-spacing: 0.04em;
}

.tl-actions {
  gap: 18px;
}

.tl-primary,
.tl-hero-primary,
.tl-dark-cta,
.tl-waitlist a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  background: var(--tessy-gradient);
  color: #ffffff;
  text-decoration: none;
  font-size: 17px;
  font-weight: 560;
  box-shadow:
    0 18px 44px rgba(63,131,241,0.18),
    0 18px 48px rgba(255,111,70,0.13);
}

.tessy-landing .tl-primary,
.tessy-landing .tl-hero-primary,
.tessy-landing .tl-dark-cta {
  color: #ffffff;
}

.tl-hero-content {
  position: relative;
  z-index: 3;
  width: calc(100% - 48px);
  max-width: 980px;
  margin: 108px auto 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-hero h1 {
  max-width: 920px;
  margin-top: 0;
  color: var(--tessy-heading);
  font-size: 70px;
  line-height: 1.04;
  letter-spacing: 0;
  font-weight: 470;
}

.tl-hero-content > p {
  max-width: 760px;
  margin-top: 26px;
  color: var(--tessy-text);
  font-size: 21px;
  line-height: 1.5;
  font-weight: 460;
}

.tl-hero-actions {
  margin-top: 34px;
  gap: 12px;
  justify-content: center;
}

.tl-hero-primary {
  position: relative;
  gap: 18px;
}

.tl-hero-arrow {
  font-size: 30px;
  line-height: 1;
  font-weight: 420;
}

.tl-hero-secondary {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: 999px;
  background:
    linear-gradient(rgba(255,255,255,0.86), rgba(255,255,255,0.86)) padding-box,
    var(--tessy-gradient) border-box;
  color: var(--tessy-graphite);
  text-decoration: none;
  font-size: 17px;
  font-weight: 560;
}

.tl-hero-content small {
  display: block;
  max-width: 360px;
  margin-top: 16px;
  color: var(--tessy-muted);
  font-size: 14px;
  line-height: 1.4;
}

.tl-phone-stage {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: -330px;
  width: min(980px, calc(100% - 48px));
  min-height: 650px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
}

.tl-section,
.tl-proof,
.tl-positioning,
.tl-waitlist,
.tl-faq,
.tl-footer {
  width: calc(100% - 56px);
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}

.tl-phone-card span,
.tl-phone-feature span,
.tl-phone-list span,
.tl-solution-grid span,
.tl-flow-grid span,
.tl-audience-panel span {
  color: var(--tessy-steel);
  font-size: 12px;
  font-weight: 560;
  text-transform: uppercase;
}

.tl-phone-card {
  position: absolute;
  top: 330px;
  width: 245px;
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.46);
  border-radius: 8px;
  background:
    linear-gradient(rgba(255,255,255,0.90), rgba(255,255,255,0.90)) padding-box,
    var(--tessy-gradient-soft) border-box;
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 58px rgba(52,57,73,0.11);
}

.tl-phone-card-left {
  left: 0;
}

.tl-phone-card-right {
  right: 0;
}

.tl-phone-card strong {
  display: block;
  margin-top: 12px;
  color: var(--tessy-graphite);
  font-size: 21px;
  line-height: 1.16;
  font-weight: 540;
}

.tl-phone-card small {
  display: block;
  margin-top: 12px;
  color: var(--tessy-muted);
  font-size: 14px;
  line-height: 1.35;
}

.tl-iphone {
  position: relative;
  width: 360px;
  height: 724px;
  padding: 14px;
  border-radius: 64px;
  background:
    linear-gradient(145deg, #0e111b 0%, #29304a 45%, #7d7898 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.16),
    inset 0 0 0 5px rgba(0,0,0,0.22),
    0 40px 90px rgba(23,27,42,0.18),
    0 30px 90px rgba(255,111,70,0.10);
}

.tl-iphone:before,
.tl-iphone:after {
  content: "";
  position: absolute;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #242937 0%, #777f95 100%);
  box-shadow: inset 1px 0 1px rgba(255,255,255,0.16);
}

.tl-iphone:before {
  left: -4px;
  top: 142px;
  height: 86px;
}

.tl-iphone:after {
  right: -4px;
  top: 190px;
  height: 118px;
}

.tl-island {
  position: absolute;
  z-index: 4;
  top: 28px;
  left: 50%;
  width: 112px;
  height: 35px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #05070c;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.06);
}

.tl-phone-screen {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 50px;
  background:
    linear-gradient(145deg, rgba(63,131,241,0.10) 0%, rgba(255,111,70,0.08) 100%),
    radial-gradient(260px 180px at 50% 18%, rgba(185,193,234,0.34) 0%, rgba(255,255,255,0) 72%),
    linear-gradient(180deg, #fbfcff 0%, #f0f2fa 100%);
  border: 1px solid rgba(255,255,255,0.20);
  color: var(--tessy-graphite);
}

.tl-phone-status {
  height: 68px;
  padding: 28px 31px 0;
  display: flex;
  justify-content: space-between;
  color: var(--tessy-graphite);
  font-size: 14px;
  font-weight: 560;
}

.tl-phone-appbar {
  padding: 18px 30px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.tl-phone-appbar small {
  display: block;
  color: var(--tessy-muted);
  font-size: 12px;
  font-weight: 560;
}

.tl-phone-appbar strong {
  display: block;
  margin-top: 5px;
  color: var(--tessy-heading);
  font-size: 31px;
  line-height: 1;
  font-weight: 520;
}

.tl-phone-appbar > span {
  min-width: 36px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  color: var(--tessy-steel);
  font-size: 12px;
  font-weight: 560;
  box-shadow: 0 10px 26px rgba(52,57,73,0.08);
}

.tl-phone-feature {
  min-height: 238px;
  margin: 24px 18px 0;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(23,27,42,0.18) 0%, rgba(23,27,42,0.72) 100%),
    linear-gradient(115deg, rgba(63,131,241,0.76) 0%, rgba(149,130,172,0.72) 48%, rgba(255,111,70,0.78) 100%);
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(52,57,73,0.16);
}

.tl-phone-feature span {
  color: rgba(255,255,255,0.70);
}

.tl-phone-feature h3 {
  margin-top: 48px;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.06;
  font-weight: 540;
}

.tl-phone-feature p {
  margin-top: 10px;
  color: rgba(255,255,255,0.74);
  font-size: 13px;
  line-height: 1.35;
}

.tl-phone-feature > strong {
  align-self: flex-start;
  padding: 8px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,0.18);
  color: #ffffff;
  font-size: 12px;
  font-weight: 560;
  backdrop-filter: blur(12px);
}

.tl-phone-list {
  margin: 12px 18px 0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(119,127,149,0.12);
  border-radius: 22px;
  background: rgba(255,255,255,0.76);
  box-shadow: 0 10px 26px rgba(52,57,73,0.06);
}

.tl-phone-list strong {
  display: block;
  margin-top: 5px;
  color: var(--tessy-graphite);
  font-size: 14px;
  line-height: 1.18;
  font-weight: 560;
}

.tl-phone-list button {
  min-width: 74px;
  height: 34px;
  padding: 0 11px;
  border: 0;
  border-radius: 999px;
  background: var(--tessy-gradient);
  color: #ffffff;
  font-size: 12px;
  font-weight: 560;
}

.tl-phone-nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 82px;
  padding: 12px 20px 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: start;
  border-top: 1px solid rgba(119,127,149,0.12);
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(18px);
}

.tl-phone-nav span,
.tl-phone-nav strong {
  display: grid;
  place-items: center;
  color: var(--tessy-muted);
  font-size: 11px;
  font-weight: 560;
}

.tl-phone-nav strong {
  width: 58px;
  height: 58px;
  margin: -22px auto 0;
  border-radius: 999px;
  background: var(--tessy-gradient);
  color: #ffffff;
  font-size: 30px;
  font-weight: 420;
  box-shadow: 0 20px 38px rgba(52,57,73,0.18);
}

main {
  background:
    linear-gradient(118deg, rgba(63,131,241,0.055) 0%, rgba(255,255,255,0) 42%, rgba(255,111,70,0.055) 100%),
    #ffffff;
}

.tl-proof {
  padding: 58px 0 76px;
}

.tl-proof-social {
  max-width: 900px;
  margin: 0 auto 118px;
  display: flex;
  align-items: center;
  gap: 34px;
}

.tl-proof-avatars {
  display: flex;
  align-items: center;
}

.tl-proof-avatars span {
  width: 74px;
  height: 74px;
  margin-left: -15px;
  display: grid;
  place-items: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  background: var(--tessy-gradient);
  color: #ffffff;
  font-size: 30px;
  line-height: 1;
  font-weight: 680;
  box-shadow: 0 14px 28px rgba(52,57,73,0.10);
}

.tl-proof-avatars span:first-child {
  margin-left: 0;
}

.tl-proof-social p {
  margin: 0;
  color: #40506b;
  font-size: 30px;
  line-height: 1.25;
  font-weight: 420;
}

.tl-proof-social strong {
  color: #0f1628;
  font-weight: 760;
}

.tl-register-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 70px 64px 68px;
  border: 1px solid transparent;
  border-radius: 28px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    var(--tessy-gradient-soft) border-box;
  box-shadow:
    0 22px 46px rgba(52,57,73,0.09),
    0 18px 70px rgba(63,131,241,0.08);
}

.tl-register-card h2 {
  margin: 0;
  color: #0f1628;
  font-size: 48px;
  line-height: 1.08;
  font-weight: 720;
}

.tl-register-list {
  margin-top: 56px;
  display: grid;
  gap: 38px;
}

.tl-register-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 22px;
  align-items: start;
  color: #334057;
}

.tl-register-icon {
  width: 42px;
  height: 42px;
  margin-top: 3px;
  color: #334057;
}

.tl-register-item h3 {
  margin: 0;
  color: #0f1628;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 720;
}

.tl-register-item p {
  margin: 6px 0 0;
  color: #40506b;
  font-size: 28px;
  line-height: 1.18;
  font-weight: 420;
}

.tl-section {
  padding: 76px 0;
  border-top: 1px solid rgba(119,127,149,0.14);
}

.tl-section-copy {
  max-width: 760px;
}

.tl-centered {
  margin: 0 auto;
  text-align: center;
}

.tl-section-subtitle,
.tl-audience-subtitle {
  margin: 18px auto 0;
  color: var(--tessy-text);
  font-size: 20px;
  line-height: 1.48;
  font-weight: 450;
}

.tl-section-subtitle {
  max-width: 780px;
}

.tl-audience-subtitle {
  max-width: 640px;
  margin-left: 0;
  margin-right: 0;
}

.tl-eyebrow {
  margin-bottom: 12px;
  color: var(--tessy-muted);
  font-size: 15px;
  line-height: 1.2;
  font-weight: 560;
  text-transform: uppercase;
}

.tl-section h2,
.tl-positioning h2,
.tl-waitlist h2,
.tl-faq h2 {
  color: var(--tessy-heading);
  font-size: 48px;
  line-height: 1.08;
  font-weight: 480;
  letter-spacing: 0;
}

.tl-solution-grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
}

.tl-solution-grid article,
.tl-flow-grid article,
.tl-faq details {
  border: 1px solid rgba(119,127,149,0.16);
  border-radius: 8px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(63,131,241,0.16), rgba(255,111,70,0.14)) border-box;
  border-color: transparent;
  box-shadow: 0 18px 56px rgba(52,57,73,0.06);
}

.tl-solution-grid article {
  min-height: 205px;
  padding: 28px;
}

.tl-find-grid article {
  min-height: 190px;
}

.tl-solution-grid h3 {
  margin-top: 0;
  color: var(--tessy-graphite);
  font-size: 26px;
  line-height: 1.12;
  font-weight: 520;
}

.tl-solution-grid p,
.tl-flow-grid p,
.tl-waitlist p,
.tl-faq p,
.tl-positioning p {
  margin-top: 12px;
  color: var(--tessy-text);
  font-size: 18px;
  line-height: 1.5;
  font-weight: 450;
}

.tl-flow-grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.tl-flow-grid article {
  min-height: 205px;
  padding: 24px;
}

.tl-flow-grid h3 {
  margin-top: 52px;
  color: var(--tessy-graphite);
  font-size: 24px;
  line-height: 1.14;
  font-weight: 520;
}

.tl-audience {
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 32px;
  align-items: stretch;
}

.tl-audience-reverse {
  grid-template-columns: 0.9fr 1fr;
}

.tl-benefits {
  margin-top: 28px;
  display: grid;
  gap: 14px;
  list-style: none;
}

.tl-benefits li {
  position: relative;
  padding-left: 32px;
  color: var(--tessy-text);
  font-size: 20px;
  line-height: 1.3;
}

.tl-benefits li:before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--tessy-gradient);
}

.tl-dark-cta {
  margin-top: 34px;
}

.tl-audience-panel {
  min-height: 330px;
  padding: 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(119,127,149,0.16);
  border-radius: 8px;
  background:
    linear-gradient(115deg, rgba(63,131,241,0.12) 0%, rgba(149,130,172,0.08) 48%, rgba(255,111,70,0.12) 100%),
    var(--tessy-soft);
}

.tl-audience-panel strong {
  color: var(--tessy-graphite);
  font-size: 34px;
  line-height: 1.1;
  font-weight: 500;
}

.tl-positioning {
  padding: 92px 0;
  text-align: center;
  border-top: 1px solid rgba(119,127,149,0.14);
}

.tl-positioning h2 {
  max-width: 820px;
  margin: 0 auto;
}

.tl-positioning p {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.tl-waitlist {
  margin-top: 0;
  padding: 44px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: center;
  border-radius: 8px;
  background: var(--tessy-gradient);
  box-shadow:
    0 22px 60px rgba(63,131,241,0.14),
    0 22px 70px rgba(255,111,70,0.14);
}

.tl-waitlist .tl-eyebrow,
.tl-waitlist h2,
.tl-waitlist p {
  color: #ffffff;
}

.tl-waitlist p {
  max-width: 720px;
  opacity: 0.78;
}

.tl-waitlist a {
  background: #ffffff;
  color: var(--tessy-deep);
}

.tessy-landing .tl-waitlist a {
  color: var(--tessy-deep);
}

.tl-faq {
  padding: 88px 0;
}

.tl-faq-list {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tl-faq details {
  padding: 22px 24px;
}

.tl-faq summary {
  cursor: pointer;
  color: var(--tessy-graphite);
  font-size: 20px;
  font-weight: 520;
}

.tl-footer {
  padding: 42px 0 54px;
  display: flex;
  justify-content: space-between;
  gap: 28px;
  border-top: 1px solid rgba(119,127,149,0.14);
}

.tl-footer strong {
  display: block;
  color: var(--tessy-graphite);
  font-size: 24px;
  font-weight: 560;
}

.tl-footer p,
.tl-footer a {
  margin-top: 8px;
  color: var(--tessy-text);
  text-decoration: none;
  font-size: 15px;
}

.tl-footer nav {
  gap: 18px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tl-mobile-glyph,
.tl-mobile-menu,
.tl-mobile-title,
.tl-mobile-nav,
.tl-mobile-intro,
.tl-phone-mini-header,
.tl-phone-dashboard,
.tl-phone-sectionbar,
.tl-phone-event {
  display: none;
}

.tl-desktop-title {
  display: block;
}

@media (max-width: 980px) {
  .tl-hero h1 {
    font-size: 54px;
  }

  .tl-proof-social,
  .tl-register-card {
    max-width: calc(100% - 48px);
  }

  .tl-proof-social {
    margin-bottom: 76px;
  }

  .tl-register-card {
    padding: 54px 42px;
  }

  .tl-solution-grid,
  .tl-flow-grid,
  .tl-audience,
  .tl-audience-reverse,
  .tl-waitlist {
    grid-template-columns: 1fr;
  }

  .tl-flow-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .tl-hero {
    min-height: 980px;
  }

  .tl-header {
    width: calc(100% - 28px);
    height: 76px;
  }

  .tl-brand-name {
    font-size: 24px;
  }

  .tl-brand-mark {
    width: 38px;
    height: 38px;
  }

  .tl-primary {
    display: none;
  }

  .tl-login {
    width: 74px;
    height: 40px;
    padding: 0;
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 999px;
    background: var(--tessy-gradient);
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff;
    font-size: 12px;
    font-weight: 560;
    box-shadow:
      0 14px 34px rgba(63,131,241,0.16),
      0 14px 34px rgba(255,111,70,0.12);
  }

  .tl-hero-content {
    width: calc(100% - 32px);
    margin-top: 48px;
  }

  .tl-hero h1 {
    max-width: 340px;
    font-size: 36px;
    line-height: 1.05;
  }

  .tl-hero-content > p {
    max-width: 325px;
    margin-top: 16px;
    font-size: 14px;
    line-height: 1.45;
  }

  .tl-section-subtitle,
  .tl-audience-subtitle {
    max-width: 100%;
    font-size: 14px;
    line-height: 1.44;
  }

  .tl-hero-content small {
    display: none;
  }

  .tl-hero-actions {
    width: 100%;
    flex-direction: column;
    gap: 10px;
    margin-top: 22px;
  }

  .tl-hero-primary,
  .tl-hero-secondary {
    width: min(318px, 100%);
    min-height: 56px;
    border-radius: 14px;
    font-size: 17px;
    font-weight: 560;
  }

  .tl-hero-primary {
    justify-content: center;
    padding: 0 46px;
  }

  .tl-hero-arrow {
    position: absolute;
    right: 22px;
    font-size: 26px;
  }

  .tl-hero-secondary {
    background: rgba(255,255,255,0.82);
    color: #171b2a;
    border-color: rgba(119,127,149,0.22);
  }

  .tl-phone-stage {
    bottom: -126px;
    width: 100%;
    min-height: 500px;
  }

  .tl-phone-card {
    display: none;
  }

  .tl-iphone {
    width: 268px;
    height: 540px;
    padding: 11px;
    border-radius: 48px;
  }

  .tl-island {
    top: 23px;
    width: 92px;
    height: 29px;
  }

  .tl-phone-screen {
    border-radius: 38px;
  }

  .tl-phone-status {
    height: 54px;
    padding: 22px 23px 0;
    font-size: 12px;
  }

  .tl-phone-appbar {
    padding: 12px 20px 0;
  }

  .tl-phone-appbar strong {
    font-size: 23px;
  }

  .tl-phone-feature {
    min-height: 166px;
    margin: 15px 13px 0;
    padding: 16px;
    border-radius: 22px;
  }

  .tl-phone-feature h3 {
    margin-top: 28px;
    font-size: 18px;
  }

  .tl-phone-feature p {
    font-size: 12px;
  }

  .tl-phone-list {
    margin: 9px 13px 0;
    padding: 12px;
    border-radius: 17px;
  }

  .tl-phone-list strong {
    font-size: 12px;
  }

  .tl-phone-list button {
    min-width: 62px;
    height: 30px;
    padding: 0 9px;
    font-size: 11px;
  }

  .tl-phone-nav {
    height: 64px;
    padding: 9px 13px 0;
  }

  .tl-phone-nav span {
    font-size: 10px;
  }

  .tl-phone-nav strong {
    width: 44px;
    height: 44px;
    margin-top: -15px;
  }

  .tl-section,
  .tl-faq {
    padding: 44px 0;
  }

  .tl-section,
  .tl-proof,
  .tl-positioning,
  .tl-waitlist,
  .tl-faq,
  .tl-footer {
    width: calc(100% - 28px);
  }

  .tl-proof {
    padding: 36px 0 46px;
  }

  .tl-proof-social {
    max-width: 100%;
    margin-bottom: 28px;
    gap: 10px;
  }

  .tl-proof-avatars span {
    width: 34px;
    height: 34px;
    margin-left: -7px;
    font-size: 14px;
    border-width: 2px;
  }

  .tl-proof-social p {
    font-size: 14px;
    line-height: 1.25;
    white-space: nowrap;
  }

  .tl-register-card {
    max-width: 100%;
    padding: 24px 20px;
    border-radius: 18px;
  }

  .tl-register-card h2 {
    font-size: 26px;
    line-height: 1.08;
  }

  .tl-register-list {
    margin-top: 22px;
    gap: 18px;
  }

  .tl-register-item {
    grid-template-columns: 27px 1fr;
    gap: 12px;
  }

  .tl-register-icon {
    width: 27px;
    height: 27px;
    margin-top: 2px;
  }

  .tl-register-item h3 {
    font-size: 18px;
  }

  .tl-register-item p {
    margin-top: 4px;
    font-size: 14px;
    line-height: 1.35;
  }

  .tl-section h2,
  .tl-positioning h2,
  .tl-waitlist h2,
  .tl-faq h2 {
    font-size: 28px;
    line-height: 1.1;
  }

  .tl-eyebrow {
    margin-bottom: 9px;
    font-size: 11px;
  }

  .tl-solution-grid {
    margin-top: 18px;
    gap: 10px;
  }

  .tl-solution-grid article,
  .tl-flow-grid article,
  .tl-audience-panel,
  .tl-waitlist {
    padding: 18px;
    border-radius: 14px;
  }

  .tl-solution-grid article,
  .tl-find-grid article,
  .tl-flow-grid article {
    min-height: auto;
  }

  .tl-solution-grid h3 {
    font-size: 19px;
  }

  .tl-solution-grid p,
  .tl-flow-grid p,
  .tl-waitlist p,
  .tl-faq p,
  .tl-positioning p {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.42;
  }

  .tl-flow-grid {
    margin-top: 18px;
  }

  .tl-flow-grid {
    grid-template-columns: 1fr;
  }

  .tl-faq-list {
    grid-template-columns: 1fr;
  }

  .tl-audience-panel {
    min-height: 190px;
  }

  .tl-audience-panel strong {
    font-size: 22px;
  }

  .tl-benefits {
    margin-top: 18px;
    gap: 9px;
  }

  .tl-benefits li {
    padding-left: 22px;
    font-size: 14px;
  }

  .tl-benefits li:before {
    top: 5px;
    width: 10px;
    height: 10px;
  }

  .tl-dark-cta {
    min-height: 50px;
    margin-top: 22px;
    padding: 0 20px;
    font-size: 15px;
  }

  .tl-positioning {
    padding: 52px 0;
  }

  .tl-waitlist {
    gap: 18px;
  }

  .tl-waitlist a {
    min-height: 48px;
    font-size: 15px;
  }

  .tl-faq details {
    padding: 16px 18px;
    border-radius: 14px;
  }

  .tl-faq summary {
    font-size: 16px;
  }

  .tl-footer {
    flex-direction: column;
  }

  .tl-footer nav {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .tessy-landing,
  main {
    background: #ffffff;
  }

  .tl-hero {
    width: calc(100% - 36px);
    min-height: 477px;
    margin: 26px auto 0;
    overflow: hidden;
    border: 0;
    border-radius: 14px 14px 0 0;
    background: linear-gradient(135deg, #5a82dc 0%, #ae7899 50%, #ff6948 100%);
  }

  .tl-hero:before,
  .tl-ring {
    display: none;
  }

  .tl-header {
    width: calc(100% - 38px);
    height: 58px;
    padding-top: 18px;
  }

  .tl-brand {
    width: 44px;
    height: 36px;
    gap: 0;
  }

  .tl-brand-mark,
  .tl-brand-name,
  .tl-actions {
    display: none !important;
  }

  .tl-mobile-glyph {
    display: block;
    width: 42px;
    height: 36px;
    object-fit: contain;
  }

  .tl-mobile-menu {
    width: 42px;
    height: 42px;
    display: grid;
    align-content: center;
    justify-items: end;
    gap: 5px;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .tl-mobile-menu span {
    width: 29px;
    height: 4px;
    border-radius: 2px;
    background: #ffffff;
  }

  .tl-mobile-nav {
    position: absolute;
    z-index: 10;
    top: 64px;
    right: 0;
    width: 176px;
    padding: 8px;
    display: grid;
    gap: 6px;
    border: 1px solid rgba(255,255,255,0.38);
    border-radius: 16px;
    background: rgba(255,255,255,0.96);
    box-shadow: 0 18px 44px rgba(15,22,40,0.16);
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
    transition: opacity 160ms ease, transform 160ms ease;
  }

  .tl-mobile-nav.is-open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .tl-mobile-nav a {
    min-height: 40px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 11px;
    color: #252b39;
    text-decoration: none;
    font-size: 14px;
    font-weight: 560;
  }

  .tl-mobile-nav a:hover {
    background: rgba(63,131,241,0.08);
  }

  .tl-hero-content {
    width: 100%;
    margin-top: 26px;
  }

  .tl-desktop-title {
    display: none;
  }

  .tl-mobile-title {
    display: block;
  }

  .tl-hero h1 {
    max-width: 310px;
    color: #ffffff;
    font-size: 39px;
    line-height: 1.08;
    font-weight: 430;
  }

  .tl-hero-content > p,
  .tl-hero-actions {
    display: none;
  }

  .tl-phone-stage {
    top: 209px;
    bottom: auto;
    width: 100%;
    min-height: 526px;
    z-index: 2;
  }

  .tl-phone-card {
    display: none;
  }

  .tl-iphone {
    width: 256px;
    height: 526px;
    padding: 6px;
    border-radius: 42px;
    background: #070912;
    box-shadow: 0 18px 40px rgba(12,15,26,0.16);
  }

  .tl-iphone:before {
    left: -3px;
    top: 122px;
    width: 3px;
    height: 58px;
  }

  .tl-iphone:after {
    right: -3px;
    top: 160px;
    width: 3px;
    height: 86px;
  }

  .tl-island {
    top: 15px;
    width: 74px;
    height: 23px;
  }

  .tl-phone-screen {
    border: 0;
    border-radius: 36px;
    background:
      radial-gradient(180px 130px at 52% 8%, rgba(185,193,234,0.24) 0%, rgba(255,255,255,0) 76%),
      linear-gradient(180deg, #f9fbff 0%, #eef2fb 100%);
  }

  .tl-phone-status {
    height: 47px;
    padding: 22px 18px 0;
    font-size: 9px;
  }

  .tl-phone-mini-header {
    height: 24px;
    margin: 10px 12px 0;
    padding: 4px 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 3px;
    background: rgba(255,255,255,0.88);
    color: #5d6474;
    box-shadow: 0 8px 22px rgba(52,57,73,0.06);
  }

  .tl-phone-mini-logo,
  .tl-phone-mini-user {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 4px;
    color: #ffffff;
    font-size: 7px;
    font-weight: 700;
  }

  .tl-phone-mini-logo {
    width: 17px;
    height: 17px;
    background: url('/tessy-icon-white.png') center / 70% no-repeat, var(--tessy-gradient);
  }

  .tl-phone-mini-header strong {
    margin-right: auto;
    color: #4f586b;
    font-size: 8px;
    font-weight: 680;
  }

  .tl-phone-mini-user {
    width: 19px;
    height: 19px;
    background: #7d8ba3;
  }

  .tl-phone-mini-header small {
    color: #9ba3b2;
    font-size: 7px;
  }

  .tl-phone-dashboard {
    display: block;
    padding: 18px 18px 0;
  }

  .tl-phone-dashboard > span {
    color: #9ba3b2;
    font-size: 7px;
    font-weight: 560;
    letter-spacing: 0.18em;
  }

  .tl-phone-dashboard h3 {
    margin: 8px 0 0;
    color: #5d6474;
    font-size: 17px;
    line-height: 1.1;
    font-weight: 650;
  }

  .tl-phone-dashboard p {
    margin: 3px 0 0;
    color: #6f7686;
    font-size: 7px;
  }

  .tl-phone-stats {
    margin-top: 14px;
    display: flex;
    gap: 6px;
  }

  .tl-phone-stats span {
    min-width: 48px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: 1px solid rgba(119,127,149,0.18);
    border-radius: 6px;
    background: #ffffff;
    color: #6f7686;
    font-size: 6px;
    box-shadow: 0 6px 16px rgba(52,57,73,0.04);
  }

  .tl-phone-stats strong {
    color: #3b4254;
    font-size: 9px;
  }

  .tl-phone-sectionbar {
    margin: 16px 18px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #5d6474;
  }

  .tl-phone-sectionbar strong {
    font-size: 8px;
  }

  .tl-phone-sectionbar span {
    color: #3f83f1;
    font-size: 6px;
    letter-spacing: 0.12em;
  }

  .tl-phone-event {
    margin: 8px 18px 0;
    display: block;
    overflow: hidden;
    border: 1px solid rgba(119,127,149,0.16);
    border-radius: 14px;
    background: #ffffff;
  }

  .tl-phone-event-visual {
    height: 112px;
    position: relative;
    padding: 11px;
    background:
      repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 2px, rgba(255,255,255,0) 2px 12px),
      linear-gradient(115deg, rgba(63,131,241,0.45) 0%, rgba(39,45,62,0.86) 100%);
  }

  .tl-phone-event-visual > span {
    padding: 7px 10px;
    border-radius: 9px;
    background: rgba(255,255,255,0.18);
    color: #ffffff;
    font-size: 8px;
    font-weight: 620;
  }

  .tl-phone-event-visual > strong {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 43px;
    height: 50px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #ffffff;
    color: #111728;
    text-align: center;
    font-size: 16px;
    line-height: 0.9;
  }

  .tl-phone-event-body {
    padding: 12px;
  }

  .tl-phone-event-body span {
    color: #9ba3b2;
    font-size: 10px;
  }

  .tl-phone-event-body h3 {
    margin-top: 7px;
    color: #5d6474;
    font-size: 16px;
    line-height: 1.12;
  }

  .tl-phone-event-body p {
    margin-top: 6px;
    color: #8d95a6;
    font-size: 9px;
  }

  .tl-phone-appbar,
  .tl-phone-feature,
  .tl-phone-list,
  .tl-phone-nav {
    display: none;
  }

  .tl-mobile-intro {
    width: calc(100% - 36px);
    margin: 24px auto 0;
    display: block;
    text-align: center;
  }

  .tl-mobile-intro h2 {
    max-width: 340px;
    margin: 0 auto;
    color: var(--tessy-heading);
    font-size: 32px;
    line-height: 1.06;
    font-weight: 470;
    letter-spacing: 0;
  }

  .tl-mobile-intro p {
    max-width: 330px;
    margin: 14px auto 0;
    color: var(--tessy-text);
    font-size: 14px;
    line-height: 1.42;
    font-weight: 450;
  }

  .tl-mobile-hero-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .tl-mobile-hero-primary,
  .tl-mobile-hero-secondary {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    text-decoration: none;
    font-size: 15px;
    font-weight: 620;
  }

  .tl-mobile-hero-primary {
    width: 172px;
    gap: 12px;
    background: var(--tessy-gradient);
    color: #ffffff !important;
    box-shadow:
      0 18px 42px rgba(63,131,241,0.14),
      0 18px 42px rgba(255,111,70,0.12);
  }

  .tl-mobile-hero-primary span:last-child {
    font-size: 24px;
    line-height: 1;
    font-weight: 400;
  }

  .tl-mobile-hero-secondary {
    width: 140px;
    border: 1px solid transparent;
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      var(--tessy-gradient) border-box;
    color: var(--tessy-heading);
  }

  .tl-proof {
    width: calc(100% - 36px);
    margin: 34px auto 0;
    padding: 22px 12px 16px;
    border-radius: 24px;
    background: linear-gradient(180deg, #f6faff 0%, #ffffff 70%);
    box-shadow: 0 18px 42px rgba(63,131,241,0.10);
  }

  .tl-proof-social {
    margin: 0 0 50px;
    gap: 10px;
  }

  .tl-register-card {
    padding: 30px 22px 28px;
    border-radius: 15px;
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(135deg, rgba(63,131,241,0.16), rgba(255,111,70,0.14)) border-box;
    box-shadow: none;
  }

  .tl-register-card h2 {
    max-width: 220px;
    font-size: 28px;
    line-height: 1.07;
  }

  .tl-register-list {
    margin-top: 30px;
    gap: 22px;
  }

  .tl-register-item {
    grid-template-columns: 29px 1fr;
    gap: 14px;
  }

  .tl-register-icon {
    width: 28px;
    height: 28px;
  }

  .tl-register-item h3 {
    font-size: 18px;
  }

  .tl-register-item p {
    max-width: 235px;
    font-size: 15px;
    line-height: 1.18;
  }

  .tl-section#o-que-encontra,
  .tl-audience,
  .tl-positioning {
    display: none;
  }

  .tl-section#como-ajuda {
    width: calc(100% - 72px);
    margin: 26px auto 0;
    padding: 38px 18px 34px;
    border: 0;
    border-radius: 2px;
    background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
    box-shadow: 0 20px 46px rgba(52,57,73,0.06);
  }

  .tl-section#como-ajuda .tl-eyebrow {
    margin-bottom: 14px;
    font-size: 10px;
    text-align: center;
  }

  .tl-section#como-ajuda h2 {
    max-width: 260px;
    margin: 0 auto;
    font-size: 27px;
    text-align: center;
  }

  .tl-section#como-ajuda .tl-section-subtitle {
    max-width: 285px;
    margin-top: 18px;
    font-size: 13px;
    line-height: 1.45;
    text-align: center;
  }

  .tl-waitlist {
    width: calc(100% - 72px);
    margin: 10px auto 0;
    padding: 28px 20px 20px;
    display: block;
    border-radius: 4px 4px 0 0;
  }

  .tl-waitlist .tl-eyebrow {
    font-size: 10px;
  }

  .tl-waitlist h2 {
    margin-top: 16px;
    color: #ffffff;
    font-size: 28px;
  }

  .tl-waitlist p {
    color: #ffffff;
    font-size: 15px;
  }

  .tl-waitlist a {
    width: 100%;
    min-height: 40px;
    margin-top: 26px;
    padding: 0 18px;
    border-radius: 999px;
    color: #0f1628;
    font-size: 14px;
  }

  .tl-faq {
    width: calc(100% - 72px);
    margin: 0 auto;
    padding: 24px 10px 26px;
    border: 0;
    border-radius: 0 0 16px 16px;
    background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,111,70,0.055));
  }

  .tl-faq .tl-eyebrow {
    display: none;
  }

  .tl-faq h2 {
    color: var(--tessy-heading);
    font-size: 27px;
    text-align: left;
  }

  .tl-faq-list {
    margin-top: 20px;
    gap: 12px;
  }

  .tl-faq details {
    padding: 17px 18px;
    border-radius: 5px;
    background: #ffffff;
  }

  .tl-faq summary {
    font-size: 16px;
  }

  .tl-faq p {
    font-size: 13px;
  }

  .tl-footer {
    width: 240px;
    margin: 42px auto 48px;
    padding: 22px 12px;
    display: block;
    border-top: 0;
    border-left: 1px solid #252b39;
    background: linear-gradient(115deg, rgba(63,131,241,0.055), rgba(255,111,70,0.055));
  }

  .tl-footer strong {
    font-size: 13px;
  }

  .tl-footer p,
  .tl-footer a {
    font-size: 8px;
  }

  .tl-footer nav {
    display: none;
  }
}
`;
