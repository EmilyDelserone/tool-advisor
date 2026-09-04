import { Card, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import { useState } from 'react';
import type { RulesFile } from '../engine/types';
import { useWizardState } from '../hooks/useWizardState';
import { AnalyzingResultGate } from './AnalyzingResultGate';
import { IntroScreen } from './IntroScreen';
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
  const [hasStarted, setHasStarted] = useState(false);
  const wizard = useWizardState(rules);

  const restart = () => {
    wizard.reset();
    setHasStarted(false);
  };

  if (!hasStarted) {
    return <IntroScreen onGetStarted={() => setHasStarted(true)} />;
  }

  if (wizard.recommendation) {
    return (
      <AnalyzingResultGate key={wizard.recommendation.generatedAt}>
        <RecommendationResult
          recommendation={wizard.recommendation}
          onRestart={restart}
          onEditAnswers={wizard.editAnswers}
        />
      </AnalyzingResultGate>
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
          answeredCount={wizard.answeredCount}
          isTiebreaker={wizard.isTiebreaker}
          steps={wizard.steps}
          onSelectStep={wizard.goToStep}
        />
        <QuestionCard
          key={wizard.currentQuestion.id}
          question={wizard.currentQuestion}
          tools={rules.tools}
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
