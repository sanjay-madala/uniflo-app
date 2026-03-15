import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { AutomationRule, RuleExecution } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface RuleListParams {
  status?: string;
  module?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateRuleBody {
  name: string;
  description?: string;
  triggerEvent: string;
  triggerModule?: string;
  locationId?: string;
  locationScope?: string[];
  templateId?: string;
}

export interface UpdateRuleBody {
  name?: string;
  description?: string;
  status?: string;
  triggerEvent?: string;
  triggerModule?: string;
  locationScope?: string[];
}

export interface ExecutionListParams {
  ruleId?: string;
  status?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createAutomationClient(client: ApiClient) {
  return {
    listRules(params?: RuleListParams) {
      return client.get<PaginatedResponse<AutomationRule>>('/api/v1/automation/rules', params as Record<string, string | number | boolean | undefined>);
    },
    getRule(id: string) {
      return client.get<SingleResponse<AutomationRule>>(`/api/v1/automation/rules/${id}`);
    },
    createRule(body: CreateRuleBody) {
      return client.post<SingleResponse<AutomationRule>>('/api/v1/automation/rules', body);
    },
    updateRule(id: string, body: UpdateRuleBody) {
      return client.put<SingleResponse<AutomationRule>>(`/api/v1/automation/rules/${id}`, body);
    },
    deleteRule(id: string) {
      return client.del(`/api/v1/automation/rules/${id}`);
    },
    toggleRule(id: string) {
      return client.post<SingleResponse<AutomationRule>>(`/api/v1/automation/rules/${id}/toggle`);
    },
    listExecutions(params?: ExecutionListParams) {
      return client.get<PaginatedResponse<RuleExecution>>('/api/v1/automation/executions', params as Record<string, string | number | boolean | undefined>);
    },
  };
}
