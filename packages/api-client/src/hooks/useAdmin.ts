import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type {
  UserListParams,
  InviteUserBody,
  UpdateUserBody,
  CreateRoleBody,
  UpdateRoleBody,
  CreateLocationBody,
  UpdateLocationBody,
  UpdateOrgBody,
} from '../modules/admin';

// ─── Users ───────────────────────────────────────────────────────────────────

export function useAdminUsers(params?: UserListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => client.admin.listUsers(params),
  });
}

export function useInviteUser() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteUserBody) => client.admin.inviteUser(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateAdminUser() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) =>
      client.admin.updateUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useDeactivateUser() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.admin.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export function useAdminRoles() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => client.admin.listRoles(),
  });
}

export function useCreateRole() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoleBody) => client.admin.createRole(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  });
}

export function useUpdateRole() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoleBody }) =>
      client.admin.updateRole(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  });
}

// ─── Locations ───────────────────────────────────────────────────────────────

export function useAdminLocations() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => client.admin.listLocations(),
  });
}

export function useCreateLocation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLocationBody) => client.admin.createLocation(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-locations'] }),
  });
}

export function useUpdateLocation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLocationBody }) =>
      client.admin.updateLocation(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-locations'] }),
  });
}

// ─── Organization ────────────────────────────────────────────────────────────

export function useOrganization() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin-org'],
    queryFn: () => client.admin.getOrg(),
  });
}

export function useUpdateOrganization() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateOrgBody) => client.admin.updateOrg(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-org'] }),
  });
}
