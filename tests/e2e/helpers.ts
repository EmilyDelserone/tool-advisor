import type { Page } from '@playwright/test';

// Answer option indexes per core question, in wizard order
export const UI_APP_PATH = [0, 1, 1, 1, 1, 0, 1]; // resolves cleanly to Power Apps
export const TIE_PATH = [1, 0, 0, 1, 0, 0, 0]; // ties Copilot Studio with Azure Logic Apps

export async function startWizard(page: Page) {
  const getStarted = page.getByRole('button', { name: /get started/i });
  const count = await getStarted.count();

  if (count > 1) {
    throw new Error(`Expected at most one Get Started button, found ${count}`);
  }

  if (count === 1) {
    await getStarted.waitFor({ state: 'visible' });
    await getStarted.click();
  }
}

export async function waitForQuestionView(page: Page) {
  await page.getByRole('radio').first().waitFor();
}

export async function answerByIndex(page: Page, optionIndex: number) {
  await startWizard(page);
  await waitForQuestionView(page);
  await page.getByRole('radio').nth(optionIndex).check();
  await page.getByRole('button', { name: /next|see recommendation/i }).click();
}

export async function walkPath(page: Page, path: number[]) {
  for (const optionIndex of path) {
    await answerByIndex(page, optionIndex);
  }
}

/** Tabs forward until a radio has focus, so glossary triggers and step buttons don't break the walk. */
export async function tabToFirstRadio(page: Page, maxPresses = 30) {
  await startWizard(page);
  await waitForQuestionView(page);
  await page.locator('body').press('Tab');

  for (let i = 0; i < maxPresses; i += 1) {
    const onRadio = await page.evaluate(
      () => document.activeElement?.getAttribute('type') === 'radio'
    );

    if (onRadio) {
      return;
    }

    await page.keyboard.press('Tab');
  }

  throw new Error('Could not reach a radio option using Tab');
}
