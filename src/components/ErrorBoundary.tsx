import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary - Catches JavaScript errors anywhere in the child component tree
 * Prevents white screen crashes by showing a friendly error UI
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // TODO: Send to error tracking service (Sentry, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl text-ocean-800 mb-2">
              Something went wrong
            </h1>

            {/* Message */}
            <p className="text-ocean-600 mb-6">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>

            {/* Error details (collapsed by default) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-sage-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-ocean-700">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-sage-200 text-ocean-700 rounded-lg font-medium hover:bg-sage-300 transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Report link */}
            <p className="mt-6 text-sm text-ocean-500">
              Keep seeing this?{' '}
              <a
                href="/bounty"
                className="text-gold-600 hover:text-gold-700 underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Use direct navigation to avoid router issues
                  window.location.href = '/bounty';
                }}
              >
                Report a bug (earn $30)
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
