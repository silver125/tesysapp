import { Link } from 'react-router-dom';

const platformTags = [
  'Produtos',
  'Amostras',
  'Eventos',
  'Representantes',
  'Leads',
  'Parcerias',
];

const opportunityCards = [
  {
    title: 'Produto com intenção médica',
    text: 'Indicação, diferencial, público ideal e material de apoio.',
    label: 'Skin quality',
  },
  {
    title: 'Representante por região',
    text: 'Contato direto com quem atende a praça do médico.',
    label: 'SP capital',
  },
  {
    title: 'Evento comercial',
    text: 'Lançamentos, demonstrações e aulas para médicos selecionados.',
    label: '20 vagas',
  },
];

const flowSteps = [
  'Empresa publica',
  'Médico demonstra interesse',
  'Representante chama no WhatsApp',
];

export default function Landing() {
  return (
    <div className="tessy-landing">
      <style>{landingCss}</style>

      <section className="tl-hero">
        <div className="tl-orbit tl-orbit-one" />
        <div className="tl-orbit tl-orbit-two" />
        <div className="tl-orbit tl-orbit-three" />
        <div className="tl-pin tl-pin-one" />
        <div className="tl-pin tl-pin-two" />

        <header className="tl-header">
          <Link to="/" className="tl-brand" aria-label="Tessy">
            <span className="tl-brand-mark">T</span>
            <span className="tl-brand-name">Tessy<span>.app</span></span>
          </Link>

          <nav className="tl-nav" aria-label="Principal">
            <a href="#produto">Produto</a>
            <a href="#medicos">Médicos</a>
            <a href="#empresas">Empresas</a>
          </nav>

          <div className="tl-actions">
            <Link to="/entrar" className="tl-login">Entrar</Link>
            <Link to="/cadastro" className="tl-outline">Criar conta</Link>
          </div>
        </header>

        <div className="tl-hero-content">
          <div className="tl-badge">
            <span />
            Plataforma B2B para saúde premium
          </div>

          <h1>
            Médicos e empresas de saúde, conectados direto.
          </h1>

          <p>
            Produtos, eventos, amostras e representantes em um só lugar.
          </p>

          <div className="tl-trust">
            <span>Sem feed público</span>
            <span>Curadoria médica</span>
            <span>WhatsApp direto</span>
          </div>

          <div className="tl-cta-shell">
            <span>Acesso para médicos e empresas</span>
            <Link to="/cadastro">Começar</Link>
          </div>
        </div>

        <div className="tl-hero-preview" aria-hidden="true">
          <div className="tl-preview-card tl-preview-left">
            <div className="tl-preview-kicker">Médico</div>
            <strong>Quero receber amostra</strong>
            <span>Dra. Marina · estética e longevidade</span>
          </div>

          <div className="tl-phone">
            <div className="tl-phone-top" />
            <div className="tl-phone-card">
              <div className="tl-company-row">
                <span className="tl-company-logo">D</span>
                <div>
                  <strong>DermaLab</strong>
                  <small>Representante ativo em SP</small>
                </div>
              </div>
              <h3>Bioestimulador premium</h3>
              <p>Indicação clara, materiais científicos e proposta comercial.</p>
              <div className="tl-mini-actions">
                <span>WhatsApp</span>
                <span>Amostra</span>
              </div>
            </div>
          </div>

          <div className="tl-preview-card tl-preview-right">
            <div className="tl-preview-kicker">Empresa</div>
            <strong>Lead qualificado</strong>
            <span>Interesse em produto + evento</span>
          </div>
        </div>
      </section>

      <main className="tl-main">
        <section className="tl-card-grid" id="produto" aria-label="Visão do produto">
          <article className="tl-wide-card">
            <div>
              <p className="tl-eyebrow">Organize a conexão</p>
              <h2>Uma ponte prática, não uma rede social.</h2>
            </div>

            <div className="tl-tag-map">
              {platformTags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
              <div className="tl-tag-core">T</div>
            </div>
          </article>

          <article className="tl-side-card">
            <p className="tl-eyebrow">Ação rápida</p>
            <h2>Interesse vira conversa.</h2>
            <div className="tl-lead-box">
              <strong>Novo lead</strong>
              <span>Quero falar com representante</span>
              <small>Agora · WhatsApp liberado</small>
            </div>
          </article>
        </section>

        <section className="tl-product-panel" id="medicos">
          <div className="tl-panel-copy">
            <p className="tl-eyebrow">Para médicos</p>
            <h2>Ver rápido. Confiar rápido. Chamar rápido.</h2>
            <ul>
              <li>Produto com indicação e diferencial.</li>
              <li>Representante certo por região.</li>
              <li>Evento, amostra ou parceria sem burocracia.</li>
            </ul>
          </div>

          <div className="tl-ui-window">
            <div className="tl-window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="tl-opportunity-list">
              {opportunityCards.map(card => (
                <div className="tl-opportunity" key={card.title}>
                  <span>{card.label}</span>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                  <button>Falar no WhatsApp</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tl-flow" id="empresas">
          <div className="tl-section-title">
            <p className="tl-eyebrow">Para empresas e startups</p>
            <h2>Do cadastro ao contato comercial.</h2>
          </div>

          <div className="tl-flow-grid">
            {flowSteps.map((step, index) => (
              <article key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-final">
          <div>
            <p className="tl-eyebrow">Tessy</p>
            <h2>Saúde premium com menos ruído.</h2>
          </div>
          <Link to="/cadastro">Criar conta</Link>
        </section>
      </main>
    </div>
  );
}

const landingCss = `
.tessy-landing {
  --tessy-deep: #171b2a;
  --tessy-graphite: #343949;
  --tessy-steel: #777f95;
  --tessy-lavender: #b9c1ea;
  --tessy-sky: #4aa8ff;
  --tessy-paper: #f7f8ff;
  --tessy-heading: #5d6474;
  --tessy-text: #6f7686;
  --tessy-muted: #9299a8;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--tessy-paper);
  color: var(--tessy-text);
  font-family: "Helvetica Neue", Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.tl-hero {
  position: relative;
  width: 100%;
  min-height: 880px;
  overflow: hidden;
  background:
    radial-gradient(900px 520px at 52% 28%, rgba(185,193,234,0.28) 0%, rgba(255,255,255,0) 70%),
    radial-gradient(600px 360px at 10% 80%, rgba(74,168,255,0.10) 0%, rgba(255,255,255,0) 72%),
    linear-gradient(180deg, #ffffff 0%, #f7f8ff 100%);
  color: var(--tessy-text);
  border-bottom: 1px solid rgba(119,127,149,0.16);
}

.tl-orbit {
  position: absolute;
  left: 50%;
  top: 51%;
  border: 1px solid rgba(52,57,73,0.12);
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.tl-orbit-one { width: 780px; height: 780px; }
.tl-orbit-two { width: 1180px; height: 1180px; }
.tl-orbit-three { width: 1600px; height: 1600px; }

.tl-pin {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--tessy-sky);
  box-shadow: 0 0 22px rgba(74,168,255,0.36);
}

.tl-pin-one { left: 51%; top: 122px; }
.tl-pin-two { left: 34%; top: 405px; }

.tl-header {
  position: relative;
  z-index: 3;
  width: calc(100% - 96px);
  max-width: 1540px;
  margin: 0 auto;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.tl-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--tessy-heading);
  text-decoration: none;
}

.tl-brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-graphite) 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 22px;
}

.tl-brand-name {
  font-size: 34px;
  line-height: 1;
  font-weight: 560;
}

.tl-brand-name span {
  color: var(--tessy-lavender);
  font-weight: 500;
}

.tl-nav {
  display: flex;
  align-items: center;
  gap: 34px;
}

.tl-nav a,
.tl-login,
.tl-outline {
  color: rgba(93,100,116,0.88);
  text-decoration: none;
  font-size: 18px;
  font-weight: 560;
}

.tl-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tl-outline {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 25px;
  border: 2px solid rgba(255,255,255,0.82);
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
  border-radius: 999px;
  color: #ffffff;
}

.tl-hero-content {
  position: relative;
  z-index: 2;
  width: calc(100% - 48px);
  max-width: 1120px;
  margin: 108px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tl-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
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
  background: var(--tessy-sky);
}

.tl-hero h1 {
  max-width: 980px;
  margin: 44px auto 0;
  font-size: 64px;
  line-height: 1.1;
  font-weight: 480;
  letter-spacing: 0;
  color: var(--tessy-heading);
}

.tl-hero-content > p {
  margin-top: 28px;
  max-width: 760px;
  color: var(--tessy-muted);
  font-size: 20px;
  line-height: 1.45;
  font-weight: 460;
}

.tl-cta-shell {
  width: 100%;
  max-width: 560px;
  min-height: 78px;
  margin-top: 30px;
  padding: 7px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px solid var(--tessy-lavender);
  border-radius: 999px;
  box-shadow: 0 28px 70px rgba(52,57,73,0.13);
}

.tl-cta-shell span {
  color: var(--tessy-muted);
  font-size: 17px;
  text-align: left;
  padding-left: 26px;
  white-space: nowrap;
}

.tl-cta-shell a {
  min-height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 36px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
  color: #ffffff;
  text-decoration: none;
  font-size: 18px;
  font-weight: 560;
}

.tl-trust {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 46px;
  color: rgba(111,118,134,0.62);
  font-size: 18px;
  font-weight: 520;
}

.tl-hero-preview {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 0;
  width: calc(100% - 56px);
  max-width: 960px;
  height: 260px;
  transform: translateX(-50%);
  pointer-events: none;
}

.tl-phone {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 330px;
  height: 250px;
  padding: 18px;
  transform: translateX(-50%);
  border-radius: 34px 34px 0 0;
  background: linear-gradient(180deg, var(--tessy-deep) 0%, #0f1220 100%);
  box-shadow: 0 30px 80px rgba(52,57,73,0.20);
}

.tl-phone-top {
  width: 86px;
  height: 18px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #000000;
}

.tl-phone-card {
  height: 196px;
  padding: 18px;
  border-radius: 8px;
  background: #ffffff;
  color: var(--tessy-heading);
}

.tl-company-row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.tl-company-logo {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--tessy-sky);
  color: var(--tessy-deep);
  font-weight: 600;
}

.tl-company-row strong {
  display: block;
  font-size: 15px;
  font-weight: 560;
}

.tl-company-row small {
  display: block;
  margin-top: 2px;
  color: var(--tessy-muted);
  font-size: 11px;
}

.tl-phone-card h3 {
  margin-top: 18px;
  font-size: 22px;
  line-height: 1.05;
}

.tl-phone-card p {
  margin-top: 8px;
  color: var(--tessy-muted);
  font-size: 13px;
  line-height: 1.35;
}

.tl-mini-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.tl-mini-actions span {
  padding: 7px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: var(--tessy-graphite);
  font-size: 12px;
  font-weight: 560;
}

.tl-preview-card {
  position: absolute;
  top: 52px;
  width: 250px;
  padding: 18px;
  border-radius: 8px;
  background: rgba(255,255,255,0.96);
  color: var(--tessy-heading);
  box-shadow: 0 24px 60px rgba(18,24,40,0.14);
}

.tl-preview-left { left: 0; }
.tl-preview-right { right: 0; }

.tl-preview-kicker {
  color: var(--tessy-sky);
  font-size: 12px;
  font-weight: 560;
  text-transform: uppercase;
}

.tl-preview-card strong {
  display: block;
  margin-top: 10px;
  font-size: 20px;
  font-weight: 560;
}

.tl-preview-card span {
  display: block;
  margin-top: 8px;
  color: var(--tessy-muted);
  font-size: 13px;
  line-height: 1.35;
}

.tl-main {
  width: calc(100% - 56px);
  max-width: 1500px;
  margin: 0 auto;
  padding: 72px 0 72px;
}

.tl-card-grid {
  display: grid;
  grid-template-columns: 1.28fr 1fr;
  gap: 24px;
}

.tl-wide-card,
.tl-side-card,
.tl-product-panel,
.tl-final {
  border: 1px solid #eeeeee;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 56px rgba(0,0,0,0.06);
}

.tl-wide-card {
  min-height: 560px;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.tl-side-card {
  min-height: 560px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tl-eyebrow {
  color: var(--tessy-muted);
  font-size: 22px;
  line-height: 1.2;
  font-weight: 480;
}

.tl-wide-card h2,
.tl-side-card h2,
.tl-panel-copy h2,
.tl-section-title h2,
.tl-final h2 {
  margin-top: 8px;
  color: var(--tessy-heading);
  font-size: 38px;
  line-height: 1.14;
  font-weight: 540;
  letter-spacing: 0;
}

.tl-tag-map {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 56px;
  min-height: 330px;
  display: flex;
  align-items: start;
  justify-content: center;
  flex-wrap: wrap;
  gap: 18px;
  padding-top: 54px;
}

.tl-tag-map:before {
  content: "";
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 108px;
  height: 180px;
  border: 1px solid #e2e5ec;
  border-top: 0;
  border-radius: 0 0 50% 50%;
}

.tl-tag-map span {
  position: relative;
  z-index: 1;
  padding: 15px 22px;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
  background: #ffffff;
  color: var(--tessy-text);
  font-size: 17px;
  font-weight: 520;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}

.tl-tag-core {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 150px;
  height: 150px;
  display: grid;
  place-items: center;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
  color: #ffffff;
  font-size: 82px;
  font-weight: 560;
  box-shadow: inset 0 -16px 28px rgba(0,0,0,0.18), 0 28px 60px rgba(52,57,73,0.18);
}

.tl-lead-box {
  min-height: 250px;
  padding: 28px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tl-lead-box strong {
  font-size: 36px;
  line-height: 1.05;
  font-weight: 540;
}

.tl-lead-box span {
  margin-top: 16px;
  color: var(--tessy-text);
  font-size: 20px;
  font-weight: 480;
}

.tl-lead-box small {
  margin-top: 34px;
  color: var(--tessy-sky);
  font-size: 15px;
  font-weight: 560;
}

.tl-product-panel {
  margin-top: 32px;
  min-height: 620px;
  display: grid;
  grid-template-columns: 0.9fr 1.2fr;
  overflow: hidden;
}

.tl-panel-copy {
  padding: 58px;
  background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
}

.tl-panel-copy ul {
  margin-top: 38px;
  display: grid;
  gap: 22px;
  list-style: none;
}

.tl-panel-copy li {
  position: relative;
  padding-left: 44px;
  color: var(--tessy-text);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 500;
}

.tl-panel-copy li:before {
  content: "✓";
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--tessy-graphite);
  color: #ffffff;
  font-size: 16px;
}

.tl-ui-window {
  margin: 58px 58px 0 0;
  border: 1px solid #e8e8e8;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: #ffffff;
  box-shadow: 0 18px 52px rgba(0,0,0,0.12);
  overflow: hidden;
}

.tl-window-bar {
  height: 62px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-steel) 100%);
}

.tl-window-bar span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.72);
}

.tl-opportunity-list {
  padding: 26px;
  display: grid;
  gap: 16px;
}

.tl-opportunity {
  padding: 20px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  background: #ffffff;
}

.tl-opportunity span {
  display: inline-flex;
  padding: 7px 11px;
  border-radius: 999px;
  background: #f1f3ff;
  color: var(--tessy-graphite);
  font-size: 12px;
  font-weight: 560;
}

.tl-opportunity strong {
  display: block;
  margin-top: 14px;
  font-size: 22px;
  line-height: 1.08;
  color: var(--tessy-heading);
  font-weight: 540;
}

.tl-opportunity p {
  margin-top: 8px;
  color: var(--tessy-muted);
  font-size: 15px;
  line-height: 1.45;
}

.tl-opportunity button {
  margin-top: 16px;
  height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--tessy-deep);
  color: #ffffff;
  font-weight: 560;
  cursor: default;
}

.tl-flow {
  margin-top: 72px;
}

.tl-section-title {
  max-width: 760px;
}

.tl-flow-grid {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.tl-flow-grid article {
  min-height: 230px;
  padding: 30px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 56px rgba(0,0,0,0.06);
}

.tl-flow-grid span {
  color: var(--tessy-sky);
  font-size: 18px;
  font-weight: 560;
}

.tl-flow-grid h3 {
  margin-top: 62px;
  color: var(--tessy-heading);
  font-size: 31px;
  line-height: 1.12;
  letter-spacing: 0;
  font-weight: 540;
}

.tl-final {
  margin-top: 34px;
  padding: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(135deg, var(--tessy-deep) 0%, var(--tessy-graphite) 100%);
}

.tl-final .tl-eyebrow,
.tl-final h2 {
  color: #ffffff;
}

.tl-final a {
  min-height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  border-radius: 999px;
  background: #ffffff;
  color: var(--tessy-deep);
  text-decoration: none;
  font-size: 18px;
  font-weight: 560;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .tl-header {
    width: calc(100% - 40px);
  }

  .tl-nav {
    display: none;
  }

  .tl-hero h1 {
    font-size: 50px;
  }

  .tl-trust {
    margin-top: 90px;
    gap: 22px;
    flex-wrap: wrap;
  }

  .tl-preview-left,
  .tl-preview-right {
    display: none;
  }

  .tl-card-grid,
  .tl-product-panel,
  .tl-flow-grid {
    grid-template-columns: 1fr;
  }

  .tl-ui-window {
    margin: 0 28px 0;
  }
}

@media (max-width: 700px) {
  html,
  body {
    overflow-x: hidden;
  }

  .tl-hero {
    min-height: 930px;
    width: 100%;
  }

  .tl-header {
    height: 78px;
    width: calc(100% - 28px);
  }

  .tl-brand-name {
    font-size: 24px;
  }

  .tl-brand-mark {
    width: 38px;
    height: 38px;
  }

  .tl-actions {
    display: none;
  }

  .tl-hero-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 140px;
    width: calc(100% - 32px);
    max-width: none;
    margin: 0 16px;
  }

  .tl-badge {
    width: auto;
    max-width: 300px;
    justify-content: center;
    font-size: 12px;
  }

  .tl-hero h1 {
    margin-top: 28px;
    max-width: 240px;
    font-size: 27px;
    line-height: 1.12;
  }

  .tl-hero-content > p {
    max-width: 285px;
    font-size: 15px;
  }

  .tl-cta-shell {
    position: static;
    transform: none;
    min-height: auto;
    width: 300px;
    max-width: 100%;
    grid-template-columns: 1fr;
    border-radius: 8px;
    margin-left: auto;
    margin-right: auto;
  }

  .tl-cta-shell span {
    padding: 16px 14px 8px;
    text-align: center;
    white-space: normal;
  }

  .tl-cta-shell a {
    width: 100%;
    min-height: 56px;
    border-radius: 8px;
  }

  .tl-trust {
    display: none;
  }

  .tl-hero-preview {
    left: 0;
    width: 100%;
    transform: none;
  }

  .tl-phone {
    left: 50vw;
  }

  .tl-orbit-one { width: 460px; height: 460px; }
  .tl-orbit-two { width: 700px; height: 700px; }
  .tl-orbit-three { width: 940px; height: 940px; }
  .tl-pin { display: none; }

  .tl-phone {
    width: 288px;
  }

  .tl-main {
    width: calc(100% - 28px);
    padding-top: 138px;
  }

  .tl-wide-card,
  .tl-side-card,
  .tl-panel-copy,
  .tl-final {
    padding: 24px;
  }

  .tl-wide-card,
  .tl-side-card {
    min-height: 430px;
  }

  .tl-wide-card h2,
  .tl-side-card h2,
  .tl-panel-copy h2,
  .tl-section-title h2,
  .tl-final h2 {
    font-size: 31px;
  }

  .tl-eyebrow {
    font-size: 18px;
  }

  .tl-tag-map {
    left: 18px;
    right: 18px;
    bottom: 30px;
    gap: 10px;
    padding-top: 48px;
  }

  .tl-tag-map span {
    padding: 10px 13px;
    font-size: 13px;
  }

  .tl-tag-core {
    width: 104px;
    height: 104px;
    font-size: 58px;
  }

  .tl-product-panel {
    min-height: auto;
  }

  .tl-panel-copy li {
    font-size: 19px;
  }

  .tl-ui-window {
    margin: 0;
  }

  .tl-flow-grid h3 {
    margin-top: 42px;
    font-size: 26px;
  }

  .tl-final {
    align-items: stretch;
    flex-direction: column;
  }
}
`;
