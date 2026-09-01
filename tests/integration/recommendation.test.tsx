import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import rulesData from '../../src/data/rules.json';
import { findPrimaryRecommendation } from '../../src/engine/recommendationEngine';
import type { Answer, RulesFile } from '../../src/engine/types';
import { RecommendationResult } from '../../src/components/RecommendationResult';

const rules = rulesData as RulesFile;

const uiAnswers: Answer[] = [
  {
    questionId: 'q1-ui',
    value: 'yes',
    timestamp: 0,
    activatedSignalIds: ['ui-required', 'cloud-connectors'],
    activatedRedFlagIds: [],
  },
  {
    questionId: 'q2-custom-code',
    value: 'no',
    timestamp: 0,
    activatedSignalIds: [],
    activatedRedFlagIds: ['simple-automation'],
  },
];

describe('Recommendation result (US2, US3)', () => {
  const recommendation = findPrimaryRecommendation(uiAnswers, rules);

  it('shows exactly one primary tool with a framework-grounded justification (US2/AC1, AC2)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Power Apps');

    const signalTexts = rules.signals
      .filter((signal) => recommendation.matchedSignalIds.includes(signal.id))
      .map((signal) => signal.text);

    expect(signalTexts.length).toBeGreaterThan(0);
    expect(signalTexts.some((text) => recommendation.justification.includes(text))).toBe(true);
  });

  it('renders 1-2 runner-ups in a comparison table with framework differentiators (US3/AC1, AC2)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    expect(recommendation.runnerUps.length).toBeGreaterThanOrEqual(1);
    expect(recommendation.runnerUps.length).toBeLessThanOrEqual(2);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(recommendation.runnerUps.length);

    expect(screen.getByRole('columnheader', { name: /tool/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /use case/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /why not this one/i })).toBeTruthy();
  });

  it('grounds every runner-up differentiator in a framework signal or red flag (SC-002, Constitution I & III)', () => {
    const frameworkTexts = [
      ...rules.signals.map((s) => s.text.toLowerCase()),
      ...rules.redFlags.map((f) => f.text.toLowerCase()),
    ];

    recommendation.runnerUps.forEach((runnerUp) => {
      const text = runnerUp.differentiationText.toLowerCase();
      const citesFramework = frameworkTexts.some((frameworkText) => text.includes(frameworkText));
      expect(citesFramework).toBe(true);
    });
  });

  it('keeps every table cell scannable at 60 words or fewer (DR-006)', () => {
    recommendation.runnerUps.forEach((runnerUp) => {
      [runnerUp.tool.name, runnerUp.tool.primaryUseCase, runnerUp.differentiationText].forEach(
        (cell) => {
          expect(cell.trim().split(/\s+/).length).toBeLessThanOrEqual(60);
        }
      );
    });
  });

  it('keeps the justification within 60 words (FR-006a)', () => {
    expect(recommendation.justification.trim().split(/\s+/).length).toBeLessThanOrEqual(60);
  });
});
