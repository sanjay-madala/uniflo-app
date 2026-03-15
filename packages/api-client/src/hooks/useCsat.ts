import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { SurveyListParams, CreateSurveyBody, SubmitRatingBody, DashboardParams } from '../modules/csat';

export function useCsatSurveys(params?: SurveyListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['csat-surveys', params],
    queryFn: () => client.csat.listSurveys(params),
  });
}

export function useCsatSurvey(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['csat-surveys', id],
    queryFn: () => client.csat.getSurvey(id),
    enabled: !!id,
  });
}

export function useCreateCsatSurvey() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSurveyBody) => client.csat.createSurvey(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['csat-surveys'] }),
  });
}

export function useSubmitCsatRating() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SubmitRatingBody }) =>
      client.csat.submitRating(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csat-surveys'] });
      queryClient.invalidateQueries({ queryKey: ['csat-dashboard'] });
    },
  });
}

export function useCsatDashboard(params?: DashboardParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['csat-dashboard', params],
    queryFn: () => client.csat.getDashboard(params),
  });
}
