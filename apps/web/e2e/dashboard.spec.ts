import { test, expect } from '@playwright/test';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/dashboard/', { waitUntil: 'load' });
    await expect(page.getByText('Operations Dashboard')).toBeVisible({ timeout: 15000 });
  });

  test('loads and shows KPI cards', async ({ page }) => {
    await expect(page.getByText('Operations Dashboard')).toBeVisible();

    // KPI cards are rendered by DashboardKPIRow — numeric values visible
    const kpiCards = page.locator('text=/\\d+%?/');
    await expect(kpiCards.first()).toBeVisible();
  });

  test('activity feed is visible', async ({ page }) => {
    await expect(page.getByText('Latest Activity')).toBeVisible({ timeout: 10000 });
  });

  test('date range picker is clickable', async ({ page }) => {
    // Date range buttons use short labels: 7d, 30d, 90d, Q
    const dateButton = page.getByRole('button', { name: /30d|7d|90d/i });
    await expect(dateButton.first()).toBeVisible({ timeout: 10000 });
    await dateButton.first().click();
  });

  test('quick actions buttons exist', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible({ timeout: 10000 });
  });
});
