import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import rulesData from '../../src/data/rules.json';
import type { RulesFile } from '../../src/engine/types';

const rules = rulesData as RulesFile;
const CORE_QUESTION_COUNT = rules.questions.filter((q) => !q.isTiebreaker).length;

// Answer option indexes per core question, in wizard order
const UI_APP_PATH = [0, 1, 1, 1, 1, 0, 1]; // resolves cleanly to Power Apps
const TIE_PATH = [1, 0, 0, 1, 0, 0, 0]; // ties Copilot Studio with Azure Logic Apps

type User = ReturnType<typeof userEvent.setup>;

const answerByIndex = async (user: User, optionIndex: number) => {
  const radios = screen.getAllByRole('radio');
  await user.click(radios[optionIndex]);
  await user.click(screen.getByRole('button', { name: /next|see recommendation/i }));
};

const walkPath = async (user: User, path: number[]) => {
  for (const optionIndex of path) {
    await answerByIndex(user, optionIndex);
  }
};

describe('Wizard question flow (US1)', () => {
  it('shows the first question with an accessible progress indicator', () => {
    render(<App />);

    expect(screen.getByText(`Question 1 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe(
      String(CORE_QUESTION_COUNT)
    );
  });

  it('blocks Next until an option is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect((screen.getByRole('button', { name: /next/i }) as HTMLButtonElement).disabled).toBe(true);

    await user.click(screen.getAllByRole('radio')[0]);

    expect((screen.getByRole('button', { name: /next/i }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it('advances to the next question and updates progress (US1/AC1, AC3)', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/does your solution need a ui/i)).toBeTruthy();

    await answerByIndex(user, 0);

    expect(screen.getByText(`Question 2 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();
    expect(screen.getByText(/do you need custom code/i)).toBeTruthy();
  });

  it('goes back and preserves the previous answer', async () => {
    const user = userEvent.setup();
    render(<App />);

    await answerByIndex(user, 0);
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByText(`Question 1 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();
    expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(true);
  });

  it('submits the last question and shows the recommendation (US1/AC4)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await walkPath(user, UI_APP_PATH);

    expect(screen.getByText('Recommended tool')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Power Apps');
  });

  it('asks the tiebreaker question when tools tie, then resolves to one tool (FR-005a, SC-007)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await walkPath(user, TIE_PATH);

    expect(
      screen.getByText(`Tiebreaker question ${CORE_QUESTION_COUNT + 1} of ${CORE_QUESTION_COUNT + 1}`)
    ).toBeTruthy();
    expect(screen.getByText(/who will own and maintain this solution/i)).toBeTruthy();

    await user.click(screen.getByLabelText('Business users or citizen developers'));
    await user.click(screen.getByRole('button', { name: /see recommendation/i }));

    expect(screen.getByText('Recommended tool')).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('restarts the wizard back to question 1 (FR-010)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await walkPath(user, UI_APP_PATH);
    await user.click(screen.getByRole('button', { name: /start over/i }));

    expect(screen.getByText(`Question 1 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();
    expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(false);
  });

  it('jumps to an earlier question from the step list (FR-021)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await answerByIndex(user, 0);
    await answerByIndex(user, 1);

    expect(screen.getByText(`Question 3 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Question 1:/ }));

    expect(screen.getByText(`Question 1 of ${CORE_QUESTION_COUNT}`)).toBeTruthy();
    expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(true);
  });

  it('disables steps the user has not reached yet', () => {
    render(<App />);

    expect(
      (screen.getByRole('button', { name: /^Question 2:/ }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('recalculates the recommendation when an earlier answer changes (FR-021)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await walkPath(user, UI_APP_PATH);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Power Apps');

    await user.click(screen.getByRole('button', { name: /change an answer/i }));
    await user.click(screen.getAllByRole('radio')[1]); // needs a UI? -> No

    for (let i = 0; i < CORE_QUESTION_COUNT; i += 1) {
      await user.click(screen.getByRole('button', { name: /next|see recommendation/i }));
    }

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Power Automate');
  });

  it('keeps the fit score in step with the edited answers (FR-019, FR-021)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await walkPath(user, UI_APP_PATH);
    const before = screen
      .getByRole('progressbar', { name: 'Fit score for Power Apps' })
      .getAttribute('aria-valuenow');

    await user.click(screen.getByRole('button', { name: /change an answer/i }));
    await user.click(screen.getAllByRole('radio')[1]);

    for (let i = 0; i < CORE_QUESTION_COUNT; i += 1) {
      await user.click(screen.getByRole('button', { name: /next|see recommendation/i }));
    }

    const after = screen
      .getByRole('progressbar', { name: 'Fit score for Power Automate' })
      .getAttribute('aria-valuenow');

    expect(before).toBe('100');
    expect(after).toBe('100');
    expect(screen.queryByRole('progressbar', { name: 'Fit score for Power Apps' })).toBeTruthy();
  });
});
