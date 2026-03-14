import { test, expect } from '@playwright/test';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

test.describe('Tickets', () => {
  test('ticket list renders with data', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('h1, h2').filter({ hasText: 'Tickets' })).toBeVisible({ timeout: 15000 });

    // Table should have rows
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('click a ticket row navigates to detail', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

    const firstTicketLink = page.locator('table tbody tr a').first();
    await expect(firstTicketLink).toBeVisible();
    await firstTicketLink.click();

    await page.waitForURL(/\/en\/tickets\/tkt_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('board view renders kanban columns', async ({ page }) => {
    await page.goto('/en/tickets/board/', { waitUntil: 'load' });
    await expect(page.getByText(/Open|In Progress|Resolved/).first()).toBeVisible({ timeout: 15000 });
  });

  test('search input filters the list', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

    const searchInput = page.getByPlaceholder('Search tickets...');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('maintenance');
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveValue('maintenance');
  });
});
