import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TessyMark } from '../components/ui';
import { COMPANY_MEETING_HREF, TESSY_CONTACT_EMAIL } from '../lib/inviteLinks';

/**
 * Resultados de campanha — administráveis.
 * Mantém `enabled: false` até existir dado comprovado.
 * Ao publicar: informe período e contexto da campanha.
 */
const CAMPAIGN_RESULTS = {
  enabled: false,
  period: '', // ex.: 'Jan–Mar 2026'
  campaign: '', // ex.: 'Presença estratégica — marca parceira'
  items: [
    // Exemplos (ocultos enquanto enabled=false):
    // { value: '+240%', label: 'em oportunidades comerciais' },
    // { value: '4x', label: 'mais leads qualificados' },
    // { value: '3x', label: 'mais interações com médicos' },
    // { value: '+X', label: 'médicos alcançados' },
  ] as Array<{ value: string; label: string }>,
};

/** Cards flutuantes do bloco visual — posicionamento de produto (não ROI). */
const PHOTO_METRICS = [
  {
    id: 'touchpoints',
    value: '4x',
    label: 'mais pontos de contato',
    detail: 'Perfil, conteúdo, eventos e soluções em destaque.',
  },
  {
    id: 'audience',
    value: '100%',
    label: 'público médico',
    detail: 'Comunicação direcionada a uma audiência profissional qualificada.',
  },
] as const;

const POSSIBILITIES = [
  {
    title: 'Perfil institucional',
    text: 'Apresente a empresa, soluções e canais de contato.',
    mark: '01',
  },
  {
    title: 'Conteúdo patrocinado',
    text: 'Publique conteúdos relevantes no feed da comunidade.',
    mark: '02',
  },
  {
    title: 'Eventos em destaque',
    text: 'Divulgue congressos, workshops e experiências.',
    mark: '03',
  },
  {
    title: 'Produtos e tecnologias',
    text: 'Apresente soluções desenvolvidas para o mercado médico.',
    mark: '04',
  },
] as const;

