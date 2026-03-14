"use client";

import type { KBCollection, KBArticle, KBCategory, User } from "@uniflo/mock-data";
import { ArticleCard } from "./ArticleCard";

interface CollectionRowProps {
  collection: KBCollection;
  articles: KBArticle[];
  categories: KBCategory[];
  users: User[];
}

export function CollectionRow({ collection, articles, categories, users: allUsers }: CollectionRowProps) {
  const collectionArticles = collection.article_ids
    .map(id => articles.find(a => a.id === id))
    .filter((a): a is KBArticle => a !== undefined);

  if (collectionArticles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{collection.name}</h3>
        <p className="text-xs text-[var(--text-muted)]">{collection.description}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {collectionArticles.map(article => (
          <div key={article.id} className="min-w-[280px] max-w-[320px] shrink-0">
            <ArticleCard
              article={article}
              category={categories.find(c => c.id === article.category_id)}
              author={allUsers.find(u => u.id === article.author_id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
