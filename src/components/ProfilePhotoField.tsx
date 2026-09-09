import { useRef } from 'react';
import { humanizeFieldLabel } from '../lib/uiHelpers';
import { validateImageFile } from '../lib/imageUpload';

export default function ProfilePhotoField({
  label,
  preview,
  onChange,
  showRemove = true,
  error,
  onValidationError,
}: {
  label: string;
  preview: string;
  onChange: (file: File | null) => void;
  showRemove?: boolean;
  error?: string;
  onValidationError?: (message: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePick(file: File | null) {
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        if (inputRef.current) inputRef.current.value = '';
        onValidationError?.(validationError);
        return;
      }
    }
    onValidationError?.(null);
    onChange(file);
  }

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 560, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 8 }}>
        {humanizeFieldLabel(label)}
      </label>
      <div style={{ margin: '-3px 0 8px', fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35 }}>
        Toque para escolher uma imagem da fototeca ou galeria. Máx. 5 MB.
      </div>
      <label style={{
        position: 'relative',
        display: 'block',
        minHeight: 132,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        border: preview ? '2px solid var(--accent)' : '1px dashed rgba(245,130,32,0.45)',
        background: preview
          ? `linear-gradient(135deg, rgba(18,24,40,0.28), rgba(245,130,32,0.16)), url(${preview}) center/cover`
          : 'linear-gradient(135deg, rgba(245,130,32,0.12), rgba(185,193,234,0.18))',
        boxShadow: '0 8px 24px rgba(90,80,130,0.08)',
      }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={event => handlePick(event.target.files?.[0] ?? null)}
          style={{ display: 'none' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: preview ? 'linear-gradient(180deg, rgba(15,22,38,0.04), rgba(15,22,38,0.42))' : 'transparent',
        }} />
        <div style={{
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 560, color: preview ? '#fff' : 'var(--ink)', lineHeight: 1.15 }}>
              {preview ? 'Foto pronta ✓' : 'Adicionar foto'}
            </div>
            <div style={{ marginTop: 3, fontSize: 11.5, color: preview ? 'rgba(255,255,255,0.76)' : 'var(--ink-2)', lineHeight: 1.3 }}>
              {preview ? 'Toque para trocar' : 'Fototeca ou galeria · JPG, PNG, HEIC'}
            </div>
          </div>
          <span style={{
            flexShrink: 0,
            padding: '9px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--ink)',
            fontSize: 12,
            fontWeight: 560,
          }}>
            {preview ? 'Trocar' : '📷 Foto'}
          </span>
        </div>
      </label>
      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#F25C54', lineHeight: 1.35 }}>{error}</div>
      )}
      {preview && showRemove && (
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = '';
            onChange(null);
          }}
          style={{
            marginTop: 8,
            padding: '7px 10px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--chip)',
            color: 'var(--ink-2)',
            fontSize: 11.5,
            fontWeight: 560,
            cursor: 'pointer',
          }}
        >
          Remover foto
        </button>
      )}
    </div>
  );
}
