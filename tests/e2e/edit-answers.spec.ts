import { test, expect } from '@playwright/test';
import { UI_APP_PATH, answerByIndex, walkPath } from './helpers';

test.describe('Editing earlier answers (FR-021)', () => {
  test('jumps to an earlier question from the step list', async ({ page }) => {
    await page.goto('/');

    await answerByIndex(page, UI_APP_PATH[0]);
    await answerByIndex(page, UI_APP_PATH[1]);
    await expect(page.getByText(`Question 3 of ${UI_APP_PATH.length}`)).toBeVisible();

    await page.getByRole('button', { name: /^Question 1:/ }).click();

    await expect(page.getByText(`Question 1 of ${UI_APP_PATH.length}`)).toBeVisible();
    await expect(page.getByRole('radio').first()).toBeChecked();
  });

  test('marks the current step and disables unreached steps', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /^Question 1:/ })).toHaveAttribute(
      'aria-current',
      'step'
    );
    await expect(page.getByRole('button', { name: /^Question 3:/ })).toBeDisabled();
  });

  test('returns from the results view and recalculates after an edit', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Power Apps');

    await page.getByRole('button', { name: /change an answer/i }).click();
    await expect(page.getByText(`Question 1 of ${UI_APP_PATH.length}`)).toBeVisible();

    await page.getByRole('radio').nth(1).check();

    for (let i = 0; i < UI_APP_PATH.length; i += 1) {
      await page.getByRole('button', { name: /next|see recommendation/i }).click();
    }

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Power Automate');
    await expect(
      page.getByRole('progressbar', { name: 'Fit score for Power Automate' })
    ).toBeVisible();
  });

  test('keeps later answers when an earlier one is edited', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    await page.getByRole('button', { name: /change an answer/i }).click();
    await page.getByRole('button', { name: /^Question 3:/ }).click();

    await expect(page.getByRole('radio').nth(UI_APP_PATH[2])).toBeChecked();
    await expect(page.getByRole('button', { name: /next|see recommendation/i })).toBeEnabled();
  });
});
