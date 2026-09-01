import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { UI_APP_PATH, walkPath } from './helpers';

const require = createRequire(import.meta.url);
const axeSource: string = require('fs').readFileSync(
  require.resolve('axe-core/axe.min.js'),
  'utf8'
);

type AxeResults = {
  violations: Array<{ id: string; impact: string | null; help: string; nodes: unknown[] }>;
};

const auditPage = async (page: Page): Promise<AxeResults> => {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () =>
    // @ts-expect-error axe is injected at runtime
    window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
  );
};

test.describe('Accessibility audit (DR-001, SC-006)', () => {
  test('question view has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await auditPage(page);
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(serious, JSON.stringify(serious.map((v) => v.help), null, 2)).toEqual([]);
  });

  test('recommendation view has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');

    await walkPath(page, UI_APP_PATH);

    await expect(page.getByText('Recommended tool')).toBeVisible();

    const results = await auditPage(page);
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(serious, JSON.stringify(serious.map((v) => v.help), null, 2)).toEqual([]);
  });

  test('the whole wizard is operable with the keyboard only', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('radio').first().waitFor();
    await page.locator('body').press('Tab');
    await page.keyboard.press('Space');

    for (let i = 1; i < UI_APP_PATH.length; i += 1) {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
    }

    await expect(page.getByRole('progressbar')).toBeVisible();
  });
});
