import { ProgressBar, Text, makeStyles, tokens } from '@fluentui/react-components';

type FitScoreBarProps = {
  toolName: string;
  fitScore: number;
};

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    minWidth: '140px',
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

export function FitScoreBar({ toolName, fitScore }: FitScoreBarProps) {
  const styles = useStyles();
  const label = `${fitScore}% fit`;

  return (
    <div className={styles.root}>
      <Text size={200} className={styles.label}>
        {label}
      </Text>
      <ProgressBar
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
