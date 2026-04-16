import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px', margin: '20px', border: '2px solid red', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', zIndex: 9999, position: 'relative' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Une erreur inattendue s'est produite lors de l'affichage du rapport.</h2>
          <p style={{ marginTop: '10px' }}>S'il vous plaît, copiez le message ci-dessous et envoyez-le au développeur :</p>
          <pre style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fca5a5', overflowX: 'auto', fontSize: '12px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
