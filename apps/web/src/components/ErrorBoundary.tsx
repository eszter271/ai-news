import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AI News] React error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: '#0a0a0a',
            color: '#fafafa',
            fontFamily: 'system-ui, sans-serif',
            padding: 24,
            textAlign: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>渲染出错</div>
          <div
            style={{
              fontSize: 13,
              color: '#a1a1a1',
              maxWidth: 320,
              lineHeight: 1.6,
              wordBreak: 'break-all',
            }}
          >
            {this.state.error.message}
          </div>
          <button
            onClick={() => location.reload()}
            style={{
              background: '#fafafa',
              color: '#0a0a0a',
              padding: '8px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            刷新重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
