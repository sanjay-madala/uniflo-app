"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Avatar, AvatarFallback } from "@uniflo/ui";
import type { KBArticle, KBCategory, User } from "@uniflo/mock-data";
import { Eye, ThumbsUp } from "lucide-react";
import { ArticleStatusBadge } from "./ArticleStatusBadge";

interface ArticleListItemProps {
  article: KBArticle;
  category: KBCategory | undefined;
  author: User | undefined;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ArticleListItem({ article, category, author }: ArticleListItemProps) {
  const { locale } = useParams<{ locale: string }>();
  const helpfulRate = article.helpful_count + article.not_helpful_count > 0
    ? Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100)
    : 0;

  return (
    <Link href={`/${locale}/knowledge/${article.id}/`}>
      <div className="flex items-center gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 transition-all hover:border-[var(--text-muted)] cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{article.title}</h3>
            <ArticleStatusBadge status={article.status} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] truncate">{article.excerpt}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {category && (
            <Badge className="text-[10px]" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
              {category.name}
            </Badge>
          )}
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5 text-[8px]">
              <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-[var(--text-muted)]">{formatDate(article.updated_at)}</span>
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
    </Link>
  );
}
