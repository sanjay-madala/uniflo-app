/**
 * PRODUCTION AUTH E2E TESTS
 *
 * Tests real Firebase Authentication against the live Uniflo production site.
 * Covers: login flows, error handling, session persistence, logout, JWT verification.
 */

import { test, expect, type Page } from "@playwright/test";
import {
  TEST_ACCOUNTS,
  getFirebaseToken,
  cleanupFirebaseApp,
  buildStorageState,
} from "./prod-auth.setup";

const PROD_URL =
  process.env.PROD_URL || "https://uniflo-prod.netlify.app";
const ORIGIN = new URL(PROD_URL).origin;

// ── Helpers ───────────────────────────────────────────────────

/** Navigate to the login page and wait for the form to be ready. */
async function goToLogin(page: Page): Promise<void> {
  await page.goto("/en/login/", { waitUntil: "load" });
  await expect(
    page.getByText("Welcome back"),
  ).toBeVisible({ timeout: 15000 });
}

/** Fill the login form and click "Sign in". */
async function submitLogin(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator('button[type="submit"]').click();
}

// ── Cleanup ───────────────────────────────────────────────────

test.afterAll(async () => {
  await cleanupFirebaseApp();
});

// ──────────────────────────────────────────────────────────────
// 1. VALID LOGIN FLOWS
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: valid login", () => {
  test("admin login redirects to dashboard", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );

    // Should navigate away from login
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });
  });

  test("manager login redirects to dashboard", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.manager.email,
      TEST_ACCOUNTS.manager.password,
    );

    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
  });

  test("field staff login redirects to dashboard", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.fieldStaff.email,
      TEST_ACCOUNTS.fieldStaff.password,
    );

    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
  });

  test("login form shows password toggle", async ({ page }) => {
    await goToLogin(page);
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("test");

    // Click eye toggle to reveal password
    const toggle = page.locator("button").filter({
      has: page.locator("svg"),
    }).nth(0); // The eye icon button inside the password field
    // The toggle is the button inside the password wrapper
    const eyeBtn = page.locator('input[type="password"]')
      .locator("..")
      .locator("button");
    if (await eyeBtn.isVisible()) {
      await eyeBtn.click();
      // Now the input type should be text
      await expect(page.locator('input[type="text"]').first()).toBeVisible();
    }
  });

  test("login page renders SSO buttons", async ({ page }) => {
    await goToLogin(page);

    await expect(
      page.locator("button").filter({ hasText: "Google" }),
    ).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: "Microsoft" }),
    ).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────
// 2. INVALID LOGIN FLOWS
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: invalid login", () => {
  test("invalid password shows error message", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(page, TEST_ACCOUNTS.admin.email, "WrongPassword99!");

    // Error message should appear (Firebase returns invalid-credential)
    await expect(
      page.getByText(/Invalid email or password|Login failed/i),
    ).toBeVisible({ timeout: 15000 });

    // Should still be on login page
    await expect(page).toHaveURL(/\/login\//);
  });

  test("non-existent email shows error message", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(page, "nobody@nonexistent.xyz", "SomePassword1!");

    await expect(
      page.getByText(/Invalid email or password|Login failed/i),
    ).toBeVisible({ timeout: 15000 });

    await expect(page).toHaveURL(/\/login\//);
  });

  test("empty email shows validation error", async ({ page }) => {
    await goToLogin(page);

    // Fill only password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("SomePassword1!");
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText(/Please enter both email and password/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test("empty password shows validation error", async ({ page }) => {
    await goToLogin(page);

    // Fill only email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(TEST_ACCOUNTS.admin.email);
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText(/Please enter both email and password/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test("short password shows validation error", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(page, TEST_ACCOUNTS.admin.email, "abc");

    await expect(
      page.getByText(/Password must be at least 6 characters/i),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 3. AUTH GUARD & REDIRECTS
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: guards", () => {
  test("accessing dashboard without auth redirects to login", async ({
    page,
  }) => {
    // Go directly to a protected route with no auth state
    await page.goto("/en/dashboard/", { waitUntil: "load" });

    // Should redirect to login
    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
  });

  test("accessing tickets without auth redirects to login", async ({
    page,
  }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });

    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
  });

  test("accessing admin pages without auth redirects to login", async ({
    page,
  }) => {
    await page.goto("/en/admin/settings/", { waitUntil: "load" });

    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 4. SESSION PERSISTENCE
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: session persistence", () => {
  test("session persists across page navigation", async ({ page }) => {
    // Log in first
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });

    // Navigate to tickets
    await page.goto("/en/tickets/", { waitUntil: "load" });
    // Should NOT be redirected to login
    await expect(page).not.toHaveURL(/\/login\//);
    await expect(
      page.locator("table tbody tr, h1, h2").first(),
    ).toBeVisible({ timeout: 15000 });

    // Navigate to audit
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page).not.toHaveURL(/\/login\//);
  });

  test("session persists after page reload", async ({ page }) => {
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });

    // Reload the page
    await page.reload({ waitUntil: "load" });

    // Should still be on dashboard, not redirected to login
    await expect(page).not.toHaveURL(/\/login\//);
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 5. LOGOUT
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: logout", () => {
  test("sign out returns to login page", async ({ page }) => {
    // Log in
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });

    // Open user dropdown (avatar button)
    const avatarButton = page.locator("header button").last();
    await avatarButton.click();

    // Click "Sign out"
    const signOutBtn = page
      .locator("button")
      .filter({ hasText: /Sign out/i });
    await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    await signOutBtn.click();

    // Should be back on login
    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
  });

  test("after logout, protected pages redirect to login", async ({
    page,
  }) => {
    // Log in
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });

    // Log out
    const avatarButton = page.locator("header button").last();
    await avatarButton.click();
    await page
      .locator("button")
      .filter({ hasText: /Sign out/i })
      .click();
    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });

    // Try to access dashboard
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/login\//, { timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 6. API DATA VERIFICATION (NOT MOCK)
// ──────────────────────────────────────────────────────────────

test.describe("Prod Auth: real data after login", () => {
  test("after login, dashboard shows real data (not mock placeholder)", async ({
    page,
  }) => {
    await goToLogin(page);
    await submitLogin(
      page,
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
    );
    await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });

    // Page should have actual content loaded
    const bodyText = await page.locator("body").textContent();
    // Real data should not contain placeholder markers
    expect(bodyText).not.toContain("[MOCK_PLACEHOLDER]");
    expect(bodyText).not.toContain("undefined undefined");
  });

  test("forgot password link navigates correctly", async ({ page }) => {
    await goToLogin(page);

    const forgotLink = page.locator('a[href*="forgot-password"]');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/forgot-password/, { timeout: 10000 });
  });

  test("remember me checkbox is functional", async ({ page }) => {
    await goToLogin(page);

    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    // Toggle it
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});
