"use client";

import {
  automationRules as mockRules,
  ruleTemplates as mockTemplates,
  ruleExecutions as mockExecutions,
} from "@uniflo/mock-data";
import type { AutomationRule, RuleTemplate, RuleExecution } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------- Automation Rules List ----------

interface UseAutomationRulesDataResult {
  rules: AutomationRule[];
  isLoading: boolean;
  error: Error | null;
}

export function useAutomationRulesData(_params?: Record<string, unknown>): UseAutomationRulesDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    return {
      rules: mockRules as AutomationRule[],
      isLoading: false,
      error: null,
    };
  }

  return {
    rules: mockRules as AutomationRule[],
    isLoading: false,
    error: null,
  };
}

// ---------- Single Automation Rule ----------

interface UseAutomationRuleDataResult {
  rule: AutomationRule | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAutomationRuleData(id: string): UseAutomationRuleDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    const allRules = mockRules as AutomationRule[];
    return {
      rule: allRules.find((r) => r.id === id),
      isLoading: false,
      error: null,
    };
  }

  const allRules = mockRules as AutomationRule[];
  return {
    rule: allRules.find((r) => r.id === id),
    isLoading: false,
    error: null,
  };
}

// ---------- Rule Templates ----------

interface UseRuleTemplatesDataResult {
  templates: RuleTemplate[];
  isLoading: boolean;
  error: Error | null;
}

export function useRuleTemplatesData(): UseRuleTemplatesDataResult {
  return {
    templates: mockTemplates as RuleTemplate[],
    isLoading: false,
    error: null,
  };
}

// ---------- Rule Executions ----------

interface UseRuleExecutionsDataResult {
  executions: RuleExecution[];
  isLoading: boolean;
  error: Error | null;
}

export function useRuleExecutionsData(): UseRuleExecutionsDataResult {
  return {
    executions: mockExecutions as RuleExecution[],
    isLoading: false,
    error: null,
  };
}
