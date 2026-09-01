import { ProgressBar, makeStyles, tokens } from '@fluentui/react-components';

type ProgressIndicatorProps = {
  currentIndex: number;
  totalQuestions: number;
  isTiebreaker?: boolean;
};

const useStyles = makeStyles({
  root: {
    marginBottom: tokens.spacingVerticalL,
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
});

export function ProgressIndicator({
  currentIndex,
  totalQuestions,
  isTiebreaker = false,
}: ProgressIndicatorProps) {
  const styles = useStyles();
  const currentPosition = currentIndex + 1;
  const progress = (currentPosition / totalQuestions) * 100;
  const label = isTiebreaker
    ? `Tiebreaker question ${currentPosition} of ${totalQuestions}`
    : `Question ${currentPosition} of ${totalQuestions}`;

  return (
    <div className={styles.root}>
      <div className={styles.labels} aria-live="polite">
        <span>{label}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <ProgressBar
        thickness="large"
        aria-label="Wizard progress"
        aria-valuenow={currentPosition}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-valuetext={label}
        value={currentPosition}
        max={totalQuestions}
      />
    </div>
  );
}
