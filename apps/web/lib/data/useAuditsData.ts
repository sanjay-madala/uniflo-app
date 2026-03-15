"use client";

import {
  audits as mockAudits,
  auditTemplates as mockTemplates,
  users as mockUsers,
  auditTrend as mockAuditTrend,
} from "@uniflo/mock-data";
import type { Audit, AuditTemplate, AuditTrendPoint, User } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseAuditsDataResult {
  data: Audit[];
  templates: AuditTemplate[];
  users: User[];
  trendData: AuditTrendPoint[];
  isLoading: boolean;
  error: Error | null;
}

export function useAuditsData(): UseAuditsDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAudits, useAuditTemplates } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auditsResult = useAudits();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const templatesResult = useAuditTemplates();
    return {
      data: (auditsResult.data as Audit[]) ?? [],
      templates: (templatesResult.data as AuditTemplate[]) ?? [],
      users: mockUsers as User[],
      trendData: mockAuditTrend as AuditTrendPoint[],
      isLoading: auditsResult.isLoading || templatesResult.isLoading,
      error: auditsResult.error ?? templatesResult.error,
    };
  }

  return {
    data: mockAudits as Audit[],
    templates: mockTemplates as AuditTemplate[],
    users: mockUsers as User[],
    trendData: mockAuditTrend as AuditTrendPoint[],
    isLoading: false,
    error: null,
  };
}

interface UseAuditDataResult {
  data: Audit | undefined;
  template: AuditTemplate | undefined;
  templates: AuditTemplate[];
  users: User[];
  trendData: AuditTrendPoint[];
  isLoading: boolean;
  error: Error | null;
}

export function useAuditData(id: string): UseAuditDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAudit, useAuditTemplates } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auditResult = useAudit(id);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const templatesResult = useAuditTemplates();
    const audit = auditResult.data as Audit | undefined;
    const templates = (templatesResult.data as AuditTemplate[]) ?? [];
    return {
      data: audit,
      template: audit ? templates.find(t => t.id === audit.template_id) : undefined,
      templates,
      users: mockUsers as User[],
      trendData: mockAuditTrend as AuditTrendPoint[],
      isLoading: auditResult.isLoading || templatesResult.isLoading,
      error: auditResult.error ?? templatesResult.error,
    };
  }

  const audit = (mockAudits as Audit[]).find(a => a.id === id);
  const templates = mockTemplates as AuditTemplate[];
  return {
    data: audit,
    template: audit ? templates.find(t => t.id === audit.template_id) : undefined,
    templates,
    users: mockUsers as User[],
    trendData: mockAuditTrend as AuditTrendPoint[],
    isLoading: false,
    error: null,
  };
}
