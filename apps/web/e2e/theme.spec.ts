import { test, expect } from '@playwright/test';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

test.describe('Dark/Light mode toggle', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
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

    // Click theme toggle
    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await toggle.click();

    // Should now be light
    await expect(html).toHaveClass(/light/);

    // Click again to go back to dark
    const toggleBack = page.getByRole('button', { name: /switch to dark mode/i });
    await toggleBack.click();

    await expect(html).toHaveClass(/dark/);
  });

  test('key elements change appearance on toggle', async ({ page }) => {
    // Capture background color in dark mode
    const body = page.locator('body');
    const darkBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor);

    // Switch to light
    const toggle = page.getByRole('button', { name: /switch to light mode/i });
    await toggle.click();
    await page.waitForTimeout(300);

    const lightBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor);

    // Colors should differ between dark and light
    expect(darkBg).not.toEqual(lightBg);
  });
});
