import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { Ticket } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface TicketListParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  locationId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketBody {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  locationId: string;
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
}

export interface UpdateTicketBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigneeId?: string;
  tags?: string[];
  resolvedAt?: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createTicketsClient(client: ApiClient) {
  return {
    list(params?: TicketListParams) {
      return client.get<PaginatedResponse<Ticket>>('/api/v1/tickets', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<Ticket>>(`/api/v1/tickets/${id}`);
    },
    create(body: CreateTicketBody) {
      return client.post<SingleResponse<Ticket>>('/api/v1/tickets', body);
    },
    update(id: string, body: UpdateTicketBody) {
      return client.put<SingleResponse<Ticket>>(`/api/v1/tickets/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/tickets/${id}`);
    },
  };
}
