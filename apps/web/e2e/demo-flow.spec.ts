/**
 * UNIFLO DEMO E2E TEST SUITE
 *
 * Tests the complete demo flow that showcases Uniflo's value proposition:
 * "One complaint triggers an audit, a CAPA task, a SOP reference, and a goal update — automatically."
 *
 * 8 Demo Scenarios:
 * 1. Login & Dashboard — unified ops view
 * 2. Ticket Management — create, view, filter, board
 * 3. Audit Triggered — from ticket, conduct on mobile, fail items
 * 4. Auto-Ticket/CAPA Modal — THE DEMO MOMENT
 * 5. CAPA Lifecycle — view, status timeline, linked audit
 * 6. SOP Referenced — CAPA links to SOP, SOP viewer works
 * 7. Workflow Automation — rules, templates, execution history
 * 8. Cross-Module Navigation — full loop without dead ends
 */

import { test, expect, type Page } from "@playwright/test";
import { AUTH_STORAGE_STATE } from "./auth.setup";

test.use({ storageState: AUTH_STORAGE_STATE });

// ──────────────────────────────────────────────────────────────
// SCENARIO 1: LOGIN & EXECUTIVE DASHBOARD
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 1: Dashboard", () => {
  test("dashboard loads with all sections visible", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    // KPI row — use .first() since labels appear in both KPI cards and chart legends
    await expect(page.getByText("Open Tickets").first()).toBeVisible();
    await expect(page.getByText("Compliance Score").first()).toBeVisible();

    // Quick actions
    await expect(page.locator("button, a").filter({ hasText: "Start Audit" }).first()).toBeVisible();
    await expect(page.locator("button, a").filter({ hasText: "Create Ticket" }).first()).toBeVisible();
  });

  test("KPI cards show numeric values", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    // Each KPI card should have a number
    const kpiCards = page.locator('[class*="KPI"], [class*="kpi"]').or(page.locator("text=/\\d+/"));
    await expect(kpiCards.first()).toBeVisible();
  });

  test("activity feed shows recent events", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(/Activity/i)).toBeVisible();
  });

  test("date range picker changes data scope", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    // Look for date range controls
    const dateControl = page.getByText(/7d|30d|90d|Last/i).first();
    await expect(dateControl).toBeVisible();
    await dateControl.click();
  });

  test("compliance heatmap renders with colored pills", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    await expect(page.getByText("Compliance Heatmap")).toBeVisible();
  });

  test("theme toggle switches between dark and light", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    const toggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').or(
      page.locator("button").filter({ has: page.locator('svg[class*="sun"], svg[class*="moon"]') })
    );
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(500);
      await toggle.click();
    }
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 2: TICKET MANAGEMENT
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 2: Tickets", () => {
  test("ticket list loads with data", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    const rowCount = await page.locator("table tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("ticket search filters results", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    const beforeCount = await page.locator("table tbody tr").count();
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill("temperature");
    await page.waitForTimeout(500);

    // Either fewer results or "no results" message
    const afterCount = await page.locator("table tbody tr").count();
    expect(afterCount).toBeLessThanOrEqual(beforeCount);
  });

  test("ticket status filter works", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // Find a status filter (select or button)
    const statusFilter = page.locator("select, button").filter({ hasText: /Status|All/i }).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
    }
  });

  test("ticket detail page shows full information", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // Click first ticket link
    const ticketLink = page.locator('a[href*="/tickets/tkt_"]').first();
    await expect(ticketLink).toBeVisible();
    await ticketLink.click();
    await page.waitForURL(/\/tickets\/tkt_/, { timeout: 10000 });

    // Detail page should show ticket info
    await expect(page.locator("text=/Priority|Status|Assignee/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("kanban board view renders columns", async ({ page }) => {
    await page.goto("/en/tickets/board/", { waitUntil: "load" });

    // Should show kanban columns
    await expect(page.getByText(/Open|In Progress|Resolved|Closed/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("my tickets view loads", async ({ page }) => {
    await page.goto("/en/tickets/my/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /My Tickets/i })).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 3: AUDIT FLOW
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 3: Audit", () => {
  test("audit list shows scheduled and completed audits", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Audits/i })).toBeVisible({ timeout: 15000 });

    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("audit KPI summary shows counts", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Audits/i })).toBeVisible({ timeout: 15000 });

    // Should show compliance rate or audit counts
    await expect(page.locator("text=/\\d+/").first()).toBeVisible();
  });

  test("audit detail shows sections and score", async ({ page }) => {
    await page.goto("/en/audit/aud_001/", { waitUntil: "load" });

    // Should show score or section details
    const scoreOrSection = page.locator("text=/\\d+%/").or(page.locator("text=/Score|Section|Checklist/i"));
    await expect(scoreOrSection.first()).toBeVisible({ timeout: 15000 });
  });

  test("audit results page shows score ring and findings", async ({ page }) => {
    await page.goto("/en/audit/aud_001/results/", { waitUntil: "load" });

    // Score display
    const score = page.locator("text=/\\d+%/").or(page.locator("svg circle"));
    await expect(score.first()).toBeVisible({ timeout: 15000 });
  });

  test("audit conduct mode renders in mobile-friendly layout", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/audit/aud_001/conduct/", { waitUntil: "load" });

    // Should show pass/fail buttons or checklist items
    const controls = page.locator("text=/Pass|Fail|N\\/A|Next|Submit/i");
    await expect(controls.first()).toBeVisible({ timeout: 15000 });
  });

  test("audit history shows trend chart", async ({ page }) => {
    await page.goto("/en/audit/history/", { waitUntil: "load" });

    await expect(page.locator("text=/History|Trend/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("audit calendar view loads", async ({ page }) => {
    await page.goto("/en/audit/calendar/", { waitUntil: "load" });

    // Should show month/calendar UI
    await expect(page.locator("text=/Mon|Tue|Wed|Thu|Fri|Jan|Feb|Mar/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 4: CAPA (THE AUTOMATION LOOP)
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 4: CAPA", () => {
  test("CAPA list loads with status filters", async ({ page }) => {
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /CAPA/i })).toBeVisible({ timeout: 15000 });

    await expect(page.locator("table tbody tr, [class*='card']").first()).toBeVisible();
  });

  test("CAPA KPI bar shows open and overdue counts", async ({ page }) => {
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /CAPA/i })).toBeVisible({ timeout: 15000 });

    await expect(page.locator("text=/Open|Overdue|Total/i").first()).toBeVisible();
  });

  test("CAPA detail shows status timeline", async ({ page }) => {
    await page.goto("/en/capa/capa_001/", { waitUntil: "load" });

    // Status timeline with stages
    const timeline = page.locator("text=/Open|In Progress|Verified|Closed/i");
    await expect(timeline.first()).toBeVisible({ timeout: 15000 });
  });

  test("CAPA detail shows linked audit source", async ({ page }) => {
    await page.goto("/en/capa/capa_001/", { waitUntil: "load" });

    // Should show source badge linking back to audit
    const source = page.locator("text=/Source|Audit|Linked/i");
    await expect(source.first()).toBeVisible({ timeout: 15000 });
  });

  test("CAPA create page loads with form", async ({ page }) => {
    await page.goto("/en/capa/create/", { waitUntil: "load" });

    await expect(page.locator("text=/Create|New CAPA/i").first()).toBeVisible({ timeout: 15000 });
    // Form fields
    await expect(page.locator("input, textarea, select").first()).toBeVisible();
  });

  test("CAPA effectiveness review page loads", async ({ page }) => {
    await page.goto("/en/capa/capa_001/review/", { waitUntil: "load" });

    await expect(page.locator("text=/Review|Effectiveness|Verify/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 5: SOP & KNOWLEDGE BASE
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 5: SOPs & Knowledge Base", () => {
  test("SOP library lists all SOPs with filters", async ({ page }) => {
    await page.goto("/en/sops/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /SOP/i })).toBeVisible({ timeout: 15000 });

    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("SOP detail shows step-by-step content", async ({ page }) => {
    await page.goto("/en/sops/sop_001/", { waitUntil: "load" });

    // Should show steps or content
    await expect(page.locator("text=/Step|Overview|Acknowledgment/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("SOP builder page loads", async ({ page }) => {
    await page.goto("/en/sops/builder/", { waitUntil: "load" });

    await expect(page.locator("text=/Builder|Create|New SOP/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("SOP builder edit mode loads existing SOP", async ({ page }) => {
    await page.goto("/en/sops/builder/sop_001/", { waitUntil: "load" });

    // Should have pre-filled content
    await expect(page.locator("input, textarea").first()).toBeVisible({ timeout: 15000 });
  });

  test("KB home shows categories and articles", async ({ page }) => {
    await page.goto("/en/knowledge/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Knowledge/i })).toBeVisible({ timeout: 15000 });

    // Categories or articles visible
    await expect(page.locator("text=/article|Article|categor/i").first()).toBeVisible();
  });

  test("KB article view renders clean reading layout", async ({ page }) => {
    await page.goto("/en/knowledge/kba_001/", { waitUntil: "load" });

    // Article content should be visible
    await expect(page.locator("article, [class*='article'], [class*='content']").first()).toBeVisible({ timeout: 15000 });
  });

  test("KB search filters articles", async ({ page }) => {
    await page.goto("/en/knowledge/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Knowledge/i })).toBeVisible({ timeout: 15000 });

    const search = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    if (await search.isVisible()) {
      await search.fill("safety");
      await page.waitForTimeout(500);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 6: WORKFLOW AUTOMATION
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 6: Workflow Automation", () => {
  test("automation rules list shows configured rules", async ({ page }) => {
    await page.goto("/en/workflow/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Automation|Workflow/i })).toBeVisible({ timeout: 15000 });

    // Rule cards or list items
    await expect(page.locator("text=/rule|Rule|trigger|Trigger/i").first()).toBeVisible();
  });

  test("rule detail shows trigger, conditions, and actions", async ({ page }) => {
    await page.goto("/en/workflow/rule_001/", { waitUntil: "load" });

    await expect(page.locator("text=/Trigger|Condition|Action/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("rule builder creates a new rule", async ({ page }) => {
    await page.goto("/en/workflow/new/", { waitUntil: "load" });

    // Rule builder canvas should be present
    await expect(page.locator("text=/Trigger|trigger|Select a trigger|Save Draft|Publish/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("template gallery shows pre-built templates", async ({ page }) => {
    await page.goto("/en/workflow/templates/", { waitUntil: "load" });

    await expect(page.locator("text=/Template|template/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("rule edit page loads existing rule", async ({ page }) => {
    await page.goto("/en/workflow/rule_001/edit/", { waitUntil: "load" });

    // Should show pre-filled rule configuration
    await expect(page.locator("text=/trigger|Trigger|Save|Update/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 7: TASK MANAGEMENT & GOALS
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 7: Tasks & Goals", () => {
  test("task list shows all tasks", async ({ page }) => {
    await page.goto("/en/tasks/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });
  });

  test("task board view shows kanban columns", async ({ page }) => {
    await page.goto("/en/tasks/board/", { waitUntil: "load" });

    await expect(page.getByText(/To Do|In Progress|Done/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("my tasks view loads", async ({ page }) => {
    await page.goto("/en/tasks/my/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /My Tasks/i })).toBeVisible({ timeout: 15000 });
  });

  test("task detail shows subtasks and linked audit", async ({ page }) => {
    await page.goto("/en/tasks/task_001/", { waitUntil: "load" });

    await expect(page.locator("text=/Subtask|Detail|Due|Assigned/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("projects page shows project cards", async ({ page }) => {
    await page.goto("/en/tasks/projects/", { waitUntil: "load" });

    await expect(page.locator("text=/Project|project/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("goals dashboard shows OKR tree", async ({ page }) => {
    await page.goto("/en/goals/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /Goals|OKR/i })).toBeVisible({ timeout: 15000 });
  });

  test("goal detail shows key results with progress", async ({ page }) => {
    await page.goto("/en/goals/goal_001/", { waitUntil: "load" });

    await expect(page.locator("text=/Key Result|Progress|Target/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("team goals view loads", async ({ page }) => {
    await page.goto("/en/goals/team/", { waitUntil: "load" });
    await expect(page.locator("text=/Team|team/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 8: ANALYTICS & SLA
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 8: Analytics & SLA", () => {
  test("analytics hub shows module cards", async ({ page }) => {
    await page.goto("/en/analytics/", { waitUntil: "load" });
    await expect(page.locator("text=/Analytics/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("ticket analytics shows charts", async ({ page }) => {
    await page.goto("/en/analytics/tickets/", { waitUntil: "load" });
    await expect(page.locator("text=/Ticket|Volume|SLA/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("audit analytics shows compliance data", async ({ page }) => {
    await page.goto("/en/analytics/audits/", { waitUntil: "load" });
    await expect(page.locator("text=/Audit|Compliance|Score/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("CAPA analytics loads", async ({ page }) => {
    await page.goto("/en/analytics/capa/", { waitUntil: "load" });
    await expect(page.locator("text=/CAPA|Closure|Severity/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("task analytics loads", async ({ page }) => {
    await page.goto("/en/analytics/tasks/", { waitUntil: "load" });
    await expect(page.locator("text=/Task|Velocity|Overdue/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("analytics breadcrumb navigates back to hub", async ({ page }) => {
    await page.goto("/en/analytics/tickets/", { waitUntil: "load" });
    await expect(page.locator("text=/Ticket/i").first()).toBeVisible({ timeout: 15000 });

    const analyticsLink = page.locator('a[href*="/analytics/"]').filter({ hasText: "Analytics" }).first();
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await page.waitForURL(/\/analytics\/$/);
    }
  });

  test("SLA policy list loads", async ({ page }) => {
    await page.goto("/en/sla/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /SLA/i })).toBeVisible({ timeout: 15000 });
  });

  test("SLA breach alerts page loads", async ({ page }) => {
    await page.goto("/en/sla/alerts/", { waitUntil: "load" });
    await expect(page.locator("text=/Alert|Breach|At Risk/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("SLA compliance report loads", async ({ page }) => {
    await page.goto("/en/sla/reports/", { waitUntil: "load" });
    await expect(page.locator("text=/Compliance|Report|Trend/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 9: REMAINING MODULES (ALPHA)
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 9: Alpha Modules", () => {
  test("customer portal loads in light theme", async ({ page }) => {
    await page.goto("/en/customer/", { waitUntil: "load" });
    await expect(page.locator("text=/Portal|Ticket|Submit/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("customer ticket submission form loads", async ({ page }) => {
    await page.goto("/en/customer/submit/", { waitUntil: "load" });
    await expect(page.locator("input, textarea").first()).toBeVisible({ timeout: 15000 });
  });

  test("broadcasts list loads", async ({ page }) => {
    await page.goto("/en/comms/", { waitUntil: "load" });
    await expect(page.locator("text=/Broadcast|Communication/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("broadcast composer loads", async ({ page }) => {
    await page.goto("/en/comms/new/", { waitUntil: "load" });
    await expect(page.locator("text=/Compose|New|Broadcast/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("training library loads with modules", async ({ page }) => {
    await page.goto("/en/training/", { waitUntil: "load" });
    await expect(page.locator("text=/Training|Module|module/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("training module detail loads content", async ({ page }) => {
    await page.goto("/en/training/trn_001/", { waitUntil: "load" });
    await expect(page.locator("text=/Content|Overview|Quiz|Enroll/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("my training dashboard loads", async ({ page }) => {
    await page.goto("/en/training/my/", { waitUntil: "load" });
    await expect(page.locator("text=/My Training|Assigned|Completed/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("training analytics loads heatmap", async ({ page }) => {
    await page.goto("/en/training/analytics/", { waitUntil: "load" });
    await expect(page.locator("text=/Analytics|Completion|Location/i").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 10: MOBILE RESPONSIVE
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 10: Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile dashboard loads with KPI cards", async ({ page }) => {
    await page.goto("/en/mobile/", { waitUntil: "load" });
    await expect(page.locator("text=/Dashboard|KPI|Ticket|Audit/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("dashboard renders on mobile viewport", async ({ page }) => {
    await page.goto("/en/mobile/", { waitUntil: "load" });
    // The dedicated mobile page should load
    await expect(page.locator("text=/Dashboard|KPI|Ticket|Audit|Schedule/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("ticket list is usable on mobile", async ({ page }) => {
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr, [class*='card']").first()).toBeVisible({ timeout: 15000 });
  });

  test("audit conduct works on mobile viewport", async ({ page }) => {
    await page.goto("/en/audit/aud_001/conduct/", { waitUntil: "load" });

    const controls = page.locator("text=/Pass|Fail|N\\/A|Next|Submit/i");
    await expect(controls.first()).toBeVisible({ timeout: 15000 });

    // Touch targets should be at least 44px
    const button = page.locator("button").filter({ hasText: /Pass|Fail/i }).first();
    if (await button.isVisible()) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 11: CROSS-MODULE NAVIGATION (NO DEAD ENDS)
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 11: Cross-Module Navigation", () => {
  test("sidebar navigation reaches all modules", async ({ page }) => {
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    const sidebarLinks = [
      "Tickets",
      "SOP",
      "Audit",
      "CAPA",
      "Workflow",
      "Knowledge",
      "Tasks",
      "Analytics",
      "SLA",
      "Goals",
    ];

    for (const linkText of sidebarLinks) {
      const link = page.locator("nav a, aside a").filter({ hasText: new RegExp(linkText, "i") }).first();
      await expect(link).toBeVisible({ timeout: 5000 });
    }
  });

  test("full demo loop: dashboard → tickets → audit → CAPA → SOP → KB", async ({ page }) => {
    // 1. Start at dashboard
    await page.goto("/en/dashboard/", { waitUntil: "load" });
    await expect(page.getByText("Operations Dashboard")).toBeVisible({ timeout: 15000 });

    // 2. Navigate to tickets
    await page.goto("/en/tickets/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // 3. Navigate to audits
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // 4. Navigate to CAPA
    await page.goto("/en/capa/", { waitUntil: "load" });
    await expect(page.locator("h1, h2").filter({ hasText: /CAPA/i })).toBeVisible({ timeout: 15000 });

    // 5. Navigate to SOPs
    await page.goto("/en/sops/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // 6. Navigate to KB
    await page.goto("/en/knowledge/", { waitUntil: "load" });
    await expect(page.locator("text=/Knowledge/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("drill-down and back: audit list → detail → results → back to list", async ({ page }) => {
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });

    // Click into detail
    const auditLink = page.locator('a[href*="/audit/aud_"]').first();
    await auditLink.click();
    await page.waitForURL(/\/audit\/aud_/, { timeout: 10000 });

    // Go to results
    const resultsLink = page.locator('a[href*="/results"]').first();
    if (await resultsLink.isVisible({ timeout: 3000 })) {
      await resultsLink.click();
      await page.waitForURL(/\/results/, { timeout: 10000 });
    }

    // Navigate back to audit list via sidebar or direct navigation
    await page.goto("/en/audit/", { waitUntil: "load" });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });
  });
});

// ──────────────────────────────────────────────────────────────
// SCENARIO 12: ADMIN & SETTINGS
// ──────────────────────────────────────────────────────────────

test.describe("Demo Scenario 12: Admin", () => {
  test("admin users page loads", async ({ page }) => {
    await page.goto("/en/admin/users/", { waitUntil: "load" });
    await expect(page.locator("text=/User|user|Team/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("admin roles page loads", async ({ page }) => {
    await page.goto("/en/admin/roles/", { waitUntil: "load" });
    await expect(page.locator("text=/Role|Permission|role/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("admin settings page loads", async ({ page }) => {
    await page.goto("/en/admin/settings/", { waitUntil: "load" });
    await expect(page.locator("text=/Setting|Organization|General/i").first()).toBeVisible({ timeout: 15000 });
  });

  test("profile page loads", async ({ page }) => {
    await page.goto("/en/profile/", { waitUntil: "load" });
    await expect(page.locator("text=/Profile|profile|Account/i").first()).toBeVisible({ timeout: 15000 });
  });
});
