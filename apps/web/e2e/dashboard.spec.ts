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
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('date range picker is clickable', async ({ page }) => {
    const dateButton = page.getByRole('button', { name: /last 30 days|last 7 days|last 90 days|this quarter/i });
    await expect(dateButton.first()).toBeVisible();
    await dateButton.first().click();
  });

  test('quick actions buttons exist', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });
});
