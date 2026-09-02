import { test, expect } from '@playwright/test';
import { TIE_PATH, UI_APP_PATH, answerByIndex, tabToFirstRadio, walkPath } from './helpers';

const CORE_QUESTIONS = UI_APP_PATH.length;

test.describe('Wizard end-to-end (US1, US2, US3)', () => {
  test('walks through all questions and shows a recommendation with runner-ups', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(`Question 1 of ${CORE_QUESTIONS}`)).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    await answerByIndex(page, UI_APP_PATH[0]);
    await expect(page.getByText(`Question 2 of ${CORE_QUESTIONS}`)).toBeVisible();

    await walkPath(page, UI_APP_PATH.slice(1));

    await expect(page.getByText('Recommended tool')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Power Apps');
    await expect(page.getByRole('columnheader', { name: /why not this one/i })).toBeVisible();
  });

  test('links the winner and every runner-up to Microsoft Learn in a new tab', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await expect(page.getByText('Learn more', { exact: true })).toBeVisible();

    const winnerLink = page.getByRole('link', { name: /Power Apps documentation/i });
    await expect(winnerLink).toHaveAttribute(
      'href',
      'https://learn.microsoft.com/en-us/power-apps/'
    );
    await expect(winnerLink).toHaveAttribute('target', '_blank');
    await expect(winnerLink).toHaveAttribute('rel', /noopener/);

    const runnerUpLinks = page.getByRole('link', { name: /learn more about/i });
    const count = await runnerUpLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i += 1) {
      const link = runnerUpLinks.nth(i);
      await expect(link).toHaveAttribute('href', /^https:\/\/learn\.microsoft\.com\//);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    }
  });

  test('presents the tiebreaker question when tools tie and resolves to one tool', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, TIE_PATH);

    await expect(
      page.getByText(`Tiebreaker question ${CORE_QUESTIONS + 1} of ${CORE_QUESTIONS + 1}`)
    ).toBeVisible();

    await page.getByLabel('Business users or citizen developers').check();
    await page.getByRole('button', { name: /see recommendation/i }).click();

    await expect(page.getByText('Recommended tool')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('shows a fit percentage for the winner and each runner-up', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const winnerBar = page.getByRole('progressbar', { name: 'Fit score for Power Apps' });
    await expect(winnerBar).toBeVisible();

    const winnerFit = Number(await winnerBar.getAttribute('aria-valuenow'));
    expect(winnerFit).toBeGreaterThan(0);
    expect(winnerFit).toBeLessThanOrEqual(100);

    const bars = page.getByRole('progressbar', { name: /^Fit score for / });
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i += 1) {
      const value = Number(await bars.nth(i).getAttribute('aria-valuenow'));
      expect(value).toBeLessThanOrEqual(winnerFit);
    }

    await expect(page.getByText(`${winnerFit}% fit`).first()).toBeVisible();
  });

  test('restarts back to the first question', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await page.getByRole('button', { name: /start over/i }).click();
    await expect(page.getByText(`Question 1 of ${CORE_QUESTIONS}`)).toBeVisible();
  });

  test('supports keyboard-only navigation through a question', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio').first().waitFor();

    await tabToFirstRadio(page);
    await page.keyboard.press('Space');
    await expect(page.getByRole('radio').first()).toBeChecked();
  });
});
