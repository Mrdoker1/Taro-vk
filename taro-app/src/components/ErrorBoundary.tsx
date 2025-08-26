import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary поймал ошибку:', error, errorInfo);
    
    // В случае ошибки маршрутизации перенаправляем на главную
    if (error.message.includes('route') || error.message.includes('navigation')) {
      window.location.hash = '#/';
    }
  }

  public render() {
    if (this.state.hasError) {
      // Возвращаем fallback UI или перенаправляем на главную
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Перенаправляем на главную страницу
      setTimeout(() => {
        window.location.hash = '#/';
        this.setState({ hasError: false });
      }, 100);
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#19191a',
          color: '#ffffff',
          fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h2 style={{ marginBottom: '16px' }}>Упс! Что-то пошло не так</h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>
              Перенаправляем на главную страницу...
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
