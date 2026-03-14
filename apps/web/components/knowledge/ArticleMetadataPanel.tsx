"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@uniflo/ui";
import type { KBArticle, KBCategory, User } from "@uniflo/mock-data";
import { Eye, ThumbsUp, ExternalLink } from "lucide-react";
import { ArticleStatusBadge } from "./ArticleStatusBadge";
import { VisibilityToggle } from "./VisibilityToggle";

interface ArticleMetadataPanelProps {
  article: KBArticle;
  category: KBCategory | undefined;
  author: User | undefined;
  relatedArticles: Array<{ id: string; title: string }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ArticleMetadataPanel({ article, category, author, relatedArticles }: ArticleMetadataPanelProps) {
  const { locale } = useParams<{ locale: string }>();
  const helpfulRate = article.helpful_count + article.not_helpful_count > 0
    ? Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Details section */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Details</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Status</span>
            <ArticleStatusBadge status={article.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Visibility</span>
            <VisibilityToggle visibility={article.visibility} readOnly />
          </div>
          {category && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Category</span>
              <span className="text-[var(--text-primary)] text-xs">{category.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Last updated</span>
            <span className="text-[var(--text-primary)] text-xs">{formatDate(article.updated_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Views</span>
            <span className="inline-flex items-center gap-1 text-[var(--text-primary)] text-xs">
              <Eye className="h-3 w-3" /> {article.views_count.toLocaleString()}
            </span>
          </div>
          {helpfulRate > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Helpful</span>
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)] text-xs">
                <ThumbsUp className="h-3 w-3" /> {helpfulRate}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Linked SOP */}
      {article.sop_source_id && article.sop_source_name && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Linked SOP</p>
          <Link
            href={`/${locale}/sop/${article.sop_source_id}/`}
            className="flex items-center gap-2 text-sm text-[var(--accent-blue)] hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {article.sop_source_name}
          </Link>
        </div>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Related Articles</p>
          <div className="space-y-2">
            {relatedArticles.map((ra) => (
              <Link
                key={ra.id}
                href={`/${locale}/knowledge/${ra.id}/`}
                className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
              >
                {ra.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
