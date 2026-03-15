"use client";

import {
  dashboardKPIs as mockDashboardKPIs,
  trendData as mockTrendData,
  activityEvents as mockActivityEvents,
  locationTree as mockLocationTree,
  ticketAnalytics as mockTicketAnalytics,
  auditAnalytics as mockAuditAnalytics,
  capaAnalytics as mockCAPAAnalytics,
  taskAnalytics as mockTaskAnalytics,
  customDashboards as mockCustomDashboards,
  exportConfigs as mockExportConfigs,
  crossModuleSummary as mockCrossModuleSummary,
  auditHeatmapData as mockAuditHeatmapData,
} from "@uniflo/mock-data";
import type {
  DashboardKPI,
  TrendDataPoint,
  ActivityEvent,
  LocationNode,
  TicketAnalytics,
  AuditAnalytics,
  CAPAAnalytics,
  TaskAnalytics,
  CustomDashboard,
  ExportConfig,
  CrossModuleSummary,
} from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------------------------------------------------------------------------
// Analytics hub (executive dashboard)
// ---------------------------------------------------------------------------

interface UseAnalyticsHubDataResult {
  kpis: DashboardKPI[];
  trendData: TrendDataPoint[];
  activityEvents: ActivityEvent[];
  locationTree: LocationNode[];
  customDashboards: CustomDashboard[];
  crossModuleSummary: CrossModuleSummary;
  isLoading: boolean;
  error: Error | null;
}

export function useAnalyticsHubData(): UseAnalyticsHubDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    kpis: mockDashboardKPIs as DashboardKPI[],
    trendData: mockTrendData as TrendDataPoint[],
    activityEvents: mockActivityEvents as ActivityEvent[],
    locationTree: mockLocationTree as LocationNode[],
    customDashboards: mockCustomDashboards as CustomDashboard[],
    crossModuleSummary: mockCrossModuleSummary as CrossModuleSummary,
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Ticket analytics
// ---------------------------------------------------------------------------

interface UseTicketAnalyticsDataResult {
  data: TicketAnalytics[];
  isLoading: boolean;
  error: Error | null;
}

export function useTicketAnalyticsData(): UseTicketAnalyticsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockTicketAnalytics as TicketAnalytics[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Audit analytics
// ---------------------------------------------------------------------------

interface UseAuditAnalyticsDataResult {
  data: AuditAnalytics[];
  heatmapData: typeof mockAuditHeatmapData;
  isLoading: boolean;
  error: Error | null;
}

export function useAuditAnalyticsData(): UseAuditAnalyticsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockAuditAnalytics as AuditAnalytics[],
    heatmapData: mockAuditHeatmapData,
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// CAPA analytics
// ---------------------------------------------------------------------------

interface UseCAPAAnalyticsDataResult {
  data: CAPAAnalytics[];
  isLoading: boolean;
  error: Error | null;
}

export function useCAPAAnalyticsData(): UseCAPAAnalyticsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockCAPAAnalytics as CAPAAnalytics[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Task analytics
// ---------------------------------------------------------------------------

interface UseTaskAnalyticsDataResult {
  data: TaskAnalytics[];
  isLoading: boolean;
  error: Error | null;
}

export function useTaskAnalyticsData(): UseTaskAnalyticsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockTaskAnalytics as TaskAnalytics[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Export / Reports configs
// ---------------------------------------------------------------------------

interface UseReportsDataResult {
  exportConfigs: ExportConfig[];
  isLoading: boolean;
  error: Error | null;
}

export function useReportsData(): UseReportsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    exportConfigs: mockExportConfigs as ExportConfig[],
    isLoading: false,
    error: null,
  };
}
