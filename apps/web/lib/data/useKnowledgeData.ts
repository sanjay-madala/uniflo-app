"use client";

import {
  kbArticles as mockArticles,
  kbCategories as mockCategories,
  kbCollections as mockCollections,
  kbAnalytics as mockAnalytics,
  kbSearchGaps as mockSearchGaps,
  users as mockUsers,
} from "@uniflo/mock-data";
import type { KBArticle, ArticleAnalytics, KBSearchGap } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------- Articles List ----------

interface UseKBArticlesDataResult {
  articles: KBArticle[];
  categories: typeof mockCategories;
  collections: typeof mockCollections;
  users: typeof mockUsers;
  isLoading: boolean;
  error: Error | null;
}

export function useKBArticlesData(_params?: Record<string, unknown>): UseKBArticlesDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useArticles } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useArticles();
    return {
      articles: ((result.data as any)?.data ?? []) as KBArticle[],
      categories: mockCategories,
      collections: mockCollections,
      users: mockUsers,
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    articles: mockArticles as KBArticle[],
    categories: mockCategories,
    collections: mockCollections,
    users: mockUsers,
    isLoading: false,
    error: null,
  };
}

// ---------- Single Article ----------

interface UseKBArticleDataResult {
  article: KBArticle | undefined;
  articles: KBArticle[];
  categories: typeof mockCategories;
  users: typeof mockUsers;
  isLoading: boolean;
  error: Error | null;
}

export function useKBArticleData(id: string): UseKBArticleDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useArticle } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useArticle(id);
    return {
      article: ((result.data as any)?.data ?? undefined) as KBArticle | undefined,
      articles: mockArticles as KBArticle[],
      categories: mockCategories,
      users: mockUsers,
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  const articles = mockArticles as KBArticle[];
  return {
    article: articles.find((a) => a.id === id),
    articles,
    categories: mockCategories,
    users: mockUsers,
    isLoading: false,
    error: null,
  };
}

// ---------- Analytics ----------

interface UseKBAnalyticsDataResult {
  analytics: ArticleAnalytics[];
  searchGaps: KBSearchGap[];
  articles: KBArticle[];
  isLoading: boolean;
  error: Error | null;
}

export function useKBAnalyticsData(): UseKBAnalyticsDataResult {
  return {
    analytics: mockAnalytics as ArticleAnalytics[],
    searchGaps: mockSearchGaps as KBSearchGap[],
    articles: mockArticles as KBArticle[],
    isLoading: false,
    error: null,
  };
}
