import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { ArticleListParams, CreateArticleBody, UpdateArticleBody, CreateCategoryBody } from '../modules/knowledge';

export function useArticles(params?: ArticleListParams) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['kb-articles', params],
    queryFn: () => client.knowledge.listArticles(params),
  });
}

export function useArticle(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['kb-articles', id],
    queryFn: () => client.knowledge.getArticle(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateArticleBody) => client.knowledge.createArticle(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-articles'] }),
  });
}

export function useUpdateArticle() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateArticleBody }) =>
      client.knowledge.updateArticle(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-articles'] }),
  });
}

export function useDeleteArticle() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.knowledge.deleteArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-articles'] }),
  });
}

export function useKBCategories() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['kb-categories'],
    queryFn: () => client.knowledge.listCategories(),
  });
}

export function useCreateKBCategory() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryBody) => client.knowledge.createCategory(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-categories'] }),
  });
}
