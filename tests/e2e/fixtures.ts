import { test as base, expect, type Page, type Request } from '@playwright/test';

/** Every goto('/') lands on the intro screen (FR-001c); clear it so specs can assume the wizard is open. */
async function passIntroScreen(page: Page) {
  const getStarted = page.getByRole('button', { name: 'Get Started' });
  if (await getStarted.isVisible().catch(() => false)) {
    await getStarted.click();
  }
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = (async (url: string, options?: Parameters<Page['goto']>[1]) => {
      const response = await goto(url, options);
      await passIntroScreen(page);
      return response;
    }) as Page['goto'];

    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback, not a React hook
    await use(page);
  },
});

export { expect };
export type { Page, Request };
