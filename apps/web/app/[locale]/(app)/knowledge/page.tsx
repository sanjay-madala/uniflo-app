"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  kbArticles, kbCategories, kbCollections, users,
} from "@uniflo/mock-data";
import type { KBArticle } from "@uniflo/mock-data";
import {
  PageHeader, SearchBar, Button, Pagination, Badge, EmptyState,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@uniflo/ui";
import { Plus, Settings, BookOpen, X } from "lucide-react";
import { CategoryCard } from "@/components/knowledge/CategoryCard";
import { ArticleCard } from "@/components/knowledge/ArticleCard";
import { FeaturedArticleBanner } from "@/components/knowledge/FeaturedArticleBanner";
import { SearchResultItem } from "@/components/knowledge/SearchResultItem";

const PER_PAGE = 8;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function getUserById(id: string) {
  return users.find(u => u.id === id);
}

function getCategoryById(id: string) {
  return kbCategories.find(c => c.id === id);
}

export default function KnowledgeBasePage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [page, setPage] = useState(1);

  const articles = kbArticles as KBArticle[];

  // Top-level categories only for grid display
  const topCategories = kbCategories.filter(c => !c.parent_id);

  // Featured collection and article
  const featuredCollection = kbCollections.find(c => c.is_featured);
  const featuredArticleId = featuredCollection?.article_ids[0];
  const featuredArticle = featuredArticleId
    ? articles.find(a => a.id === featuredArticleId)
    : undefined;

  // Tab counts
  const counts = useMemo(() => {
    const published = articles.filter(a => a.status === "published");
    return {
      all: published.length,
      internal: published.filter(a => a.visibility === "internal").length,
      public: published.filter(a => a.visibility === "public").length,
      drafts: articles.filter(a => a.status === "draft").length,
    };
  }, [articles]);

  // Filtered articles
  const filtered = useMemo(() => {
    let result = [...articles];

    // Tab filter
    if (activeTab === "internal") {
      result = result.filter(a => a.status === "published" && a.visibility === "internal");
    } else if (activeTab === "public") {
      result = result.filter(a => a.status === "published" && a.visibility === "public");
    } else if (activeTab === "drafts") {
      result = result.filter(a => a.status === "draft");
    } else {
      // "all" shows published only
      result = result.filter(a => a.status === "published");
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(a => a.category_id === selectedCategory);
    }

    // Search filter
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        stripHtml(a.body_html).toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by most recently updated
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return result;
  }, [articles, activeTab, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const isSearching = searchQuery.length >= 2;
  const selectedCategoryObj = selectedCategory ? getCategoryById(selectedCategory) : undefined;

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Documentation, guides, and articles for your team"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/knowledge/categories/`}>
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4" /> Manage Categories
              </Button>
            </Link>
            <Link href={`/${locale}/knowledge/new/`}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New Article
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All Articles ({counts.all})</TabsTrigger>
          <TabsTrigger value="internal">Internal ({counts.internal})</TabsTrigger>
          <TabsTrigger value="public">Public ({counts.public})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({counts.drafts})</TabsTrigger>
        </TabsList>

        {/* Search bar */}
        <div className="mt-4">
          <SearchBar
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setPage(1); }}
            onClear={() => { setSearchQuery(""); setPage(1); }}
            placeholder="Search articles, guides, and documentation..."
            shortcut="Ctrl+K"
            className="w-full"
          />
        </div>

        {/* Active category filter chip */}
        {selectedCategoryObj && (
          <div className="flex items-center gap-2 mt-3">
            <Badge style={{ backgroundColor: `${selectedCategoryObj.color}20`, color: selectedCategoryObj.color }}>
              Category: {selectedCategoryObj.name}
              <button
                type="button"
                onClick={() => { setSelectedCategory(null); setPage(1); }}
                className="ml-1.5 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Search results mode */}
        {isSearching ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""} found for &ldquo;{searchQuery}&rdquo;
            </p>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title={`No articles found for "${searchQuery}"`}
                description="Try a different search term or create a new article"
                action={{
                  label: "Create a new article",
                  onClick: () => {
                    window.location.href = `/${locale}/knowledge/new?title=${encodeURIComponent(searchQuery)}`;
                  },
                }}
              />
            ) : (
              <div className="space-y-3">
                {pageData.map((article) => (
                  <SearchResultItem
                    key={article.id}
                    article={article}
                    category={getCategoryById(article.category_id)}
                    author={getUserById(article.author_id)}
                    query={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <TabsContent value={activeTab} className="mt-0">
            {/* Featured collection banner */}
            {!selectedCategory && featuredCollection && featuredArticle && (
              <div className="mb-6">
                <FeaturedArticleBanner
                  collection={featuredCollection}
                  article={featuredArticle}
                  category={getCategoryById(featuredArticle.category_id)}
                  author={getUserById(featuredArticle.author_id)}
                />
              </div>
            )}

            {/* Categories grid */}
            {!selectedCategory && activeTab === "all" && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {topCategories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent articles */}
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                {selectedCategory ? `${selectedCategoryObj?.name ?? "Category"} Articles` : "Recent Articles"}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
              </p>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="No articles found"
                  description="Try adjusting your filters or create a new article"
                  action={{
                    label: "Create a new article",
                    onClick: () => {
                      window.location.href = `/${locale}/knowledge/new/`;
                    },
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageData.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      category={getCategoryById(article.category_id)}
                      author={getUserById(article.author_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
