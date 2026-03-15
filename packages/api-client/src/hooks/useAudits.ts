import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type {
  AuditListParams,
  CreateAuditBody,
  UpdateAuditBody,
  AuditTemplateListParams,
  CreateAuditTemplateBody,
} from '../modules/audits';

export function useAudits(params?: AuditListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['audits', params],
    queryFn: () => client.audits.list(params),
  });
}

export function useAudit(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['audits', id],
    queryFn: () => client.audits.get(id),
    enabled: !!id,
  });
}

export function useCreateAudit() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAuditBody) => client.audits.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audits'] }),
  });
}

export function useUpdateAudit() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAuditBody }) =>
      client.audits.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audits'] }),
  });
}

export function useDeleteAudit() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.audits.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audits'] }),
  });
}

export function useAuditTemplates(params?: AuditTemplateListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['audit-templates', params],
    queryFn: () => client.audits.listTemplates(params),
  });
}

export function useCreateAuditTemplate() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAuditTemplateBody) => client.audits.createTemplate(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit-templates'] }),
  });
}
