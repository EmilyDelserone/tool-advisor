import { useMemo, useState } from 'react';
import { answerToSignals, evaluateAnswers } from '../engine/recommendationEngine';
import type { Answer, Question, Recommendation, RulesFile } from '../engine/types';

export function useWizardState(rules: RulesFile) {
  const coreQuestions = useMemo(
    () => [...rules.questions].filter((q) => !q.isTiebreaker).sort((a, b) => a.position - b.position),
    [rules.questions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [tiebreakerQuestion, setTiebreakerQuestion] = useState<Question | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const currentQuestion: Question | undefined = tiebreakerQuestion ?? coreQuestions[currentIndex];
  const totalQuestions = coreQuestions.length + (tiebreakerQuestion ? 1 : 0);
  const isLastQuestion = Boolean(tiebreakerQuestion) || currentIndex === coreQuestions.length - 1;

  const selectAnswer = (value: string) => {
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

  const goNext = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
      return;
    }

    if (!tiebreakerQuestion && currentIndex < coreQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const orderedAnswers = [...coreQuestions, ...(tiebreakerQuestion ? [tiebreakerQuestion] : [])]
      .map((question) => answers[question.id])
      .filter((answer): answer is Answer => Boolean(answer));

    const evaluation = evaluateAnswers(orderedAnswers, rules);

    if (evaluation.status === 'tiebreaker') {
      setTiebreakerQuestion(evaluation.tiebreakerQuestion);
      return;
    }

    setRecommendation(evaluation.recommendation);
  };

  const goBack = () => {
    if (tiebreakerQuestion) {
      setTiebreakerQuestion(null);
      return;
    }

    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setTiebreakerQuestion(null);
    setRecommendation(null);
  };

  return {
    currentQuestion,
    currentIndex: tiebreakerQuestion ? coreQuestions.length : currentIndex,
    totalQuestions,
    isTiebreaker: Boolean(tiebreakerQuestion),
    isLastQuestion,
    canGoBack: currentIndex > 0 || Boolean(tiebreakerQuestion),
    selectedValue: currentQuestion ? answers[currentQuestion.id]?.value : undefined,
    recommendation,
    selectAnswer,
    goNext,
    goBack,
    reset,
  };
}