const STEPS = [
  {
    n: '01',
    title: 'Entendemos sua empresa',
    text: 'Conhecemos os objetivos, soluções e público da marca.',
  },
  {
    n: '02',
    title: 'Criamos uma estratégia',
    text: 'Definimos os melhores formatos de presença na Tessy.',
  },
  {
    n: '03',
    title: 'Conectamos sua marca',
    text: 'Sua empresa passa a aparecer de maneira estratégica para médicos.',
  },
] as const;

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MeetingLink({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={COMPANY_MEETING_HREF}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nodes = el.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

const showCampaignResults =
  CAMPAIGN_RESULTS.enabled &&
  CAMPAIGN_RESULTS.items.length > 0 &&
  Boolean(CAMPAIGN_RESULTS.period.trim()) &&
  Boolean(CAMPAIGN_RESULTS.campaign.trim());

export default function ForCompanies() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useReveal();

  return (
    <div className="fc" ref={rootRef}>
      <style>{css}</style>

      <header className="fc-nav">
        <div className="fc-nav__inner">
          <Link to="/" className="fc-brand" aria-label="Tessy.app">
            <TessyMark size={34} />
            <span>
              Tessy<span>.app</span>
            </span>
          </Link>

          <nav className="fc-nav__links" aria-label="Principal">
            <Link to="/">Para médicos</Link>
            <Link to="/para-empresas" aria-current="page">
              Para empresas
            </Link>
            <a href="#possibilidades">Possibilidades</a>
            <a href="#como-funciona">Como funciona</a>
          </nav>

          <div className="fc-nav__actions">
            <Link to="/entrar" className="fc-btn fc-btn--ghost">
              Entrar
            </Link>
            <MeetingLink className="fc-btn fc-btn--primary">Agende uma conversa</MeetingLink>
          </div>

          <button
            type="button"
            className="fc-burger"
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
          <div className="fc-drawer">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Para médicos
            </Link>
            <a href="#possibilidades" onClick={() => setMenuOpen(false)}>
              Possibilidades
            </a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
              Como funciona
            </a>
            <Link to="/entrar" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <MeetingLink
              className="fc-btn fc-btn--primary"
              onClick={() => setMenuOpen(false)}
            >
              Agende uma conversa
            </MeetingLink>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="fc-hero">
          <div className="fc-container fc-hero__inner" data-reveal>
            <p className="fc-kicker">Tessy para empresas</p>
            <h1>
              Sua próxima grande
              <br />
              <span className="fc-accent-word">conexão</span> com{' '}
              <span className="fc-accent-word">médicos</span>
              <br />
              começa aqui
            </h1>
            <p className="fc-lead">
              Posicione sua empresa diante de uma comunidade médica qualificada e transforme
              visibilidade em novas conexões e oportunidades de negócio.
            </p>
            <div className="fc-hero__cta">
              <MeetingLink className="fc-btn fc-btn--primary fc-btn--lg">
                Agende uma conversa
              </MeetingLink>
              <a href="#possibilidades" className="fc-btn fc-btn--soft fc-btn--lg">
                Conheça as possibilidades
              </a>
            </div>
          </div>
        </section>

        {/* Dual visual block */}
        <section className="fc-dual" aria-label="Presença estratégica">
          <div className="fc-container fc-dual__grid">
            <article className="fc-dark" data-reveal>
              <p className="fc-kicker fc-kicker--on-dark">Presença estratégica</p>
              <h2>Sua empresa no centro das decisões médicas.</h2>
              <p>
                Apresente sua marca, soluções, eventos e conteúdos dentro de um ambiente
                profissional criado para médicos.
              </p>
              <div className="fc-dark__cta">
                <MeetingLink className="fc-btn fc-btn--light">Falar com o time Tessy</MeetingLink>
                <a href="#possibilidades" className="fc-btn fc-btn--outline-light">
                  Ver possibilidades
                </a>
              </div>
              <div className="fc-dark__panel">
                <strong>Mais visibilidade para sua marca</strong>
                <p>
                  Conteúdos patrocinados, eventos, soluções em destaque e presença institucional
                  dentro da Tessy.
                </p>
              </div>
            </article>

            <div className="fc-photo" data-reveal>
              <img
                src="/hero-bg.jpg"
                alt="Profissional de saúde em ambiente clínico contemporâneo"
                width={1440}
                height={1589}
                loading="lazy"
                decoding="async"
              />
              <div className="fc-photo__scrim" aria-hidden="true" />

              {PHOTO_METRICS.map((m, i) => (
                <aside
                  key={m.id}
                  className={`fc-metric fc-metric--${i === 0 ? 'a' : 'b'}`}
                  data-metric={m.id}
                >
                  <div className="fc-metric__value">{m.value}</div>
                  <div className="fc-metric__label">{m.label}</div>
                  <p>{m.detail}</p>
                </aside>
              ))}
            </div>
          </div>
        </section>

        {/* Possibilities */}
        <section className="fc-section" id="possibilidades">
          <div className="fc-container">
            <div className="fc-section__head" data-reveal>
              <p className="fc-kicker">Possibilidades</p>
              <h2>Mais presença. Mais conexões. Mais oportunidades.</h2>
              <p className="fc-note">
                Todo conteúdo comercial na Tessy é identificado como Patrocinado, Parceria ou Em
                destaque — com transparência para a comunidade médica.
              </p>
            </div>

            <div className="fc-poss">
              {POSSIBILITIES.map(item => (
                <article key={item.title} className="fc-poss__card" data-reveal>
                  <span className="fc-poss__mark" aria-hidden="true">
                    {item.mark}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="fc-section fc-section--soft" id="como-funciona">
          <div className="fc-container">
            <div className="fc-section__head" data-reveal>
              <p className="fc-kicker">Como funciona</p>
              <h2>Do primeiro contato à presença estratégica.</h2>
            </div>
            <div className="fc-steps">
              {STEPS.map(s => (
                <article key={s.n} className="fc-step" data-reveal>
                  <span className="fc-step__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Campaign results — hidden until enabled with real data */}
        {showCampaignResults && (
          <section className="fc-section" id="resultados" aria-label="Resultados de campanhas">
            <div className="fc-container">
              <div className="fc-section__head" data-reveal>
                <p className="fc-kicker">Resultados</p>
                <h2>Campanhas com impacto mensurável.</h2>
                <p className="fc-note">
                  {CAMPAIGN_RESULTS.campaign}
                  <span className="fc-results__sep" aria-hidden="true">
                    ·
                  </span>
                  Período: {CAMPAIGN_RESULTS.period}
                </p>
              </div>
              <div className="fc-results">
                {CAMPAIGN_RESULTS.items.map(item => (
                  <article key={`${item.value}-${item.label}`} className="fc-results__card" data-reveal>
                    <div className="fc-results__value">{item.value}</div>
                    <p>{item.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="fc-final" id="agendar" data-reveal>
          <div className="fc-container fc-final__inner">
            <p className="fc-kicker fc-kicker--on-dark">Agendamento</p>
            <h2>Sua empresa mais próxima do público médico.</h2>
            <p>
              A Tessy aproxima sua empresa de um público médico qualificado por meio de conteúdos,
              eventos, soluções em destaque e experiências estratégicas.
            </p>
            <p className="fc-final__extra">
              Quer descobrir como sua empresa pode fazer parte da Tessy? Agende uma conversa com
              nosso time.
            </p>
            <MeetingLink className="fc-btn fc-btn--primary fc-btn--lg">
              Agendar uma reunião
            </MeetingLink>
          </div>
        </section>
      </main>

      <footer className="fc-footer">
        <div className="fc-container fc-footer__inner">
          <div>
            <strong>Tessy.app</strong>
            <p>Infraestrutura comercial para saúde.</p>
          </div>
          <nav aria-label="Rodapé">
            <Link to="/">Para médicos</Link>
            <Link to="/para-empresas">Para empresas</Link>
            <a href={`mailto:${TESSY_CONTACT_EMAIL}`}>Contato</a>
            <Link to="/termos">Termos</Link>
            <Link to="/privacidade">Privacidade</Link>
          </nav>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fc-sticky" aria-hidden="false">
        <MeetingLink className="fc-btn fc-btn--primary fc-btn--lg">Agende uma conversa</MeetingLink>
      </div>
    </div>
  );
}

const css = `
.fc {
  --paper: #f7f5f1;
  --ink: #14171c;
  --ink-2: #5a5f69;
  --muted: #8a909a;
  --line: rgba(20,23,28,0.10);
  --card: #ffffff;
  --accent: #F58220;
  --accent-2: #FF9A4D;
  --deep: #14171c;
  --grad: linear-gradient(118deg, #F58220 0%, #FF9A4D 55%, #ffb06a 100%);
  --r: 24px;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  background:
    radial-gradient(900px 420px at 12% -10%, rgba(245,130,32,0.07), transparent 55%),
    radial-gradient(700px 360px at 100% 0%, rgba(245,130,32,0.04), transparent 50%),
    var(--paper);
  color: var(--ink-2);
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-bottom: 88px;
}

.fc *,
.fc *::before,
.fc *::after { box-sizing: border-box; }

.fc a { color: inherit; text-decoration: none; }

.fc h1, .fc h2, .fc h3 {
  font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--ink);
  letter-spacing: -0.035em;
  font-weight: 560;
  margin: 0;
  line-height: 1.08;
}

.fc-container {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
}

[data-reveal] {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
}
[data-reveal].is-in {
  opacity: 1;
  transform: none;
}

/* Nav */
.fc-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  background: rgba(247,245,241,0.88);
  border-bottom: 1px solid var(--line);
}

.fc-nav__inner {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.fc-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.fc-brand span span { color: var(--accent); }

.fc-nav__links {
  display: none;
  align-items: center;
  gap: 22px;
  margin-left: 18px;
  font-size: 14px;
  color: var(--ink-2);
  font-weight: 500;
}
.fc-nav__links a[aria-current="page"] { color: var(--ink); }
.fc-nav__links a:hover { color: var(--ink); }

.fc-nav__actions {
  display: none;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.fc-burger {
  margin-left: auto;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  display: grid;
  place-content: center;
  gap: 5px;
  cursor: pointer;
}
.fc-burger span {
  display: block;
  width: 16px;
  height: 1.5px;
  background: var(--ink);
  border-radius: 2px;
}

.fc-drawer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 20px 20px;
  border-top: 1px solid var(--line);
}
.fc-drawer a {
  padding: 12px 4px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}
.fc-drawer .fc-btn { margin-top: 8px; justify-content: center; }

/* Buttons */
.fc-btn {
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
.fc-btn:active { transform: scale(0.98); }
.fc-btn--lg { min-height: 52px; padding: 0 22px; font-size: 15px; }

.fc-btn--primary {
  background: var(--grad);
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  box-shadow: 0 12px 28px rgba(245,130,32,0.28);
}
.fc a.fc-btn--primary {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

.fc-btn--ghost {
  background: transparent;
  color: var(--ink);
}

.fc-btn--soft {
  background: #fff;
  border-color: var(--line);
  color: var(--ink) !important;
  -webkit-text-fill-color: var(--ink) !important;
  box-shadow: 0 8px 20px rgba(20,23,28,0.05);
}

.fc-btn--light {
  background: #fff;
  color: #14171c !important;
  -webkit-text-fill-color: #14171c !important;
}
.fc a.fc-btn--light {
  color: #14171c !important;
  -webkit-text-fill-color: #14171c !important;
}

.fc-btn--outline-light {
  background: transparent;
  border-color: rgba(255,255,255,0.42);
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

/* Hero */
.fc-hero {
  padding: clamp(64px, 12vw, 120px) 0 clamp(48px, 8vw, 80px);
  text-align: center;
}

.fc-hero__inner { max-width: 820px; }

.fc-kicker {
  margin: 0 0 18px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.fc-kicker--on-dark { color: rgba(255,255,255,0.62); }

.fc-hero h1 {
  font-size: clamp(2.35rem, 6.4vw, 4.25rem);
  font-weight: 580;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.fc-accent-word {
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.fc-lead {
  margin: 22px auto 0;
  max-width: 560px;
  font-size: clamp(1.02rem, 2.2vw, 1.15rem);
  line-height: 1.6;
  color: var(--ink-2);
}

.fc-hero__cta {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

/* Dual cards */
.fc-dual { padding: 12px 0 40px; }

.fc-dual__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.fc-dark {
  background: linear-gradient(160deg, #1a1d24 0%, #101218 100%);
  color: rgba(255,255,255,0.78);
  border-radius: 28px;
  padding: clamp(28px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  min-height: 520px;
  box-shadow: 0 24px 50px rgba(16,18,24,0.18);
}

.fc-dark h2 {
  color: #fff;
  font-size: clamp(1.7rem, 3.5vw, 2.35rem);
  margin: 10px 0 14px;
  max-width: 14ch;
}

.fc-dark > p {
  max-width: 36ch;
  line-height: 1.55;
  font-size: 15px;
}

.fc-dark__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.fc-dark__panel {
  margin-top: auto;
  padding-top: 28px;
}

.fc-dark__panel > strong,
.fc-dark__panel > p {
  display: block;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  backdrop-filter: blur(10px);
}

.fc-dark__panel > strong {
  border-radius: 18px 18px 0 0;
  border-bottom: none;
  padding: 18px 18px 8px;
  color: #fff;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.fc-dark__panel > p {
  border-radius: 0 0 18px 18px;
  border-top: none;
  margin: 0;
  padding: 0 18px 18px;
  font-size: 14px;
  line-height: 1.55;
  color: rgba(255,255,255,0.68);
}

.fc-photo {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  min-height: 520px;
  background: #1a1d24;
  box-shadow: 0 24px 50px rgba(16,18,24,0.12);
}

.fc-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
  min-height: 520px;
}

.fc-photo__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(16,18,24,0.08) 20%, rgba(16,18,24,0.35) 100%),
    radial-gradient(500px 280px at 80% 20%, rgba(245,130,32,0.18), transparent 60%);
  pointer-events: none;
}

.fc-metric {
  position: absolute;
  z-index: 2;
  width: min(240px, calc(100% - 40px));
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.94);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 16px 36px rgba(16,18,24,0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--ink);
}

.fc-metric--a {
  top: 28px;
  left: 22px;
  animation: fc-float 5.5s var(--ease) infinite;
}

.fc-metric--b {
  right: 22px;
  bottom: 28px;
  animation: fc-float 6.2s var(--ease) infinite reverse;
}

.fc-metric__value {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1;
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.fc-metric__label {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.fc-metric p {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-2);
}

@keyframes fc-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Sections */
.fc-section { padding: 72px 0; }
.fc-section--soft {
  background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.2));
}

.fc-section__head {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 36px;
}

.fc-section__head h2 {
  margin-top: 10px;
  font-size: clamp(1.7rem, 4vw, 2.5rem);
}

.fc-note {
  margin: 14px auto 0;
  max-width: 520px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
}

.fc-poss {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.fc-poss__card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 24px 22px;
  box-shadow: 0 10px 28px rgba(20,23,28,0.04);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}
.fc-poss__card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(20,23,28,0.08);
}

.fc-poss__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 14%, #fff);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
}

.fc-poss__card h3 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}
.fc-poss__card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
}

.fc-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.fc-step {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 24px 22px;
}

.fc-step__n {
  display: block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 12px;
}

.fc-step h3 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}
.fc-step p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
}

/* Final CTA */
.fc-final {
  padding: 20px 0 40px;
}

.fc-final__inner {
  text-align: center;
  background: linear-gradient(145deg, #1a1d24, #101218);
  color: rgba(255,255,255,0.75);
  border-radius: 28px;
  padding: clamp(40px, 7vw, 64px) 24px;
  box-shadow: 0 24px 50px rgba(16,18,24,0.16);
}

.fc-final h2 {
  color: #fff;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  max-width: 18ch;
  margin: 0 auto;
}

.fc-final p {
  margin: 14px auto 0;
  max-width: 520px;
  line-height: 1.55;
}

.fc-final__extra {
  margin-top: 18px !important;
  max-width: 460px !important;
  color: rgba(255,255,255,0.88) !important;
  font-weight: 500;
}

.fc-final .fc-btn { margin-top: 28px; }

/* Campaign results */
.fc-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.fc-results__card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 10px 28px rgba(20,23,28,0.04);
}

.fc-results__value {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1;
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.fc-results__card p {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--ink-2);
}

.fc-results__sep {
  margin: 0 8px;
  opacity: 0.55;
}

/* Footer */
.fc-footer {
  padding: 36px 0 28px;
  border-top: 1px solid var(--line);
}

.fc-footer__inner {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.fc-footer strong {
  color: var(--ink);
  font-size: 15px;
}
.fc-footer p {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
}
.fc-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
}

/* Sticky mobile CTA */
.fc-sticky {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, transparent, rgba(247,245,241,0.92) 28%);
  display: flex;
  justify-content: center;
}
.fc-sticky .fc-btn { width: min(420px, 100%); box-shadow: 0 12px 28px rgba(245,130,32,0.3); }

@media (min-width: 760px) {
  .fc { padding-bottom: 0; }
  .fc-sticky { display: none; }
  .fc-burger { display: none; }
  .fc-nav__links,
  .fc-nav__actions { display: flex; }
  .fc-poss { grid-template-columns: 1fr 1fr; gap: 16px; }
  .fc-steps { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .fc-results { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .fc-footer__inner {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

@media (min-width: 960px) {
  .fc-dual__grid {
    grid-template-columns: 1fr 1.05fr;
    gap: 20px;
    align-items: stretch;
  }
  .fc-poss { grid-template-columns: repeat(4, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .fc-metric--a,
  .fc-metric--b { animation: none; }
}
`;
