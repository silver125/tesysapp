import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TessyMark } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Tessy render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
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
              Algo deu errado ao carregar a página
            </h1>
            <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.45, color: '#6F7686' }}>
              Recarregue a página. Se continuar em branco, saia e entre de novo.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  minHeight: 40,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#F58220',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Recarregar
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/entrar'; }}
                style={{
                  minHeight: 40,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1px solid #E3E7F2',
                  background: '#fff',
                  color: '#343949',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Ir para login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
