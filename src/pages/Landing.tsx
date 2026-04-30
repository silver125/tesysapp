import { Link } from 'react-router-dom';

const waitlistHref = 'mailto:contato@tessybr.com?subject=Waitlist%20Tessy&body=Ol%C3%A1%2C%20quero%20entrar%20na%20waitlist%20da%20Tessy.';

const solutionCards = [
  {
    eyebrow: 'Para médicos',
    title: 'Menos tempo procurando. Mais oportunidades certas.',
    text: 'Descubra produtos relevantes, fale direto com representantes e receba oportunidades de produtos e teste startups sem perder tempo.',
  },
  {
    eyebrow: 'Para empresas',
    title: 'Demanda qualificada, não audiência vazia.',
    text: 'Receba demanda qualificada, gere leads reais e reduza CAC comercial.',
  },
  {
    eyebrow: 'Para representantes',
    title: 'Intenção clara antes da conversa.',
    text: 'Atenda médicos com intenção clara e aumente conversão.',
  },
];

const flowSteps = [
  ['01', 'Cadastre seu perfil', 'Médico, clínica, marca ou representante.'],
  ['02', 'A Tessy conecta interesses reais', 'Produtos, regiões, especialidades e momento de compra.'],
  ['03', 'Conversa vira oportunidade', 'WhatsApp, reunião, demonstração, evento ou pedido.'],
  ['04', 'Dados viram crescimento', 'Mais inteligência comercial a cada interação.'],
];

const doctorBenefits = [
  'Produtos alinhados à sua especialidade',
  'Representante certo na sua região',
  'Eventos e aulas selecionadas',
  'Novidades sem spam',
  'Ganho de tempo real',
];

const companyBenefits = [
  'Leads médicos com intenção real',
  'Segmentação por especialidade e praça',
  'Distribuição comercial mais eficiente',
  'Lançamentos com tração imediata',
  'Métricas claras de performance',
];

