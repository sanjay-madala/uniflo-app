import { test, expect } from '@playwright/test';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

test.describe('Drill-down navigation', () => {
  test('ticket list -> ticket detail -> back', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    const link = page.locator('table tbody tr a').first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL(/\/en\/tickets\/tkt_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });

    await page.goBack();
    await page.waitForURL(/\/en\/tickets\//, { timeout: 15000 });
    await expect(page.locator('h1, h2').filter({ hasText: 'Tickets' })).toBeVisible({ timeout: 15000 });
  });

  test('audit list -> audit detail -> results page', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    const link = page.locator('table tbody tr a').first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL(/\/en\/audit\/aud_\d+\//, { timeout: 15000 });

    await page.goto('/en/audit/aud_001/results/', { waitUntil: 'load' });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('SOP list -> SOP detail', async ({ page }) => {
    await page.goto('/en/sops/', { waitUntil: 'load' });
    const sopLink = page.locator('a[href*="/sops/sop_"]').first();
    await expect(sopLink).toBeVisible({ timeout: 15000 });
    await sopLink.click();
    await page.waitForURL(/\/en\/sops\/sop_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('CAPA list -> CAPA detail', async ({ page }) => {
    await page.goto('/en/capa/', { waitUntil: 'load' });
    const capaLink = page.locator('a[href*="/capa/capa_"]').first();
    await expect(capaLink).toBeVisible({ timeout: 15000 });
    await capaLink.click();
    await page.waitForURL(/\/en\/capa\/capa_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('KB home -> article detail', async ({ page }) => {
    await page.goto('/en/knowledge/', { waitUntil: 'load' });
    const articleLink = page.locator('a[href*="/knowledge/kba_"]').first();
    await expect(articleLink).toBeVisible({ timeout: 15000 });
    await articleLink.click();
    await page.waitForURL(/\/en\/knowledge\/kba_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('workflow list -> rule detail', async ({ page }) => {
    await page.goto('/en/workflow/', { waitUntil: 'load' });
    const ruleLink = page.locator('a[href*="/workflow/rule_"]').first();
    await expect(ruleLink).toBeVisible({ timeout: 15000 });
    await ruleLink.click();
    await page.waitForURL(/\/en\/workflow\/rule_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('tasks list -> task detail', async ({ page }) => {
    await page.goto('/en/tasks/', { waitUntil: 'load' });
    const taskLink = page.locator('a[href*="/tasks/task_"]').first();
    await expect(taskLink).toBeVisible({ timeout: 15000 });
    await taskLink.click();
    await page.waitForURL(/\/en\/tasks\/task_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('goals -> goal detail', async ({ page }) => {
    await page.goto('/en/goals/', { waitUntil: 'load' });
    const goalLink = page.locator('a[href*="/goals/goal_"]').first();
    await expect(goalLink).toBeVisible({ timeout: 15000 });
    await goalLink.click();
    await page.waitForURL(/\/en\/goals\/goal_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('training -> module detail', async ({ page }) => {
    await page.goto('/en/training/', { waitUntil: 'load' });
    // Wait for page content to hydrate (grid or table view)
    await expect(page.locator('text=/\\d+ modules? found/')).toBeVisible({ timeout: 15000 });
    const moduleLink = page.locator('a[href*="/training/tm_"]').first();
    await expect(moduleLink).toBeVisible({ timeout: 15000 });
    await moduleLink.click();
    await page.waitForURL(/\/en\/training\/tm_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });

  test('comms -> broadcast detail', async ({ page }) => {
    await page.goto('/en/comms/', { waitUntil: 'load' });
    const bcLink = page.locator('a[href*="/comms/bc_"]').first();
    await expect(bcLink).toBeVisible({ timeout: 15000 });
    await bcLink.click();
    await page.waitForURL(/\/en\/comms\/bc_\d+\//, { timeout: 15000 });
    await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });
  });
});
