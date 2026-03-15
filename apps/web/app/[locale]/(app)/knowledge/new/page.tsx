"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useKBArticlesData } from "@/lib/data/useKnowledgeData";
import type { KBVisibility } from "@uniflo/mock-data";
import {
  PageHeader, BreadcrumbBar, Button, Input, Badge, RichTextEditor,
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  FormField,
} from "@uniflo/ui";
import { Save, Upload, Sparkles, X } from "lucide-react";
import { ArticleEditorToolbar } from "@/components/knowledge/ArticleEditorToolbar";
import { ArticlePreviewToggle } from "@/components/knowledge/ArticlePreviewToggle";
import { VisibilityToggle } from "@/components/knowledge/VisibilityToggle";
import { MediaUploadBlock } from "@/components/knowledge/MediaUploadBlock";
import { KBAICopilotPanel } from "@/components/knowledge/KBAICopilotPanel";

export default function NewArticlePage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const prefillTitle = searchParams.get("title") ?? "";
  const { categories: kbCategories } = useKBArticlesData();

  const [title, setTitle] = useState(prefillTitle);
  const [excerpt, setExcerpt] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState<KBVisibility>("internal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  // Auto-save every 30s
  useEffect(() => {
    if (!isDirty) return;
    const timer = setInterval(() => {
      handleSaveDraft();
    }, 30000);
    return () => clearInterval(timer);
  }, [isDirty, bodyHtml, title, excerpt, categoryId, visibility, tags]);

  // Beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    const key = "kb-draft-new";
    localStorage.setItem(key, JSON.stringify({ title, excerpt, bodyHtml, categoryId, visibility, tags }));
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date());
      setIsDirty(false);
    }, 500);
  }, [title, excerpt, bodyHtml, categoryId, visibility, tags]);

  function handlePublish() {
    if (window.confirm(`Publish this article? It will be visible to ${visibility === "public" ? "Public" : "Internal"} readers.`)) {
      handleSaveDraft();
    }
  }

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setIsDirty(true);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
    setIsDirty(true);
  }

  function getSaveIndicator(): string {
    if (isSaving) return "Saving...";
    if (!lastSavedAt) return "";
    const diffSec = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (diffSec < 5) return "Draft saved just now";
    return `Draft saved ${diffSec}s ago`;
  }

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="New Article"
        breadcrumb={
          <BreadcrumbBar
            items={[
              { label: "Knowledge Base", href: `/${locale}/knowledge/` },
              { label: "New Article" },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            {getSaveIndicator() && (
              <span className="text-xs text-[var(--text-muted)]">{getSaveIndicator()}</span>
            )}
            <ArticlePreviewToggle mode={editorMode} onChange={setEditorMode} />
            <Button variant="secondary" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Upload className="h-4 w-4" /> Publish
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCopilotOpen(true)}>
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full">
        {/* Metadata bar */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
            placeholder="Article title"
            className="w-full text-2xl font-semibold bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-0 outline-none focus:ring-0 p-0"
          />

          <div className="flex flex-wrap items-center gap-3">
            <FormField label="Category" className="min-w-[160px]">
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setIsDirty(true); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {kbCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Visibility">
              <VisibilityToggle visibility={visibility} onChange={(v) => { setVisibility(v); setIsDirty(true); }} />
            </FormField>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-[var(--text-muted)] mr-1">Tags:</span>
            {tags.map(tag => (
              <Badge key={tag} className="gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Add tag..."
              className="text-xs bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-0 outline-none w-20"
            />
          </div>

          <FormField label="Excerpt (optional)">
            <Input
              value={excerpt}
              onChange={(e) => { setExcerpt(e.target.value); setIsDirty(true); }}
              placeholder="Brief summary of the article..."
            />
          </FormField>
        </div>

        {/* Editor / Preview */}
        {editorMode === "edit" ? (
          <div className="space-y-0">
            {/* Extended toolbar (visual) */}
            <div className="rounded-t-lg border border-b-0 border-[var(--border-default)] overflow-hidden">
              <ArticleEditorToolbar onImageClick={() => setShowMediaUpload(true)} />
            </div>

            {/* RichTextEditor from @uniflo/ui */}
            <RichTextEditor
              value={bodyHtml}
              onChange={(html) => {
                setBodyHtml(html);
                setIsDirty(true);
              }}
              placeholder="Start writing your article..."
              className="rounded-t-none [&>div:first-child]:hidden"
            />

            {showMediaUpload && (
              <div className="p-6 border border-t-0 border-[var(--border-default)] rounded-b-lg bg-[var(--bg-secondary)]">
                <MediaUploadBlock
                  onUpload={() => {
                    setShowMediaUpload(false);
                  }}
                />
                <div className="mt-2 text-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowMediaUpload(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{title || "Untitled Article"}</h1>
              <div
                className="kb-article-body"
                style={{
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "var(--text-primary)",
                }}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
              <style>{`
                .kb-article-body h2 { font-size: 20px; font-weight: 600; margin-top: 40px; margin-bottom: 12px; }
                .kb-article-body h3 { font-size: 16px; font-weight: 600; margin-top: 32px; margin-bottom: 8px; }
                .kb-article-body p { margin-bottom: 16px; }
                .kb-article-body ul, .kb-article-body ol { margin-inline-start: 24px; margin-bottom: 16px; }
                .kb-article-body li { margin-bottom: 8px; }
                .kb-article-body ul { list-style-type: disc; }
                .kb-article-body ol { list-style-type: decimal; }
                .kb-article-body blockquote { border-inline-start: 3px solid var(--accent-blue); padding-inline-start: 16px; font-style: italic; }
                .kb-article-body code { font-size: 13px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; }
                .kb-article-body pre { background: var(--bg-tertiary); padding: 16px; border-radius: 8px; overflow-x: auto; }
              `}</style>
            </div>
            <div className="fixed bottom-4 inset-x-0 flex justify-center z-10">
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 shadow-lg flex items-center gap-3">
                <span className="text-sm text-[var(--text-secondary)]">You are in preview mode</span>
                <Button variant="secondary" size="sm" onClick={() => setEditorMode("edit")}>
                  Back to editing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <KBAICopilotPanel
        open={copilotOpen}
        onOpenChange={setCopilotOpen}
        articleTitle={title}
      />
    </div>
  );
}
