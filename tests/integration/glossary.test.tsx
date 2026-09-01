import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { glossary } from '../../src/data/glossary';

const uiEntry = glossary.find((entry) => entry.id === 'ui')!;

const triggerName = (term: string) =>
  new RegExp(`what does "${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" mean\\?`, 'i');

describe('Glossary tooltips', () => {
  it('offers a definition trigger beside a technical term in the question', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: triggerName(uiEntry.term) })).toBeTruthy();
  });

  it('reveals the definition and example on tap', async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole('button', { name: triggerName(uiEntry.term) });
    await user.pointer({ keys: '[TouchA]', target: trigger });

    expect(await screen.findByText(uiEntry.definition)).toBeTruthy();
    expect(screen.getByText(uiEntry.example)).toBeTruthy();
  });

  it('reveals the definition on mouse hover', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.hover(screen.getByRole('button', { name: triggerName(uiEntry.term) }));

    expect(await screen.findByText(uiEntry.definition)).toBeTruthy();
  });

  it('opens from the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole('button', { name: triggerName(uiEntry.term) });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await user.keyboard('{Enter}');

    expect(await screen.findByText(uiEntry.definition)).toBeTruthy();
  });

  it('annotates only the first mention of a term', () => {
    render(<App />);

    expect(screen.getAllByRole('button', { name: triggerName(uiEntry.term) })).toHaveLength(1);
  });

  it('does not select a radio option when its definition is opened', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Walk to the ownership-style question whose options mention citizen developers
    const citizenEntry = glossary.find((entry) => entry.id === 'citizen-developer')!;

    for (let i = 0; i < 7; i += 1) {
      const trigger = screen.queryByRole('button', { name: triggerName(citizenEntry.term) });
      if (trigger) {
        await user.pointer({ keys: '[TouchA]', target: trigger });
        expect(await screen.findByText(citizenEntry.definition)).toBeTruthy();
        screen.getAllByRole('radio').forEach((radio) => {
          expect((radio as HTMLInputElement).checked).toBe(false);
        });
        return;
      }

      await user.click(screen.getAllByRole('radio')[0]);
      await user.click(screen.getByRole('button', { name: /next|see recommendation/i }));
    }
  });
});
