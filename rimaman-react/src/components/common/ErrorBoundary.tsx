import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // TODO: Envoyer à un service de monitoring (Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <Icon 
                name="error" 
                className="text-error mx-auto mb-4" 
                size="xl"
                filled
              />
              <h1 className="text-3xl font-black text-on-surface font-headline mb-4">
                Oups ! Une erreur est survenue
              </h1>
              <p className="text-on-surface-variant mb-6">
                Quelque chose s'est mal passé. Rechargez la page ou revenez à l'accueil.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-error-container p-4 rounded-lg mb-6">
                  <summary className="cursor-pointer font-bold text-on-error-container mb-2">
                    Détails de l'erreur (dev only)
                  </summary>
                  <pre className="text-xs overflow-auto text-on-error-container">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Retour à l'accueil
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
