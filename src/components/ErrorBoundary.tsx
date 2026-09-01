import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card, Text, Title1 } from '@fluentui/react-components';

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
          <Card className="alert-card" role="alert">
            <Title1 as="h1">Something went wrong</Title1>
            <Text>The advisor hit an unexpected problem. Try again to start a new session.</Text>
            <div>
              <Button
                appearance="primary"
                className="alert-action"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </Button>
            </div>
          </Card>
        </main>
      );
    }

    return this.props.children;
  }
}
