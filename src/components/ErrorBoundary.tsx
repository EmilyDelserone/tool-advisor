import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Local-only reporting: no telemetry leaves the browser (Constitution II)
    console.error('Tool Advisor error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="wizard-shell">
          <div className="wizard-card" role="alert">
            <h1 className="wizard-title">Something went wrong</h1>
            <p>The advisor hit an unexpected problem. Try again to start a new session.</p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
