import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { SopListParams, CreateSopBody, UpdateSopBody, AcknowledgeSopBody } from '../modules/sops';

export function useSops(params?: SopListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sops', params],
    queryFn: () => client.sops.list(params),
  });
}

export function useSop(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sops', id],
    queryFn: () => client.sops.get(id),
    enabled: !!id,
  });
}

export function useCreateSop() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSopBody) => client.sops.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });
}

export function useUpdateSop() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSopBody }) =>
      client.sops.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });
}

export function useDeleteSop() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.sops.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });
}

export function usePublishSop() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.sops.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });
}

export function useAcknowledgeSop() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AcknowledgeSopBody }) =>
      client.sops.acknowledge(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });
}
