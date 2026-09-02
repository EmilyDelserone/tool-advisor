import { test, expect } from '@playwright/test';
import { UI_APP_PATH, walkPath } from './helpers';

const SHOW_TOGGLE = /^Show what lowered /;
const HIDE_TOGGLE = /^Hide what lowered /;

test.describe('Runner-up score breakdown (FR-020)', () => {
  test('is collapsed by default', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const toggles = page.getByRole('button', { name: SHOW_TOGGLE });
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i += 1) {
      await expect(toggles.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }

    await expect(page.getByText(/points:$/)).toHaveCount(0);
  });

  test('reveals the red flags that lowered the score on click', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const toggle = page.getByRole('button', { name: SHOW_TOGGLE }).first();
    await toggle.click();

    const expanded = page.getByRole('button', { name: HIDE_TOGGLE }).first();
    await expect(expanded).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listitem').first()).toBeVisible();
  });

  test('collapses again on a second click', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await page.getByRole('button', { name: SHOW_TOGGLE }).first().click();
    await page.getByRole('button', { name: HIDE_TOGGLE }).first().click();

    await expect(page.getByRole('button', { name: SHOW_TOGGLE }).first()).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('opens from the keyboard', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const toggle = page.getByRole('button', { name: SHOW_TOGGLE }).first();
    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('button', { name: HIDE_TOGGLE }).first()).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});

test.describe('Runner-up score breakdown on touch devices', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('expands on tap', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await page.getByRole('button', { name: SHOW_TOGGLE }).first().tap();

    await expect(page.getByRole('button', { name: HIDE_TOGGLE }).first()).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
