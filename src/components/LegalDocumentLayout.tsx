import { Link } from 'react-router-dom';
import { TessyMark } from './ui';

type Section = { title: string; body: string };

export default function LegalDocumentLayout({
  title,
  subtitle,
  version,
  sections,
}: {
  title: string;
  subtitle: string;
  version?: string;
  sections: readonly Section[];
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <header style={{
        padding: '16px clamp(20px, 5vw, 72px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(247,248,255,0.92)', backdropFilter: 'blur(14px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <TessyMark size={36} />
          <span style={{ fontWeight: 560, fontSize: 18, color: 'var(--accent-ink)' }}>
            Tessy<span style={{ color: 'var(--lavender)' }}>.app</span>
          </span>
        </Link>
        <Link to="/cadastro" style={{ fontSize: 14, fontWeight: 560, color: 'var(--accent-ink)', textDecoration: 'none' }}>
          Cadastrar
        </Link>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 64px' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Documento legal
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 560, lineHeight: 1.12, color: 'var(--accent-ink)', marginBottom: 8 }}>
          {title}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: version ? 8 : 28 }}>
          {subtitle}
        </p>
        {version && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
            Versão {version}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sections.map(section => (
            <section key={section.title}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--accent-ink)', marginBottom: 8 }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p style={{ marginTop: 40, fontSize: 13, color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--accent-ink)', textDecoration: 'none' }}>← Voltar ao início</Link>
        </p>
      </main>
    </div>
  );
}
