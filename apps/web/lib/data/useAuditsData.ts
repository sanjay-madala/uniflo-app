"use client";

import {
  audits as mockAudits,
  auditTemplates as mockTemplates,
  users as mockUsers,
} from "@uniflo/mock-data";
import type { Audit, AuditTemplate, User } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseAuditsDataResult {
  data: Audit[];
  templates: AuditTemplate[];
  users: User[];
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
      isLoading: auditsResult.isLoading || templatesResult.isLoading,
      error: auditsResult.error ?? templatesResult.error,
    };
  }

  return {
    data: mockAudits as Audit[],
    templates: mockTemplates as AuditTemplate[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}
