import type { CSSProperties } from 'react';
import { ProgressBar, Text, makeStyles, tokens } from '@fluentui/react-components';

type FitScoreBarProps = {
  toolName: string;
  fitScore: number;
  /** Position in the results list, used to stagger the fill animation */
  order?: number;
};

const FILL_DURATION_MS = 500;
const STAGGER_MS = 120;

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: '140px',
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
  },
  bar: {
    '& .fui-ProgressBar__bar': {
      animationName: {
        from: { transform: 'scaleX(0)' },
        to: { transform: 'scaleX(1)' },
      },
      animationDuration: `var(--fit-bar-duration, ${FILL_DURATION_MS}ms)`,
      animationTimingFunction: tokens.curveEasyEase,
      animationDelay: 'var(--fit-bar-delay, 0ms)',
      animationFillMode: 'backwards',
      transformOrigin: 'left center',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '& .fui-ProgressBar__bar': {
        animationName: 'none',
      },
    },
  },
});

export function FitScoreBar({ toolName, fitScore, order = 0 }: FitScoreBarProps) {
  const styles = useStyles();
  const label = `${fitScore}% fit`;

  return (
    <div className={styles.root}>
      <Text size={200} className={styles.label}>
        {label}
      </Text>
      <ProgressBar
        className={styles.bar}
        style={{ '--fit-bar-delay': `${order * STAGGER_MS}ms` } as CSSProperties}
        thickness="large"
        value={fitScore}
        max={100}
        aria-label={`Fit score for ${toolName}`}
        aria-valuenow={fitScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${toolName}: ${label}`}
      />
    </div>
  );
}
