import { test, expect, type Page } from '@playwright/test';
import { UI_APP_PATH, answerByIndex, walkPath } from './helpers';

const INTERACTIVE_ROLES = ['button', 'link', 'radio', 'radiogroup', 'checkbox', 'textbox'];

const unnamedControls = (ariaYaml: string) =>
  ariaYaml
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      const match = /^- ([a-z]+)(.*)$/.exec(line);
      if (!match || !INTERACTIVE_ROLES.includes(match[1])) {
        return false;
      }
      return !/"[^"]+"/.test(match[2]);
    });

const ariaTree = (page: Page) => page.locator('body').ariaSnapshot();

/**
 * Automated coverage of what a screen reader announces. It does not replace a manual
 * VoiceOver/NVDA pass, but it fails if any control loses its accessible name or role.
 */
test.describe('Screen reader announcements (DR-001, SC-006)', () => {
  test('names every interactive control on the question view', async ({ page }) => {
    await page.goto('/');

    const tree = await ariaTree(page);

    expect(tree).toContain('radiogroup');
    expect(unnamedControls(tree)).toEqual([]);
  });

  test('announces the question as the group label and each option', async ({ page }) => {
    await page.goto('/');

    const tree = await ariaTree(page);

    expect(tree).toMatch(/radiogroup "Does your solution need a UI for end users\?/);
    expect(tree).toContain('radio "Yes"');
    expect(tree).toContain('radio "No"');
  });

  test('announces progress as text, not just a bar', async ({ page }) => {
    await page.goto('/');

    const progress = page.getByRole('progressbar');
    await expect(progress).toHaveAttribute('aria-valuetext', /Question 1 of \d+/);
    await expect(progress).toHaveAttribute('aria-valuenow', '1');
  });

  test('announces glossary triggers with the term they explain', async ({ page }) => {
    await page.goto('/');

    const tree = await ariaTree(page);

    expect(tree).toMatch(/button "What does .* mean\?"/);
  });

  test('names every control and link on the results view', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);
    await expect(page.getByText('Recommended tool')).toBeVisible();

    const tree = await ariaTree(page);

    expect(unnamedControls(tree)).toEqual([]);
    expect(tree).toContain('button "Start over"');

    const linkNames = [...tree.matchAll(/- link "([^"]+)"/g)].map((match) => match[1]);
    expect(linkNames.length).toBeGreaterThanOrEqual(2);
    linkNames.forEach((name) => expect(name).toMatch(/opens in a new tab/i));

    await expect(page.getByRole('columnheader', { name: 'Tool' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Use case' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Why not this one?' })).toBeVisible();
  });

  test('exposes a single main landmark and one h1 per view', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    await walkPath(page, UI_APP_PATH);

    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('announces progress changes through a live region', async ({ page }) => {
    await page.goto('/');

    const live = page.locator('[aria-live="polite"]');
    await expect(live).toContainText('Question 1 of');

    await answerByIndex(page, UI_APP_PATH[0]);

    await expect(live).toContainText('Question 2 of');
  });

  test('announces the selected state of a radio option', async ({ page }) => {
    await page.goto('/');

    const first = page.getByRole('radio').first();
    await expect(first).not.toBeChecked();

    await first.check();

    await expect(first).toBeChecked();
    expect(await ariaTree(page)).toMatch(/radio "Yes" \[checked\]/);
  });

  test('announces the step list as navigation with the current step marked', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Wizard steps' });
    await expect(nav).toBeVisible();

    const tree = await nav.ariaSnapshot();
    expect(tree).toMatch(/button "Question 1:.*"/);
    await expect(page.getByRole('button', { name: /^Question 1:/ })).toHaveAttribute(
      'aria-current',
      'step'
    );
  });

  test('announces glossary definitions when opened, without trapping focus', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /mean\?$/ }).first();
    await trigger.focus();
    await page.keyboard.press('Enter');

    const tree = await ariaTree(page);
    expect(tree).toContain('Example:');

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('announces the runner-up disclosure state and its revealed content', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const toggle = page.getByRole('button', { name: /^Show what lowered / }).first();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const controls = await toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    await toggle.click();

    await expect(page.getByRole('button', { name: /^Hide what lowered / }).first()).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(page.locator(`#${controls}`)).toBeVisible();
  });

  test('keeps decorative tool icons out of the accessibility tree', async ({ page }) => {
    await page.goto('/');
    await walkPath(page, UI_APP_PATH);

    const tree = await ariaTree(page);

    expect(tree).not.toMatch(/- img/);
    expect(tree).toContain('heading "Power Apps"');
  });
});
