import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TessyMark } from '../components/ui';

const flowSteps = [
  { num: '01', title: 'Descubra', text: 'Produtos, eventos e representantes' },
  { num: '02', title: 'Avise interesse', text: 'Sem expor seu WhatsApp' },
  { num: '03', title: 'Aprove', text: 'Empresa pede permissão' },
  { num: '04', title: 'WhatsApp', text: 'Conversa fora do app' },
];

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
  ['Como funciona?', 'Médico vê oportunidades → avisa interesse → empresa pede contato → médico aprova → WhatsApp liberado.'],
  ['Para quais áreas?', 'Estética, dermato, cirurgia, medicina premium e áreas estratégicas.'],
  ['Médico paga?', 'Gratuito para médicos cadastrados.'],
  ['Como empresas entram?', 'Cadastro comercial e validação de categoria.'],
  ['Quando acesso?', 'Imediatamente após criar conta em tessybr.com/cadastro.'],
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
            <Link to="/entrar" className="tl-login">Entrar</Link>
            <Link to="/cadastro?perfil=medico" className="tl-primary">Criar conta</Link>
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
            <Link to="/cadastro?perfil=medico" onClick={() => setIsMobileMenuOpen(false)}>Sou médico</Link>
            <Link to="/cadastro?perfil=empresa" onClick={() => setIsMobileMenuOpen(false)}>Sou empresa</Link>
          </nav>
        </header>

        <div className="tl-hero-content">
          <p className="tl-hero-eyebrow">Marketplace médico-empresa</p>

          <h1>
            <span className="tl-desktop-title">Descubra oportunidades da saúde — e fale com empresas pelo WhatsApp.</span>
            <span className="tl-mobile-title">Oportunidades da saúde,<br />direto no seu WhatsApp.</span>
          </h1>

          <p>
            Produtos, eventos, workshops e representantes em um fluxo simples: você demonstra interesse, a empresa pede contato e a conversa acontece no WhatsApp.
          </p>

          <div className="tl-hero-flow">
            <FlowStrip />
          </div>

          <div className="tl-hero-actions">
            <Link to="/cadastro?perfil=medico" className="tl-hero-primary">
              <span>Sou médico</span>
              <span className="tl-hero-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/cadastro?perfil=empresa" className="tl-hero-secondary">Sou empresa</Link>
          </div>
        </div>

        <div className="tl-phone-stage" aria-hidden="true">
          <div className="tl-phone-card tl-phone-card-left">
            <span>Médico</span>
            <strong>Avisei interesse</strong>
            <small>Sculptra · marketplace Tessy</small>
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
                <h3>Olá, Dra. Ana.</h3>
                <p>Oportunidades curadas para você esta semana.</p>

                <div className="tl-phone-stats">
                  <span><strong>2</strong> Produtos</span>
                  <span><strong>1</strong> Eventos</span>
                  <span><strong>1</strong> Rep.</span>
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
                  <span>Marketplace</span>
                  <h3>Bioestimulador Sculptra</h3>
                  <p>Material científico e representante em SP.</p>
                </div>
                <strong>Interesse</strong>
              </div>

              <div className="tl-phone-list">
                <div>
                  <span>Permissão</span>
                  <strong>Empresa pediu WhatsApp</strong>
                </div>
                <button>Aprovar</button>
              </div>

              <div className="tl-phone-list">
                <div>
                  <span>WhatsApp</span>
                  <strong>Conversa liberada</strong>
                </div>
                <button>Abrir</button>
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
            <strong>Pediu permissão</strong>
            <small>Aguardando aprovação do médico</small>
          </div>
        </div>
      </section>

      <section className="tl-mobile-intro">
        <h2>Marketplace da saúde — do interesse ao WhatsApp.</h2>
        <p>
          Produtos, eventos e representantes em um fluxo simples: avise interesse, aprove o contato e converse no WhatsApp.
        </p>

        <div className="tl-mobile-flow">
          <p className="tl-mobile-flow-label">Como funciona</p>
          <FlowStrip compact />
        </div>

        <div className="tl-mobile-hero-actions">
          <Link to="/cadastro?perfil=medico" className="tl-mobile-hero-primary">
            <span>Sou médico</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/cadastro?perfil=empresa" className="tl-mobile-hero-secondary">Sou empresa</Link>
        </div>
      </section>

      <main>
        <section className="tl-proof">
          <div className="tl-proof-social" aria-label="Plataforma ativa para médicos e empresas">
            <div className="tl-proof-pills" aria-hidden="true">
              <span>Médicos</span>
              <span>Empresas</span>
              <span>WhatsApp</span>
            </div>
            <p><strong>Plataforma ativa</strong> para médicos e empresas de saúde</p>
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
            {findCards.map((card, index) => (
              <article key={card.title}>
                <span className="tl-find-num">{String(index + 1).padStart(2, '0')}</span>
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
          <div className="tl-positioning-inner">
            <h2>Interesse → aprovação → WhatsApp.</h2>
            <p>Sem feed público, sem spam — só oportunidades com intenção clara.</p>
          </div>
        </section>

        <section className="tl-waitlist">
          <div>
            <p className="tl-eyebrow">Comece agora</p>
            <h2>Cadastro gratuito.</h2>
            <p>Médicos e empresas entram direto na plataforma.</p>
          </div>
          <Link to="/cadastro?perfil=medico">Criar conta médico</Link>
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
          <a href="/termos">Termos</a>
          <a href="/privacidade">Privacidade</a>
        </nav>
      </footer>
    </div>
  );
}

function FlowStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`tl-flow-strip${compact ? ' tl-flow-strip--compact' : ''}`} role="list" aria-label="Como funciona">
      {flowSteps.map(step => (
        <div key={step.num} className="tl-flow-step" role="listitem">
          <span className="tl-flow-step-num">{step.num}</span>
          <strong>{step.title}</strong>
          {compact ? (
            <span className="tl-flow-step-text">{step.text}</span>
          ) : (
            <p>{step.text}</p>
          )}
        </div>
      ))}
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
  /* RHDS-inspired surface scale */
  --tl-lightest: #ffffff;
  --tl-lighter: #f2f2f2;
  --tl-light: #e0e0e0;
  --tl-dark: #4d4d4d;
  --tl-darker: #1f1f1f;
  --tl-darkest: #151515;

  --tessy-deep: var(--tl-darkest);
  --tessy-graphite: var(--tl-darker);
  --tessy-steel: #6f6f6f;
  --tessy-lavender: #b9c1ea;
  --tessy-accent: #F58220;
  --tessy-blue: #0066cc;
  --tessy-coral: var(--tessy-accent);
  --tessy-mauve: #707070;
  --tessy-paper: var(--tl-lightest);
  --tessy-soft: var(--tl-lighter);
  --tessy-heading: var(--tl-darkest);
  --tessy-text: var(--tl-dark);
  --tessy-muted: #707070;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--tl-lightest);
  color: var(--tessy-text);
  font-family: "Red Hat Text", "Inter", Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif;
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
  min-height: auto;
  padding-bottom: 56px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--tl-lightest);
  border-bottom: 1px solid var(--tl-light);
}

