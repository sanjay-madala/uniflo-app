"use client";

import {
  slaPolicies as mockPolicies,
  slaBreaches as mockBreaches,
  slaComplianceTrend as mockComplianceTrend,
  slaComplianceReport as mockComplianceReport,
  slaItemStatuses as mockItemStatuses,
} from "@uniflo/mock-data";
import type { SLAPolicy, SLABreach, SLAComplianceReport } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------- SLA Policies List ----------

interface UseSLAPoliciesDataResult {
  policies: SLAPolicy[];
  isLoading: boolean;
  error: Error | null;
}

export function useSLAPoliciesData(_params?: Record<string, unknown>): UseSLAPoliciesDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    return {
      policies: mockPolicies as unknown as SLAPolicy[],
      isLoading: false,
      error: null,
    };
  }

  return {
    policies: mockPolicies as unknown as SLAPolicy[],
    isLoading: false,
    error: null,
  };
}

// ---------- Single SLA Policy ----------

interface UseSLAPolicyDataResult {
  policy: SLAPolicy | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useSLAPolicyData(id: string): UseSLAPolicyDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    const allPolicies = mockPolicies as unknown as SLAPolicy[];
    return {
      policy: allPolicies.find((p) => p.id === id),
      isLoading: false,
      error: null,
    };
  }

  const allPolicies = mockPolicies as unknown as SLAPolicy[];
  return {
    policy: allPolicies.find((p) => p.id === id),
    isLoading: false,
    error: null,
  };
}

// ---------- SLA Breaches ----------

interface UseSLABreachesDataResult {
  breaches: SLABreach[];
  isLoading: boolean;
  error: Error | null;
}

export function useSLABreachesData(_params?: Record<string, unknown>): UseSLABreachesDataResult {
  return {
    breaches: mockBreaches as unknown as SLABreach[],
    isLoading: false,
    error: null,
  };
}

// ---------- SLA Compliance ----------

interface UseSLAComplianceDataResult {
  report: SLAComplianceReport;
  trend: typeof mockComplianceTrend;
  breaches: SLABreach[];
  policies: SLAPolicy[];
  itemStatuses: typeof mockItemStatuses;
  isLoading: boolean;
  error: Error | null;
}

export function useSLAComplianceData(): UseSLAComplianceDataResult {
  return {
    report: mockComplianceReport as unknown as SLAComplianceReport,
    trend: mockComplianceTrend,
    breaches: mockBreaches as unknown as SLABreach[],
    policies: mockPolicies as unknown as SLAPolicy[],
    itemStatuses: mockItemStatuses,
    isLoading: false,
    error: null,
  };
}
