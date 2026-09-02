import {
  Button,
  Card,
  Radio,
  RadioGroup,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { Question, Tool } from '../engine/types';
import { GlossaryText, findGlossaryEntry } from './GlossaryText';
import { GlossaryTerm } from './GlossaryTerm';
import { ToolIcon } from './ToolIcon';

type QuestionCardProps = {
  question: Question;
  tools?: Tool[];
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
  question: {
    display: 'block',
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalM,
  },
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  options: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalS,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
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
  tools = [],
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

  const toolNamedIn = (text: string) => tools.find((tool) => text.includes(tool.name));
  const questionTool = toolNamedIn(question.text);

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
        <span className={styles.questionRow}>
          {questionTool ? <ToolIcon toolId={questionTool.id} /> : null}
          <Text as="h2" className={styles.question}>
            <GlossaryText text={question.text} />
          </Text>
        </span>

        <RadioGroup
          className={styles.options}
          name={question.id}
          // Explicit label keeps inline glossary triggers out of the group's accessible name
          aria-label={question.text}
          value={selectedValue ?? ''}
          onChange={(_, data) => onSelect(data.value)}
        >
          {options.map((option) => {
            // Trigger sits outside the <label> so opening it cannot select the radio
            const entry = findGlossaryEntry(option.label);
            const optionTool = toolNamedIn(option.label);

            return (
              <div className={styles.option} key={option.id}>
                {optionTool ? <ToolIcon toolId={optionTool.id} /> : null}
                <Radio value={option.id} label={option.label} />
                {entry ? <GlossaryTerm entry={entry} /> : null}
              </div>
            );
          })}
        </RadioGroup>
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
