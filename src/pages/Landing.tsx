import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TessyMark } from '../components/ui';

const features = [
  {
    title: 'Só o que importa',
    text: 'Oportunidades filtradas pela sua especialidade e região.',
    icon: 'spark',
  },
  {
    title: 'Privacidade primeiro',
    text: 'Seu WhatsApp só aparece depois da sua aprovação.',
    icon: 'lock',
  },
  {
    title: 'Conversa fora do app',
    text: 'Interesse → aprovação → WhatsApp. Sem spam no feed.',
    icon: 'chat',
  },
];

const steps = [
  { num: '01', title: 'Descubra', text: 'Produtos, eventos e representantes.' },
  { num: '02', title: 'Avise interesse', text: 'Sem expor seu WhatsApp.' },
  { num: '03', title: 'Converse', text: 'Aprove o contato e fale fora do app.' },
];

const finds = [
  { title: 'Representantes', icon: 'people' },
  { title: 'Eventos', icon: 'calendar' },
  { title: 'Workshops', icon: 'learn' },
  { title: 'Produtos', icon: 'box' },
];

const faqs = [
  ['Como funciona?', 'Médico vê oportunidades → avisa interesse → empresa pede contato → médico aprova → WhatsApp liberado.'],
  ['Médico paga?', 'Gratuito para médicos cadastrados.'],
  ['Como empresas entram?', 'Cadastro comercial e validação de categoria.'],
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="tx-landing">
      <style>{css}</style>

      <header className="tx-header">
        <Link to="/" className="tx-brand" aria-label="Tessy.app">
          <TessyMark className="tx-brand-mark" />
          <span>Tessy<span>.app</span></span>
        </Link>

        <div className="tx-header-actions">
          <Link to="/entrar" className="tx-link">Entrar</Link>
          <Link to="/cadastro?perfil=medico" className="tx-btn tx-btn-dark">Criar conta</Link>
        </div>

        <button
          type="button"
          className="tx-menu"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>

        <nav className={`tx-mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="Menu">
          <Link to="/entrar" onClick={() => setMenuOpen(false)}>Entrar</Link>
          <Link to="/cadastro?perfil=medico" onClick={() => setMenuOpen(false)}>Sou médico</Link>
          <Link to="/cadastro?perfil=empresa" onClick={() => setMenuOpen(false)}>Sou empresa</Link>
        </nav>
      </header>

      <main>
        <section className="tx-bento" aria-label="Hero">
          <div className="tx-tile tx-tile-hero">
            <p className="tx-kicker">Marketplace médico-empresa</p>
            <h1>Oportunidades da saúde no WhatsApp</h1>
            <div className="tx-hero-actions">
              <Link to="/cadastro?perfil=medico" className="tx-btn tx-btn-soft">Sou médico</Link>
              <Link to="/cadastro?perfil=empresa" className="tx-btn tx-btn-dark">Sou empresa</Link>
            </div>
          </div>

          <div className="tx-tile tx-tile-phone" aria-hidden="true">
            <div className="tx-phone">
              <div className="tx-phone-bar">
                <strong>Tessy.app</strong>
                <span>SP</span>
              </div>
              <div className="tx-phone-card">
                <span>MARKETPLACE</span>
                <h3>Bioestimulador Sculptra</h3>
                <p>Material científico · SP</p>
                <em>Interesse</em>
              </div>
              <div className="tx-phone-row">
                <div>
                  <span>PERMISSÃO</span>
                  <strong>Empresa pediu WhatsApp</strong>
                </div>
                <button type="button">Aprovar</button>
              </div>
            </div>
          </div>

          <div className="tx-tile tx-tile-accent" aria-hidden="true">
            <AccentMark />
          </div>

          <div className="tx-tile tx-tile-note">
            <p>Avise interesse, aprove o contato e converse no WhatsApp — sem expor seus dados.</p>
          </div>
        </section>

        <section className="tx-section">
          <div className="tx-feature-grid">
            {features.map(item => (
              <article key={item.title} className="tx-feature">
                <span className="tx-feature-icon" aria-hidden="true">
                  <FeatureIcon name={item.icon} />
                </span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tx-section">
          <div className="tx-steps-head">
            <div>
              <h2>Pronto para conectar?</h2>
              <p>Três passos simples.</p>
            </div>
            <Link to="/cadastro?perfil=medico" className="tx-btn tx-btn-dark">Começar agora</Link>
          </div>

          <div className="tx-steps">
            {steps.map(step => (
              <article key={step.num} className="tx-step">
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tx-section">
          <h2 className="tx-section-title">O que você encontra</h2>
          <div className="tx-find-grid">
            {finds.map(item => (
              <article key={item.title} className="tx-find">
                <span aria-hidden="true"><FindIcon name={item.icon} /></span>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="tx-cta-band">
          <div>
            <h2>Cadastro gratuito</h2>
            <p>Médicos e empresas entram direto na plataforma.</p>
          </div>
          <Link to="/cadastro?perfil=medico" className="tx-btn tx-btn-light">Criar conta médico</Link>
        </section>

        <section className="tx-section tx-faq">
          <h2 className="tx-section-title">Dúvidas</h2>
          <div className="tx-faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="tx-footer">
        <div>
          <strong>Tessy.app</strong>
          <p>Marketplace médico-empresa</p>
        </div>
        <nav>
          <a href="mailto:contato@tessybr.com">Contato</a>
          <a href="/termos">Termos</a>
          <a href="/privacidade">Privacidade</a>
        </nav>
      </footer>
    </div>
  );
}

function AccentMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 24h28M28 14l10 10-10 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'lock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect {...c} x="5" y="11" width="14" height="10" rx="2" />
        <path {...c} d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === 'chat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...c} d="M5 18.5 4 21l3-1.2A8.5 8.5 0 1 0 5 18.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...c} d="m12 3 2.1 6.1L20 11l-5.9 1.9L12 19l-2.1-6.1L4 11l5.9-1.9L12 3Z" />
    </svg>
  );
}

function FindIcon({ name }: { name: string }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect {...c} x="4" y="5" width="16" height="15" rx="2" />
        <path {...c} d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === 'learn') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...c} d="M4 19V6.8A1.8 1.8 0 0 1 5.8 5H12v14H5.8A1.8 1.8 0 0 0 4 19Z" />
        <path {...c} d="M20 19V6.8A1.8 1.8 0 0 0 18.2 5H12v14h6.2A1.8 1.8 0 0 1 20 19Z" />
      </svg>
    );
  }
  if (name === 'box') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...c} d="m4 8 8-4 8 4v9l-8 4-8-4V8Z" />
        <path {...c} d="M12 12v9M4 8l8 4 8-4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle {...c} cx="9" cy="9" r="3.2" />
      <circle {...c} cx="16" cy="10.5" r="2.5" />
      <path {...c} d="M3.5 19c1-3.5 3.3-5.2 5.5-5.2S13 15.5 14 19" />
      <path {...c} d="M13.8 15.5c1.4-.8 3-.8 4.5.1 1.6 1 2.7 2.9 3.2 5.4" />
    </svg>
  );
}

const css = `
.tx-landing {
  --bg: #F5F4F1;
  --card: #ffffff;
  --ink: #151515;
  --muted: #5c5c5c;
  --line: #e4e2dc;
  --orange: #F58220;
  --orange-deep: #e07112;
  --tan: #E7D3B8;
  --soft: rgba(255,255,255,0.28);
  --gutter: clamp(16px, 3vw, 28px);
  --radius: 28px;
  --radius-sm: 20px;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Red Hat Text", Inter, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tx-landing *,
.tx-landing *:before,
.tx-landing *:after { box-sizing: border-box; }

.tx-landing a { color: inherit; text-decoration: none; }

.tx-header {
  position: relative;
  z-index: 20;
  width: min(1180px, calc(100% - 2 * var(--gutter)));
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tx-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "Red Hat Display", "Red Hat Text", sans-serif;
  font-size: 22px;
  font-weight: 700;
}

.tx-brand span span { color: var(--orange); }
.tx-brand-mark { width: 34px; height: 34px; }

.tx-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tx-link {
  font-size: 15px;
  font-weight: 600;
}

.tx-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  border: 0;
  transition: transform 120ms ease, opacity 120ms ease;
}

.tx-btn:hover { transform: translateY(-1px); }

.tx-btn-dark {
  background: #1f1f1f;
  color: #fff;
}

.tx-btn-soft {
  background: var(--soft);
  color: var(--ink);
  backdrop-filter: blur(8px);
}

.tx-btn-light {
  background: #fff;
  color: var(--ink);
}

.tx-menu {
  display: none;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  background: transparent;
  align-content: center;
  justify-items: end;
  gap: 5px;
}

.tx-menu span {
  width: 22px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
}

.tx-mobile-nav {
  display: none;
}

main {
  width: min(1180px, calc(100% - 2 * var(--gutter)));
  margin: 0 auto;
  padding-bottom: 48px;
}

.tx-bento {
  display: grid;
  grid-template-columns: 1.35fr 0.72fr 0.38fr;
  grid-template-rows: 1.35fr 0.75fr;
  gap: 14px;
  min-height: 520px;
  margin-top: 8px;
}

.tx-tile {
  border-radius: var(--radius);
  overflow: hidden;
}

.tx-tile-hero {
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(28px, 4vw, 44px);
  background: var(--orange);
  color: var(--ink);
}

.tx-kicker {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
}

.tx-tile-hero h1 {
  margin: 10px 0 0;
  max-width: 11ch;
  font-family: "Red Hat Display", "Red Hat Text", sans-serif;
  font-size: clamp(36px, 5.2vw, 64px);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.tx-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tx-tile-phone {
  grid-column: 2;
  grid-row: 1;
  background: #eceae4;
  display: grid;
  place-items: center;
  padding: 18px;
}

.tx-phone {
  width: min(100%, 220px);
  display: grid;
  gap: 10px;
}

.tx-phone-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4d4d4d;
  font-size: 12px;
  font-weight: 700;
}

.tx-phone-card {
  min-height: 168px;
  padding: 16px;
  border-radius: 18px;
  background: #2a2a2a;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
}

.tx-phone-card span {
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.tx-phone-card h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.15;
}

.tx-phone-card p {
  margin: 0;
  font-size: 12px;
  opacity: 0.72;
}

.tx-phone-card em {
  align-self: flex-start;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  font-style: normal;
  font-size: 11px;
  font-weight: 700;
}

.tx-phone-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
}

.tx-phone-row span {
  display: block;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: #8a8a8a;
  font-weight: 700;
}

.tx-phone-row strong {
  display: block;
  margin-top: 2px;
  font-size: 12px;
}

.tx-phone-row button {
  border: 0;
  border-radius: 999px;
  min-height: 30px;
  padding: 0 12px;
  background: var(--orange);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.tx-tile-accent {
  grid-column: 3;
  grid-row: 1 / span 2;
  background: #1f1f1f;
  color: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 28px;
}

.tx-tile-accent svg {
  width: 42px;
  height: 42px;
}

.tx-tile-note {
  grid-column: 2;
  grid-row: 2;
  background: var(--tan);
  padding: 22px 24px;
  display: flex;
  align-items: center;
}

.tx-tile-note p {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  font-weight: 500;
}

.tx-section {
  margin-top: 56px;
}

.tx-section-title {
  margin: 0 0 18px;
  font-family: "Red Hat Display", sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.tx-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.tx-feature {
  padding: 28px 24px;
  border-radius: var(--radius-sm);
  background: var(--card);
  border: 1px solid var(--line);
}

.tx-feature-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: rgba(245,130,32,0.12);
  color: var(--orange-deep);
}

.tx-feature-icon svg { width: 24px; height: 24px; }

.tx-feature h2 {
  margin: 0;
  font-family: "Red Hat Display", sans-serif;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
}

.tx-feature p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.45;
}

.tx-steps-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.tx-steps-head h2 {
  margin: 0;
  font-family: "Red Hat Display", sans-serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.tx-steps-head p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 16px;
}

.tx-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.tx-step {
  padding: 24px;
  border-radius: var(--radius-sm);
  background: var(--card);
  border: 1px solid var(--line);
}

.tx-step span {
  display: block;
  color: var(--orange);
  font-family: "Red Hat Display", sans-serif;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.tx-step h3 {
  margin: 14px 0 0;
  font-size: 20px;
  font-weight: 800;
}

.tx-step p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.4;
}

.tx-find-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.tx-find {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 22px 12px;
  border-radius: var(--radius-sm);
  background: var(--card);
  border: 1px solid var(--line);
  text-align: center;
}

.tx-find span {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(245,130,32,0.12);
  color: var(--orange-deep);
}

.tx-find svg { width: 24px; height: 24px; }

.tx-find h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.tx-cta-band {
  margin-top: 56px;
  padding: 32px;
  border-radius: var(--radius);
  background: #1f1f1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.tx-cta-band h2 {
  margin: 0;
  font-family: "Red Hat Display", sans-serif;
  font-size: 32px;
  font-weight: 800;
}

.tx-cta-band p {
  margin: 8px 0 0;
  opacity: 0.75;
}

.tx-faq-list {
  display: grid;
  gap: 10px;
}

.tx-faq details {
  padding: 18px 20px;
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--line);
}

