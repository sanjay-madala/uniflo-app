import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { Broadcast, ReadReceipt } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface BroadcastListParams {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateBroadcastBody {
  title: string;
  bodyHtml?: string;
  bodyPlain?: string;
  priority?: string;
  locationId?: string;
  audience?: Record<string, unknown>;
  acknowledgmentRequired?: boolean;
  templateId?: string;
  attachments?: unknown[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateBroadcastBody {
  title?: string;
  bodyHtml?: string;
  bodyPlain?: string;
  priority?: string;
  locationId?: string;
  audience?: Record<string, unknown>;
  acknowledgmentRequired?: boolean;
  templateId?: string;
  attachments?: unknown[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
}

export interface ReceiptListParams {
  page?: number;
  limit?: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createBroadcastsClient(client: ApiClient) {
  return {
    list(params?: BroadcastListParams) {
      return client.get<PaginatedResponse<Broadcast>>('/api/v1/broadcasts', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<Broadcast>>(`/api/v1/broadcasts/${id}`);
    },
    create(body: CreateBroadcastBody) {
      return client.post<SingleResponse<Broadcast>>('/api/v1/broadcasts', body);
    },
    update(id: string, body: UpdateBroadcastBody) {
      return client.put<SingleResponse<Broadcast>>(`/api/v1/broadcasts/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/broadcasts/${id}`);
    },
    send(id: string) {
      return client.post<SingleResponse<Broadcast>>(`/api/v1/broadcasts/${id}/send`);
    },
    getReceipts(id: string, params?: ReceiptListParams) {
      return client.get<PaginatedResponse<ReadReceipt>>(`/api/v1/broadcasts/${id}/receipts`, params as Record<string, string | number | boolean | undefined>);
    },
  };
}
