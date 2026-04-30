import { Link } from 'react-router-dom';

const waitlistHref = 'mailto:contato@tessybr.com?subject=Acesso%20antecipado%20Tessy&body=Ol%C3%A1%2C%20quero%20acesso%20antecipado%20%C3%A0%20Tessy.';

const solutionCards = [
  {
    eyebrow: 'Para médicos',
    title: 'Oportunidades certas.',
    text: 'Produtos e contatos que fazem sentido.',
  },
  {
    eyebrow: 'Para empresas',
    title: 'Demanda real.',
    text: 'Médicos que levantaram a mão.',
  },
  {
    eyebrow: 'Para representantes',
    title: 'Conversa quente.',
    text: 'Contato com motivo para acontecer.',
  },
];

const flowSteps = [
  ['01', 'Perfil', 'Médico, clínica ou empresa.'],
  ['02', 'Match', 'Interesse, região e especialidade.'],
  ['03', 'Contato', 'Solicitação clara.'],
  ['04', 'Negócio', 'Conversa com intenção.'],
];

const doctorBenefits = [
  'Produtos alinhados à sua especialidade',
  'Representante certo na sua região',
  'Novidades sem spam',
];

const companyBenefits = [
  'Leads médicos com intenção real',
  'Segmentação por especialidade e praça',
  'Métricas claras de performance',
];

const faqs = [
  ['Para quais áreas?', 'Estética, dermato, cirurgia, medicina premium e áreas estratégicas.'],
  ['Médico paga?', 'O acesso inicial poderá ser gratuito para perfis aprovados.'],
  ['Como empresas entram?', 'Onboarding comercial e validação de categoria.'],
  ['Quando acesso?', 'Por fases, conforme perfil e ordem da waitlist.'],
];

