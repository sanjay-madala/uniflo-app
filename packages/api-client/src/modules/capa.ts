import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { CAPA } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface CapaListParams {
  status?: string;
  severity?: string;
  source?: string;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateCapaBody {
  title: string;
  description?: string;
  severity?: string;
  source?: string;
  sourceId?: string;
  locationId: string;
  ownerId: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  dueDate?: string;
  linkedTicketIds?: string[];
  linkedAuditIds?: string[];
  linkedSopIds?: string[];
  tags?: string[];
  category?: string;
}

export interface UpdateCapaBody {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  ownerId?: string;
  rootCause?: string;
  rootCauseAnalysis?: Record<string, unknown>;
  correctiveAction?: string;
  preventiveAction?: string;
  dueDate?: string;
  closedAt?: string;
  linkedTicketIds?: string[];
  linkedAuditIds?: string[];
  linkedSopIds?: string[];
  tags?: string[];
  category?: string;
}

export interface CapaReviewBody {
  effective: boolean;
  criteria?: Record<string, unknown>[];
  followUpRequired?: boolean;
  followUpCapaId?: string;
  signOffComment?: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createCapaClient(client: ApiClient) {
  return {
    list(params?: CapaListParams) {
      return client.get<PaginatedResponse<CAPA>>('/api/v1/capas', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<CAPA>>(`/api/v1/capas/${id}`);
    },
    create(body: CreateCapaBody) {
      return client.post<SingleResponse<CAPA>>('/api/v1/capas', body);
    },
    update(id: string, body: UpdateCapaBody) {
      return client.put<SingleResponse<CAPA>>(`/api/v1/capas/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/capas/${id}`);
    },
    review(id: string, body: CapaReviewBody) {
      return client.post<SingleResponse<unknown>>(`/api/v1/capas/${id}/review`, body);
    },
  };
}
