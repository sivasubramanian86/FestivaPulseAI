import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enterprise React Error Boundary.
 * Catches unhandled runtime render exceptions, prevents white screens,
 * and renders an accessible WCAG 2.1 AAA recovery panel with diagnostic trace.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('FestivaPulseAI ErrorBoundary caught an unhandled exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[340px] flex items-center justify-center p-6 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900/60 rounded-2xl m-4 text-slate-900 dark:text-slate-100 shadow-xl"
        >
          <div className="max-w-xl w-full text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-rose-950 dark:text-rose-100">
                {this.props.fallbackTitle || 'Celebration Cockpit Recovery Alert'}
              </h2>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1.5 leading-relaxed font-sans">
                FestivaPulseAI caught an unexpected runtime error. Your celebration state in local memory remains safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/60 rounded-xl text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto border border-rose-500/20">
                <span className="font-bold text-rose-400 block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.trim().slice(0, 300)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recover Isolated View</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all active:scale-[0.98]"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
