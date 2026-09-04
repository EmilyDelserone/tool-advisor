import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import rulesData from '../../src/data/rules.json';
import { findPrimaryRecommendation } from '../../src/engine/recommendationEngine';
import { RecommendationResult } from '../../src/components/RecommendationResult';
import type { Answer, RulesFile } from '../../src/engine/types';

const startWizard = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /get started/i }));
};

const rules = rulesData as RulesFile;

const answers: Answer[] = [
  {
    questionId: 'q1-ui',
    value: 'yes',
    timestamp: 0,
    activatedSignalIds: ['ui-required', 'structured-data-entry'],
    activatedRedFlagIds: ['needs-ui'],
  },
];

describe('Accessible markup (DR-001, SC-006)', () => {
  it('gives every radio option an associated label', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await startWizard(user);

    const radios = Array.from(container.querySelectorAll('input[type="radio"]'));
    expect(radios.length).toBeGreaterThan(0);

    radios.forEach((radio) => {
      const labelled =
        radio.closest('label') ??
        (radio.id ? container.querySelector(`label[for="${radio.id}"]`) : null);

      expect(labelled?.textContent?.trim().length).toBeGreaterThan(0);
      expect(radio.getAttribute('name')).toBeTruthy();
    });
  });

  it('groups question options in a labelled radiogroup', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startWizard(user);

    const group = screen.getByRole('radiogroup');
    expect(group).toBeTruthy();

    const groupName = group.getAttribute('aria-label') ?? group.getAttribute('aria-labelledby');
    expect(groupName).toBeTruthy();
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(1);
  });

  it('renders the wizard inside a main landmark with a single h1', async () => {
    const user = userEvent.setup();
    render(<App />);
    await startWizard(user);

    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('gives every button an explicit type and accessible name', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await startWizard(user);

    Array.from(container.querySelectorAll('button')).forEach((button) => {
      expect(['button', 'submit']).toContain(button.getAttribute('type'));
      expect(button.textContent?.trim().length).toBeGreaterThan(0);
    });
  });

  it('uses scoped column headers in the comparison table', () => {
    const recommendation = findPrimaryRecommendation(answers, rules);
    const { container } = render(
      <RecommendationResult recommendation={recommendation} onRestart={() => {}} />
    );

    const headers = Array.from(container.querySelectorAll('th'));
    expect(headers).toHaveLength(3);
    headers.forEach((header) => expect(header.getAttribute('scope')).toBe('col'));
  });

  it('keeps heading order sequential on the results view', () => {
    const recommendation = findPrimaryRecommendation(answers, rules);
    render(<RecommendationResult recommendation={recommendation} onRestart={() => {}} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  });
});
