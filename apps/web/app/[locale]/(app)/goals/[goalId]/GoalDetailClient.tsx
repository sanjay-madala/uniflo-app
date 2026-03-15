"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGoalData } from "@/lib/data/useGoalsData";
import type { Goal, KeyResult, KRProgressEntry } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@uniflo/ui";
import { Edit, Archive, MoreHorizontal } from "lucide-react";
import { GoalBreadcrumb } from "@/components/goals/GoalBreadcrumb";
import { GoalProgressRing } from "@/components/goals/GoalProgressRing";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";
import { GoalStatusChip } from "@/components/goals/GoalStatusChip";
import { GoalOwnerAvatar } from "@/components/goals/GoalOwnerAvatar";
import { AutoUpdateBadge } from "@/components/goals/AutoUpdateBadge";
import { KeyResultProgressModal } from "@/components/goals/KeyResultProgressModal";
import { LinkedEvidencePanel } from "@/components/goals/LinkedEvidencePanel";
import { LinkedEvidenceCard } from "@/components/goals/LinkedEvidenceCard";

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "percent": return `${value}%`;
    case "currency": return `$${value.toLocaleString()}`;
    case "boolean": return value ? "Yes" : "No";
    case "score": return value.toFixed(1);
    default: return String(value);
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function GoalDetailClient() {
  const { locale, goalId } = useParams<{ locale: string; goalId: string }>();
  const { goal, users, isLoading, error } = useGoalData(goalId);

  function getUserName(userId: string): string {
    const u = users.find((u) => u.id === userId);
    return u?.name ?? userId;
  }

  const [activeTab, setActiveTab] = useState<string>("key-results");
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-40 rounded bg-[var(--bg-tertiary)] animate-pulse mt-4" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load goal: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Goal not found</h1>
        <Link href={`/${locale}/goals`} className="text-sm text-[var(--accent-blue)]">
          Back to Goals
        </Link>
      </div>
    );
  }

  // Collect all progress entries for the Activity tab
  const allProgressEntries = useMemo(() => {
    const entries: (KRProgressEntry & { krTitle: string; krUnit: string })[] = [];
    for (const kr of goal.key_results) {
      for (const entry of kr.progress_history) {
        entries.push({ ...entry, krTitle: kr.title, krUnit: kr.unit });
      }
    }
    entries.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    return entries;
  }, [goal]);

  const levelLabel = goal.level.charAt(0).toUpperCase() + goal.level.slice(1);

  return (
    <div className="flex flex-col gap-4 p-6">
      <GoalBreadcrumb
        locale={locale}
        crumbs={[
          { label: goal.timeframe_label },
          { label: goal.title },
        ]}
      />

      <PageHeader
        title={goal.title}
        subtitle={`${levelLabel}-level objective -- ${goal.timeframe_label}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button variant="secondary" size="sm">
              <Archive className="h-4 w-4" /> Archive
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Hero Section */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Progress Ring */}
          <GoalProgressRing
            progress={goal.progress_pct}
            health={goal.health}
            size={120}
            strokeWidth={10}
            className="shrink-0 self-center md:self-start"
          />

          {/* Metadata */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-[var(--text-muted)] text-xs">Status</span>
                <div className="mt-1"><GoalStatusChip health={goal.health} /></div>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Owner</span>
                <div className="mt-1"><GoalOwnerAvatar name={goal.owner_name} size="md" /></div>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Level</span>
                <div className="mt-1 text-[var(--text-primary)] font-medium capitalize">{goal.level}</div>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Timeframe</span>
                <div className="mt-1 text-[var(--text-primary)]">
                  {new Date(goal.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash;{" "}
                  {new Date(goal.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Created</span>
                <div className="mt-1 text-[var(--text-primary)]">
                  {new Date(goal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">Updated</span>
                <div className="mt-1 text-[var(--text-primary)]">
                  {timeAgo(goal.updated_at)}
                </div>
              </div>
            </div>

            {goal.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                {goal.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="key-results">Key Results</TabsTrigger>
          <TabsTrigger value="evidence">Linked Evidence</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Key Results Tab */}
        <TabsContent value="key-results">
          <div className="flex flex-col gap-4">
            {goal.key_results.map((kr) => (
              <div
                key={kr.id}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <AutoUpdateBadge
                    trackingType={kr.tracking_type}
                    moduleLabel={kr.data_source_module ? kr.data_source_module.charAt(0).toUpperCase() + kr.data_source_module.slice(1) : undefined}
                  />
                  <GoalStatusChip health={kr.health} />
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  {kr.title}
                </h3>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <GoalProgressBar
                      progress={kr.progress_pct}
                      health={kr.health}
                      showLabel={false}
                      label={`${kr.title}: ${formatValue(kr.current_value, kr.unit)} of ${formatValue(kr.target_value, kr.unit)}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                    {formatValue(kr.current_value, kr.unit)} / {formatValue(kr.target_value, kr.unit)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
                  <span>Baseline: {formatValue(kr.start_value, kr.unit)}</span>
                  <span>Current: {formatValue(kr.current_value, kr.unit)}</span>
                  <span>Target: {formatValue(kr.target_value, kr.unit)}</span>
                  <span className="capitalize">Direction: {kr.direction}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                  <GoalOwnerAvatar name={getUserName(kr.owner_id)} />
                  {kr.last_auto_update && (
                    <span>
                      Last {kr.tracking_type === "auto" ? "auto-update" : "update"}: {timeAgo(kr.last_auto_update)}
                      {kr.progress_history.length > 0 && (
                        <> from {kr.progress_history[kr.progress_history.length - 1].source_label}</>
                      )}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedKR(kr);
                      setIsProgressModalOpen(true);
                    }}
                  >
                    Update Progress
                  </Button>
                  {kr.tracking_type === "auto" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEvidenceOpen(true);
                      }}
                    >
                      View Evidence
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Linked Evidence Tab */}
        <TabsContent value="evidence">
          {goal.linked_modules.length > 0 ? (
            <div className="flex flex-col gap-4">
              {goal.linked_modules.map((link) => {
                const feedingKR = goal.key_results.find(
                  (kr) => kr.data_source_module === link.module
                );
                return (
                  <LinkedEvidenceCard
                    key={link.module}
                    link={link}
                    krTitle={feedingKR?.title}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              No linked operational data for this goal.
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="flex flex-col gap-0">
            {allProgressEntries.map((entry, i) => {
              const delta = entry.value - entry.previous_value;
              const deltaStr = delta > 0 ? `+${delta}` : String(delta);
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 py-3 border-b border-[var(--border-default)] last:border-0"
                >
                  {/* Timeline dot */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`h-2 w-2 rounded-full ${entry.source === "auto" ? "bg-[var(--accent-blue)]" : "bg-[var(--accent-green)]"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        KR &ldquo;{entry.krTitle}&rdquo; updated
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatValue(entry.value, entry.krUnit)}
                      </span>
                      <span className={delta > 0 ? "text-[var(--accent-green)]" : delta < 0 ? "text-[var(--accent-red)]" : ""}>
                        (was {formatValue(entry.previous_value, entry.krUnit)}, {deltaStr})
                      </span>
                      <span>|</span>
                      <span>Source: {entry.source_label ?? (entry.source === "auto" ? "Auto" : "Manual")}</span>
                      <span>|</span>
                      <Badge variant={entry.source === "auto" ? "blue" : "default"}>
                        {entry.source === "auto" ? "Auto-updated" : "Manual update"}
                      </Badge>
                      <span>|</span>
                      <span>{timeAgo(entry.recorded_at)}</span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {allProgressEntries.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                No activity recorded yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* KR Progress Modal */}
      <KeyResultProgressModal
        open={isProgressModalOpen}
        onOpenChange={setIsProgressModalOpen}
        kr={selectedKR}
        onSave={() => setIsProgressModalOpen(false)}
      />

      {/* Evidence Panel Drawer */}
      <LinkedEvidencePanel
        open={isEvidenceOpen}
        onOpenChange={setIsEvidenceOpen}
        goal={goal}
      />
    </div>
  );
}
