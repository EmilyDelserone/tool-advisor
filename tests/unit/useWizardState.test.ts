import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import rulesData from '../../src/data/rules.json';
import { useWizardState } from '../../src/hooks/useWizardState';
import type { RulesFile } from '../../src/engine/types';

const rules = rulesData as RulesFile;
const coreQuestions = rules.questions
  .filter((q) => !q.isTiebreaker)
  .sort((a, b) => a.position - b.position);

const optionAt = (questionIndex: number, optionIndex: number) => {
  const question = coreQuestions[questionIndex];
  return question.options ? question.options[optionIndex].id : ['yes', 'no'][optionIndex];
};

// Answer option indexes per core question
const UI_APP_PATH = [0, 1, 1, 1, 1, 0, 1];
const TIE_PATH = [1, 0, 0, 1, 0, 0, 0];

const walk = (result: { current: ReturnType<typeof useWizardState> }, path: number[]) => {
  path.forEach((optionIndex, questionIndex) => {
    act(() => result.current.selectAnswer(optionAt(questionIndex, optionIndex)));
    act(() => result.current.goNext());
  });
};

describe('useWizardState', () => {
  it('starts on the first core question with nothing selected', () => {
    const { result } = renderHook(() => useWizardState(rules));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalQuestions).toBe(coreQuestions.length);
    expect(result.current.currentQuestion?.id).toBe(coreQuestions[0].id);
    expect(result.current.selectedValue).toBeUndefined();
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.recommendation).toBeNull();
  });

  it('does not advance until the current question is answered', () => {
    const { result } = renderHook(() => useWizardState(rules));

    act(() => result.current.goNext());

    expect(result.current.currentIndex).toBe(0);
  });

  it('advances and steps back while preserving answers', () => {
    const { result } = renderHook(() => useWizardState(rules));

    act(() => result.current.selectAnswer(optionAt(0, 0)));
    act(() => result.current.goNext());

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);

    act(() => result.current.goBack());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedValue).toBe(optionAt(0, 0));
  });

  it('flags the final core question as last', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH.slice(0, coreQuestions.length - 1));

    expect(result.current.isLastQuestion).toBe(true);
  });

  it('produces a recommendation after the final question', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH);

    expect(result.current.recommendation?.primaryTool.name).toBe('Power Apps');
  });

  it('surfaces the tiebreaker question when tools tie', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, TIE_PATH);

    expect(result.current.isTiebreaker).toBe(true);
    expect(result.current.recommendation).toBeNull();
    expect(result.current.totalQuestions).toBe(coreQuestions.length + 1);
    expect(result.current.currentIndex).toBe(coreQuestions.length);
  });

  it('leaves the tiebreaker when going back', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, TIE_PATH);
    act(() => result.current.goBack());

    expect(result.current.isTiebreaker).toBe(false);
    expect(result.current.totalQuestions).toBe(coreQuestions.length);
  });

  it('clears all state on reset (FR-010)', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH);
    act(() => result.current.reset());

    expect(result.current.recommendation).toBeNull();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedValue).toBeUndefined();
    expect(result.current.isTiebreaker).toBe(false);
  });

  it('exposes a step per core question, reachable only up to the furthest visited', () => {
    const { result } = renderHook(() => useWizardState(rules));

    expect(result.current.steps).toHaveLength(coreQuestions.length);
    expect(result.current.steps[0].reachable).toBe(true);
    expect(result.current.steps[1].reachable).toBe(false);

    walk(result, UI_APP_PATH.slice(0, 2));

    expect(result.current.steps[1].reachable).toBe(true);
    expect(result.current.steps[0].answered).toBe(true);
  });

  it('jumps back to an earlier step without losing answers (FR-021)', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH.slice(0, 3));
    act(() => result.current.goToStep(0));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedValue).toBe(optionAt(0, UI_APP_PATH[0]));

    act(() => result.current.goToStep(2));
    expect(result.current.selectedValue).toBe(optionAt(2, UI_APP_PATH[2]));
  });

  it('refuses to jump forward past the furthest answered step', () => {
    const { result } = renderHook(() => useWizardState(rules));

    act(() => result.current.goToStep(4));

    expect(result.current.currentIndex).toBe(0);
  });

  it('returns to the questions from the results view with answers intact (FR-021)', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH);
    expect(result.current.recommendation).toBeTruthy();

    act(() => result.current.editAnswers());

    expect(result.current.recommendation).toBeNull();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedValue).toBe(optionAt(0, UI_APP_PATH[0]));
  });

  it('recalculates the recommendation after an earlier answer changes (FR-021)', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, UI_APP_PATH);
    expect(result.current.recommendation?.primaryTool.name).toBe('Power Apps');

    act(() => result.current.editAnswers());
    act(() => result.current.selectAnswer(optionAt(0, 1)));

    expect(result.current.recommendation).toBeNull();

    for (let i = 0; i < coreQuestions.length; i += 1) {
      act(() => result.current.goNext());
    }

    expect(result.current.recommendation?.primaryTool.name).toBe('Power Automate');
  });

  it('discards a tiebreaker answer when a core answer changes (FR-021)', () => {
    const { result } = renderHook(() => useWizardState(rules));

    walk(result, TIE_PATH);
    expect(result.current.isTiebreaker).toBe(true);

    const tiebreakerOption = result.current.currentQuestion!.options![0].id;
    act(() => result.current.selectAnswer(tiebreakerOption));
    act(() => result.current.goNext());
    expect(result.current.recommendation).toBeTruthy();

    act(() => result.current.editAnswers());
    act(() => result.current.selectAnswer(optionAt(0, 0)));

    expect(result.current.isTiebreaker).toBe(false);
    expect(result.current.recommendation).toBeNull();
    expect(result.current.steps).toHaveLength(coreQuestions.length);
  });
});
