"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sops as allSops } from "@uniflo/mock-data";
import type { SOP, SOPStep, SOPCategory } from "@uniflo/mock-data";
import {
  BreadcrumbBar,
  Button,
  Input,
  Textarea,
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  Switch,
  Checkbox,
  FormSection,
} from "@uniflo/ui";
import { Save, Eye, Upload, Check, History } from "lucide-react";
import { SOPStepList } from "@/components/sops/SOPStepList";
import { SOPAutoPublishToggle } from "@/components/sops/SOPAutoPublishToggle";
import { SOPVersionHistoryDrawer } from "@/components/sops/SOPVersionHistoryDrawer";
import { SOPPublishModal } from "@/components/sops/SOPPublishModal";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  field_staff: "Staff",
  support_agent: "Support Agent",
  auditor: "Auditor",
};

export function generateStaticParams() { return [{id:"sop_001"},{id:"sop_002"},{id:"sop_003"},{id:"sop_004"},{id:"sop_005"}] }

export default function SOPBuilderEditPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();

  const sop = useMemo(() => (allSops as SOP[]).find(s => s.id === id), [id]);

  const [title, setTitle] = useState(sop?.title ?? "");
  const [description, setDescription] = useState(sop?.description.replace(/<[^>]*>/g, "") ?? "");
  const [category, setCategory] = useState<SOPCategory>(sop?.category ?? "operations");
  const [tags, setTags] = useState(sop?.tags.join(", ") ?? "");
  const [locationIds, setLocationIds] = useState<Set<string>>(new Set(sop?.location_ids ?? []));
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set(sop?.role_ids ?? []));
  const [ackRequired, setAckRequired] = useState(sop?.acknowledgment_required ?? false);
  const [autoPublishKB, setAutoPublishKB] = useState(sop?.auto_publish_kb ?? false);
  const [steps, setSteps] = useState<SOPStep[]>(sop?.steps ?? []);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showSaveFlash, setShowSaveFlash] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Track dirty state
  useEffect(() => {
    setIsDirty(true);
  }, [title, description, category, tags, steps, ackRequired, autoPublishKB]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        setLastSavedAt(new Date());
        setIsDirty(false);
        setShowSaveFlash(true);
        setTimeout(() => setShowSaveFlash(false), 1500);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty]);

  // Keyboard shortcut: Cmd+S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setPublishModalOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveDraft = useCallback(() => {
    setLastSavedAt(new Date());
    setIsDirty(false);
    setShowSaveFlash(true);
    setTimeout(() => setShowSaveFlash(false), 1500);
  }, []);

  function toggleLocation(locId: string) {
    setLocationIds(prev => {
      const next = new Set(prev);
      if (next.has(locId)) next.delete(locId);
      else next.add(locId);
      return next;
    });
  }

  function toggleRole(roleId: string) {
    setRoleIds(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  function formatTimeSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1m ago";
    return `${diffMins}m ago`;
  }

  if (!sop) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-[var(--text-secondary)]">SOP not found</p>
        <Link href={`/${locale}/sops/`}>
          <Button variant="secondary" size="sm">Back to SOPs</Button>
        </Link>
      </div>
    );
  }

  const estimatedReadTime = Math.max(1, Math.ceil(steps.length * 1.5));

  return (
    <div className="flex flex-col gap-4 p-6">
      <BreadcrumbBar
        items={[
          { label: "SOPs", href: `/${locale}/sops/` },
          { label: `Edit: ${sop.title}` },
        ]}
      />

      {/* Builder Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button variant="secondary" size="sm">
            <Eye className="h-4 w-4" /> Preview
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {lastSavedAt && (
            <span className={`text-xs transition-colors ${showSaveFlash ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
              {showSaveFlash && <Check className="inline h-3 w-3 me-1" />}
              Draft saved {formatTimeSince(lastSavedAt)}
            </span>
          )}
          <Button size="sm" onClick={() => setPublishModalOpen(true)}>
            <Upload className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex gap-6">
        {/* LEFT: Content */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="SOP title..."
              className="text-base font-medium"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the purpose and scope of this SOP..."
              rows={4}
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-[var(--text-primary)]">Steps</label>
            <SOPStepList steps={steps} onStepsChange={setSteps} />
          </div>
        </div>

        {/* RIGHT: Settings */}
        <div className="w-80 shrink-0 space-y-4">
          <FormSection title="Metadata">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Category</label>
              <Select value={category} onValueChange={v => setCategory(v as SOPCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Comma-separated tags"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Est. Read Time</span>
              <span className="text-[var(--text-primary)]">{estimatedReadTime} min</span>
            </div>
          </FormSection>

          <FormSection title="Distribution">
            <div className="space-y-2">
              <span className="text-xs text-[var(--text-secondary)]">Locations</span>
              {Object.entries(locationLabels).map(([locId, name]) => (
                <label key={locId} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={locationIds.has(locId)}
                    onCheckedChange={() => toggleLocation(locId)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{name}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <span className="text-xs text-[var(--text-secondary)]">Roles</span>
              {Object.entries(roleLabels).map(([roleId, name]) => (
                <label key={roleId} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={roleIds.has(roleId)}
                    onCheckedChange={() => toggleRole(roleId)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{name}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-primary)]">Ack Required</span>
              <Switch checked={ackRequired} onCheckedChange={setAckRequired} />
            </div>
          </FormSection>

          <FormSection title="KB Auto-Publish">
            <SOPAutoPublishToggle
              enabled={autoPublishKB}
              onToggle={setAutoPublishKB}
              sopTitle={title}
              linkedArticleId={sop.linked_kb_article_id}
              locale={locale}
            />
          </FormSection>

          <FormSection title="Version Info">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Current</span>
              <span className="text-[var(--text-primary)]">v{sop.version}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setVersionDrawerOpen(true)} className="text-xs w-full">
              <History className="h-3 w-3" /> View History
            </Button>
          </FormSection>
        </div>
      </div>

      {/* Version History Drawer */}
      <SOPVersionHistoryDrawer
        open={versionDrawerOpen}
        onOpenChange={setVersionDrawerOpen}
        versions={sop.versions}
        currentVersion={sop.version}
      />

      {/* Publish Modal */}
      <SOPPublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        sop={sop}
      />

    </div>
  );
}
