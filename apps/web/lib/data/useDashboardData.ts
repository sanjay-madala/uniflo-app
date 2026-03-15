"use client";

import {
  dashboardKPIs as mockKPIs,
  trendData as mockTrendData,
  activityEvents as mockActivityEvents,
  locationTree as mockLocationTree,
  crossModuleSummary as mockCrossModuleSummary,
  auditHeatmapData as mockHeatmapData,
} from "@uniflo/mock-data";
import type {
  DashboardKPI,
  TrendDataPoint,
  ActivityEvent,
  LocationNode,
  CrossModuleSummary,
} from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseDashboardDataResult {
  kpis: DashboardKPI[];
  trendData: TrendDataPoint[];
  activityEvents: ActivityEvent[];
  locationTree: LocationNode[];
  crossModuleSummary: CrossModuleSummary;
  auditHeatmapData: Record<string, Record<string, number>>;
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardData(): UseDashboardDataResult {
  if (API_MODE === "api") {
    // In API mode, the dashboard would fetch from a dedicated endpoint.
    // For now, fall back to mock data since no dashboard API hook exists yet.
    return {
      kpis: mockKPIs,
      trendData: mockTrendData,
      activityEvents: mockActivityEvents,
      locationTree: mockLocationTree,
      crossModuleSummary: mockCrossModuleSummary,
      auditHeatmapData: mockHeatmapData as Record<string, Record<string, number>>,
      isLoading: false,
      error: null,
    };
  }

  return {
    kpis: mockKPIs,
    trendData: mockTrendData,
    activityEvents: mockActivityEvents,
    locationTree: mockLocationTree,
    crossModuleSummary: mockCrossModuleSummary,
    auditHeatmapData: mockHeatmapData as Record<string, Record<string, number>>,
    isLoading: false,
    error: null,
  };
}
