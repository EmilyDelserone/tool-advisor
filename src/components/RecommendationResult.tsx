import { Button, Card, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import type { Recommendation } from '../engine/types';
import { ComparisonTable } from './ComparisonTable';

type RecommendationResultProps = {
  recommendation: Recommendation;
  onRestart: () => void;
};

const useStyles = makeStyles({
  winnerCard: {
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorBrandBackground2,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorBrandStroke2}`,
    boxShadow: tokens.shadow16,
  },
  eyebrow: {
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: tokens.colorBrandForeground2,
    fontWeight: tokens.fontWeightBold,
  },
  title: {
    display: 'block',
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalM,
  },
  justification: {
    display: 'block',
  },
  actions: {
    marginTop: tokens.spacingVerticalL,
  },
  // DR-002 requires a 44px minimum touch target; Fluent's default is 32px
  button: {
    minHeight: '44px',
  },
});

export function RecommendationResult({ recommendation, onRestart }: RecommendationResultProps) {
  const styles = useStyles();

  return (
    <main className="result-shell">
      <Card className={styles.winnerCard}>
        <Text className={styles.eyebrow}>Recommended tool</Text>
        <Title1 as="h1" className={styles.title}>
          {recommendation.primaryTool.name}
        </Title1>
        <Text size={400} className={styles.justification}>
          {recommendation.justification}
        </Text>

        <div className={styles.actions}>
          <Button
            className={styles.button}
            appearance="primary"
            type="button"
            onClick={onRestart}
          >
            Start over
          </Button>
        </div>
      </Card>

      <ComparisonTable runnerUps={recommendation.runnerUps} />
    </main>
  );
}
