import { test, expect } from '@playwright/test';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

test.describe('Audit', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test('audit list loads', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });

    // Wait for hydration
    await expect(page.locator('h1, h2').filter({ hasText: 'Audits' })).toBeVisible({ timeout: 15000 });

    // Table should have rows
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('click an audit navigates to detail page', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

    // Click the first audit link
    const firstAuditLink = page.locator('table tbody tr a').first();
    await expect(firstAuditLink).toBeVisible();
    await firstAuditLink.click();

    // Should navigate to audit detail page
    await page.waitForURL(/\/en\/audit\/aud_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('score ring is visible on detail page', async ({ page }) => {
    await page.goto('/en/audit/aud_001/', { waitUntil: 'load' });

    // Audit detail pages show a score percentage
    const scoreElement = page.locator('text=/\\d+%/');
    await expect(scoreElement.first()).toBeVisible({ timeout: 15000 });
  });
});
