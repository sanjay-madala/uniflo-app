import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { TicketListParams, CreateTicketBody, UpdateTicketBody } from '../modules/tickets';

export function useTickets(params?: TicketListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => client.tickets.list(params),
  });
}

export function useTicket(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => client.tickets.get(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTicketBody) => client.tickets.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTicket() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTicketBody }) =>
      client.tickets.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useDeleteTicket() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.tickets.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
