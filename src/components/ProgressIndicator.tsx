import { Button, ProgressBar, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import type { WizardStep } from '../hooks/useWizardState';

type ProgressIndicatorProps = {
  currentIndex: number;
  totalQuestions: number;
  answeredCount?: number;
  isTiebreaker?: boolean;
  steps?: WizardStep[];
  onSelectStep?: (index: number) => void;
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
  steps: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
    padding: 0,
    listStyleType: 'none',
  },
  step: {
    minWidth: '44px',
    minHeight: '44px',
  },
  current: {
    fontWeight: tokens.fontWeightBold,
  },
});

export function ProgressIndicator({
  currentIndex,
  totalQuestions,
  answeredCount = 0,
  isTiebreaker = false,
  steps,
  onSelectStep,
}: ProgressIndicatorProps) {
  const styles = useStyles();
  const currentPosition = currentIndex + 1;
  // Completion counts answered questions, so nothing is "complete" before the first answer
  const progress = (answeredCount / totalQuestions) * 100;
  const label = isTiebreaker
    ? `Tiebreaker question ${currentPosition} of ${totalQuestions}`
    : `Question ${currentPosition} of ${totalQuestions}`;
  const completionText = `${answeredCount} of ${totalQuestions} questions answered`;

  return (
    <div className={styles.root}>
      <div className={styles.labels} aria-live="polite">
        <span>{label}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <ProgressBar
        thickness="large"
        aria-label="Wizard progress"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuetext={completionText}
        value={answeredCount}
        max={totalQuestions}
      />

      {steps && onSelectStep ? (
        <nav aria-label="Wizard steps">
          <ol className={styles.steps}>
            {steps.map((step) => {
              const isCurrent = step.index === currentIndex;
              const stepLabel = step.isTiebreaker
                ? `Tiebreaker question: ${step.label}`
                : `Question ${step.index + 1}: ${step.label}`;

              return (
                <li key={step.id}>
                  <Button
                    className={mergeClasses(styles.step, isCurrent && styles.current)}
                    appearance={isCurrent ? 'primary' : step.answered ? 'outline' : 'subtle'}
                    shape="circular"
                    type="button"
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`${stepLabel}${step.answered ? ' (answered)' : ''}`}
                    disabled={!step.reachable || step.isTiebreaker}
                    onClick={() => onSelectStep(step.index)}
                  >
                    {step.index + 1}
                  </Button>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
    </div>
  );
}
