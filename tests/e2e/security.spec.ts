import { test, expect } from '@playwright/test';
import { UI_APP_PATH, walkPath } from './helpers';

test.describe('Security and privacy (FR-008, Constitution II)', () => {
  test('persists nothing across sessions', async ({ page, context }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);
    await expect(page.getByText('Recommended tool')).toBeVisible();

    const state = await context.storageState();

    expect(state.cookies).toEqual([]);
    expect(state.origins).toEqual([]);
  });

  test('renders framework text as text, never as markup', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const injected = await page.evaluate(() => ({
      scripts: document.querySelectorAll('main script').length,
      iframes: document.querySelectorAll('iframe').length,
      handlers: document.querySelectorAll('[onclick],[onerror],[onload]').length,
    }));

    expect(injected).toEqual({ scripts: 0, iframes: 0, handlers: 0 });
  });

  test('loads only same-origin scripts and styles', async ({ page }) => {
    await page.goto('/');

    const externalAssets = await page.evaluate(() =>
      [
        ...Array.from(document.querySelectorAll('script[src]')).map((el) =>
          el.getAttribute('src')
        ),
        ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((el) =>
          el.getAttribute('href')
        ),
      ].filter((src): src is string => Boolean(src) && /^(https?:)?\/\//.test(src!))
    );

    expect(externalAssets).toEqual([]);
  });

  test('opens no new browsing contexts', async ({ page, context }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    expect(context.pages()).toHaveLength(1);
  });
});
