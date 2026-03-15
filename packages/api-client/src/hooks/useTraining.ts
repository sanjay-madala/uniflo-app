import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type {
  ModuleListParams,
  CreateModuleBody,
  UpdateModuleBody,
  EnrollmentListParams,
  EnrollBody,
  SubmitQuizBody,
  CertificateListParams,
} from '../modules/training';

export function useTrainingModules(params?: ModuleListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['training-modules', params],
    queryFn: () => client.training.listModules(params),
  });
}

export function useTrainingModule(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['training-modules', id],
    queryFn: () => client.training.getModule(id),
    enabled: !!id,
  });
}

export function useCreateTrainingModule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateModuleBody) => client.training.createModule(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-modules'] }),
  });
}

export function useUpdateTrainingModule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateModuleBody }) =>
      client.training.updateModule(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-modules'] }),
  });
}

export function useDeleteTrainingModule() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.training.deleteModule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-modules'] }),
  });
}

export function useTrainingEnrollments(params?: EnrollmentListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['training-enrollments', params],
    queryFn: () => client.training.listEnrollments(params),
  });
}

export function useEnrollUser() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EnrollBody) => client.training.enroll(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-enrollments'] }),
  });
}

export function useSubmitQuiz() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, body }: { moduleId: string; body: SubmitQuizBody }) =>
      client.training.submitQuiz(moduleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['training-certificates'] });
    },
  });
}

export function useTrainingCertificates(params?: CertificateListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['training-certificates', params],
    queryFn: () => client.training.listCertificates(params),
  });
}
