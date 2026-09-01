import type { Page } from '@playwright/test';

// Answer option indexes per core question, in wizard order
export const UI_APP_PATH = [0, 1, 1, 1, 1, 0, 1]; // resolves cleanly to Power Apps
export const TIE_PATH = [1, 0, 0, 1, 0, 0, 0]; // ties Copilot Studio with Azure Logic Apps

export async function answerByIndex(page: Page, optionIndex: number) {
  await page.getByRole('radio').nth(optionIndex).check();
  await page.getByRole('button', { name: /next|see recommendation/i }).click();
}

export async function walkPath(page: Page, path: number[]) {
  for (const optionIndex of path) {
    await answerByIndex(page, optionIndex);
  }
}
