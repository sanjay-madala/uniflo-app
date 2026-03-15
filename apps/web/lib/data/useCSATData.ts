"use client";

import {
  csatSurveys as mockCSATSurveys,
  csatDashboardSummary as mockCSATDashboardSummary,
  csatTrendData as mockCSATTrendData,
  csatDistribution as mockCSATDistribution,
  csatCategoryScores as mockCSATCategoryScores,
  csatLowScoreEntries as mockCSATLowScoreEntries,
  csatAlerts as mockCSATAlerts,
  portalTickets as mockPortalTickets,
  portalTimeline as mockPortalTimeline,
} from "@uniflo/mock-data";
import type {
  CSATSurvey,
  CSATDashboardSummary,
  CSATTrendPoint,
  CSATDistribution,
  CSATCategoryScore,
  CSATLowScoreEntry,
  CSATAlert,
  PortalTicket,
  PortalTimelineEntry,
} from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------------------------------------------------------------------------
// CSAT Surveys list
// ---------------------------------------------------------------------------

interface UseCSATSurveysDataResult {
  data: CSATSurvey[];
  isLoading: boolean;
  error: Error | null;
}

export function useCSATSurveysData(
  _params?: Record<string, unknown>,
): UseCSATSurveysDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockCSATSurveys as CSATSurvey[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// CSAT Dashboard metrics
// ---------------------------------------------------------------------------

interface UseCSATDashboardDataResult {
  summary: CSATDashboardSummary;
  trend: CSATTrendPoint[];
  distribution: CSATDistribution;
  categoryScores: CSATCategoryScore[];
  lowScores: CSATLowScoreEntry[];
  alerts: CSATAlert[];
  isLoading: boolean;
  error: Error | null;
}

export function useCSATDashboardData(): UseCSATDashboardDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    summary: mockCSATDashboardSummary as CSATDashboardSummary,
    trend: mockCSATTrendData as CSATTrendPoint[],
    distribution: mockCSATDistribution as CSATDistribution,
    categoryScores: mockCSATCategoryScores as CSATCategoryScore[],
    lowScores: mockCSATLowScoreEntries as CSATLowScoreEntry[],
    alerts: mockCSATAlerts as CSATAlert[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Portal tickets
// ---------------------------------------------------------------------------

interface UsePortalTicketsDataResult {
  data: PortalTicket[];
  timeline: PortalTimelineEntry[];
  surveys: CSATSurvey[];
  isLoading: boolean;
  error: Error | null;
}

export function usePortalTicketsData(): UsePortalTicketsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockPortalTickets as PortalTicket[],
    timeline: mockPortalTimeline as PortalTimelineEntry[],
    surveys: mockCSATSurveys as CSATSurvey[],
    isLoading: false,
    error: null,
  };
}
