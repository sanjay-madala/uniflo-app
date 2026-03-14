"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, Badge, Avatar, AvatarFallback } from "@uniflo/ui";
import type { KBArticle, KBCategory, User } from "@uniflo/mock-data";
import { Eye, ThumbsUp } from "lucide-react";
import { SOPSourceBadge } from "./SOPSourceBadge";
import { VisibilityToggle } from "./VisibilityToggle";

interface ArticleCardProps {
  article: KBArticle;
  category: KBCategory | undefined;
  author: User | undefined;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function ArticleCard({ article, category, author }: ArticleCardProps) {
  const { locale } = useParams<{ locale: string }>();
  const helpfulRate = article.helpful_count + article.not_helpful_count > 0
    ? Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100)
    : 0;

  return (
    <Link href={`/${locale}/knowledge/${article.id}/`}>
      <Card className="cursor-pointer transition-all hover:border-[var(--border-default)] p-5 h-full flex flex-col gap-3">
        {/* Top row: badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {category && (
            <Badge style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: `${category.color}40` }}>
              {category.name}
            </Badge>
          )}
          <VisibilityToggle visibility={article.visibility} readOnly />
          {article.sop_source_id && article.sop_source_name && (
            <SOPSourceBadge
              sopSourceId={article.sop_source_id}
              sopSourceName={article.sop_source_name}
              variant="compact"
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 flex-1">
          {article.excerpt}
        </p>

        {/* Bottom row: author + meta */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-5 w-5 text-[9px]">
              <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-[var(--text-muted)] truncate">
              {timeAgo(article.updated_at)}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Eye className="h-3 w-3" /> {article.views_count}
            </span>
            {helpfulRate > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <ThumbsUp className="h-3 w-3" /> {helpfulRate}%
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
