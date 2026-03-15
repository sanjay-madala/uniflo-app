"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCAPAData } from "@/lib/data/useCAPAsData";
import type { CAPA, CAPAStatus, CAPAAction as CAPAActionType, User } from "@uniflo/mock-data";
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ConfirmDialog,
  Avatar,
  AvatarFallback,
} from "@uniflo/ui";
import { ArrowLeft, AlertTriangle, Check, ChevronRight } from "lucide-react";
import { CAPAStatusTimeline } from "@/components/capa/CAPAStatusTimeline";
import { CAPAStatusChip } from "@/components/capa/CAPAStatusChip";
import { CAPASeverityBadge } from "@/components/capa/CAPASeverityBadge";
import { CAPASourceBadge } from "@/components/capa/CAPASourceBadge";
import { LinkedSourcePanel } from "@/components/capa/LinkedSourcePanel";
import { RootCauseForm } from "@/components/capa/RootCauseForm";
import { ResolutionLog } from "@/components/capa/ResolutionLog";
import { EffectivenessForm } from "@/components/capa/EffectivenessForm";

const NOW = new Date("2026-03-14T12:00:00Z");

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

const STATUS_FLOW: CAPAStatus[] = ["open", "in_progress", "verified", "closed"];

const ADVANCE_MESSAGES: Record<CAPAStatus, string> = {
  open: "This marks the CAPA as actively being worked on.",
  in_progress: "This submits the CAPA for effectiveness verification.",
  verified: "This closes the CAPA. An effectiveness review is required.",
  closed: "",
};

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function CAPADetailClient() {
  const { locale, id } = useParams<{ locale: string; id: string }>();

  const { data: capa, users, sops, isLoading, error } = useCAPAData(id);

  function getUserName(userId: string): string {
    const u = users.find(u => u.id === userId);
    return u?.name ?? "";
  }

  const [capaStatus, setCAPAStatus] = useState<CAPAStatus>(capa?.status ?? "open");
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-4 w-32 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-8 w-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-16 rounded bg-[var(--bg-tertiary)] animate-pulse mt-4" />
        <div className="flex gap-6 mt-4">
          <div className="flex-1 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded bg-[var(--bg-tertiary)] animate-pulse" />
            ))}
          </div>
          <div className="w-72 h-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load CAPA: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!capa) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-lg text-[var(--text-primary)]">CAPA not found</p>
        <Link href={`/${locale}/capa/`}>
          <Button variant="secondary">Back to CAPA List</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(capaStatus);
  const nextStatus = currentStatusIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIndex + 1] : null;
  const isOverdue = new Date(capa.due_date) < NOW && capaStatus !== "closed";
  const overdueDays = Math.floor((NOW.getTime() - new Date(capa.due_date).getTime()) / 86400000);

  const sopTitles: Record<string, string> = {};
  for (const sop of sops) {
    sopTitles[sop.id] = sop.title;
  }

  function handleAdvanceStatus() {
    if (!nextStatus) return;
    setConfirmAdvance(false);
    setAnimating(true);
    setTimeout(() => {
      setCAPAStatus(nextStatus);
      setAnimating(false);
    }, 600);
  }

  const owner = users.find(u => u.id === capa.owner_id);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/${locale}/capa/`}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CAPA
        </Link>
        <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
        <span className="text-[var(--text-primary)] font-medium">
          {capa.id.replace("capa_", "CAPA-")}
        </span>
      </div>

      {/* Linked source badges */}
      <LinkedSourcePanel capa={capa} locale={locale} sopTitles={sopTitles} />

      {/* Status timeline */}
      <CAPAStatusTimeline
        status={capaStatus}
        variant="full"
        dates={{
          opened_at: capa.created_at,
          in_progress_at: capaStatus !== "open" ? capa.updated_at : undefined,
          verified_at: capaStatus === "verified" || capaStatus === "closed" ? capa.updated_at : undefined,
          closed_at: capa.closed_at ?? undefined,
        }}
        animating={animating}
      />

      {/* Overdue banner */}
      {isOverdue && (
        <div className="flex items-center gap-2 rounded-md border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[var(--accent-red)]" />
          <span className="text-sm font-medium text-[var(--accent-red)]">
            This CAPA is overdue by {overdueDays} day{overdueDays !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="root_cause">Root Cause</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">{capa.title}</h1>
                  {capa.description && (
                    <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{capa.description}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Corrective Action</h3>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{capa.corrective_action}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Preventive Action</h3>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{capa.preventive_action}</p>
                </div>

                <ResolutionLog actions={capa.actions} />
              </div>
            </TabsContent>

            {/* Root Cause tab */}
            <TabsContent value="root_cause">
              <RootCauseForm analysis={capa.root_cause_analysis} rootCause={capa.root_cause} />
            </TabsContent>

            {/* Actions tab */}
            <TabsContent value="actions">
              <div className="space-y-3">
                {capa.actions && capa.actions.length > 0 ? (
                  capa.actions.map(action => (
                    <ActionCard key={action.id} action={action} usersList={users} />
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No actions defined yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Review tab */}
            <TabsContent value="review">
              {capa.effectiveness_review ? (
                <EffectivenessForm existingReview={capa.effectiveness_review} users={users} />
              ) : capaStatus === "verified" || capaStatus === "closed" ? (
                <EffectivenessForm users={users} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Effectiveness review will be available once the CAPA reaches &quot;Verified&quot; status.
                  </p>
                  {nextStatus && (
                    <Button variant="secondary" size="sm" onClick={() => setConfirmAdvance(true)}>
                      Advance Status
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Metadata sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 space-y-4">
            <MetadataField label="Status">
              <CAPAStatusChip status={capaStatus} />
            </MetadataField>
            <MetadataField label="Severity">
              <CAPASeverityBadge severity={capa.severity} />
            </MetadataField>
            <MetadataField label="Source">
              <CAPASourceBadge source={capa.source} />
            </MetadataField>
            <MetadataField label="Owner">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {owner ? getInitials(owner.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[var(--text-primary)]">{getUserName(capa.owner_id)}</span>
              </div>
            </MetadataField>
            <MetadataField label="Location">
              <span className="text-sm text-[var(--text-primary)]">
                {locationLabels[capa.location_id] ?? capa.location_id}
              </span>
            </MetadataField>
            <MetadataField label="Due Date">
              <span className={`text-sm ${isOverdue ? "font-medium text-[var(--accent-red)]" : "text-[var(--text-primary)]"}`}>
                {new Date(capa.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </MetadataField>
            <MetadataField label="Created">
              <span className="text-sm text-[var(--text-primary)]">
                {new Date(capa.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </MetadataField>
            {capa.updated_at && (
              <MetadataField label="Updated">
                <span className="text-sm text-[var(--text-primary)]">
                  {new Date(capa.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </MetadataField>
            )}
            {capa.tags && capa.tags.length > 0 && (
              <MetadataField label="Tags">
                <div className="flex flex-wrap gap-1">
                  {capa.tags.map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </MetadataField>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 space-y-2">
            {nextStatus && (
              <Button className="w-full" onClick={() => setConfirmAdvance(true)}>
                Advance to {nextStatus === "in_progress" ? "In Progress" : nextStatus === "verified" ? "Verified" : "Closed"}
              </Button>
            )}
            <Button variant="secondary" className="w-full" onClick={() => {}}>
              Edit CAPA
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => {}}>
              Create Follow-up
            </Button>
          </div>
        </div>
      </div>

      {/* Advance status confirmation */}
      <ConfirmDialog
        open={confirmAdvance}
        onOpenChange={setConfirmAdvance}
        title={`Advance to ${nextStatus === "in_progress" ? "In Progress" : nextStatus === "verified" ? "Verified" : "Closed"}?`}
        description={nextStatus ? ADVANCE_MESSAGES[capaStatus] : ""}
        confirmLabel="Advance"
        onConfirm={handleAdvanceStatus}
      />
    </div>
  );
}

function MetadataField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ActionCard({ action, usersList }: { action: CAPAActionType; usersList: User[] }) {
  const isCompleted = action.status === "completed";
  const assigneeName = usersList.find(u => u.id === (action.assignee_id ?? ""))?.name ?? "";

  return (
    <div className={`rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 ${isCompleted ? "opacity-75" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-green)]/20">
              <Check className="h-3 w-3 text-[var(--accent-green)]" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-[var(--border-default)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-[var(--text-primary)] ${isCompleted ? "line-through" : ""}`}>
            {action.description}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={action.type === "corrective" ? "blue" : "success"}>
              {action.type === "corrective" ? "Corrective" : "Preventive"}
            </Badge>
            <Badge variant={
              action.status === "completed" ? "success" :
              action.status === "in_progress" ? "warning" : "default"
            }>
              {action.status === "completed" ? "Completed" : action.status === "in_progress" ? "In Progress" : "Pending"}
            </Badge>
            {assigneeName && (
              <span className="text-xs text-[var(--text-secondary)]">{assigneeName}</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              Due {new Date(action.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          {action.notes && (
            <p className="mt-1 text-xs text-[var(--text-secondary)] italic">{action.notes}</p>
          )}
          {action.evidence && action.evidence.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {action.evidence.map((ev, i) => (
                <span key={i} className="inline-flex items-center rounded border border-[var(--border-default)] px-1.5 py-0.5 text-xs text-[var(--text-secondary)]">
                  {ev.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