.tl-hero:before {
  display: none;
}

.tl-ring {
  display: none;
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
  color: var(--tl-darkest);
  font-family: "Red Hat Display", "Red Hat Text", sans-serif;
  font-size: 34px;
  line-height: 1;
  font-weight: 600;
}

.tl-brand-name span {
  color: var(--tessy-accent);
  font-weight: 600;
}

.tl-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tl-dark);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
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
  border-radius: 4px;
  border: 1px solid var(--tessy-accent);
  background: var(--tessy-accent);
  color: #ffffff;
  text-decoration: none;
  font-family: "Red Hat Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  box-shadow: none;
  transition: background 120ms ease, border-color 120ms ease;
}

.tl-primary:hover,
.tl-hero-primary:hover,
.tl-dark-cta:hover,
.tl-waitlist a:hover {
  background: #e07318;
  border-color: #e07318;
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
  margin: 56px auto 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.tl-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 18px;
  padding: 6px 14px;
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lighter);
  color: var(--tl-dark);
  font-family: "Red Hat Text", sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: none;
}

.tl-hero h1 {
  max-width: 920px;
  margin-top: 0;
  color: var(--tl-darkest);
  font-family: "Red Hat Display", sans-serif;
  font-size: 68px;
  line-height: 1.06;
  letter-spacing: -0.02em;
  font-weight: 600;
}

