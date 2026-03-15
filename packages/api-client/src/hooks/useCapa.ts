import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { CapaListParams, CreateCapaBody, UpdateCapaBody, CapaReviewBody } from '../modules/capa';

export function useCapas(params?: CapaListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['capas', params],
    queryFn: () => client.capa.list(params),
  });
}

export function useCapa(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['capas', id],
    queryFn: () => client.capa.get(id),
    enabled: !!id,
  });
}

export function useCreateCapa() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCapaBody) => client.capa.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capas'] }),
  });
}

export function useUpdateCapa() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCapaBody }) =>
      client.capa.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capas'] }),
  });
}

export function useDeleteCapa() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.capa.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capas'] }),
  });
}

export function useReviewCapa() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CapaReviewBody }) =>
      client.capa.review(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capas'] }),
  });
}
