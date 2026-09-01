import { test, expect } from '@playwright/test';

const TERM_TRIGGER = /what does ".*" mean\?/i;

test.describe('Glossary definitions (FR-009)', () => {
  test('opens on mouse hover', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: TERM_TRIGGER }).first();
    await trigger.hover();

    await expect(page.getByText(/^Example:/)).toBeVisible();
  });

  test('opens from the keyboard and closes with Escape', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: TERM_TRIGGER }).first();
    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText(/^Example:/)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByText(/^Example:/)).toBeHidden();
  });

  test('is reachable by tabbing, never trapping focus', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: TERM_TRIGGER }).first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');

    await expect(trigger).not.toBeFocused();
  });
});

test.describe('Glossary definitions on touch devices', () => {
  test.use({ hasTouch: true, isMobile: false, viewport: { width: 390, height: 844 } });

  test('reveals the definition on tap', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: TERM_TRIGGER }).first();
    await trigger.tap();

    await expect(page.getByText(/^Example:/)).toBeVisible();
  });
});
