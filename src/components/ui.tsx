import type { ReactNode, CSSProperties } from 'react';

/* ── Mono label ── */
export function Mono({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <span
      className={`mono ${className ?? ''}`}
      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', ...style }}
    >
      {children}
    </span>
  );
}

/* ── Company/entity mark (colored square w/ initials) ── */
export function CompanyMark({
  code, tint, size = 44, radius,
}: { code: string; tint: string; size?: number; radius?: number }) {
  const hex = tint.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const fg = lum > 150 ? '#0F1626' : '#fff';
  const rr = radius ?? Math.round(size / 3.5);
  return (
    <div style={{
      width: size, height: size, borderRadius: rr,
      background: tint, color: fg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", fontWeight: 700,
      fontSize: Math.round(size * 0.35), letterSpacing: '-0.02em',
    }}>
      {code}
    </div>
  );
}

/* ── Verified checkmark badge ── */
export function VerifiedDot({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill="#2E7BFF" />
      <path d="M4 7.2l2 2L10 5.2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── WhatsApp icon ── */
export function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

/* ── Modality badge ── */
export function ModalityBadge({ modality }: { modality: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
    online:     { label: 'Online',     bg: 'rgba(30,169,124,0.12)', color: '#1EA97C', border: 'rgba(30,169,124,0.3)' },
    presencial: { label: 'Presencial', bg: 'rgba(245,130,32,0.12)', color: '#F58220', border: 'rgba(245,130,32,0.3)' },
    hibrido:    { label: 'Híbrido',    bg: 'rgba(46,123,255,0.12)', color: '#6FA4FF', border: 'rgba(46,123,255,0.3)' },
  };
  const c = cfg[modality] ?? { label: modality, bg: 'rgba(111,122,144,0.12)', color: '#6F7A90', border: 'rgba(111,122,144,0.3)' };
  return (
    <span style={{
      padding: '4px 9px', borderRadius: 999,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
    }}>
      {c.label}
    </span>
  );
}

/* ── Small pill chip (category badge) ── */
export function Chip({ children, color = '#2E7BFF' }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      padding: '4px 9px', borderRadius: 999,
      background: `${color}18`, color,
      border: `1px solid ${color}35`,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

/* ── Gradient banner card ── */
export function BannerCard({
  tint1, tint2, month, day, format, children,
}: {
  tint1: string; tint2: string; month?: string; day?: string; format?: string; children: ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 20,
      border: '1px solid var(--line)', overflow: 'hidden',
    }}>
      {/* banner */}
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${tint1} 0%, ${tint2} 100%)`,
        position: 'relative', padding: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        {/* hatching overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          background: 'repeating-linear-gradient(45deg,#fff 0 1.5px,transparent 1.5px 14px)',
        }} />
        {/* format pill */}
        {format && (
          <div style={{
            position: 'relative',
            padding: '5px 9px', borderRadius: 6,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            color: '#fff', fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          }}>{format}</div>
        )}
        {/* date badge */}
        {month && day && (
          <div style={{
            position: 'relative',
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#0F1626',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2E7BFF', letterSpacing: '0.1em' }}>{month}</div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{day}</div>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>{children}</div>
    </div>
  );
}

/* ── Compact row card (list item) ── */
export function RowCard({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', gap: 12, padding: '12px 14px',
      background: 'var(--card)', borderRadius: 16,
      border: '1px solid var(--line)', cursor: onClick ? 'pointer' : 'default',
    }}>
      {children}
    </div>
  );
}

/* ── Button ── */
export function Btn({
  children, onClick, variant = 'primary', size = 'md', disabled, href, target,
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'whatsapp' | 'ghost';
  size?: 'sm' | 'md' | 'lg'; disabled?: boolean; href?: string; target?: string;
}) {
  const styles: Record<string, CSSProperties> = {
    primary:   { background: '#2E7BFF', color: '#fff', border: 'none' },
    secondary: { background: 'var(--chip)', color: 'var(--ink)', border: '1px solid var(--line)' },
    whatsapp:  { background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' },
    ghost:     { background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line)' },
  };
  const sz: Record<string, CSSProperties> = {
    sm: { padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600 },
    md: { padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600 },
    lg: { padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 600 },
  };
  const base: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontFamily: "'Inter', sans-serif",
    transition: 'opacity 0.15s',
    textDecoration: 'none',
    ...styles[variant],
    ...sz[size],
  };
  if (href) return <a href={href} target={target} style={base}>{children}</a>;
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}
