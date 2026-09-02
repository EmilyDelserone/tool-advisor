import { Card, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import type { RulesFile } from '../engine/types';
import { useWizardState } from '../hooks/useWizardState';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionCard } from './QuestionCard';
import { RecommendationResult } from './RecommendationResult';

type WizardContainerProps = {
  rules: RulesFile;
};

const useStyles = makeStyles({
  stepCard: {
    padding: tokens.spacingVerticalXXL,
  },
  header: {
    marginBottom: tokens.spacingVerticalL,
  },
  eyebrow: {
    display: 'block',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  title: {
    display: 'block',
    marginTop: tokens.spacingVerticalXS,
  },
});

export function WizardContainer({ rules }: WizardContainerProps) {
  const styles = useStyles();
  const wizard = useWizardState(rules);

  if (wizard.recommendation) {
    return (
      <RecommendationResult
        recommendation={wizard.recommendation}
        onRestart={wizard.reset}
        onEditAnswers={wizard.editAnswers}
      />
    );
  }

  if (!wizard.currentQuestion) {
    return null;
  }

  return (
    <main className="wizard-shell">
      <Card className={styles.stepCard}>
        <header className={styles.header}>
          <Text className={styles.eyebrow}>Microsoft Tool Advisor</Text>
          <Title1 as="h1" className={styles.title}>
            Choose the right Microsoft tool
          </Title1>
        </header>

        <ProgressIndicator
          currentIndex={wizard.currentIndex}
          totalQuestions={wizard.totalQuestions}
          isTiebreaker={wizard.isTiebreaker}
          steps={wizard.steps}
          onSelectStep={wizard.goToStep}
        />
        <QuestionCard
          key={wizard.currentQuestion.id}
          question={wizard.currentQuestion}
          selectedValue={wizard.selectedValue}
          isLastQuestion={wizard.isLastQuestion}
          canGoBack={wizard.canGoBack}
          onSelect={wizard.selectAnswer}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      </Card>
    </main>
  );
}
