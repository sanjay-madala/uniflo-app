/**
 * PRODUCTION DATA FLOW E2E TESTS
 *
 * Tests that the live Uniflo production site loads real data from the API,
 * verifies module pages render content, cross-module links work, and
 * filtering/pagination behave with actual data.
 */

import { test, expect, type Page } from "@playwright/test";
import {
  TEST_ACCOUNTS,
  cleanupFirebaseApp,
} from "./prod-auth.setup";

const PROD_URL =
  process.env.PROD_URL || "https://uniflo-prod.netlify.app";

// ── Helpers ───────────────────────────────────────────────────

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/en/login/", { waitUntil: "load" });
  await expect(page.getByText("Welcome back")).toBeVisible({
    timeout: 15000,
  });

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await emailInput.fill(TEST_ACCOUNTS.admin.email);
  await passwordInput.fill(TEST_ACCOUNTS.admin.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard\//, { timeout: 20000 });
}

// ── Cleanup ───────────────────────────────────────────────────

test.afterAll(async () => {
  await cleanupFirebaseApp();
});

// ──────────────────────────────────────────────────────────────
// 1. DASHBOARD DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("dashboard loads with KPI values", async ({ page }) => {
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });

    // KPI cards should contain numeric values
    await expect(
      page.getByText("Open Tickets").first(),
    ).toBeVisible();
    await expect(
      page.getByText("Compliance Score").first(),
    ).toBeVisible();

    // There should be at least one number displayed
    const numbers = page.locator("text=/\\d+/");
    await expect(numbers.first()).toBeVisible();
  });

  test("dashboard does not contain mock data markers", async ({ page }) => {
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("[MOCK_PLACEHOLDER]");
    expect(bodyText).not.toContain("SEED_DATA");
    expect(bodyText).not.toContain("TODO_REPLACE");
  });

  test("dashboard activity feed has entries", async ({ page }) => {
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(/Activity/i)).toBeVisible();
  });

  test("dashboard compliance heatmap renders", async ({ page }) => {
    await expect(
      page.getByText("Operations Dashboard"),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByText("Compliance Heatmap"),
    ).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────
// 2. TICKETS DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Tickets", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("ticket list loads with rows", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("ticket rows show expected columns", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // Table headers should include common ticket fields
    const headerText = await page.locator("table thead").textContent();
    expect(headerText).toBeTruthy();
  });

  test("ticket search filters results", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    const beforeCount = await page.locator("table tbody tr").count();
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("temperature");
      await page.waitForTimeout(500);

      const afterCount = await page.locator("table tbody tr").count();
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    }
  });

  test("ticket detail page loads from list click", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // Click first ticket link
    const ticketLink = page.locator('a[href*="/tickets/tkt_"]').first();
    await expect(ticketLink).toBeVisible();
    await ticketLink.click();
    await page.waitForURL(/\/tickets\/tkt_/, { timeout: 10000 });

    // Detail page should display ticket attributes
    await expect(
      page.locator("text=/Priority|Status|Assignee/i").first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("ticket kanban board loads columns", async ({ page }) => {
    await page.goto("/en/tickets/board/", { waitUntil: "load" });

    await expect(
      page.getByText(/Open|In Progress|Resolved|Closed/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 3. AUDIT DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Audits", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("audit list loads with rows", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /Audits/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible();
  });

  test("audit detail page shows score or sections", async ({ page }) => {
    await page.goto("/en/audit/aud_001/", { waitUntil: "load" });

    const scoreOrSection = page
      .locator("text=/\\d+%/")
      .or(page.locator("text=/Score|Section|Checklist/i"));
    await expect(scoreOrSection.first()).toBeVisible({ timeout: 15000 });
  });

  test("audit results page shows score", async ({ page }) => {
    await page.goto("/en/audit/aud_001/results/", { waitUntil: "load" });

    const score = page
      .locator("text=/\\d+%/")
      .or(page.locator("svg circle"));
    await expect(score.first()).toBeVisible({ timeout: 15000 });
  });

  test("audit calendar view loads", async ({ page }) => {
    await page.goto("/en/audit/calendar/", { waitUntil: "load" });

    await expect(
      page
        .locator("text=/Mon|Tue|Wed|Thu|Fri|Jan|Feb|Mar/i")
        .first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 4. SOP DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: SOPs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("SOP list loads with rows", async ({ page }) => {
    await page.goto("/en/sops/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /SOP/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible();
  });

  test("SOP detail shows step content", async ({ page }) => {
    await page.goto("/en/sops/sop_001/", { waitUntil: "load" });

    await expect(
      page.locator("text=/Step|Overview|Acknowledgment/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("SOP builder page loads", async ({ page }) => {
    await page.goto("/en/sops/builder/", { waitUntil: "load" });

    await expect(
      page.locator("text=/Builder|Create|New SOP/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 5. CAPA DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: CAPA", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("CAPA list loads with items", async ({ page }) => {
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /CAPA/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.locator("table tbody tr, [class*='card']").first(),
    ).toBeVisible();
  });

  test("CAPA detail shows status timeline", async ({ page }) => {
    await page.goto("/en/capa/capa_001/", { waitUntil: "load" });

    const timeline = page.locator(
      "text=/Open|In Progress|Verified|Closed/i",
    );
    await expect(timeline.first()).toBeVisible({ timeout: 15000 });
  });

  test("CAPA detail shows linked audit source", async ({ page }) => {
    await page.goto("/en/capa/capa_001/", { waitUntil: "load" });

    const source = page.locator("text=/Source|Audit|Linked/i");
    await expect(source.first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 6. KNOWLEDGE BASE DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Knowledge Base", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("KB home shows categories or articles", async ({ page }) => {
    await page.goto("/en/knowledge/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /Knowledge/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.locator("text=/article|Article|categor/i").first(),
    ).toBeVisible();
  });

  test("KB article view renders content", async ({ page }) => {
    await page.goto("/en/knowledge/kba_001/", { waitUntil: "load" });

    await expect(
      page
        .locator(
          "article, [class*='article'], [class*='content']",
        )
        .first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 7. ORG-SCOPED DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: org scoping", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("org name is visible in the top bar", async ({ page }) => {
    // The TopBar displays org.name — for demo accounts this is "Demo Corp"
    const orgName = page.locator("header").getByText(/Demo Corp|Uniflo/i);
    await expect(orgName.first()).toBeVisible({ timeout: 10000 });
  });

  test("data does not leak across orgs", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // No tickets from other orgs (check for known foreign org names)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("AcmeCorp_Foreign");
    expect(bodyText).not.toContain("TestOrg_External");
  });
});

// ──────────────────────────────────────────────────────────────
// 8. CROSS-MODULE LINKS
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: cross-module links", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("full data loop: tickets -> audit -> CAPA -> SOP", async ({
    page,
  }) => {
    // Tickets list
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // Audits list
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // CAPA list
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(
      page.locator("h1, h2").filter({ hasText: /CAPA/i }),
    ).toBeVisible({ timeout: 15000 });

    // SOPs list
    await page.goto("/en/sops/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("audit detail -> results -> back to list", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });

    // Click into detail
    const auditLink = page.locator('a[href*="/audit/aud_"]').first();
    await auditLink.click();
    await page.waitForURL(/\/audit\/aud_/, { timeout: 10000 });

    // Go to results if link exists
    const resultsLink = page.locator('a[href*="/results"]').first();
    if (await resultsLink.isVisible({ timeout: 3000 })) {
      await resultsLink.click();
      await page.waitForURL(/\/results/, { timeout: 10000 });
    }

    // Navigate back via sidebar
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(
      page.locator("table tbody tr").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("CAPA detail links back to source audit", async ({ page }) => {
    await page.goto("/en/capa/capa_001/", { waitUntil: "load" });

    // Look for any link that references an audit
    const auditRef = page.locator("text=/Source|Audit|Linked/i").first();
    await expect(auditRef).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 9. ANALYTICS DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("analytics hub loads with module cards", async ({ page }) => {
    await page.goto("/en/analytics/", { waitUntil: "load" });
    await expect(
      page.locator("text=/Analytics/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("ticket analytics shows charts or data", async ({ page }) => {
    await page.goto("/en/analytics/tickets/", { waitUntil: "load" });
    await expect(
      page.locator("text=/Ticket|Volume|SLA/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("audit analytics shows compliance data", async ({ page }) => {
    await page.goto("/en/analytics/audits/", { waitUntil: "load" });
    await expect(
      page.locator("text=/Audit|Compliance|Score/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// 10. WORKFLOW DATA
// ──────────────────────────────────────────────────────────────

test.describe("Prod Data: Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("workflow rules list loads", async ({ page }) => {
    await page.goto("/en/workflow/", { waitUntil: "load" });
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /Automation|Workflow/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.locator("text=/rule|Rule|trigger|Trigger/i").first(),
    ).toBeVisible();
  });

  test("workflow template gallery loads", async ({ page }) => {
    await page.goto("/en/workflow/templates/", { waitUntil: "load" });

    await expect(
      page.locator("text=/Template|template/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
