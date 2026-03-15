"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSLABreachesData } from "@/lib/data/useSLAData";
import type { SLABreach } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  KPICard,
  EmptyState,
} from "@uniflo/ui";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BreachCard } from "@/components/sla/BreachCard";
import { BreachFilterBar } from "@/components/sla/BreachFilterBar";

export default function SLABreachAlertsPage() {
  const { locale } = useParams<{ locale: string }>();
  const { breaches: mockBreaches, isLoading, error } = useSLABreachesData();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("active");
  const [breaches, setBreaches] = useState<SLABreach[]>(
    mockBreaches as unknown as SLABreach[]
  );

  // Simulated live countdown (updates every 60s)
  useEffect(() => {
    const interval = setInterval(() => {
      setBreaches((prev) =>
        prev.map((b) => ({
          ...b,
          remaining_ms: b.remaining_ms - 60000,
        }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Summary counts
  const breachedCount = useMemo(
    () => breaches.filter((b) => b.breach_status === "breached").length,
    [breaches]
  );
  const atRiskCount = useMemo(
    () => breaches.filter((b) => b.breach_status === "at_risk").length,
    [breaches]
  );
  const escalatedCount = useMemo(
    () => breaches.filter((b) => b.breach_status === "escalated").length,
    [breaches]
  );

  // Filtered and sorted
  const displayed = useMemo(() => {
    let result = breaches.filter((b) =>
      activeTab === "active"
        ? b.breach_status !== "resolved"
        : b.breach_status === "resolved"
    );
    if (moduleFilter !== "all") result = result.filter((b) => b.module === moduleFilter);
    if (statusFilter !== "all") result = result.filter((b) => b.breach_status === statusFilter);
    if (severityFilter !== "all") result = result.filter((b) => b.breach_severity === severityFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) => b.item_title.toLowerCase().includes(q) || b.item_id.includes(q)
      );
    }
    // Sort: breached first (longest breach / most negative), then at_risk (least remaining)
    return result.sort((a, b) => a.remaining_ms - b.remaining_ms);
  }, [breaches, activeTab, moduleFilter, statusFilter, severityFilter, search]);

  // Group active breaches into sections
  const breachedItems = useMemo(
    () => displayed.filter((b) => b.breach_status === "breached" || b.breach_status === "escalated"),
    [displayed]
  );
  const atRiskItems = useMemo(
    () => displayed.filter((b) => b.breach_status === "at_risk"),
    [displayed]
  );

  function handleReassign(breachId: string) {
    // Mock: just show feedback
    setBreaches((prev) =>
      prev.map((b) =>
        b.id === breachId ? { ...b, assignee_name: "Reassigned User" } : b
      )
    );
  }

  function handleEscalate(breachId: string) {
    setBreaches((prev) =>
      prev.map((b) =>
        b.id === breachId
          ? {
              ...b,
              breach_status: "escalated" as const,
              escalated_at: new Date().toISOString(),
            }
          : b
      )
    );
  }

  function handleAcknowledge(breachId: string) {
    setBreaches((prev) =>
      prev.map((b) =>
        b.id === breachId
          ? { ...b, breach_status: "resolved" as const, resolved_at: new Date().toISOString() }
          : b
      )
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load SLA alerts: {error.message}</p>
        </div>
      </div>
    );
  }

  const activeCount = breaches.filter((b) => b.breach_status !== "resolved").length;
  const resolvedCount = breaches.filter((b) => b.breach_status === "resolved").length;

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="SLA Alerts"
        subtitle="Items at risk or in breach of their SLA"
        actions={
          <Link href={`/${locale}/sla/`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" /> Policies
            </Button>
          </Link>
        }
        className="px-0 py-0 border-0"
      />

      {/* Alert summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          title="Breached"
          value={breachedCount}
          color="var(--accent-red)"
        />
        <KPICard
          title="At Risk"
          value={atRiskCount}
          color="var(--accent-yellow)"
        />
        <KPICard
          title="Escalated"
          value={escalatedCount}
          color="var(--accent-purple)"
        />
      </div>

      {/* Filters */}
      <BreachFilterBar
        search={search}
        onSearchChange={setSearch}
        moduleFilter={moduleFilter}
        onModuleFilterChange={setModuleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {displayed.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-6 w-6" />}
              title="No SLA alerts"
              description="All items are within their SLA targets."
            />
          ) : (
            <div className="space-y-6" aria-live="polite">
              {/* Breached section */}
              {breachedItems.length > 0 && (
                <div>
                  <div
                    className="mb-3 rounded-md p-3"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-red) 8%, transparent)",
                      borderInlineStart: "4px solid var(--accent-red)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-red)" }}>
                      Breached ({breachedItems.length})
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      These items have exceeded their SLA target.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {breachedItems.map((b) => (
                      <BreachCard
                        key={b.id}
                        breach={b}
                        onReassign={handleReassign}
                        onEscalate={handleEscalate}
                        onAcknowledge={handleAcknowledge}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* At Risk section */}
              {atRiskItems.length > 0 && (
                <div>
                  <div
                    className="mb-3 rounded-md p-3"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-yellow) 8%, transparent)",
                      borderInlineStart: "4px solid var(--accent-yellow)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-yellow)" }}>
                      At Risk ({atRiskItems.length})
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      These items are approaching their SLA deadline.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {atRiskItems.map((b) => (
                      <BreachCard
                        key={b.id}
                        breach={b}
                        onReassign={handleReassign}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          {displayed.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-6 w-6" />}
              title="No resolved breaches"
              description="Resolved breach alerts will appear here."
            />
          ) : (
            <div className="space-y-3">
              {displayed.map((b) => (
                <BreachCard key={b.id} breach={b} isResolved />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