export default function Landing() {
  return (
    <div className="tessy-landing">
      <style>{landingCss}</style>

      <section className="tl-hero">
        <div className="tl-ring tl-ring-a" />
        <div className="tl-ring tl-ring-b" />

        <header className="tl-header">
          <Link to="/" className="tl-brand" aria-label="Tessy.app">
            <span className="tl-brand-mark">T</span>
            <span className="tl-brand-name">Tessy<span>.app</span></span>
          </Link>

          <nav className="tl-nav" aria-label="Principal">
            <a href="#problema">Problema</a>
            <a href="#solucao">Solução</a>
            <a href="#medicos">Médicos</a>
            <a href="#empresas">Empresas</a>
          </nav>

          <div className="tl-actions">
            <Link to="/entrar" className="tl-login">Entrar</Link>
            <a href={waitlistHref} className="tl-primary">Acesso antecipado</a>
          </div>
        </header>

        <div className="tl-hero-content">
          <div className="tl-badge">
            <span />
            Oportunidades reais na saúde
          </div>

          <h1>Você perde oportunidades porque ninguém certo te encontra?</h1>

          <p>
            A Tessy conecta médicos, clínicas e empresas quando existe intenção real.
          </p>

          <div className="tl-hero-actions">
            <a href={waitlistHref} className="tl-hero-primary">Quero acesso antecipado</a>
            <Link to="/cadastro?perfil=empresa" className="tl-hero-secondary">Quero captar médicos</Link>
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

      <main>
        <section className="tl-proof">
          <p>Para quem move o mercado da saúde no Brasil.</p>
        </section>

        <section className="tl-problem tl-section" id="problema">
          <div className="tl-section-copy">
            <p className="tl-eyebrow">O problema</p>
            <h2>Você perde oportunidades porque ninguém certo te encontra?</h2>
          </div>

          <div className="tl-problem-card">
            <p>Médicos ocupados. Marcas dispersas. Representantes no escuro.</p>
            <strong>Oportunidade sem direção vira ruído.</strong>
          </div>
        </section>

        <section className="tl-section" id="solucao">
          <div className="tl-section-copy tl-centered">
            <p className="tl-eyebrow">A solução</p>
            <h2>O lugar onde médicos encontram oportunidades reais.</h2>
          </div>

          <div className="tl-solution-grid">
            {solutionCards.map(card => (
              <article key={card.eyebrow}>
                <span>{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-section tl-flow">
          <div className="tl-section-copy">
            <p className="tl-eyebrow">Como funciona</p>
            <h2>Entrar. Conectar. Fechar.</h2>
          </div>

          <div className="tl-flow-grid">
            {flowSteps.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-audience tl-section" id="medicos">
          <div>
            <p className="tl-eyebrow">Para médicos</p>
            <h2>Menos ruído. Mais relevância.</h2>
            <BenefitList items={doctorBenefits} />
            <Link to="/cadastro?perfil=medico" className="tl-dark-cta">Receber oportunidades</Link>
          </div>

          <div className="tl-audience-panel">
            <span>Onde interesse vira conversa.</span>
            <strong>Produtos alinhados à prática médica, sem feed público e sem spam.</strong>
          </div>
        </section>

        <section className="tl-audience tl-section tl-audience-reverse" id="empresas">
          <div className="tl-audience-panel">
            <span>Menos visita fria. Mais demanda quente.</span>
            <strong>A ponte entre decisão médica e oportunidade comercial.</strong>
          </div>

          <div>
            <p className="tl-eyebrow">Para empresas</p>
            <h2>Mais demanda. Menos CAC.</h2>
            <BenefitList items={companyBenefits} />
            <Link to="/cadastro?perfil=empresa" className="tl-dark-cta">Captar médicos certos</Link>
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

const landingCss = `
.tessy-landing {
  --tessy-deep: #171b2a;
  --tessy-graphite: #343949;
  --tessy-steel: #777f95;
  --tessy-lavender: #b9c1ea;
  --tessy-paper: #f7f8ff;
  --tessy-soft: #f1f3fa;
  --tessy-heading: #5d6474;
  --tessy-text: #6f7686;
  --tessy-muted: #9299a8;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--tessy-paper);
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
    radial-gradient(860px 520px at 50% 26%, rgba(185,193,234,0.26) 0%, rgba(255,255,255,0) 72%),
    linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  border-bottom: 1px solid rgba(119,127,149,0.16);
}

.tl-ring {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(52,57,73,0.10);
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
.tl-nav,
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
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--tessy-deep);
  color: #ffffff;
  font-size: 22px;
  font-weight: 560;
}

.tl-brand-name {
  color: var(--tessy-heading);
  font-size: 34px;
  line-height: 1;
  font-weight: 560;
}

.tl-brand-name span {
  color: var(--tessy-lavender);
  font-weight: 500;
}

.tl-nav {
  gap: 32px;
}

.tl-nav a,
.tl-login {
  color: rgba(93,100,116,0.88);
  text-decoration: none;
  font-size: 17px;
  font-weight: 520;
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
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
  color: #ffffff;
  text-decoration: none;
  font-size: 17px;
  font-weight: 560;
  box-shadow: 0 18px 45px rgba(52,57,73,0.16);
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

.tl-badge {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 18px;
  border: 1px solid rgba(119,127,149,0.18);
  border-radius: 999px;
  background: #ffffff;
  color: var(--tessy-text);
  font-size: 15px;
  font-weight: 560;
  box-shadow: 0 12px 30px rgba(18,24,40,0.08);
}

.tl-badge span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--tessy-lavender);
}

.tl-hero h1 {
  max-width: 920px;
  margin-top: 42px;
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

.tl-hero-secondary {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  border: 1px solid rgba(119,127,149,0.22);
  border-radius: 999px;
  background: rgba(255,255,255,0.78);
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
  border: 1px solid rgba(119,127,149,0.14);
  border-radius: 8px;
  background: rgba(255,255,255,0.88);
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
    linear-gradient(145deg, #0e111b 0%, #232838 45%, #6f7688 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.16),
    inset 0 0 0 5px rgba(0,0,0,0.22),
    0 40px 90px rgba(23,27,42,0.20);
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
    radial-gradient(220px 140px at 80% 0%, rgba(185,193,234,0.55) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(135deg, #dce1f4 0%, #8f96a8 100%);
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
  background: var(--tessy-deep);
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
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
  color: #ffffff;
  font-size: 30px;
  font-weight: 420;
  box-shadow: 0 20px 38px rgba(52,57,73,0.18);
}

main {
  background: #ffffff;
}

.tl-proof {
  padding: 44px 0;
  text-align: center;
}

.tl-proof p {
  max-width: 820px;
  margin: 0 auto;
  color: var(--tessy-heading);
  font-size: 24px;
  line-height: 1.35;
  font-weight: 480;
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

.tl-problem {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 48px;
  align-items: start;
}

.tl-problem-card {
  padding: 30px;
  border: 1px solid rgba(119,127,149,0.16);
  border-radius: 8px;
  background: var(--tessy-soft);
}

.tl-problem-card p {
  color: var(--tessy-text);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 460;
}

.tl-problem-card strong {
  display: block;
  margin-top: 22px;
  color: var(--tessy-graphite);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 540;
}

.tl-solution-grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.tl-solution-grid article,
.tl-flow-grid article,
.tl-faq details {
  border: 1px solid rgba(119,127,149,0.16);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 56px rgba(52,57,73,0.06);
}

.tl-solution-grid article {
  min-height: 220px;
  padding: 28px;
}

.tl-solution-grid h3 {
  margin-top: 48px;
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
  background: var(--tessy-lavender);
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
    linear-gradient(135deg, rgba(185,193,234,0.20) 0%, rgba(255,255,255,0) 70%),
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
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-graphite) 100%);
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

@media (max-width: 980px) {
  .tl-nav {
    display: none;
  }

  .tl-hero h1 {
    font-size: 54px;
  }

  .tl-problem,
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
    min-height: 1100px;
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
    min-height: 40px;
    padding: 0 18px;
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 999px;
    background: var(--tessy-deep);
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff;
    font-size: 14px;
    font-weight: 560;
    box-shadow: 0 14px 34px rgba(23,27,42,0.16);
  }

  .tl-hero-content {
    width: calc(100% - 32px);
    margin-top: 70px;
  }

  .tl-badge {
    max-width: 320px;
    justify-content: center;
    font-size: 12px;
    text-align: left;
  }

  .tl-hero h1 {
    margin-top: 28px;
    max-width: 340px;
    font-size: 42px;
    line-height: 1.06;
  }

  .tl-hero-content > p {
    max-width: 330px;
    font-size: 16px;
  }

  .tl-hero-content small {
    display: none;
  }

  .tl-hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .tl-hero-primary,
  .tl-hero-secondary {
    width: min(320px, 100%);
  }

  .tl-phone-stage {
    bottom: -168px;
    width: 100%;
    min-height: 550px;
  }

  .tl-phone-card {
    display: none;
  }

  .tl-iphone {
    width: 292px;
    height: 588px;
    padding: 11px;
    border-radius: 52px;
  }

  .tl-island {
    top: 23px;
    width: 92px;
    height: 29px;
  }

  .tl-phone-screen {
    border-radius: 42px;
  }

  .tl-phone-status {
    height: 58px;
    padding: 23px 25px 0;
    font-size: 12px;
  }

  .tl-phone-appbar {
    padding: 14px 22px 0;
  }

  .tl-phone-appbar strong {
    font-size: 25px;
  }

  .tl-phone-feature {
    min-height: 190px;
    margin: 18px 14px 0;
    padding: 18px;
    border-radius: 24px;
  }

  .tl-phone-feature h3 {
    margin-top: 34px;
    font-size: 20px;
  }

  .tl-phone-feature p {
    font-size: 12px;
  }

  .tl-phone-list {
    margin: 10px 14px 0;
    padding: 13px;
    border-radius: 19px;
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
    height: 70px;
    padding: 10px 14px 0;
  }

  .tl-phone-nav span {
    font-size: 10px;
  }

  .tl-phone-nav strong {
    width: 50px;
    height: 50px;
    margin-top: -19px;
  }

  .tl-section,
  .tl-faq {
    padding: 60px 0;
  }

  .tl-section,
  .tl-proof,
  .tl-positioning,
  .tl-waitlist,
  .tl-faq,
  .tl-footer {
    width: calc(100% - 28px);
  }

  .tl-proof p {
    font-size: 20px;
  }

  .tl-section h2,
  .tl-positioning h2,
  .tl-waitlist h2,
  .tl-faq h2 {
    font-size: 34px;
  }

  .tl-problem-card,
  .tl-solution-grid article,
  .tl-flow-grid article,
  .tl-audience-panel,
  .tl-waitlist {
    padding: 24px;
  }

  .tl-problem-card p {
    font-size: 20px;
  }

  .tl-flow-grid {
    grid-template-columns: 1fr;
  }

  .tl-faq-list {
    grid-template-columns: 1fr;
  }

  .tl-audience-panel {
    min-height: 280px;
  }

  .tl-audience-panel strong {
    font-size: 27px;
  }

  .tl-benefits li {
    font-size: 17px;
  }

  .tl-positioning {
    padding: 72px 0;
  }

  .tl-footer {
    flex-direction: column;
  }

  .tl-footer nav {
    justify-content: flex-start;
  }
}
`;
