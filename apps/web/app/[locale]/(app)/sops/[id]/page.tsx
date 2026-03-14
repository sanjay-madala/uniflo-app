"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sops as allSops, users } from "@uniflo/mock-data";
import type { SOP } from "@uniflo/mock-data";
import {
  PageHeader,
  BreadcrumbBar,
  Button,
  Badge,
  Card, CardHeader, CardTitle, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Switch,
  ConfirmDialog,
} from "@uniflo/ui";
import { Pencil, History, CheckCircle } from "lucide-react";
import { SOPStatusChip } from "@/components/sops/SOPStatusChip";
import { SOPCategoryBadge } from "@/components/sops/SOPCategoryBadge";
import { SOPStepViewer } from "@/components/sops/SOPStepViewer";
import { SOPVersionHistoryDrawer } from "@/components/sops/SOPVersionHistoryDrawer";
import { SOPAcknowledgmentPanel } from "@/components/sops/SOPAcknowledgmentPanel";
import { ProgressRing } from "@/components/sops/ProgressRing";

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

function getUserName(id: string): string {
  const u = users.find(u => u.id === id);
  return u?.name ?? id;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateStaticParams() { return [{id:"sop_001"},{id:"sop_002"},{id:"sop_003"},{id:"sop_004"},{id:"sop_005"}] }

export default function SOPDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);

  const sop = useMemo(() => (allSops as SOP[]).find(s => s.id === id), [id]);

  const ackStats = useMemo(() => {
    if (!sop) return { total: 0, acknowledged: 0, percentage: 0 };
    const total = sop.acknowledgments.length;
    const acknowledged = sop.acknowledgments.filter(a => a.acknowledged_at !== null).length;
    const percentage = total > 0 ? Math.round((acknowledged / total) * 100) : 0;
    return { total, acknowledged, percentage };
  }, [sop]);

  const handleBranchClick = useCallback((stepId: string) => {
    setHighlightedStepId(stepId);
    const el = document.getElementById(`step-${stepId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedStepId(null), 2000);
    }
  }, []);

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

  return (
    <div className="flex flex-col gap-4 p-6">
      <BreadcrumbBar
        items={[
          { label: "SOPs", href: `/${locale}/sops/` },
          { label: sop.title },
        ]}
      />

      <PageHeader
        title={sop.title}
        subtitle={`v${sop.version} \u2022 ${sop.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} \u2022 ${sop.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/sops/builder/${sop.id}/`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setVersionDrawerOpen(true)}>
              <History className="h-4 w-4" /> Versions
            </Button>
            {sop.acknowledgment_required && (
              <Button size="sm" onClick={() => setAcknowledgeDialogOpen(true)}>
                <CheckCircle className="h-4 w-4" /> Acknowledge
              </Button>
            )}
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          {sop.acknowledgment_required && (
            <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Status</span>
                  <SOPStatusChip status={sop.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Version</span>
                  <span className="text-sm text-[var(--text-primary)]">v{sop.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Category</span>
                  <SOPCategoryBadge category={sop.category} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Author</span>
                  <span className="text-sm text-[var(--text-primary)]">{getUserName(sop.created_by)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Created</span>
                  <span className="text-sm text-[var(--text-primary)]">{formatDate(sop.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Updated</span>
                  <span className="text-sm text-[var(--text-primary)]">{formatDate(sop.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Est. Read Time</span>
                  <span className="text-sm text-[var(--text-primary)]">{sop.estimated_read_time_minutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Auto-Publish KB</span>
                  <Switch checked={sop.auto_publish_kb} disabled />
                </div>
                {sop.linked_kb_article_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">KB Article</span>
                    <Link
                      href={`/${locale}/knowledge/${sop.linked_kb_article_id}/`}
                      className="text-sm text-[var(--accent-blue)] hover:underline"
                    >
                      View Article
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-[var(--text-secondary)]">Locations ({sop.location_ids.length})</span>
                  <ul className="mt-1 space-y-0.5">
                    {sop.location_ids.map(locId => (
                      <li key={locId} className="text-sm text-[var(--text-primary)]">
                        {locationLabels[locId] ?? locId}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-secondary)]">Roles</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {sop.role_ids.map(roleId => (
                      <Badge key={roleId}>{roleLabels[roleId] ?? roleId}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Ack Required</span>
                  <span className="text-sm text-[var(--text-primary)]">{sop.acknowledgment_required ? "Yes" : "No"}</span>
                </div>
                {sop.acknowledgment_required && ackStats.total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Ack Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--text-primary)]">{ackStats.percentage}%</span>
                      <ProgressRing percentage={ackStats.percentage} size={32} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)] [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: sop.description }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {sop.tags.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {sop.tags.map(tag => (
                    <Badge key={tag} variant="blue">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Items */}
          {(sop.linked_audit_template_ids.length > 0 || sop.linked_capa_ids.length > 0) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Linked Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sop.linked_audit_template_ids.length > 0 && (
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">Audit Templates</span>
                    <div className="mt-1 space-y-1">
                      {sop.linked_audit_template_ids.map(tplId => (
                        <Link
                          key={tplId}
                          href={`/${locale}/audit/templates/${tplId}/`}
                          className="block text-sm text-[var(--accent-blue)] hover:underline"
                        >
                          {tplId}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {sop.linked_capa_ids.length > 0 && (
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">CAPA Records</span>
                    <div className="mt-1 space-y-1">
                      {sop.linked_capa_ids.map(capaId => (
                        <Link
                          key={capaId}
                          href={`/${locale}/capa/${capaId}/`}
                          className="block text-sm text-[var(--accent-blue)] hover:underline"
                        >
                          {capaId}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <div className="space-y-3">
            {sop.steps.map((step, idx) => (
              <SOPStepViewer
                key={step.id}
                step={step}
                stepNumber={idx + 1}
                totalSteps={sop.steps.length}
                onBranchClick={handleBranchClick}
                highlightedStepId={highlightedStepId}
              />
            ))}
          </div>
        </TabsContent>

        {/* Acknowledgments Tab */}
        {sop.acknowledgment_required && (
          <TabsContent value="acknowledgments">
            <SOPAcknowledgmentPanel acknowledgments={sop.acknowledgments} />
          </TabsContent>
        )}
      </Tabs>

      {/* Version History Drawer */}
      <SOPVersionHistoryDrawer
        open={versionDrawerOpen}
        onOpenChange={setVersionDrawerOpen}
        versions={sop.versions}
        currentVersion={sop.version}
      />

      {/* Acknowledge Dialog */}
      <ConfirmDialog
        open={acknowledgeDialogOpen}
        onOpenChange={setAcknowledgeDialogOpen}
        title="Acknowledge SOP"
        description={`I confirm I have read and understood "${sop.title}" (v${sop.version}).`}
        confirmLabel="Acknowledge"
        cancelLabel="Cancel"
        onConfirm={() => setAcknowledgeDialogOpen(false)}
      />
    </div>
  );
}
