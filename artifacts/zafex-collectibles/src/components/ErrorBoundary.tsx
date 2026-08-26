import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, ArrowLeft } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-5">
          <div className="max-w-lg w-full bg-[#faf8f4] border border-[#d8d0c2] rounded-2xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#1a1208] text-[#d4af37] flex items-center justify-center mx-auto shadow-md border border-[#d4af37]/30">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#8b6914] block">
                EXPERIENCING AN INTERRUPTED JOURNEY
              </span>
              <h1 className="font-serif text-[24px] sm:text-[30px] font-bold text-[#1a1208] uppercase tracking-[1px] leading-tight">
                Something Went Awry
              </h1>
              <p className="font-sans text-[13px] sm:text-[14px] text-[#555047] leading-relaxed max-w-md mx-auto">
                We encountered an unexpected issue while assembling this page. Our master craftsmen have recorded the disturbance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a18] hover:bg-[#d4af37] text-white hover:text-[#1a1208] font-serif text-[11px] uppercase font-bold tracking-[1.5px] rounded-xl transition duration-200 shadow"
              >
                <RefreshCw size={14} /> Refresh Page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#ede7dd] text-[#1a1208] border border-[#d4cdc4] font-serif text-[11px] uppercase font-bold tracking-[1.5px] rounded-xl transition duration-200"
              >
                <Home size={14} /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
