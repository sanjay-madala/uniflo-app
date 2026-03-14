import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test('dashboard page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/dashboard/', { waitUntil: 'load' });
    await expect(page.getByText('Operations Dashboard')).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Filter to serious and critical only
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(serious).toHaveLength(0);
  });

  test('ticket list page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('h1, h2').filter({ hasText: 'Tickets' })).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(serious).toHaveLength(0);
  });

  test('audit list page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    await expect(page.locator('h1, h2').filter({ hasText: 'Audits' })).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(serious).toHaveLength(0);
  });
});
