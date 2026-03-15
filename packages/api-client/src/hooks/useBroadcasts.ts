import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { BroadcastListParams, CreateBroadcastBody, UpdateBroadcastBody, ReceiptListParams } from '../modules/broadcasts';

export function useBroadcasts(params?: BroadcastListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['broadcasts', params],
    queryFn: () => client.broadcasts.list(params),
  });
}

export function useBroadcast(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['broadcasts', id],
    queryFn: () => client.broadcasts.get(id),
    enabled: !!id,
  });
}

export function useCreateBroadcast() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBroadcastBody) => client.broadcasts.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
}

export function useUpdateBroadcast() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBroadcastBody }) =>
      client.broadcasts.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
}

export function useDeleteBroadcast() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.broadcasts.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
}

export function useSendBroadcast() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.broadcasts.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
}

export function useBroadcastReceipts(id: string, params?: ReceiptListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['broadcast-receipts', id, params],
    queryFn: () => client.broadcasts.getReceipts(id, params),
    enabled: !!id,
  });
}
