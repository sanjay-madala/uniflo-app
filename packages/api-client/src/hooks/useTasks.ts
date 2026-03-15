import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { TaskListParams, CreateTaskBody, UpdateTaskBody, ProjectListParams, CreateProjectBody } from '../modules/tasks';

export function useTasks(params?: TaskListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => client.tasks.list(params),
  });
}

export function useTask(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => client.tasks.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskBody) => client.tasks.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTaskBody }) =>
      client.tasks.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.tasks.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useProjects(params?: ProjectListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => client.tasks.listProjects(params),
  });
}

export function useCreateProject() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProjectBody) => client.tasks.createProject(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
