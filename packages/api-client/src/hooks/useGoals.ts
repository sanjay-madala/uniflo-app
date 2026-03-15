import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { GoalListParams, CreateGoalBody, UpdateGoalBody, CreateKeyResultBody, UpdateKRProgressBody } from '../modules/goals';

export function useGoals(params?: GoalListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['goals', params],
    queryFn: () => client.goals.list(params),
  });
}

export function useGoal(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => client.goals.get(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGoalBody) => client.goals.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateGoal() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGoalBody }) =>
      client.goals.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.goals.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useAddKeyResult() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, body }: { goalId: string; body: CreateKeyResultBody }) =>
      client.goals.addKeyResult(goalId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateKRProgress() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, krId, body }: { goalId: string; krId: string; body: UpdateKRProgressBody }) =>
      client.goals.updateKRProgress(goalId, krId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}
