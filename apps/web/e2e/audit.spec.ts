import { test, expect } from '@playwright/test';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

test.describe('Audit', () => {
  test('audit list loads', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    await expect(page.locator('h1, h2').filter({ hasText: 'Audits' })).toBeVisible({ timeout: 15000 });

    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('click an audit navigates to detail page', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

    const firstAuditLink = page.locator('table tbody tr a').first();
    await expect(firstAuditLink).toBeVisible();
    await firstAuditLink.click();

    await page.waitForURL(/\/en\/audit\/aud_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('score ring is visible on detail page', async ({ page }) => {
    await page.goto('/en/audit/aud_001/', { waitUntil: 'load' });
    const scoreElement = page.locator('text=/\\d+%/');
    await expect(scoreElement.first()).toBeVisible({ timeout: 15000 });
  });
});
