import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import rulesData from '../../src/data/rules.json';
import { findPrimaryRecommendation } from '../../src/engine/recommendationEngine';
import { RecommendationResult } from '../../src/components/RecommendationResult';
import { hasToolIcon } from '../../src/components/ToolIcon';
import type { Answer, RulesFile } from '../../src/engine/types';

const rules = rulesData as RulesFile;

const answers: Answer[] = [
  {
    questionId: 'q1-ui',
    value: 'yes',
    timestamp: 0,
    activatedSignalIds: ['ui-required', 'structured-data-entry', 'cloud-connectors'],
    activatedRedFlagIds: ['needs-ui'],
  },
];

describe('Tool icons (DR-010)', () => {
  const recommendation = findPrimaryRecommendation(answers, rules);

  it('maps every tool in rules.json to an icon', () => {
    rules.tools.forEach((tool) => {
      expect(hasToolIcon(tool.id), `no icon mapped for ${tool.id}`).toBe(true);
    });
  });

  it('renders one icon for the winner and one per runner-up', () => {
    const { container } = render(
      <RecommendationResult recommendation={recommendation} onRestart={() => {}} />
    );

    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThanOrEqual(1 + recommendation.runnerUps.length);
  });

  it('marks icons decorative so tool names are not announced twice', () => {
    const { container } = render(
      <RecommendationResult recommendation={recommendation} onRestart={() => {}} />
    );

    container.querySelectorAll('svg').forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.getAttribute('aria-label')).toBeNull();
    });

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      recommendation.primaryTool.name
    );
  });

  it('keeps the tool name as visible text alongside the icon', () => {
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    recommendation.runnerUps.forEach(({ tool }) => {
      expect(screen.getAllByText(tool.name).length).toBeGreaterThan(0);
    });
  });
});
