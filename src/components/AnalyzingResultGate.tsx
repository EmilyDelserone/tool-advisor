import { Component, type ReactNode } from 'react';
import { Card, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';

type AnalyzingResultGateProps = {
  children: ReactNode;
  delayMs?: number;
};

type AnalyzingResultGateState = {
  ready: boolean;
};

const DEFAULT_DELAY_MS = 700;

const useStyles = makeStyles({
  shell: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  card: {
    minHeight: '220px',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
  },
  text: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

function AnalyzingState() {
  const styles = useStyles();

  return (
    <main className={styles.shell} aria-busy="true">
      <Card className={styles.card} role="status" aria-live="polite">
        <Spinner size="large" />
        <Text size={400} className={styles.text}>
          Analyzing your answers...
        </Text>
      </Card>
    </main>
  );
}

export class AnalyzingResultGate extends Component<
  AnalyzingResultGateProps,
  AnalyzingResultGateState
> {
  state: AnalyzingResultGateState = { ready: false };

  private timer: number | undefined;

  componentDidMount() {
    this.timer = window.setTimeout(() => {
      this.setState({ ready: true });
    }, this.props.delayMs ?? DEFAULT_DELAY_MS);
  }

  componentWillUnmount() {
    if (this.timer !== undefined) {
      window.clearTimeout(this.timer);
    }
  }

  render() {
    if (!this.state.ready) {
      return <AnalyzingState />;
    }

    return this.props.children;
  }
}