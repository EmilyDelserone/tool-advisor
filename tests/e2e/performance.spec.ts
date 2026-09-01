import { test, expect } from '@playwright/test';
import { UI_APP_PATH, answerByIndex } from './helpers';

// Generous multiples of the NFR targets so the budgets catch regressions, not CI jitter
const FIRST_LOAD_BUDGET_MS = 2000;
const INTERACTION_BUDGET_MS = 100;

test.describe('Performance budgets (NFR-001, NFR-004)', () => {
  test('first load completes within budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('radio').first().waitFor();

    const timing = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav.domContentLoadedEventEnd - nav.startTime;
    });

    expect(timing).toBeLessThan(FIRST_LOAD_BUDGET_MS);
  });

  test('question transitions render within budget', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio').first().waitFor();

    const durations: number[] = [];

    for (const optionIndex of UI_APP_PATH.slice(0, -1)) {
      const started = Date.now();
      await answerByIndex(page, optionIndex);
      await page.getByRole('radio').first().waitFor();
      durations.push(Date.now() - started);
    }

    const slowest = Math.max(...durations);
    expect(slowest, `slowest transition ${slowest}ms`).toBeLessThan(INTERACTION_BUDGET_MS * 10);
  });

  test('recommendation generation is effectively instant', async ({ page }) => {
    await page.goto('/');

    for (const optionIndex of UI_APP_PATH.slice(0, -1)) {
      await answerByIndex(page, optionIndex);
    }

    await page.getByRole('radio').nth(UI_APP_PATH[UI_APP_PATH.length - 1]).check();

    const started = Date.now();
    await page.getByRole('button', { name: /see recommendation/i }).click();
    await expect(page.getByText('Recommended tool')).toBeVisible();
    const elapsed = Date.now() - started;

    expect(elapsed, `generation took ${elapsed}ms`).toBeLessThan(INTERACTION_BUDGET_MS * 10);
  });
});
