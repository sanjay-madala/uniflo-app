import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { PolicyListParams, CreatePolicyBody, UpdatePolicyBody, BreachListParams, ComplianceParams } from '../modules/sla';

export function useSlaPolicies(params?: PolicyListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sla-policies', params],
    queryFn: () => client.sla.listPolicies(params),
  });
}

export function useSlaPolicy(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sla-policies', id],
    queryFn: () => client.sla.getPolicy(id),
    enabled: !!id,
  });
}

export function useCreateSlaPolicy() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePolicyBody) => client.sla.createPolicy(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sla-policies'] }),
  });
}

export function useUpdateSlaPolicy() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePolicyBody }) =>
      client.sla.updatePolicy(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sla-policies'] }),
  });
}

export function useDeleteSlaPolicy() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.sla.deletePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sla-policies'] }),
  });
}

export function useSlaBreaches(params?: BreachListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sla-breaches', params],
    queryFn: () => client.sla.listBreaches(params),
  });
}

export function useSlaCompliance(params?: ComplianceParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['sla-compliance', params],
    queryFn: () => client.sla.getCompliance(params),
  });
}
