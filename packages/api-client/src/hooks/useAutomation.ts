import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { RuleListParams, CreateRuleBody, UpdateRuleBody, ExecutionListParams } from '../modules/automation';

export function useAutomationRules(params?: RuleListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['automation-rules', params],
    queryFn: () => client.automation.listRules(params),
  });
}

export function useAutomationRule(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['automation-rules', id],
    queryFn: () => client.automation.getRule(id),
    enabled: !!id,
  });
}

export function useCreateAutomationRule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRuleBody) => client.automation.createRule(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });
}

export function useUpdateAutomationRule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRuleBody }) =>
      client.automation.updateRule(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });
}

export function useDeleteAutomationRule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.automation.deleteRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });
}

export function useToggleAutomationRule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.automation.toggleRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });
}

export function useAutomationExecutions(params?: ExecutionListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['automation-executions', params],
    queryFn: () => client.automation.listExecutions(params),
  });
}
