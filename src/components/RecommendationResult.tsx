import { Button, Card, Link, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import type { Recommendation } from '../engine/types';
import { ComparisonTable } from './ComparisonTable';
import { FitScoreBar } from './FitScoreBar';
import { GlossaryText } from './GlossaryText';
import { ToolIcon } from './ToolIcon';

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
  comboCard: {
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorNeutralBackground2,
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
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  comboTools: {
    display: 'grid',
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalM,
  },
  comboTool: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: tokens.spacingHorizontalM,
    alignItems: 'center',
  },
  comboRole: {
    gridColumn: '2',
    color: tokens.colorNeutralForeground2,
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
  const comboTools = recommendation.comboTools;
  const displayName = comboTools
    ? comboTools.map(({ tool }) => tool.name).join(' + ')
    : recommendation.primaryTool.name;

  return (
    <main className="result-shell">
      <Card className={comboTools ? styles.comboCard : styles.winnerCard}>
        <Text className={styles.eyebrow}>
          {comboTools ? 'Recommended combination' : 'Recommended tool'}
        </Text>
        <div className={styles.titleRow}>
          {comboTools ? (
            comboTools.map(({ tool }) => <ToolIcon key={tool.id} toolId={tool.id} size="large" />)
          ) : (
            <ToolIcon toolId={recommendation.primaryTool.id} size="large" />
          )}
          <Title1 as="h1" className={styles.title}>
            {displayName}
          </Title1>
        </div>
        {comboTools ? (
          <div className={styles.comboTools}>
            {comboTools.map(({ tool, role }) => (
              <div className={styles.comboTool} key={tool.id}>
                <Text weight="semibold">{tool.name}</Text>
                <Text className={styles.comboRole}>{role}</Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.fit}>
            <FitScoreBar
              toolName={recommendation.primaryTool.name}
              fitScore={recommendation.fitScore}
              order={0}
            />
          </div>
        )}
        <Text size={400} className={styles.justification}>
          <GlossaryText text={recommendation.justification} />
        </Text>

        <div className={styles.learnMore}>
          <Text className={styles.learnMoreHeading}>Learn more</Text>
          {comboTools
            ? comboTools.map(({ tool }) => (
                <Link key={tool.id} href={tool.docsUrl} target="_blank" rel="noopener noreferrer">
                  {tool.name} documentation on Microsoft Learn (opens in a new tab)
                </Link>
              ))
            : (
                <Link
                  href={recommendation.primaryTool.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {recommendation.primaryTool.name} documentation on Microsoft Learn (opens in a new tab)
                </Link>
              )}
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
