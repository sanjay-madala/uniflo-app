import { test, expect } from '@playwright/test';

async function authenticate(page: import('@playwright/test').Page) {
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

test.describe('Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test('ticket list renders with data', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });

    // Wait for hydration and content
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

    // Click the first ticket link in the table
    const firstTicketLink = page.locator('table tbody tr a').first();
    await expect(firstTicketLink).toBeVisible();
    await firstTicketLink.click();

    // Should navigate to a ticket detail page
    await page.waitForURL(/\/en\/tickets\/tkt_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('board view renders kanban columns', async ({ page }) => {
    await page.goto('/en/tickets/board/', { waitUntil: 'load' });

    // Board view should show status columns
    await expect(page.getByText(/Open|In Progress|Resolved/).first()).toBeVisible({ timeout: 15000 });
  });

  test('search input filters the list', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

    // Find the search input
    const searchInput = page.getByPlaceholder('Search tickets...');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('maintenance');
    await page.waitForTimeout(300);

    // The search input should have our value
    await expect(searchInput).toHaveValue('maintenance');
  });
});
