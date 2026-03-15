import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { SLAPolicy, SLABreach } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface PolicyListParams {
  module?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreatePolicyBody {
  name: string;
  description?: string;
  module: string;
  status?: string;
  locationId?: string;
  conditions?: unknown[];
  escalationEnabled?: boolean;
  escalationConfig?: unknown;
  businessHours?: unknown;
  priorityOrder?: number;
  locationScope?: string[];
}

export interface UpdatePolicyBody {
  name?: string;
  description?: string;
  module?: string;
  status?: string;
  conditions?: unknown[];
  escalationEnabled?: boolean;
  escalationConfig?: unknown;
  businessHours?: unknown;
  priorityOrder?: number;
  locationScope?: string[];
}

export interface BreachListParams {
  status?: string;
  severity?: string;
  policyId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface ComplianceParams {
  module?: string;
  locationId?: string;
}

export interface ComplianceReport {
  totalPolicies: number;
  totalBreaches: number;
  activeBreaches: number;
  resolvedBreaches: number;
  complianceRate: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createSlaClient(client: ApiClient) {
  return {
    listPolicies(params?: PolicyListParams) {
      return client.get<PaginatedResponse<SLAPolicy>>('/api/v1/sla/policies', params as Record<string, string | number | boolean | undefined>);
    },
    getPolicy(id: string) {
      return client.get<SingleResponse<SLAPolicy>>(`/api/v1/sla/policies/${id}`);
    },
    createPolicy(body: CreatePolicyBody) {
      return client.post<SingleResponse<SLAPolicy>>('/api/v1/sla/policies', body);
    },
    updatePolicy(id: string, body: UpdatePolicyBody) {
      return client.put<SingleResponse<SLAPolicy>>(`/api/v1/sla/policies/${id}`, body);
    },
    deletePolicy(id: string) {
      return client.del(`/api/v1/sla/policies/${id}`);
    },
    listBreaches(params?: BreachListParams) {
      return client.get<PaginatedResponse<SLABreach>>('/api/v1/sla/breaches', params as Record<string, string | number | boolean | undefined>);
    },
    getCompliance(params?: ComplianceParams) {
      return client.get<SingleResponse<ComplianceReport>>('/api/v1/sla/compliance', params as Record<string, string | number | boolean | undefined>);
    },
  };
}
