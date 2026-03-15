import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { SOP } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface SopListParams {
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateSopBody {
  title: string;
  description?: string;
  category?: string;
  locationId?: string;
  locationIds?: string[];
  roleIds?: string[];
  tags?: string[];
  acknowledgmentRequired?: boolean;
  autoPublishKb?: boolean;
}

export interface UpdateSopBody {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  version?: string;
  locationId?: string;
  locationIds?: string[];
  roleIds?: string[];
  tags?: string[];
  acknowledgmentRequired?: boolean;
  autoPublishKb?: boolean;
  estimatedReadTimeMinutes?: number;
}

export interface AcknowledgeSopBody {
  version: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createSopsClient(client: ApiClient) {
  return {
    list(params?: SopListParams) {
      return client.get<PaginatedResponse<SOP>>('/api/v1/sops', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<SOP>>(`/api/v1/sops/${id}`);
    },
    create(body: CreateSopBody) {
      return client.post<SingleResponse<SOP>>('/api/v1/sops', body);
    },
    update(id: string, body: UpdateSopBody) {
      return client.put<SingleResponse<SOP>>(`/api/v1/sops/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/sops/${id}`);
    },
    publish(id: string) {
      return client.post<SingleResponse<SOP>>(`/api/v1/sops/${id}/publish`);
    },
    acknowledge(id: string, body: AcknowledgeSopBody) {
      return client.post<SingleResponse<unknown>>(`/api/v1/sops/${id}/acknowledge`, body);
    },
  };
}