.tx-faq summary {
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.tx-faq p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.45;
}

.tx-footer {
  width: min(1180px, calc(100% - 2 * var(--gutter)));
  margin: 24px auto 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.tx-footer strong {
  display: block;
  font-size: 16px;
}

.tx-footer p,
.tx-footer a {
  margin-top: 6px;
  color: var(--muted);
  font-size: 14px;
}

.tx-footer nav {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .tx-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    min-height: 0;
  }

  .tx-tile-hero {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: 320px;
  }

  .tx-tile-phone { grid-column: 1; grid-row: auto; min-height: 280px; }
  .tx-tile-note { grid-column: 1; grid-row: auto; }
  .tx-tile-accent { grid-column: 2; grid-row: 2 / span 2; }

  .tx-feature-grid,
  .tx-steps {
    grid-template-columns: 1fr;
  }

  .tx-find-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tx-steps-head,
  .tx-cta-band {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .tx-header-actions { display: none; }

  .tx-menu {
    display: grid;
  }

  .tx-mobile-nav {
    position: absolute;
    top: 64px;
    right: 0;
    width: 180px;
    padding: 8px;
    display: grid;
    gap: 4px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-6px);
    transition: 160ms ease;
  }

  .tx-mobile-nav.is-open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .tx-mobile-nav a {
    min-height: 40px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
  }

  .tx-bento {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tx-tile-hero,
  .tx-tile-phone,
  .tx-tile-note,
  .tx-tile-accent {
    grid-column: 1;
    grid-row: auto;
  }

  .tx-tile-hero {
    min-height: 0;
    padding: 24px;
  }

  .tx-tile-hero h1 {
    max-width: 12ch;
    font-size: clamp(30px, 9vw, 38px);
  }

  .tx-tile-accent {
    min-height: 88px;
    align-items: center;
    padding: 0;
  }

  .tx-tile-phone { min-height: 260px; }

  .tx-tile-note p { font-size: 15px; }

  .tx-hero-actions .tx-btn {
    flex: 1 1 140px;
  }

  .tx-section { margin-top: 36px; }

  .tx-feature,
  .tx-step,
  .tx-find {
    border-radius: 16px;
  }

  .tx-cta-band {
    margin-top: 36px;
    padding: 24px;
    border-radius: 20px;
  }

  .tx-cta-band h2 { font-size: 26px; }

  .tx-footer {
    flex-direction: column;
  }
}
`;
