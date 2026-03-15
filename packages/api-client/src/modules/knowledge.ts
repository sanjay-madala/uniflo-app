import type { ApiClient, PaginatedResponse, SingleResponse } from '../client';
import type { KBArticle } from '@uniflo/mock-data';

// ─── Parameter types ─────────────────────────────────────────────────────────

export interface ArticleListParams {
  categoryId?: string;
  status?: string;
  visibility?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateArticleBody {
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  status?: string;
  visibility?: string;
  categoryId?: string;
  authorId: string;
  locationId?: string;
  tags?: string[];
  featuredImage?: string;
}

export interface UpdateArticleBody {
  title?: string;
  slug?: string;
  excerpt?: string;
  bodyHtml?: string;
  status?: string;
  visibility?: string;
  categoryId?: string;
  tags?: string[];
  featuredImage?: string;
  publishedAt?: string;
}

export interface CreateCategoryBody {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder?: number;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parentId?: string | null;
  sortOrder: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export function createKnowledgeClient(client: ApiClient) {
  return {
    listArticles(params?: ArticleListParams) {
      return client.get<PaginatedResponse<KBArticle>>('/api/v1/kb/articles', params as Record<string, string | number | boolean | undefined>);
    },
    getArticle(id: string) {
      return client.get<SingleResponse<KBArticle>>(`/api/v1/kb/articles/${id}`);
    },
    createArticle(body: CreateArticleBody) {
      return client.post<SingleResponse<KBArticle>>('/api/v1/kb/articles', body);
    },
    updateArticle(id: string, body: UpdateArticleBody) {
      return client.put<SingleResponse<KBArticle>>(`/api/v1/kb/articles/${id}`, body);
    },
    deleteArticle(id: string) {
      return client.del(`/api/v1/kb/articles/${id}`);
    },
    listCategories() {
      return client.get<SingleResponse<KBCategory[]>>('/api/v1/kb/categories');
    },
    createCategory(body: CreateCategoryBody) {
      return client.post<SingleResponse<KBCategory>>('/api/v1/kb/categories', body);
    },
  };
}
