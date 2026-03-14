"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ruleTemplates as mockTemplates } from "@uniflo/mock-data";
import type { RuleTemplate } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  EmptyState,
} from "@uniflo/ui";
import { ArrowLeft, Search } from "lucide-react";
import { TemplateCard } from "@/components/workflow/TemplateCard";
import { TemplatePreviewDrawer } from "@/components/workflow/TemplatePreviewDrawer";

export default function TemplateGalleryPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const templates = mockTemplates as RuleTemplate[];

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<RuleTemplate | null>(null);

  const filtered = useMemo(() => {
    let result = [...templates];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(t => t.category === categoryFilter);
    }

    return result;
  }, [templates, search, categoryFilter]);

  function handleActivate(name: string, locations: string[], template: RuleTemplate) {
    // Mock: in production this would create the rule via API
    setPreviewTemplate(null);
    router.push(`/${locale}/workflow/`);
  }

  function handleCustomize(template: RuleTemplate) {
    // Navigate to the builder with template data (in production would pass via query params or state)
    setPreviewTemplate(null);
    router.push(`/${locale}/workflow/new/`);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Rule Templates"
        subtitle="Start with a pre-built template and customize it"
        breadcrumb={
          <Link href={`/${locale}/workflow/`} className="text-sm text-[var(--accent-blue)] hover:underline">
            <ArrowLeft className="inline h-3 w-3 mr-1" />Back to Rules
          </Link>
        }
        className="px-0 py-0 border-0"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="efficiency">Efficiency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No templates match your search"
          description="Try adjusting your search or filter criteria."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setCategoryFilter("all");
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={setPreviewTemplate}
            />
          ))}
        </div>
      )}

      {/* Preview drawer */}
      <TemplatePreviewDrawer
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onActivate={handleActivate}
        onCustomize={handleCustomize}
      />
    </div>
  );
}
