import { test, expect } from '@playwright/test';

test('debug: see what page renders', async ({ page }) => {
  // First visit login to set up localStorage
  await page.goto('/en/login/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('uniflo-auth', 'true');
    localStorage.setItem('uniflo-role', 'admin');
  });

  // Now visit dashboard
  await page.goto('/en/dashboard/', { waitUntil: 'load' });

  // Wait a bit for hydration
  await page.waitForTimeout(5000);

  // Log what we see
  const title = await page.title();
  const bodyText = await page.locator('body').innerText();
  const htmlClass = await page.locator('html').getAttribute('class');

  console.log('=== DEBUG INFO ===');
  console.log('Title:', title);
  console.log('HTML class:', htmlClass);
  console.log('Body text (first 500 chars):', bodyText.slice(0, 500));
  console.log('URL:', page.url());
  console.log('=== END DEBUG ===');

  expect(true).toBe(true);
});
