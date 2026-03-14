import { test, expect } from '@playwright/test';

/**
 * Auth helper: sets localStorage so AuthGuard lets us through.
 * Must be called before any page.goto().
 */
async function authenticate(page: import('@playwright/test').Page) {
  // Navigate to a blank page on the same origin first so localStorage is available
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });
}

const pages = [
  { path: '/en/', label: 'Home / entry' },
  { path: '/en/dashboard/', label: 'Dashboard' },
  { path: '/en/tickets/', label: 'Tickets' },
  { path: '/en/tickets/board/', label: 'Ticket Board' },
  { path: '/en/sops/', label: 'SOPs' },
  { path: '/en/audit/', label: 'Audits' },
  { path: '/en/capa/', label: 'CAPA' },
  { path: '/en/workflow/', label: 'Workflow' },
  { path: '/en/knowledge/', label: 'Knowledge Base' },
  { path: '/en/tasks/', label: 'Tasks' },
  { path: '/en/analytics/', label: 'Analytics' },
  { path: '/en/sla/', label: 'SLA' },
  { path: '/en/goals/', label: 'Goals' },
  { path: '/en/customer/', label: 'Customer Portal' },
  { path: '/en/comms/', label: 'Communications' },
  { path: '/en/training/', label: 'Training' },
  { path: '/en/mobile/', label: 'Mobile' },
];

test.describe('Navigation smoke tests', () => {
  for (const { path, label } of pages) {
    test(`${label} (${path}) loads without errors`, async ({ page }) => {
      await authenticate(page);

      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(path, { waitUntil: 'load' });

      // Wait for React hydration — the title is set by Next.js during hydration
      await expect(page).toHaveTitle(/Uniflo/, { timeout: 15000 });

      // No JS console errors (filter out benign React hydration warnings and resource loads)
      const realErrors = consoleErrors.filter(
        (e) =>
          !e.includes('Hydration') &&
          !e.includes('hydrat') &&
          !e.includes('Warning:') &&
          !e.includes('act()') &&
          !e.includes('Failed to load resource') &&
          !e.includes('favicon')
      );
      expect(realErrors).toHaveLength(0);
    });
  }
});
