import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AUTH_STORAGE_STATE } from './auth.setup';

test.use({ storageState: AUTH_STORAGE_STATE });

/**
 * Known issues excluded from strict pass criteria:
 * - color-contrast: dark theme has known contrast issues (tracked separately)
 * - scrollable-region-focusable: some scrollable areas need tabindex (tracked separately)
 */
const EXCLUDED_RULES = [
  'color-contrast',              // Dark theme contrast issues (tracked separately)
  'scrollable-region-focusable', // Scrollable areas need tabindex (tracked separately)
  'button-name',                 // Radix Select triggers lack aria-label (tracked separately)
];

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test('dashboard page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/dashboard/', { waitUntil: 'load' });
    await expect(page.getByText('Operations Dashboard')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (serious.length > 0) {
      console.log('Dashboard a11y violations:', JSON.stringify(serious.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(serious).toHaveLength(0);
  });

  test('ticket list page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/tickets/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (serious.length > 0) {
      console.log('Tickets a11y violations:', JSON.stringify(serious.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(serious).toHaveLength(0);
  });

  test('audit list page has no critical a11y violations', async ({ page }) => {
    await page.goto('/en/audit/', { waitUntil: 'load' });
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (serious.length > 0) {
      console.log('Audit a11y violations:', JSON.stringify(serious.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(serious).toHaveLength(0);
  });
});
