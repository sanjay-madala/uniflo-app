import { test, expect } from '@playwright/test';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto('/en/dashboard/', { waitUntil: 'load' });
    // Wait for React hydration
    await expect(page.getByText('Operations Dashboard')).toBeVisible({ timeout: 15000 });
  });

  test('loads and shows KPI cards', async ({ page }) => {
    // The PageHeader says "Operations Dashboard"
    await expect(page.getByText('Operations Dashboard')).toBeVisible();

    // KPI cards are rendered by DashboardKPIRow
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
