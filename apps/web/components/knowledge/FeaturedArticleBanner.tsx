"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Avatar, AvatarFallback, Button } from "@uniflo/ui";
import type { KBArticle, KBCategory, KBCollection, User } from "@uniflo/mock-data";
import { ArrowRight, Star } from "lucide-react";

interface FeaturedArticleBannerProps {
  collection: KBCollection;
  article: KBArticle;
  category: KBCategory | undefined;
  author: User | undefined;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function FeaturedArticleBanner({ collection, article, category, author }: FeaturedArticleBannerProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] p-6 md:p-8"
      style={{
        background: category
          ? `linear-gradient(135deg, ${category.color}10 0%, ${category.color}05 100%)`
          : "var(--bg-secondary)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-[var(--accent-yellow)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {collection.name}
        </span>
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{article.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{article.excerpt}</p>
          <div className="flex items-center gap-3">
            {category && (
              <Badge style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                {category.name}
              </Badge>
            )}
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5 text-[9px]">
                <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-[var(--text-muted)]">{author?.name ?? "Unknown"}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Link href={`/${locale}/knowledge/${article.id}/`}>
            <Button size="sm">
              Read Article <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
