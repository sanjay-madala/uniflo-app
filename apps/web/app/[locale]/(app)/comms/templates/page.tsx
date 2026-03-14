"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { broadcastTemplates } from "@uniflo/mock-data";
import type { BroadcastTemplate, TemplateCategory } from "@uniflo/mock-data";
import { PageHeader, Button, Input } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { TemplateCard } from "@/components/broadcasts/TemplateCard";
import { TemplatePreviewModal } from "@/components/broadcasts/TemplatePreviewModal";

const categoryLabels: Record<TemplateCategory | "all", string> = {
  all: "All",
  policy_update: "Policy Update",
  safety_alert: "Safety Alert",
  operational_change: "Operational",
  event_announcement: "Event",
  training_reminder: "Training",
  compliance_notice: "Compliance",
  general: "General",
};

const categories: (TemplateCategory | "all")[] = [
  "all",
  "policy_update",
  "safety_alert",
  "operational_change",
  "event_announcement",
  "training_reminder",
  "compliance_notice",
  "general",
];

export default function TemplateLibraryPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<BroadcastTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const templates = broadcastTemplates as BroadcastTemplate[];

  const filtered = useMemo(() => {
    let result = [...templates];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }
    return result;
  }, [templates, search, activeCategory]);

  const handlePreview = (template: BroadcastTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleUseTemplate = (template: BroadcastTemplate) => {
    router.push(`/${locale}/comms/new/?template=${template.id}`);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Broadcast Templates"
        subtitle="Browse and use pre-built templates for your broadcasts"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      {/* Search + Category Tabs */}
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--accent-blue)"
                    : "var(--bg-secondary)",
                  color: isActive ? "white" : "var(--text-secondary)",
                  border: isActive ? "none" : "1px solid var(--border-default)",
                }}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">No templates found</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Create your first broadcast template
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => handlePreview(template)}
              onUse={() => handleUseTemplate(template)}
            />
          ))}
        </div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUse={handleUseTemplate}
      />
    </div>
  );
}
