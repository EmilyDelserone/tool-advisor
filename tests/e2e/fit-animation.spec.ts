import { test, expect } from '@playwright/test';
import { UI_APP_PATH, walkPath } from './helpers';

const barsIn = (page: import('@playwright/test').Page) =>
  page.locator('[role="progressbar"] .fui-ProgressBar__bar');

test.describe('Fit score bar animation (DR-011)', () => {
  test('fills from zero rather than rendering at full width', async ({ page }) => {
    await page.goto('/');

    // Slow the fill so the mid-animation state can be observed without racing it
    await page.addStyleTag({ content: ':root { --fit-bar-duration: 5s; }' });

    await walkPath(page, UI_APP_PATH);

    const winnerBar = barsIn(page).first();
    await winnerBar.waitFor();

    const scaleNow = await winnerBar.evaluate((el) => {
      const transform = getComputedStyle(el).transform;
      return transform === 'none' ? 1 : Number(transform.replace('matrix(', '').split(',')[0]);
    });

    expect(scaleNow).toBeLessThan(0.9);

    await expect
      .poll(
        async () =>
          winnerBar.evaluate((el) => {
            const transform = getComputedStyle(el).transform;
            return transform === 'none'
              ? 1
              : Number(transform.replace('matrix(', '').split(',')[0]);
          }),
        { timeout: 10_000 }
      )
      .toBeCloseTo(1, 1);
  });

  test('staggers the winner and runner-ups', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const delays = await barsIn(page).evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationDelay)
    );

    expect(delays.length).toBeGreaterThanOrEqual(2);
    expect(new Set(delays).size).toBeGreaterThan(1);
    expect(delays[0]).toBe('0s');
  });

  test('completes in about half a second', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const durations = await barsIn(page).evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationDuration)
    );

    durations.forEach((duration) => expect(duration).toBe('0.5s'));
  });

  test('keeps the announced value at the final score while animating', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const winner = page.getByRole('progressbar', { name: 'Fit score for Power Apps' });
    await expect(winner).toHaveAttribute('aria-valuenow', '100');
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const names = await barsIn(page).evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationName)
    );

    names.forEach((name) => expect(name).toBe('none'));
  });
});
