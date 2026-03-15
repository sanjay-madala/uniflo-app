import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { Goal, KeyResult } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface GoalListParams {
  status?: string;
  level?: string;
  timeframe?: string;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateGoalBody {
  title: string;
  description?: string;
  level?: string;
  status?: string;
  ownerId: string;
  teamId?: string;
  teamName?: string;
  timeframe: string;
  timeframeLabel?: string;
  startDate: string;
  endDate: string;
  parentGoalId?: string;
  locationId?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateGoalBody {
  title?: string;
  description?: string;
  level?: string;
  status?: string;
  health?: string;
  ownerId?: string;
  teamId?: string;
  teamName?: string;
  timeframe?: string;
  timeframeLabel?: string;
  startDate?: string;
  endDate?: string;
  progressPct?: number;
  tags?: string[];
  category?: string;
}

export interface CreateKeyResultBody {
  title: string;
  description?: string;
  sortOrder?: number;
  unit?: string;
  direction?: string;
  startValue?: number;
  targetValue: number;
  trackingType?: string;
  dataSource?: string;
  dataSourceLabel?: string;
  dataSourceModule?: string;
  ownerId: string;
}

export interface UpdateKRProgressBody {
  value: number;
  note?: string;
  source?: string;
  sourceLabel?: string;
  sourceEntityId?: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createGoalsClient(client: ApiClient) {
  return {
    list(params?: GoalListParams) {
      return client.get<PaginatedResponse<Goal>>('/api/v1/goals', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<Goal>>(`/api/v1/goals/${id}`);
    },
    create(body: CreateGoalBody) {
      return client.post<SingleResponse<Goal>>('/api/v1/goals', body);
    },
    update(id: string, body: UpdateGoalBody) {
      return client.put<SingleResponse<Goal>>(`/api/v1/goals/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/goals/${id}`);
    },
    addKeyResult(goalId: string, body: CreateKeyResultBody) {
      return client.post<SingleResponse<KeyResult>>(`/api/v1/goals/${goalId}/key-results`, body);
    },
    updateKRProgress(goalId: string, krId: string, body: UpdateKRProgressBody) {
      return client.put<SingleResponse<{ keyResult: KeyResult; progressEntry: unknown }>>(`/api/v1/goals/${goalId}/key-results/${krId}/progress`, body);
    },
  };
}