const faqs = [
  ['A Tessy é para quais áreas?', 'Saúde estética, dermatologia, cirurgia, medicina premium e especialidades estratégicas.'],
  ['Existe custo para médico?', 'O acesso inicial poderá ser gratuito para médicos aprovados.'],
  ['Como empresas entram?', 'Via onboarding comercial e validação de categoria.'],
  ['Quando recebo acesso?', 'Conforme ordem da waitlist e perfil estratégico.'],
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
            <a href={waitlistHref} className="tl-primary">Waitlist</a>
          </div>
        </header>

        <div className="tl-hero-content">
          <div className="tl-badge">
            <span />
            Oportunidades entre empresas da saúde e médicos
          </div>

          <h1>Onde a saúde fecha negócios mais rápido.</h1>

          <p>
            A Tessy conecta médicos, clínicas, distribuidores e indústrias em um ecossistema inteligente de oportunidades reais.
          </p>

          <div className="tl-hero-actions">
            <a href={waitlistHref} className="tl-hero-primary">Entrar na waitlist</a>
            <Link to="/cadastro?perfil=empresa" className="tl-hero-secondary">Sou empresa</Link>
          </div>

          <small>Convites liberados em fases para perfis selecionados.</small>
        </div>

        <div className="tl-hero-console" aria-hidden="true">
          <div className="tl-console-top">
            <span>Interesse qualificado</span>
            <strong>Agora</strong>
          </div>
          <div className="tl-console-grid">
            <div>
              <span>Médico</span>
              <strong>Quero receber amostra</strong>
              <small>Dra. Marina · estética e longevidade</small>
            </div>
            <div>
              <span>Empresa</span>
              <strong>Lead qualificado</strong>
              <small>Produto + evento + região</small>
            </div>
            <div className="tl-console-wide">
              <span>Representante ativo</span>
              <strong>Conversa iniciada pelo WhatsApp</strong>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="tl-proof">
          <p>Usado por médicos de todo Brasil e mundo que movem o mercado da saúde no Brasil.</p>
        </section>

        <section className="tl-problem tl-section" id="problema">
          <div className="tl-section-copy">
            <p className="tl-eyebrow">O problema</p>
            <h2>O mercado da saúde ainda vende como em 2010.</h2>
          </div>

          <div className="tl-problem-card">
            <p>
              Representantes perdidos em visitas frias. Médicos sem tempo para descobrir novidades. Eventos cheios de ruído. Marcas gastando alto para pouca conversão.
            </p>
            <strong>A conexão existe. O sistema é que está ultrapassado.</strong>
          </div>
        </section>

        <section className="tl-section" id="solucao">
          <div className="tl-section-copy tl-centered">
            <p className="tl-eyebrow">A solução</p>
            <h2>A infraestrutura comercial que faltava para a saúde.</h2>
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
            <h2>Simples para entrar. Poderoso para crescer.</h2>
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
            <Link to="/cadastro?perfil=medico" className="tl-dark-cta">Entrar como médico</Link>
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
            <h2>Marketing bonito não basta. Venda precisa acontecer.</h2>
            <BenefitList items={companyBenefits} />
            <Link to="/cadastro?perfil=empresa" className="tl-dark-cta">Entrar como empresa</Link>
          </div>
        </section>

        <section className="tl-positioning">
          <h2>A década da saúde é sobre conexão.</h2>
          <p>Tessy nasce para modernizar a relação entre médicos e indústria.</p>
        </section>

        <section className="tl-waitlist">
          <div>
            <p className="tl-eyebrow">Exclusividade</p>
            <h2>Entrada por waitlist. Qualidade acima de volume.</h2>
            <p>Estamos ativando a plataforma em fases para garantir alta qualidade de networking e oportunidades relevantes.</p>
          </div>
          <a href={waitlistHref}>Entrar na waitlist</a>
        </section>

        <section className="tl-faq">
          <div className="tl-section-copy">
            <p className="tl-eyebrow">FAQ</p>
            <h2>Perguntas frequentes.</h2>
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

.tl-hero-console {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 0;
  width: calc(100% - 48px);
  max-width: 860px;
  padding: 18px;
  transform: translateX(-50%);
  border: 1px solid rgba(119,127,149,0.16);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: rgba(255,255,255,0.84);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 70px rgba(52,57,73,0.12);
}

.tl-console-top,
.tl-console-grid,
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

.tl-console-top {
  width: 100%;
  max-width: none;
  display: flex;
  justify-content: space-between;
  padding: 8px 4px 16px;
  color: var(--tessy-muted);
  font-size: 13px;
}

.tl-console-top strong {
  color: var(--tessy-graphite);
  font-weight: 560;
}

.tl-console-grid {
  width: 100%;
  max-width: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tl-console-grid div {
  min-height: 132px;
  padding: 20px;
  border: 1px solid rgba(119,127,149,0.14);
  border-radius: 8px;
  background: #ffffff;
}

.tl-console-grid span,
.tl-solution-grid span,
.tl-flow-grid span,
.tl-audience-panel span {
  color: var(--tessy-steel);
  font-size: 12px;
  font-weight: 560;
  text-transform: uppercase;
}

.tl-console-grid strong {
  display: block;
  margin-top: 10px;
  color: var(--tessy-graphite);
  font-size: 22px;
  line-height: 1.14;
  font-weight: 540;
}

.tl-console-grid small {
  display: block;
  margin-top: 12px;
  color: var(--tessy-muted);
  font-size: 14px;
}

.tl-console-wide {
  grid-column: 1 / -1;
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
  padding: 88px 0;
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
  padding: 34px;
  border: 1px solid rgba(119,127,149,0.16);
  border-radius: 8px;
  background: var(--tessy-soft);
}

.tl-problem-card p {
  color: var(--tessy-text);
  font-size: 25px;
  line-height: 1.36;
  font-weight: 460;
}

.tl-problem-card strong {
  display: block;
  margin-top: 30px;
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
  min-height: 300px;
  padding: 28px;
}

.tl-solution-grid h3 {
  margin-top: 64px;
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
  margin-top: 16px;
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
  min-height: 260px;
  padding: 24px;
}

.tl-flow-grid h3 {
  margin-top: 72px;
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
  min-height: 430px;
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
  padding: 112px 0;
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

  .tl-hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .tl-hero-primary,
  .tl-hero-secondary {
    width: min(320px, 100%);
  }

  .tl-hero-console {
    width: calc(100% - 28px);
    padding: 12px;
  }

  .tl-console-grid {
    grid-template-columns: 1fr;
  }

  .tl-console-grid div {
    min-height: auto;
  }

  .tl-console-grid strong {
    font-size: 18px;
  }

  .tl-console-wide {
    display: none;
  }

  .tl-section,
  .tl-faq {
    padding: 60px 0;
  }

  .tl-console-top,
  .tl-console-grid,
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
