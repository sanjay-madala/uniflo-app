import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { Audit, AuditTemplate } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface AuditListParams {
  status?: string;
  templateId?: string;
  locationId?: string;
  auditorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateAuditBody {
  title: string;
  templateId: string;
  locationId: string;
  auditorId: string;
  scheduledAt?: string;
  notes?: string;
}

export interface UpdateAuditBody {
  title?: string;
  status?: string;
  auditorId?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  pass?: boolean;
  findings?: string[];
  notes?: string;
}

export interface AuditTemplateListParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateAuditTemplateBody {
  title: string;
  description?: string;
  category?: string;
  passThreshold?: number;
  version?: string;
  linkedSopIds?: string[];
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createAuditsClient(client: ApiClient) {
  return {
    list(params?: AuditListParams) {
      return client.get<PaginatedResponse<Audit>>('/api/v1/audits', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<Audit>>(`/api/v1/audits/${id}`);
    },
    create(body: CreateAuditBody) {
      return client.post<SingleResponse<Audit>>('/api/v1/audits', body);
    },
    update(id: string, body: UpdateAuditBody) {
      return client.put<SingleResponse<Audit>>(`/api/v1/audits/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/audits/${id}`);
    },
    listTemplates(params?: AuditTemplateListParams) {
      return client.get<PaginatedResponse<AuditTemplate>>('/api/v1/audit-templates', params as Record<string, string | number | boolean | undefined>);
    },
    createTemplate(body: CreateAuditTemplateBody) {
      return client.post<SingleResponse<AuditTemplate>>('/api/v1/audit-templates', body);
    },
  };
}
