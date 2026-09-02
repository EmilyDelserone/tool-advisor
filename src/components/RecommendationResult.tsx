import { Button, Card, Link, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import type { Recommendation } from '../engine/types';
import { ComparisonTable } from './ComparisonTable';
import { FitScoreBar } from './FitScoreBar';
import { GlossaryText } from './GlossaryText';

type RecommendationResultProps = {
  recommendation: Recommendation;
  onRestart: () => void;
  onEditAnswers?: () => void;
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
  fit: {
    maxWidth: '260px',
    marginBottom: tokens.spacingVerticalM,
  },
  justification: {
    display: 'block',
  },
  actions: {
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  learnMore: {
    marginTop: tokens.spacingVerticalL,
    paddingTop: tokens.spacingVerticalM,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    display: 'grid',
    gap: tokens.spacingVerticalXS,
    justifyItems: 'start',
  },
  learnMoreHeading: {
    fontWeight: tokens.fontWeightBold,
  },
  // DR-002 requires a 44px minimum touch target; Fluent's default is 32px
  button: {
    minHeight: '44px',
  },
});

export function RecommendationResult({
  recommendation,
  onRestart,
  onEditAnswers,
}: RecommendationResultProps) {
  const styles = useStyles();

  return (
    <main className="result-shell">
      <Card className={styles.winnerCard}>
        <Text className={styles.eyebrow}>Recommended tool</Text>
        <Title1 as="h1" className={styles.title}>
          {recommendation.primaryTool.name}
        </Title1>
        <div className={styles.fit}>
          <FitScoreBar
            toolName={recommendation.primaryTool.name}
            fitScore={recommendation.fitScore}
          />
        </div>
        <Text size={400} className={styles.justification}>
          <GlossaryText text={recommendation.justification} />
        </Text>

        <div className={styles.learnMore}>
          <Text className={styles.learnMoreHeading}>Learn more</Text>
          <Link
            href={recommendation.primaryTool.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {recommendation.primaryTool.name} documentation on Microsoft Learn (opens in a new tab)
          </Link>
        </div>

        <div className={styles.actions}>
          {onEditAnswers ? (
            <Button
              className={styles.button}
              appearance="secondary"
              type="button"
              onClick={onEditAnswers}
            >
              Change an answer
            </Button>
          ) : null}
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
