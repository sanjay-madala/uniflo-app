// ─── Core API Client ─────────────────────────────────────────────────────────
// Framework-agnostic typed HTTP client for the Uniflo API.

import { createTicketsClient } from './modules/tickets';
import { createAuditsClient } from './modules/audits';
import { createSopsClient } from './modules/sops';
import { createCapaClient } from './modules/capa';
import { createTasksClient } from './modules/tasks';
import { createKnowledgeClient } from './modules/knowledge';
import { createAutomationClient } from './modules/automation';
import { createSlaClient } from './modules/sla';
import { createGoalsClient } from './modules/goals';
import { createBroadcastsClient } from './modules/broadcasts';
import { createTrainingClient } from './modules/training';
import { createCsatClient } from './modules/csat';
import { createAdminClient } from './modules/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: { error?: string; message?: string } | null,
  ) {
    super(body?.message ?? `${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

export interface ApiClient {
  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  del(path: string): Promise<void>;
}

function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] => entry[1] !== undefined,
  );
  if (entries.length === 0) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of entries) {
    qs.set(key, String(value));
  }
  return `?${qs.toString()}`;
}

function createCoreClient(config: ApiClientConfig): ApiClient {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await config.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${config.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Handle error responses
    if (!res.ok) {
      let errorBody: { error?: string; message?: string } | null = null;
      try {
        errorBody = await res.json();
      } catch {
        // Response may not have a JSON body
      }

      if (res.status === 401) {
        throw new ApiError(401, 'Unauthorized', errorBody);
      }
      if (res.status === 403) {
        throw new ApiError(403, 'Forbidden', errorBody);
      }
      if (res.status === 404) {
        throw new ApiError(404, 'Not Found', errorBody);
      }

      throw new ApiError(res.status, res.statusText, errorBody);
    }

    // 204 No Content (DELETE responses)
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  return {
    get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
      return request<T>('GET', `${path}${buildQueryString(params)}`);
    },
    post<T>(path: string, body?: unknown): Promise<T> {
      return request<T>('POST', path, body);
    },
    put<T>(path: string, body?: unknown): Promise<T> {
      return request<T>('PUT', path, body);
    },
    patch<T>(path: string, body?: unknown): Promise<T> {
      return request<T>('PATCH', path, body);
    },
    del(path: string): Promise<void> {
      return request<void>('DELETE', path);
    },
  };
}

// ─── Composed client ─────────────────────────────────────────────────────────

export type UnifloApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(config: ApiClientConfig) {
  const core = createCoreClient(config);

  return {
    core,
    tickets: createTicketsClient(core),
    audits: createAuditsClient(core),
    sops: createSopsClient(core),
    capa: createCapaClient(core),
    tasks: createTasksClient(core),
    knowledge: createKnowledgeClient(core),
    automation: createAutomationClient(core),
    sla: createSlaClient(core),
    goals: createGoalsClient(core),
    broadcasts: createBroadcastsClient(core),
    training: createTrainingClient(core),
    csat: createCsatClient(core),
    admin: createAdminClient(core),
  };
}
