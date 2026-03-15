import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { Task, Project } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface TaskListParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  source?: string;
  locationId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: string;
  locationId: string;
  assigneeId?: string;
  reporterId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  source?: string;
  linkedAuditId?: string;
  linkedAuditItem?: string;
  linkedCapaId?: string;
  linkedTicketId?: string;
  linkedSopId?: string;
  estimatedHours?: number;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  projectId?: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  watchers?: string[];
  estimatedHours?: number;
  customFields?: Record<string, unknown>;
}

export interface ProjectListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProjectBody {
  name: string;
  description?: string;
  locationId?: string;
  ownerId: string;
  dueDate?: string;
  color?: string;
  tags?: string[];
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createTasksClient(client: ApiClient) {
  return {
    list(params?: TaskListParams) {
      return client.get<PaginatedResponse<Task>>('/api/v1/tasks', params as Record<string, string | number | boolean | undefined>);
    },
    get(id: string) {
      return client.get<SingleResponse<Task>>(`/api/v1/tasks/${id}`);
    },
    create(body: CreateTaskBody) {
      return client.post<SingleResponse<Task>>('/api/v1/tasks', body);
    },
    update(id: string, body: UpdateTaskBody) {
      return client.put<SingleResponse<Task>>(`/api/v1/tasks/${id}`, body);
    },
    delete(id: string) {
      return client.del(`/api/v1/tasks/${id}`);
    },
    listProjects(params?: ProjectListParams) {
      return client.get<PaginatedResponse<Project>>('/api/v1/projects', params as Record<string, string | number | boolean | undefined>);
    },
    createProject(body: CreateProjectBody) {
      return client.post<SingleResponse<Project>>('/api/v1/projects', body);
    },
  };
}
