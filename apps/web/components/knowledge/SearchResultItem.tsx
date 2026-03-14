"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Avatar, AvatarFallback } from "@uniflo/ui";
import type { KBArticle, KBCategory, User } from "@uniflo/mock-data";
import { Eye } from "lucide-react";
import { VisibilityToggle } from "./VisibilityToggle";

interface SearchResultItemProps {
  article: KBArticle;
  category: KBCategory | undefined;
  author: User | undefined;
  query: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-[var(--accent-blue)]/20 text-inherit rounded-sm px-0.5">{match}</mark>
      {after}
    </>
  );
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SearchResultItem({ article, category, author, query }: SearchResultItemProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Link href={`/${locale}/knowledge/${article.id}/`}>
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--text-muted)] cursor-pointer space-y-2">
        {/* Top row: category + visibility */}
        <div className="flex items-center justify-between gap-2">
          {category && (
            <Badge style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: `${category.color}40` }}>
              {category.name}
            </Badge>
          )}
          <VisibilityToggle visibility={article.visibility} readOnly />
        </div>

        {/* Title with highlight */}
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
          {highlightMatch(article.title, query)}
        </h3>

        {/* Excerpt with highlight */}
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
          {highlightMatch(article.excerpt, query)}
        </p>

        {/* Bottom row: author, date, views */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4 text-[8px]">
              <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-[var(--text-muted)]">{author?.name ?? "Unknown"}</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Updated {formatDate(article.updated_at)}</span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Eye className="h-3 w-3" /> {article.views_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
