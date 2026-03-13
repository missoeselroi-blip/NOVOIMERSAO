import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Ops! Algo deu errado.</h2>
          <p className="text-stone-600 dark:text-zinc-400 max-w-md mb-8">
            Ocorreu um erro inesperado ao carregar esta página. Tente recarregar ou volte mais tarde.
          </p>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-red-100 dark:border-red-900/20 mb-8 w-full max-w-lg overflow-auto">
            <code className="text-xs text-red-500 font-mono">
              {this.state.error?.message || 'Erro desconhecido'}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            <RefreshCw size={20} />
            RECARREGAR PÁGINA
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