.tl-hero-content > p {
  max-width: 740px;
  margin-top: 22px;
  color: var(--tessy-text);
  font-size: 20px;
  line-height: 1.52;
  font-weight: 460;
}

.tl-hero-flow {
  width: 100%;
  max-width: 920px;
  margin-top: 30px;
}

.tl-flow-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.tl-flow-step {
  position: relative;
  padding: 18px 16px 16px;
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lightest);
  text-align: left;
  box-shadow: none;
}

.tl-flow-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--tl-lighter);
  color: var(--tl-darker);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.tl-flow-step strong {
  display: block;
  margin-top: 12px;
  color: var(--tessy-graphite);
  font-size: 17px;
  line-height: 1.2;
  font-weight: 560;
}

.tl-flow-step p,
.tl-flow-step-text {
  display: block;
  margin-top: 6px;
  color: var(--tessy-text);
  font-size: 14px;
  line-height: 1.4;
  font-weight: 450;
}

.tl-flow-strip--compact {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tl-flow-strip--compact .tl-flow-step {
  padding: 12px 10px;
  border-radius: 10px;
  text-align: center;
}

.tl-flow-strip--compact .tl-flow-step-num {
  min-width: 28px;
  padding: 3px 7px;
  font-size: 10px;
}

.tl-flow-strip--compact .tl-flow-step strong {
  margin-top: 8px;
  font-size: 13px;
}

.tl-flow-strip--compact .tl-flow-step-text {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
}

.tl-hero-actions {
  margin-top: 28px;
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
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lightest);
  color: var(--tl-darker);
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: background 120ms ease, border-color 120ms ease;
}

.tl-hero-secondary:hover {
  background: var(--tl-lighter);
  border-color: var(--tl-dark);
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
  position: relative;
  z-index: 2;
  width: min(980px, calc(100% - 48px));
  min-height: 760px;
  margin: 36px auto 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
  flex-shrink: 0;
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
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lightest);
  box-shadow: 0 4px 16px rgba(21, 21, 21, 0.06);
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
  background: var(--tl-darkest);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.08),
    inset 0 0 0 5px rgba(0,0,0,0.35),
    0 24px 48px rgba(21, 21, 21, 0.18);
}

.tl-iphone:before,
.tl-iphone:after {
  content: "";
  position: absolute;
  width: 4px;
  border-radius: 999px;
  background: var(--tl-darker);
  box-shadow: inset 1px 0 1px rgba(255,255,255,0.08);
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
  background: var(--tl-lighter);
  border: 1px solid var(--tl-light);
  color: var(--tl-darker);
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
  border-radius: 8px;
  background: var(--tl-darker);
  color: #ffffff;
  box-shadow: none;
}

.tl-phone-feature span {
  color: rgba(255,255,255,0.72);
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
  border-radius: 4px;
  background: var(--tessy-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
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
  background: var(--tessy-accent);
  color: #ffffff;
  font-size: 30px;
  font-weight: 400;
  box-shadow: 0 4px 12px rgba(21, 21, 21, 0.14);
}

main {
  background: var(--tl-lightest);
}

.tl-proof {
  padding: 58px 0 76px;
}

.tl-proof-social {
  max-width: 900px;
  margin: 0 auto 48px;
  display: flex;
  align-items: center;
  gap: 34px;
}

.tl-proof-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tl-proof-pills span {
  padding: 6px 12px;
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lighter);
  color: var(--tl-darker);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.tl-proof-social p {
  margin: 0;
  color: var(--tl-dark);
  font-size: 22px;
  line-height: 1.35;
  font-weight: 400;
}

.tl-proof-social strong {
  color: var(--tl-darkest);
  font-weight: 700;
}

.tl-register-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 40px;
  border: 1px solid var(--tl-light);
  border-radius: 8px;
  background: var(--tl-lightest);
  box-shadow: none;
}

.tl-register-card h2 {
  margin: 0;
  color: var(--tl-darkest);
  font-family: "Red Hat Display", sans-serif;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 600;
}

.tl-register-list {
  margin-top: 32px;
  display: grid;
  gap: 24px;
}

