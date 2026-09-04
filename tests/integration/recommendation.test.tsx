import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const comboRecommendation = findPrimaryRecommendation(
    [
      {
        questionId: 'combo-test',
        value: 'yes',
        timestamp: 0,
        activatedSignalIds: ['ui-required', 'custom-code-logic'],
        activatedRedFlagIds: [],
      },
    ],
    rules
  );

  it('shows both tools and their roles for a paired recommendation', () => {
    render(<RecommendationResult recommendation={comboRecommendation} onRestart={() => {}} />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Power Apps + Azure Functions'
    );
    expect(screen.getByText('Handles the user interface.')).toBeTruthy();
    expect(screen.getByText('Handles custom logic connectors cannot express.')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Power Apps documentation/i })
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Azure Functions documentation/i })
    ).toBeTruthy();
  });

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

  it('links the recommended tool to its official documentation in a new tab (FR-018)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    expect(screen.getByText('Learn more')).toBeTruthy();

    const link = screen.getByRole('link', {
      name: new RegExp(`${recommendation.primaryTool.name} documentation`, 'i'),
    });

    expect(link.getAttribute('href')).toBe(recommendation.primaryTool.docsUrl);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('links every runner-up to its official documentation (FR-018)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    recommendation.runnerUps.forEach(({ tool }) => {
      const link = screen.getByRole('link', {
        name: new RegExp(`learn more about ${tool.name}`, 'i'),
      });

      expect(link.getAttribute('href')).toBe(tool.docsUrl);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  });

  it('shows a fit percentage bar for the winner and every runner-up (FR-019)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(1 + recommendation.runnerUps.length);

    expect(
      screen
        .getByRole('progressbar', {
          name: `Fit score for ${recommendation.primaryTool.name}`,
        })
        .getAttribute('aria-valuenow')
    ).toBe(String(recommendation.fitScore));

    expect(screen.getAllByText(`${recommendation.fitScore}% fit`).length).toBeGreaterThan(0);

    recommendation.runnerUps.forEach(({ tool, fitScore }) => {
      const bar = screen.getByRole('progressbar', { name: `Fit score for ${tool.name}` });
      expect(bar.getAttribute('aria-valuenow')).toBe(String(fitScore));
      expect(fitScore).toBeLessThanOrEqual(recommendation.fitScore);
    });
  });

  it('keeps each runner-up breakdown collapsed by default (FR-020)', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    recommendation.runnerUps.forEach(({ tool, redFlagBreakdown }) => {
      const toggle = screen.getByRole('button', {
        name: new RegExp(`show what lowered ${tool.name}`, 'i'),
      });

      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      redFlagBreakdown.forEach((flag) => {
        expect(screen.queryByText(new RegExp(flag.text, 'i'))).toBeNull();
      });
    });
  });

  it('reveals the engine red flag breakdown when expanded (FR-020)', async () => {
    const user = userEvent.setup();

    // q1 "yes" activates the needs-ui red flag, so the runner-ups carry a penalty
    const flagged = findPrimaryRecommendation(
      [
        {
          questionId: 'q1-ui',
          value: 'yes',
          timestamp: 0,
          activatedSignalIds: ['ui-required', 'structured-data-entry', 'cloud-connectors'],
          activatedRedFlagIds: ['needs-ui'],
        },
      ],
      rules
    );

    render(<RecommendationResult recommendation={flagged} onRestart={() => {}} />);

    const runnerUp = flagged.runnerUps.find((item) => item.redFlagBreakdown.length > 0);
    expect(runnerUp, 'expected a runner-up with red flags in this scenario').toBeTruthy();

    const toggle = screen.getByRole('button', {
      name: new RegExp(`show what lowered ${runnerUp!.tool.name}`, 'i'),
    });

    await user.click(toggle);

    expect(
      screen
        .getByRole('button', { name: new RegExp(`hide what lowered ${runnerUp!.tool.name}`, 'i') })
        .getAttribute('aria-expanded')
    ).toBe('true');

    runnerUp!.redFlagBreakdown.forEach((flag) => {
      expect(screen.getByText(new RegExp(`\\(\u2212${flag.weight} points\\)`))).toBeTruthy();
    });

    expect(screen.getByText(new RegExp(`cost ${runnerUp!.tool.name}`, 'i'))).toBeTruthy();
  });

  it('collapses again on a second activation (FR-020)', async () => {
    const user = userEvent.setup();
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    const name = recommendation.runnerUps[0].tool.name;
    await user.click(
      screen.getByRole('button', { name: new RegExp(`show what lowered ${name}`, 'i') })
    );
    await user.click(
      screen.getByRole('button', { name: new RegExp(`hide what lowered ${name}`, 'i') })
    );

    expect(
      screen
        .getByRole('button', { name: new RegExp(`show what lowered ${name}`, 'i') })
        .getAttribute('aria-expanded')
    ).toBe('false');
  });

  it('sources the breakdown from the engine, not the UI (FR-020)', () => {
    recommendation.runnerUps.forEach((runnerUp) => {
      const expected = rules.redFlags
        .filter((flag) => runnerUp.matchedRedFlagIds.includes(flag.id))
        .map((flag) => flag.id)
        .sort();

      expect(runnerUp.redFlagBreakdown.map((flag) => flag.id).sort()).toEqual(expected);
      expect(runnerUp.redFlagBreakdown.reduce((sum, flag) => sum + flag.weight, 0)).toBe(
        runnerUp.redFlagPenalty
      );
    });
  });
});
