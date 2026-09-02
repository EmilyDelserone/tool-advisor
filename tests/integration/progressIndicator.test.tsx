import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '../../src/components/ProgressIndicator';

describe('ProgressIndicator (FR-003, DR-004)', () => {
  it('renders "Question X of Y" for core questions', () => {
    render(<ProgressIndicator currentIndex={1} totalQuestions={7} />);

    expect(screen.getByText('Question 2 of 7')).toBeTruthy();
  });

  it('labels tiebreaker questions distinctly', () => {
    render(<ProgressIndicator currentIndex={7} totalQuestions={8} isTiebreaker />);

    expect(screen.getByText('Tiebreaker question 8 of 8')).toBeTruthy();
  });

  it('reports percentage complete', () => {
    render(<ProgressIndicator currentIndex={3} totalQuestions={8} answeredCount={4} />);

    expect(screen.getByText('50% complete')).toBeTruthy();
  });

  it('exposes progressbar semantics', () => {
    render(<ProgressIndicator currentIndex={2} totalQuestions={7} answeredCount={2} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('2');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('7');
    expect(bar.getAttribute('aria-valuetext')).toBe('2 of 7 questions answered');
  });

  it('announces updates in a live region', () => {
    const { container } = render(<ProgressIndicator currentIndex={0} totalQuestions={7} />);

    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('reaches 100% on the final question', () => {
    render(<ProgressIndicator currentIndex={6} totalQuestions={7} answeredCount={7} />);

    expect(screen.getByText('100% complete')).toBeTruthy();
  });
});
