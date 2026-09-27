import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper p-6">
          <div className="w-full max-w-md rounded-4xl border border-line bg-paper p-10 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-clay-tint">
              <AlertTriangle className="h-8 w-8 text-clay" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold">Something went wrong</h1>
            <p className="mt-3 text-sm text-ink-soft">
              The page hit an unexpected error. Try reloading — if it keeps happening, let us know.
            </p>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs text-ink-mute hover:text-ink-soft">
                  Show details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-2xl bg-slate-tint p-3 text-[11px] text-ink-soft">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button onClick={this.handleReload} className="btn-glow mt-8">
              <RotateCcw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
