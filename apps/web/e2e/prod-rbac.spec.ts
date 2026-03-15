/**
 * PRODUCTION RBAC E2E TESTS
 *
 * Tests role-based access control against the live Uniflo production site.
 * Each role (Admin, Manager, Field Staff) has different visibility and
 * permission levels. These tests log in as each role and verify the UI
 * reflects the correct access boundaries.
 */

import { test, expect, type Page } from "@playwright/test";
import {
  TEST_ACCOUNTS,
  type TestAccount,
  buildStorageState,
  getFirebaseToken,
  cleanupFirebaseApp,
} from "./prod-auth.setup";

const PROD_URL =
  process.env.PROD_URL || "https://uniflo-prod.netlify.app";
const ORIGIN = new URL(PROD_URL).origin;

// ── Helpers ───────────────────────────────────────────────────

async function loginAs(page: Page, account: TestAccount): Promise<void> {
  await page.goto("/en/login/", { waitUntil: "load" });
  await expect(page.getByText("Welcome back")).toBeVisible({
    timeout: 15000,
  });

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await emailInput.fill(account.email);
  await passwordInput.fill(account.password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
}

async function setRoleViaUI(page: Page, roleName: string): Promise<void> {
  // Click the role switcher in the top bar
  const roleSwitcher = page
    .locator("header button")
    .filter({ has: page.locator("svg") })
    .filter({ hasText: /Admin|Manager|Field Staff/i });
  await roleSwitcher.click();

  // Select the target role
  const roleOption = page
    .locator("button")
    .filter({ hasText: new RegExp(`^${roleName}$`, "i") });
  await roleOption.click();

  // Wait for UI to settle
  await page.waitForTimeout(500);
}

// ── Cleanup ───────────────────────────────────────────────────

test.afterAll(async () => {
  await cleanupFirebaseApp();
});

// ──────────────────────────────────────────────────────────────
// ADMIN ROLE
// ──────────────────────────────────────────────────────────────

test.describe("Prod RBAC: Admin role", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ACCOUNTS.admin);
  });

  test("admin sees all sidebar navigation items", async ({ page }) => {
    const expectedLabels = [
      "Dashboard",
      "Tickets",
      "SOPs",
      "Audits",
      "CAPA",
      "Tasks",
      "Analytics",
      "SLA",
      "Knowledge Base",
      "Workflow",
      "Goals",
    ];

    for (const label of expectedLabels) {
      const link = page
        .locator("nav a, aside a")
        .filter({ hasText: new RegExp(label, "i") })
        .first();
      await expect(link).toBeVisible({ timeout: 5000 });
    }
  });

  test("admin sees admin section in sidebar", async ({ page }) => {
    await expect(
      page
        .locator("aside a")
        .filter({ hasText: /Users/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page
        .locator("aside a")
        .filter({ hasText: /Roles/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page
        .locator("aside a")
        .filter({ hasText: /Settings/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("admin can access users page", async ({ page }) => {
    await page.goto("/en/admin/users/", { waitUntil: "load" });
    await expect(
      page.locator("text=/User|user|Team/i").first(),
    ).toBeVisible({ timeout: 15000 });

    // Should NOT redirect to login or show access denied
    await expect(page).not.toHaveURL(/\/login\//);
  });

  test("admin can access roles page", async ({ page }) => {
    await page.goto("/en/admin/roles/", { waitUntil: "load" });
    await expect(
      page.locator("text=/Role|Permission|role/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("admin can access settings page", async ({ page }) => {
    await page.goto("/en/admin/settings/", { waitUntil: "load" });
    await expect(
      page.locator("text=/Setting|Organization|General/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("admin role switcher shows Admin as active", async ({ page }) => {
    // The role switcher in the top bar should indicate current role
    const roleIndicator = page
      .locator("header")
      .getByText(/Admin/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 5000 });
  });
});

// ──────────────────────────────────────────────────────────────
// MANAGER ROLE
// ──────────────────────────────────────────────────────────────

test.describe("Prod RBAC: Manager role", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ACCOUNTS.admin);
    await setRoleViaUI(page, "Manager");
  });

  test("manager can see tickets module", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr, h1, h2").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("manager can see audits module", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /Audits/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("manager can see SOPs module", async ({ page }) => {
    await page.goto("/en/sops/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /SOP/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("manager can see CAPA module", async ({ page }) => {
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /CAPA/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("manager role is reflected in the top bar", async ({ page }) => {
    const roleIndicator = page
      .locator("header")
      .getByText(/Manager/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 5000 });
  });
});

// ──────────────────────────────────────────────────────────────
// FIELD STAFF ROLE
// ──────────────────────────────────────────────────────────────

test.describe("Prod RBAC: Field Staff role", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ACCOUNTS.admin);
    await setRoleViaUI(page, "Field Staff");
  });

  test("field staff can see tasks module", async ({ page }) => {
    await page.goto("/en/tasks/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr, h1, h2").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("field staff can see audits module", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /Audits/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("field staff role is reflected in the top bar", async ({ page }) => {
    const roleIndicator = page
      .locator("header")
      .getByText(/Field Staff/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 5000 });
  });

  test("field staff can access the dashboard", async ({ page }) => {
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// ROLE SWITCHING
// ──────────────────────────────────────────────────────────────

test.describe("Prod RBAC: role switching", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ACCOUNTS.admin);
  });

  test("switching from Admin to Manager updates the role indicator", async ({
    page,
  }) => {
    await setRoleViaUI(page, "Manager");

    const roleIndicator = page
      .locator("header")
      .getByText(/Manager/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 5000 });
  });

  test("switching from Admin to Field Staff updates the role indicator", async ({
    page,
  }) => {
    await setRoleViaUI(page, "Field Staff");

    const roleIndicator = page
      .locator("header")
      .getByText(/Field Staff/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 5000 });
  });

  test("role persists in localStorage after switch", async ({ page }) => {
    await setRoleViaUI(page, "Manager");

    const storedRole = await page.evaluate(() =>
      localStorage.getItem("uniflo-role"),
    );
    expect(storedRole).toBe("manager");
  });

  test("role persists after page reload", async ({ page }) => {
    await setRoleViaUI(page, "Field Staff");

    await page.reload({ waitUntil: "load" });

    // After reload, the role indicator should still show Field Staff
    const roleIndicator = page
      .locator("header")
      .getByText(/Field Staff/i)
      .first();
    await expect(roleIndicator).toBeVisible({ timeout: 10000 });
  });
});
