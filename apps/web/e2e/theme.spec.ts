import { test, expect } from '@playwright/test';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

test.describe('Dark/Light mode toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/', { waitUntil: 'load' });
    await expect(page.getByText('Operations Dashboard')).toBeVisible({ timeout: 15000 });
  });

  test('theme toggle button exists', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();
  });

  test('click toggles between dark and light', async ({ page }) => {
    const html = page.locator('html');

    // Default theme is dark
    await expect(html).toHaveClass(/dark/);

    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await toggle.click();

    await expect(html).toHaveClass(/light/);

    const toggleBack = page.getByRole('button', { name: /switch to dark mode/i });
    await toggleBack.click();

    await expect(html).toHaveClass(/dark/);
  });

  test('key elements change appearance on toggle', async ({ page }) => {
    const body = page.locator('body');
    const darkBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor);

    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await toggle.click();
    await page.waitForTimeout(300);

    const lightBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).not.toEqual(lightBg);
  });
});