.tl-register-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 16px;
  align-items: start;
  color: var(--tl-dark);
}

.tl-register-icon {
  width: 40px;
  height: 40px;
  margin-top: 2px;
  color: var(--tl-darker);
}

.tl-register-item h3 {
  margin: 0;
  color: var(--tl-darkest);
  font-family: "Red Hat Display", sans-serif;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 600;
}

.tl-register-item p {
  margin: 4px 0 0;
  color: var(--tl-dark);
  font-size: 16px;
  line-height: 1.45;
  font-weight: 400;
}

.tl-section {
  padding: 76px 0;
  border-top: 1px solid var(--tl-light);
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
  color: var(--tl-darkest);
  font-family: "Red Hat Display", sans-serif;
  font-size: 40px;
  line-height: 1.12;
  font-weight: 600;
  letter-spacing: -0.01em;
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
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lightest);
  box-shadow: none;
  transition: border-color 120ms ease, background 120ms ease;
}

.tl-solution-grid article:hover,
.tl-find-grid article:hover {
  transform: none;
  border-color: var(--tl-dark);
  background: var(--tl-lighter);
}

.tl-solution-grid article {
  min-height: 205px;
  padding: 28px;
}

.tl-find-grid article {
  min-height: 190px;
}

.tl-find-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  margin-bottom: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  background: var(--tl-lighter);
  color: var(--tl-darker);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
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
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--tessy-accent);
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
  border: 1px solid var(--tl-light);
  border-radius: 4px;
  background: var(--tl-lighter);
}

.tl-audience-panel strong {
  color: var(--tl-darkest);
  font-family: "Red Hat Display", sans-serif;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 600;
}

.tl-positioning {
  padding: 76px 0;
  text-align: center;
  border-top: 1px solid var(--tl-light);
}

.tl-positioning-inner {
  padding: 48px 40px;
  border: 1px solid var(--tl-light);
  border-radius: 8px;
  background: var(--tl-lighter);
  box-shadow: none;
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
  border: 1px solid var(--tl-darker);
  background: var(--tl-darker);
  box-shadow: none;
}

.tl-waitlist .tl-eyebrow,
.tl-waitlist h2,
.tl-waitlist p {
  color: #ffffff;
}

.tl-waitlist p {
  max-width: 720px;
  opacity: 0.85;
}

.tl-waitlist a {
  background: #ffffff;
  color: var(--tl-darkest);
  border-color: #ffffff;
}

.tessy-landing .tl-waitlist a {
  color: var(--tl-darkest);
}

