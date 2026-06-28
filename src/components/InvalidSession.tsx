import { TessyMark } from './ui';

export default function InvalidSession({ onLogout }: { onLogout: () => void | Promise<void> }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#F7F8FF',
      color: '#343949',
    }}>
      <div style={{
        width: 'min(420px, 100%)',
        padding: 22,
        borderRadius: 20,
        background: '#fff',
        border: '1px solid #E3E7F2',
        boxShadow: '0 18px 48px rgba(52,57,73,0.12)',
        textAlign: 'center',
      }}>
        <TessyMark size={40} />
        <h1 style={{ marginTop: 14, fontSize: 20, fontWeight: 650, lineHeight: 1.2 }}>
          Perfil incompleto ou inválido
        </h1>
        <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.45, color: '#6F7686' }}>
          Sua conta existe, mas o tipo de perfil não foi reconhecido. Saia e entre novamente ou recadastre-se.
        </p>
        <button
          type="button"
          onClick={() => { void onLogout(); window.location.href = '/entrar'; }}
          style={{
            marginTop: 16,
            minHeight: 40,
            padding: '0 18px',
            borderRadius: 12,
            border: 'none',
            background: '#343949',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sair e ir para login
        </button>
      </div>
    </div>
  );
}
