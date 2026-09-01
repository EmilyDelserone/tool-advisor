import { test, expect } from '@playwright/test';
import { UI_APP_PATH, walkPath } from './helpers';

const VIEWPORTS = [
  { name: 'mobile', width: 320, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

test.describe('Responsive layout (DR-002, DR-006)', () => {
  for (const viewport of VIEWPORTS) {
    test(`has no horizontal overflow at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const overflowsOnQuestion = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflowsOnQuestion).toBe(false);

      await walkPath(page, UI_APP_PATH);
      await expect(page.getByText('Recommended tool')).toBeVisible();

      const overflowsOnResults = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflowsOnResults).toBe(false);
    });
  }

  test('stacks comparison rows on mobile and keeps a row layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const firstCell = page.getByRole('cell').first();
    await expect(firstCell).toHaveCSS('display', 'block');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(firstCell).toHaveCSS('display', 'table-cell');
  });

  test('keeps interactive targets at least 44px tall', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');

    // Inline glossary affordances follow the 24px WCAG 2.2 AA minimum, not the 44px action target
    for (const button of await page
      .getByRole('button', { name: /back|next|see recommendation/i })
      .all()) {
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    for (const trigger of await page.getByRole('button', { name: /mean\?$/i }).all()) {
      const box = await trigger.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    }
  });
});