.tl-waitlist a:hover {
  background: var(--tl-lighter);
  border-color: var(--tl-lighter);
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
  border-top: 1px solid var(--tl-light);
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
.tl-mobile-flow,
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

  .tl-flow-strip:not(.tl-flow-strip--compact) {
    grid-template-columns: repeat(2, 1fr);
  }

  .tl-proof-social,
  .tl-register-card {
    max-width: calc(100% - 48px);
  }

  .tl-proof-social {
    margin-bottom: 40px;
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
    min-height: auto;
    padding-bottom: 0;
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
    width: auto;
    min-width: 74px;
    height: 40px;
    padding: 0 14px;
    border: 1px solid var(--tl-light);
    border-radius: 4px;
    background: var(--tl-lightest);
    color: var(--tl-darker) !important;
    -webkit-text-fill-color: var(--tl-darker);
    font-size: 14px;
    font-weight: 600;
    box-shadow: none;
  }

  .tl-hero-content {
    width: calc(100% - 32px);
    margin-top: 32px;
  }

  .tl-hero h1 {
    max-width: 340px;
    font-size: 32px;
    line-height: 1.05;
  }

  .tl-hero-content > p {
    max-width: 325px;
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.4;
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

  .tl-proof-pills span {
    padding: 4px 8px;
    font-size: 11px;
  }

  .tl-proof-social p {
    font-size: 14px;
    line-height: 1.35;
    white-space: normal;
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
    padding: 40px 0;
  }

  .tl-positioning-inner {
    padding: 28px 20px;
    border-radius: 12px;
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
    width: calc(100% - 24px);
    min-height: auto;
    margin: 14px auto 0;
    padding-bottom: 12px;
    overflow: hidden;
    border: 1px solid var(--tl-light);
    border-radius: 8px 8px 0 0;
    background: var(--tl-lightest);
  }

  .tl-hero:before,
  .tl-ring {
    display: none;
  }

  .tl-header {
    width: calc(100% - 28px);
    height: 50px;
    padding-top: 10px;
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
    height: 3px;
    border-radius: 2px;
    background: var(--tl-darkest);
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
    margin-top: 10px;
  }

  .tl-desktop-title {
    display: none;
  }

  .tl-mobile-title {
    display: block;
  }

  .tl-hero h1 {
    max-width: 268px;
    color: var(--tl-darkest);
    font-size: 28px;
    line-height: 1.1;
    font-weight: 600;
  }

  .tl-hero-content > p,
  .tl-hero-actions,
  .tl-hero-flow,
  .tl-hero-eyebrow {
    display: none;
  }

  .tl-phone-stage {
    position: relative;
    top: auto;
    bottom: auto;
    width: 100%;
    min-height: auto;
    margin: 6px auto 0;
    z-index: 2;
  }

  .tl-phone-card {
    display: none;
  }

  .tl-iphone {
    width: 200px;
    height: 408px;
    padding: 5px;
    border-radius: 34px;
    background: #070912;
    box-shadow: 0 14px 32px rgba(12,15,26,0.14);
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
    background: var(--tl-lighter);
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
    background: url('/tessy-icon-white.png') center / 70% no-repeat, var(--tessy-accent);
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
    padding: 12px 14px 0;
  }

  .tl-phone-dashboard > span {
    color: #9ba3b2;
    font-size: 7px;
    font-weight: 560;
    letter-spacing: 0.18em;
  }

  .tl-phone-dashboard h3 {
    margin: 6px 0 0;
    color: #5d6474;
    font-size: 14px;
    line-height: 1.1;
    font-weight: 650;
  }

  .tl-phone-dashboard p {
    margin: 3px 0 0;
    color: #6f7686;
    font-size: 7px;
  }

  .tl-phone-stats {
    margin-top: 10px;
    display: flex;
    gap: 5px;
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
    margin: 12px 14px 0;
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
    margin: 6px 14px 0;
    display: block;
    overflow: hidden;
    border: 1px solid rgba(119,127,149,0.16);
    border-radius: 14px;
    background: #ffffff;
  }

  .tl-phone-event-visual {
    height: 88px;
    position: relative;
    padding: 11px;
    background: var(--tl-darker);
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
    width: calc(100% - 24px);
    margin: 10px auto 0;
    display: block;
    text-align: center;
  }

  .tl-mobile-intro h2 {
    max-width: 300px;
    margin: 0 auto;
    color: var(--tessy-heading);
    font-size: 22px;
    line-height: 1.08;
    font-weight: 470;
    letter-spacing: 0;
  }

  .tl-mobile-intro p {
    max-width: 300px;
    margin: 8px auto 0;
    color: var(--tessy-text);
    font-size: 13px;
    line-height: 1.38;
    font-weight: 450;
  }

  .tl-mobile-flow {
    margin-top: 12px;
    padding: 10px;
    border-radius: 14px;
    background: rgba(245,130,32,0.06);
    border: 1px solid rgba(245,130,32,0.12);
  }

  .tl-mobile-flow-label {
    margin: 0 0 8px;
    color: var(--tessy-steel);
    font-size: 11px;
    font-weight: 620;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tl-mobile-flow .tl-flow-step {
    background: #ffffff;
    border-color: rgba(119,127,149,0.12);
    box-shadow: none;
  }

  .tl-mobile-flow .tl-flow-step-num {
    background: rgba(245,130,32,0.10);
    color: var(--tessy-steel);
  }

  .tl-mobile-flow .tl-flow-step strong {
    color: var(--tessy-graphite);
  }

  .tl-mobile-flow .tl-flow-step-text {
    color: var(--tessy-text);
  }

  .tl-mobile-hero-actions {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .tl-mobile-hero-primary,
  .tl-mobile-hero-secondary {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 620;
  }

  .tl-mobile-hero-primary {
    width: 158px;
    gap: 10px;
    background: var(--tessy-accent);
    color: #ffffff !important;
    border-radius: 4px;
    box-shadow: none;
  }

  .tl-mobile-hero-primary span:last-child {
    font-size: 20px;
    line-height: 1;
    font-weight: 400;
  }

  .tl-mobile-hero-secondary {
    width: 128px;
    border: 1px solid var(--tl-light);
    background: var(--tl-lightest);
    color: var(--tl-darker);
    border-radius: 4px;
  }

  .tl-proof {
    width: calc(100% - 24px);
    margin: 18px auto 0;
    padding: 16px 12px 14px;
    border-radius: 8px;
    border: 1px solid var(--tl-light);
    background: var(--tl-lightest);
    box-shadow: none;
  }

  .tl-proof-social {
    margin: 0 0 24px;
    gap: 8px;
  }

  .tl-register-card {
    padding: 22px 18px 20px;
    border-radius: 8px;
    border: 1px solid var(--tl-light);
    background: var(--tl-lightest);
    box-shadow: none;
  }

  .tl-register-card h2 {
    max-width: 220px;
    font-size: 22px;
    line-height: 1.08;
  }

  .tl-register-list {
    margin-top: 18px;
    gap: 14px;
  }

  .tl-register-item {
    grid-template-columns: 26px 1fr;
    gap: 12px;
  }

  .tl-register-icon {
    width: 24px;
    height: 24px;
  }

  .tl-register-item h3 {
    font-size: 16px;
  }

  .tl-register-item p {
    max-width: 235px;
    font-size: 13px;
    line-height: 1.3;
  }

  .tl-section#o-que-encontra {
    display: block;
    width: calc(100% - 48px);
    margin: 16px auto 0;
    padding: 22px 14px 18px;
    border: 1px solid var(--tl-light);
    border-radius: 4px;
    background: var(--tl-lightest);
    box-shadow: none;
  }

  .tl-section#o-que-encontra .tl-eyebrow {
    margin-bottom: 8px;
    font-size: 10px;
    text-align: center;
  }

  .tl-section#o-que-encontra h2 {
    max-width: 240px;
    margin: 0 auto;
    font-size: 22px;
    text-align: center;
  }

  .tl-section#o-que-encontra .tl-find-grid {
    margin-top: 14px;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .tl-section#o-que-encontra .tl-find-grid article {
    min-height: auto;
    padding: 12px 10px;
  }

  .tl-section#o-que-encontra .tl-find-num {
    min-width: 28px;
    margin-bottom: 8px;
    padding: 3px 7px;
    font-size: 9px;
  }

  .tl-section#o-que-encontra .tl-find-grid h3 {
    font-size: 14px;
  }

  .tl-section#o-que-encontra .tl-find-grid p {
    margin-top: 6px;
    font-size: 11px;
    line-height: 1.35;
  }

  .tl-audience {
    display: none;
  }

  .tl-section#como-ajuda {
    width: calc(100% - 48px);
    margin: 14px auto 0;
    padding: 22px 14px 18px;
    border: 1px solid var(--tl-light);
    border-radius: 4px;
    background: var(--tl-lightest);
    box-shadow: none;
  }

  .tl-section#como-ajuda .tl-eyebrow {
    margin-bottom: 8px;
    font-size: 10px;
    text-align: center;
  }

  .tl-section#como-ajuda h2 {
    max-width: 240px;
    margin: 0 auto;
    font-size: 22px;
    text-align: center;
  }

  .tl-section#como-ajuda .tl-section-subtitle {
    max-width: 285px;
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
  }

  .tl-waitlist {
    width: calc(100% - 48px);
    margin: 8px auto 0;
    padding: 22px 16px 16px;
    display: block;
    border-radius: 4px 4px 0 0;
  }

  .tl-waitlist .tl-eyebrow {
    font-size: 10px;
  }

  .tl-waitlist h2 {
    margin-top: 10px;
    color: #ffffff;
    font-size: 22px;
  }

  .tl-waitlist p {
    color: #ffffff;
    font-size: 13px;
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
    border-radius: 0 0 8px 8px;
    background: var(--tl-lighter);
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
    border-top: 1px solid var(--tl-light);
    border-left: 0;
    background: var(--tl-lightest);
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
