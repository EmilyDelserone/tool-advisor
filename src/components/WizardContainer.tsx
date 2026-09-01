import type { RulesFile } from '../engine/types';
import { useWizardState } from '../hooks/useWizardState';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionCard } from './QuestionCard';
import { RecommendationResult } from './RecommendationResult';

type WizardContainerProps = {
  rules: RulesFile;
};

export function WizardContainer({ rules }: WizardContainerProps) {
  const wizard = useWizardState(rules);

  if (wizard.recommendation) {
    return <RecommendationResult recommendation={wizard.recommendation} onRestart={wizard.reset} />;
  }

  if (!wizard.currentQuestion) {
    return null;
  }

  return (
    <main className="wizard-shell">
      <div className="wizard-card">
        <header className="wizard-header">
          <p className="wizard-eyebrow">Microsoft Tool Advisor</p>
          <h1 className="wizard-title">Choose the right Microsoft tool</h1>
        </header>

        <ProgressIndicator
          currentIndex={wizard.currentIndex}
          totalQuestions={wizard.totalQuestions}
          isTiebreaker={wizard.isTiebreaker}
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
      </div>
    </main>
  );
}
