import { test, expect, type Request } from '@playwright/test';
import { UI_APP_PATH, walkPath } from './helpers';

test.describe('Client-side completeness (US4, FR-008, FR-011, SC-004, SC-005)', () => {
  test('completes the wizard with zero external requests', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', (request: Request) => {
      const url = new URL(request.url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        externalRequests.push(request.url());
      }
    });

    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await expect(page.getByText('Recommended tool')).toBeVisible();
    expect(externalRequests).toEqual([]);
  });

  test('works with the network offline after first load', async ({ page, context }) => {
    await page.goto('/');
    await context.setOffline(true);

    await walkPath(page, UI_APP_PATH);

    await expect(page.getByText('Recommended tool')).toBeVisible();
    await context.setOffline(false);
  });

  test('writes nothing to browser storage', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const storage = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
      cookies: document.cookie,
    }));

    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);
    expect(storage.cookies).toBe('');
  });
});
