import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { User } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface UserListParams {
  search?: string;
  roleId?: string;
  locationId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface InviteUserBody {
  email: string;
  name: string;
  roleId: string;
  locationIds?: string[];
}

export interface UpdateUserBody {
  name?: string;
  roleId?: string;
  locationIds?: string[];
  locale?: string;
  timezone?: string;
}

export interface CreateRoleBody {
  name: string;
  permissions: Array<{
    module: string;
    actions: string[];
    locationScope?: string;
  }>;
}

export interface UpdateRoleBody {
  name?: string;
  permissions?: Array<{
    module: string;
    actions: string[];
    locationScope?: string;
  }>;
}

export interface CreateLocationBody {
  name: string;
  type: string;
  parentId?: string;
  address?: Record<string, unknown>;
}

export interface UpdateLocationBody {
  name?: string;
  type?: string;
  parentId?: string;
  address?: Record<string, unknown>;
}

export interface UpdateOrgBody {
  name?: string;
  domain?: string;
  plan?: string;
  settings?: Record<string, unknown>;
  branding?: Record<string, unknown>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: Array<{
    module: string;
    actions: string[];
    locationScope: string;
  }>;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  address: Record<string, unknown>;
  children?: Location[];
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  plan?: string;
  settings?: Record<string, unknown>;
  branding?: Record<string, unknown>;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createAdminClient(client: ApiClient) {
  return {
    // Users
    listUsers(params?: UserListParams) {
      return client.get<PaginatedResponse<User>>('/api/v1/admin/users', params as Record<string, string | number | boolean | undefined>);
    },
    inviteUser(body: InviteUserBody) {
      return client.post<SingleResponse<User>>('/api/v1/admin/users', body);
    },
    updateUser(id: string, body: UpdateUserBody) {
      return client.put<SingleResponse<User>>(`/api/v1/admin/users/${id}`, body);
    },
    deactivateUser(id: string) {
      return client.del(`/api/v1/admin/users/${id}`);
    },

    // Roles
    listRoles() {
      return client.get<SingleResponse<Role[]>>('/api/v1/admin/roles');
    },
    createRole(body: CreateRoleBody) {
      return client.post<SingleResponse<Role>>('/api/v1/admin/roles', body);
    },
    updateRole(id: string, body: UpdateRoleBody) {
      return client.put<SingleResponse<Role>>(`/api/v1/admin/roles/${id}`, body);
    },

    // Locations
    listLocations() {
      return client.get<SingleResponse<Location[]>>('/api/v1/admin/locations');
    },
    createLocation(body: CreateLocationBody) {
      return client.post<SingleResponse<Location>>('/api/v1/admin/locations', body);
    },
    updateLocation(id: string, body: UpdateLocationBody) {
      return client.put<SingleResponse<Location>>(`/api/v1/admin/locations/${id}`, body);
    },

    // Organization
    getOrg() {
      return client.get<SingleResponse<Organization>>('/api/v1/admin/org');
    },
    updateOrg(body: UpdateOrgBody) {
      return client.put<SingleResponse<Organization>>('/api/v1/admin/org', body);
    },
  };
}
