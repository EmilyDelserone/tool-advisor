import {
  Button,
  Card,
  Field,
  Radio,
  RadioGroup,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { Question } from '../engine/types';

type QuestionCardProps = {
  question: Question;
  selectedValue?: string;
  isLastQuestion: boolean;
  canGoBack: boolean;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

const useStyles = makeStyles({
  form: {
    display: 'grid',
    gap: tokens.spacingVerticalL,
  },
  optionsCard: {
    padding: tokens.spacingVerticalL,
  },
  options: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalS,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  // DR-002 requires a 44px minimum touch target; Fluent's default is 32px
  button: {
    minHeight: '44px',
  },
});

export function QuestionCard({
  question,
  selectedValue,
  isLastQuestion,
  canGoBack,
  onSelect,
  onNext,
  onBack,
}: QuestionCardProps) {
  const styles = useStyles();
  const options = question.options ?? [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ];

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedValue) {
          onNext();
        }
      }}
    >
      <Card className={styles.optionsCard}>
        <Field label={question.text} size="large">
          <RadioGroup
            className={styles.options}
            name={question.id}
            value={selectedValue ?? ''}
            onChange={(_, data) => onSelect(data.value)}
          >
            {options.map((option) => (
              <Radio key={option.id} value={option.id} label={option.label} />
            ))}
          </RadioGroup>
        </Field>
      </Card>

      <div className={styles.actions}>
        <Button
          className={styles.button}
          appearance="secondary"
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button
          className={styles.button}
          appearance="primary"
          type="submit"
          disabled={!selectedValue}
        >
          {isLastQuestion ? 'See recommendation' : 'Next'}
        </Button>
      </div>
    </form>
  );
}
