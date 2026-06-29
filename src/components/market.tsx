import type { ReactNode } from 'react';
import { useEffect } from 'react';

/* ──────────────────────────────────────────────────────────────
   Componentes de marketplace (estilo vitrine, photo-first)
   Inspirado em padrões de marketplace/comunidade.
   ────────────────────────────────────────────────────────────── */

/* ── Rail de categorias (atalhos com ícone, scroll horizontal) ── */
export interface CategoryItem {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export function CategoryRail({ items, onSelect }: {
  items: CategoryItem[];
  onSelect: (key: string) => void;
}) {
  return (
    <div className="tessy-category-rail no-scrollbar">
      {items.map(item => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className="tessy-category-rail__item"
        >
          <span className="tessy-category-rail__icon" style={{
            background: item.active
              ? 'linear-gradient(135deg, rgba(245,130,32,0.16), rgba(255,196,140,0.26))'
              : 'var(--card)',
            border: `1px solid ${item.active ? 'rgba(245,130,32,0.45)' : 'var(--line)'}`,
            boxShadow: item.active ? '0 8px 20px rgba(245,130,32,0.18)' : '0 4px 14px rgba(85,96,130,0.06)',
            color: item.active ? 'var(--accent)' : 'var(--ink-2)',
            transition: 'all 0.2s var(--ease)',
          }}>
            {item.icon}
          </span>
          <span style={{
            fontSize: 10.5,
            fontWeight: item.active ? 700 : 560,
            color: item.active ? 'var(--accent-ink)' : 'var(--ink-2)',
            lineHeight: 1.1,
            textAlign: 'center',
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Barra de filtros (chips arredondados com seta) ── */
export function FilterBar({ chips, active, onChange }: {
  chips: [string, string][];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="no-scrollbar"
      style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 12px' }}
    >
      {chips.map(([value, label]) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: 999,
              border: `1px solid ${isActive ? 'transparent' : 'var(--line)'}`,
              background: isActive ? 'var(--accent)' : 'var(--card)',
              color: isActive ? '#fff' : 'var(--ink-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 8px 18px rgba(245,130,32,0.22)' : 'none',
              transition: 'all 0.18s var(--ease)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Breadcrumb (início › seção) ── */
export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 11.5,
              fontWeight: isLast ? 700 : 600,
              color: i === 0 ? 'var(--accent)' : isLast ? 'var(--ink)' : 'var(--ink-2)',
              textTransform: 'lowercase',
            }}>
              {item}
            </span>
            {!isLast && <span style={{ fontSize: 11, color: 'var(--muted)' }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

/* ── Grid de vitrine (2 colunas, photo-first) ── */
export function MarketGrid({ children }: { children: ReactNode }) {
  return (
    <div className="tessy-market-grid">
      {children}
    </div>
  );
}

/* ── Card de vitrine (foto grande + selos + preço/título) ── */
export function MarketCard({
  image,
  topLeft,
  topRight,
  highlight,
  highlightStrike,
  title,
  subtitle,
  tag,
  onClick,
  aspect = '4 / 5',
}: {
  image?: string;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  highlight?: string;
  highlightStrike?: string;
  title: string;
  subtitle?: string;
  tag?: ReactNode;
  onClick?: () => void;
  aspect?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        padding: 0,
        boxShadow: '0 4px 16px rgba(85,96,130,0.05)',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspect,
        background: image
          ? `url(${image}) center/cover`
          : 'linear-gradient(135deg, rgba(74,168,255,0.20), rgba(185,193,234,0.30))',
      }}>
        {topLeft && (
          <div style={{ position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 5 }}>{topLeft}</div>
        )}
        {topRight && (
          <div style={{ position: 'absolute', right: 8, top: 8 }}>{topRight}</div>
        )}
      </div>
      <div style={{ padding: '9px 10px 12px', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {(highlight || highlightStrike) && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {highlight && <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>{highlight}</span>}
            {highlightStrike && <span style={{ fontSize: 11.5, color: 'var(--muted)', textDecoration: 'line-through' }}>{highlightStrike}</span>}
          </div>
        )}
        <div style={{
          fontSize: 13, fontWeight: 560, color: 'var(--ink)', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </div>
        )}
        {tag && <div style={{ marginTop: 4 }}>{tag}</div>}
      </div>
    </button>
  );
}

/* ── Selo flutuante sobre a foto (ex.: 15%, Amostra, data) ── */
export function PhotoBadge({ children, color = 'var(--success)', solid = true }: {
  children: ReactNode;
  color?: string;
  solid?: boolean;
}) {
  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: 8,
      background: solid ? color : 'rgba(255,255,255,0.92)',
      color: solid ? '#fff' : 'var(--ink)',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.02em',
      boxShadow: '0 6px 14px rgba(15,22,38,0.18)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

/* ── Botão circular de favoritar (canto da foto) ── */
export function SaveButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={e => { e.stopPropagation(); onToggle(); }}
      onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onToggle(); } }}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 6px 14px rgba(15,22,38,0.18)',
        cursor: 'pointer',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24"
        fill={saved ? 'var(--accent)' : 'none'}
        stroke={saved ? 'var(--accent)' : '#6F7A90'} strokeWidth="2">
        <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ── Bottom sheet (painel de detalhes do anúncio) ── */
export function Sheet({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
        background: 'rgba(15,18,30,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-up"
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '92vh', overflowY: 'auto',
          background: 'var(--card)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: '0 -20px 60px rgba(15,18,30,0.30)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--card)', padding: '10px 0 6px', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <div style={{ width: 44, height: 4, borderRadius: 999, background: 'rgba(52,57,73,0.16)', margin: '0 auto' }} />
        </div>
        {children}
      </div>
    </div>
  );
}
