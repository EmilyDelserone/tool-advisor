import { useMemo, useState } from 'react';
import { answerToSignals, evaluateAnswers } from '../engine/recommendationEngine';
import type { Answer, Question, Recommendation, RulesFile } from '../engine/types';

export type WizardStep = {
  id: string;
  index: number;
  label: string;
  answered: boolean;
  reachable: boolean;
  isTiebreaker: boolean;
};

export function useWizardState(rules: RulesFile) {
  const coreQuestions = useMemo(
    () => [...rules.questions].filter((q) => !q.isTiebreaker).sort((a, b) => a.position - b.position),
    [rules.questions]
  );

  const tiebreakerIds = useMemo(
    () => rules.questions.filter((q) => q.isTiebreaker).map((q) => q.id),
    [rules.questions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [tiebreakerQuestion, setTiebreakerQuestion] = useState<Question | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const currentQuestion: Question | undefined = tiebreakerQuestion ?? coreQuestions[currentIndex];
  const totalQuestions = coreQuestions.length + (tiebreakerQuestion ? 1 : 0);
  const isLastQuestion = Boolean(tiebreakerQuestion) || currentIndex === coreQuestions.length - 1;

  const steps: WizardStep[] = [
    ...coreQuestions.map((question, index) => ({
      id: question.id,
      index,
      label: question.text,
      answered: Boolean(answers[question.id]),
      reachable: index <= furthestIndex,
      isTiebreaker: false,
    })),
    ...(tiebreakerQuestion
      ? [
          {
            id: tiebreakerQuestion.id,
            index: coreQuestions.length,
            label: tiebreakerQuestion.text,
            answered: Boolean(answers[tiebreakerQuestion.id]),
            reachable: true,
            isTiebreaker: true,
          },
        ]
      : []),
  ];

  const selectAnswer = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    const mapped = answerToSignals(currentQuestion.id, value, rules.questionMappings);
    const editingCoreQuestion = !currentQuestion.isTiebreaker;

    setAnswers((prev) => {
      const next = {
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          value,
          timestamp: Date.now(),
          activatedSignalIds: mapped.signalIds,
          activatedRedFlagIds: mapped.redFlagIds,
        },
      };

      // A tiebreaker was only asked because of the old core scores, so its answer no longer applies
      if (editingCoreQuestion) {
        tiebreakerIds.forEach((id) => delete next[id]);
      }

      return next;
    });

    if (editingCoreQuestion) {
      setTiebreakerQuestion(null);
    }

    setRecommendation(null);
  };

  const evaluate = () => {
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

  const allCoreAnswered = coreQuestions.every((question) => answers[question.id]);
  const answeredCount = steps.filter((step) => step.answered).length;

  const goNext = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
      return;
    }

    if (!tiebreakerQuestion && currentIndex < coreQuestions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setFurthestIndex((prev) => Math.max(prev, next));
      return;
    }

    evaluate();
  };

  const goBack = () => {
    if (tiebreakerQuestion) {
      setTiebreakerQuestion(null);
      return;
    }

    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > furthestIndex || index >= coreQuestions.length) {
      return;
    }

    setTiebreakerQuestion(null);
    setRecommendation(null);
    setCurrentIndex(index);
  };

  /** Return from the results view to the questions, keeping every answer */
  const editAnswers = () => {
    setRecommendation(null);
    setTiebreakerQuestion(null);
    setCurrentIndex(0);
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setFurthestIndex(0);
    setTiebreakerQuestion(null);
    setRecommendation(null);
  };

  return {
    currentQuestion,
    currentIndex: tiebreakerQuestion ? coreQuestions.length : currentIndex,
    totalQuestions,
    answeredCount,
    steps,
    isTiebreaker: Boolean(tiebreakerQuestion),
    isLastQuestion,
    canGoBack: currentIndex > 0 || Boolean(tiebreakerQuestion),
    canSeeRecommendation: allCoreAnswered,
    selectedValue: currentQuestion ? answers[currentQuestion.id]?.value : undefined,
    recommendation,
    selectAnswer,
    goNext,
    goBack,
    goToStep,
    editAnswers,
    reset,
  };
}
