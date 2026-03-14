"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  kbArticles, kbCategories, users,
} from "@uniflo/mock-data";
import type { KBArticle } from "@uniflo/mock-data";
import {
  PageHeader, BreadcrumbBar, Button, Badge, Avatar, AvatarFallback,
} from "@uniflo/ui";
import { Pencil, Link2, Sparkles } from "lucide-react";
import { SOPSourceBadge } from "@/components/knowledge/SOPSourceBadge";
import { VisibilityToggle } from "@/components/knowledge/VisibilityToggle";
import { ArticleTableOfContents } from "@/components/knowledge/ArticleTableOfContents";
import { ArticleMetadataPanel } from "@/components/knowledge/ArticleMetadataPanel";
import { ArticleFeedbackWidget } from "@/components/knowledge/ArticleFeedbackWidget";
import { KBAICopilotPanel } from "@/components/knowledge/KBAICopilotPanel";

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function generateStaticParams() { return [{articleId:"kb_001"},{articleId:"kb_002"},{articleId:"kb_003"},{articleId:"kb_004"},{articleId:"kb_005"}] }

export default function ArticleReadPage() {
  const { locale, articleId } = useParams<{ locale: string; articleId: string }>();
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const articles = kbArticles as KBArticle[];
  const article = articles.find(a => a.id === articleId);
  const category = article ? kbCategories.find(c => c.id === article.category_id) : undefined;
  const author = article ? users.find(u => u.id === article.author_id) : undefined;

  // Related articles: same category, different article
  const relatedArticles = article
    ? articles
        .filter(a => a.category_id === article.category_id && a.id !== article.id && a.status === "published")
        .slice(0, 3)
        .map(a => ({ id: a.id, title: a.title }))
    : [];

  // Scroll spy for ToC
  const handleScroll = useCallback(() => {
    if (!article) return;
    const headings = article.table_of_contents;
    let current = "";
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = h.id;
      }
    }
    if (current) setActiveHeadingId(current);
  }, [article]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 p-6">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Article not found</h1>
        <Link href={`/${locale}/knowledge/`}>
          <Button variant="secondary" size="sm">Back to Knowledge Base</Button>
        </Link>
      </div>
    );
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title={article.title}
        breadcrumb={
          <BreadcrumbBar
            items={[
              { label: "Knowledge Base", href: `/${locale}/knowledge/` },
              ...(category ? [{ label: category.name, href: `/${locale}/knowledge/?category=${category.id}` }] : []),
              { label: article.title },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/knowledge/${article.id}/edit/`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleCopyLink}>
              <Link2 className="h-4 w-4" /> {linkCopied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCopilotOpen(true)}>
              <Sparkles className="h-4 w-4" /> AI Copilot
            </Button>
          </div>
        }
      />

      {/* Two-column layout */}
      <div className="flex justify-center gap-16 p-6" style={{ maxWidth: "1024px", margin: "0 auto", width: "100%" }}>
        {/* Main content column */}
        <article className="min-w-0 flex-1" style={{ maxWidth: "720px" }}>
          {/* SOP Source Badge */}
          {article.sop_source_id && article.sop_source_name && (
            <div className="mb-4">
              <SOPSourceBadge
                sopSourceId={article.sop_source_id}
                sopSourceName={article.sop_source_name}
                variant="full"
              />
            </div>
          )}

          {/* Visibility badge */}
          <div className="mb-3">
            <VisibilityToggle visibility={article.visibility} readOnly />
          </div>

          {/* Article metadata */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              {article.published_at && (
                <span>Published {formatDate(article.published_at)}</span>
              )}
              <span>&middot;</span>
              <span>Updated {formatDate(article.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 text-[10px]">
                <AvatarFallback>{author ? getInitials(author.name) : "?"}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-[var(--text-primary)]">{author?.name ?? "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                  {category.name}
                </Badge>
              )}
              {article.tags.map(tag => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <hr className="border-[var(--border-default)] mb-6" />

          {/* Article body */}
          <div
            className="kb-article-body"
            style={{
              fontSize: "15px",
              lineHeight: 1.75,
              color: "var(--text-primary)",
            }}
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />

          <style>{`
            .kb-article-body h2 {
              font-size: 20px;
              font-weight: 600;
              margin-top: 40px;
              margin-bottom: 12px;
              color: var(--text-primary);
            }
            .kb-article-body h3 {
              font-size: 16px;
              font-weight: 600;
              margin-top: 32px;
              margin-bottom: 8px;
              color: var(--text-primary);
            }
            .kb-article-body p {
              margin-bottom: 16px;
              color: var(--text-primary);
            }
            .kb-article-body ul, .kb-article-body ol {
              margin-inline-start: 24px;
              margin-bottom: 16px;
            }
            .kb-article-body li {
              margin-bottom: 8px;
            }
            .kb-article-body ul {
              list-style-type: disc;
            }
            .kb-article-body ol {
              list-style-type: decimal;
            }
            .kb-article-body code {
              font-family: "JetBrains Mono", monospace;
              font-size: 13px;
              background: var(--bg-tertiary);
              padding: 2px 6px;
              border-radius: 4px;
            }
            .kb-article-body pre {
              background: var(--bg-tertiary);
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              margin-bottom: 16px;
            }
            .kb-article-body blockquote {
              border-inline-start: 3px solid var(--accent-blue);
              padding-inline-start: 16px;
              font-style: italic;
              color: var(--text-secondary);
              margin-bottom: 16px;
            }
            .kb-article-body img {
              border-radius: 8px;
              max-width: 100%;
              margin: 0 auto;
              display: block;
            }
            .kb-article-body a {
              color: var(--accent-blue);
              text-decoration: underline;
            }
            .kb-article-body strong {
              font-weight: 600;
            }
          `}</style>

          <hr className="border-[var(--border-default)] mt-8 mb-2" />

          {/* Feedback widget */}
          <ArticleFeedbackWidget
            articleId={article.id}
            helpfulCount={article.helpful_count}
            notHelpfulCount={article.not_helpful_count}
          />
        </article>

        {/* Right rail (desktop only) */}
        <aside className="hidden xl:block w-60 shrink-0">
          <div className="sticky top-20 space-y-8">
            <ArticleTableOfContents
              headings={article.table_of_contents}
              activeId={activeHeadingId}
            />
            <hr className="border-[var(--border-default)]" />
            <ArticleMetadataPanel
              article={article}
              category={category}
              author={author}
              relatedArticles={relatedArticles}
            />
          </div>
        </aside>
      </div>

      {/* AI Copilot drawer */}
      <KBAICopilotPanel
        open={copilotOpen}
        onOpenChange={setCopilotOpen}
        articleTitle={article.title}
      />
    </div>
  );
}
