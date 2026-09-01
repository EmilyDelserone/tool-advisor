import { useMemo, useState } from 'react';
import rulesData from './data/rules.json';
import { answerToSignals, findPrimaryRecommendation } from './engine/recommendationEngine';
import type { Answer, Question, Recommendation, RulesFile } from './engine/types';
import { ProgressIndicator } from './components/ProgressIndicator';
import { QuestionCard } from './components/QuestionCard';
import { RecommendationResult } from './components/RecommendationResult';

const rules = rulesData as RulesFile;

const orderedQuestions = [...rules.questions].sort((a, b) => a.position - b.position);

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const currentQuestion = useMemo<Question | undefined>(
    () => orderedQuestions[currentIndex],
    [currentIndex]
  );

  const handleSelect = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    const mapped = answerToSignals(currentQuestion.id, value, rules.questionMappings);

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        value,
        timestamp: Date.now(),
        activatedSignalIds: mapped.signalIds,
        activatedRedFlagIds: mapped.redFlagIds,
      },
    }));
  };

  const handleNext = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
      return;
    }

    if (currentIndex < orderedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const orderedAnswers = orderedQuestions
      .map((question) => answers[question.id])
      .filter((answer): answer is Answer => Boolean(answer));

    setRecommendation(findPrimaryRecommendation(orderedAnswers, rules));
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const resetWizard = () => {
    setAnswers({});
    setCurrentIndex(0);
    setRecommendation(null);
  };

  if (recommendation) {
    return <RecommendationResult recommendation={recommendation} onRestart={resetWizard} />;
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dbe4f0',
          borderRadius: '18px',
          padding: '1.5rem',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        }}
      >
        <header style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#1d4ed8' }}>Microsoft Tool Advisor</p>
          <h1 style={{ margin: '0.35rem 0 0', fontSize: '2rem' }}>Choose the right Microsoft tool</h1>
        </header>

        <ProgressIndicator currentIndex={currentIndex} totalQuestions={orderedQuestions.length} />
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          selectedValue={answers[currentQuestion.id]?.value}
          isLastQuestion={currentIndex === orderedQuestions.length - 1}
          canGoBack={currentIndex > 0}
          onSelect={handleSelect}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </main>
  );
}
