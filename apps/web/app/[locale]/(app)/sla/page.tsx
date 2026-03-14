"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { slaPolicies as mockPolicies, slaBreaches } from "@uniflo/mock-data";
import type { SLAPolicy } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
  Badge,
} from "@uniflo/ui";
import { Plus, Bell, Clock } from "lucide-react";
import { PolicyCard } from "@/components/sla/PolicyCard";
import { PolicyStatsBar } from "@/components/sla/PolicyStatsBar";

export default function SLAPolicyListPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleTab, setModuleTab] = useState<string>("all");
  const [policies, setPolicies] = useState<SLAPolicy[]>(mockPolicies as unknown as SLAPolicy[]);

  // Active breach count for alerts badge
  const activeBreachCount = useMemo(
    () =>
      (slaBreaches as Array<{ breach_status: string }>).filter(
        (b) => b.breach_status !== "resolved"
      ).length,
    []
  );

  // Stats
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const breachesToday = useMemo(
    () =>
      (slaBreaches as Array<{ breach_status: string; created_at: string }>).filter(
        (b) =>
          b.breach_status !== "resolved" &&
          new Date(b.created_at).toDateString() === new Date("2026-03-14").toDateString()
      ).length,
    []
  );
  const avgCompliance = useMemo(() => {
    const active = policies.filter((p) => p.status === "active" && p.items_covered > 0);
    if (active.length === 0) return 100;
    return active.reduce((sum, p) => sum + p.compliance_percent_30d, 0) / active.length;
  }, [policies]);

  // Module counts
  const moduleCounts = useMemo(() => {
    const counts = { all: policies.length, tickets: 0, audits: 0, capa: 0 };
    for (const p of policies) {
      counts[p.module]++;
    }
    return counts;
  }, [policies]);

  // Toggle handler
  function handleToggle(policyId: string, enabled: boolean) {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? { ...p, status: enabled ? "active" : "paused" }
          : p
      )
    );
  }

  // Filtered list
  const filtered = useMemo(() => {
    let result = [...policies];
    if (moduleTab !== "all") result = result.filter((p) => p.module === moduleTab);
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.priority_order - b.priority_order);
  }, [policies, moduleTab, statusFilter, search]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="SLA Policies"
        subtitle="Define and manage service level agreements"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/sla/alerts/`}>
              <Button variant="secondary" size="sm">
                <Bell className="h-4 w-4" />
                Alerts
                {activeBreachCount > 0 && (
                  <Badge
                    className="ml-1 text-xs"
                    style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}
                  >
                    {activeBreachCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href={`/${locale}/sla/new/`}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New Policy
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Stats bar */}
      <PolicyStatsBar
        totalPolicies={totalPolicies}
        activePolicies={activePolicies}
        breachesToday={breachesToday}
        compliancePercent={avgCompliance}
      />

      {/* Tabs + Filters */}
      <Tabs value={moduleTab} onValueChange={setModuleTab}>
        <TabsList>
          <TabsTrigger value="all">All ({moduleCounts.all})</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({moduleCounts.tickets})</TabsTrigger>
          <TabsTrigger value="audits">Audits ({moduleCounts.audits})</TabsTrigger>
          <TabsTrigger value="capa">CAPA ({moduleCounts.capa})</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 text-xs text-[var(--text-muted)]">
          {filtered.length} polic{filtered.length !== 1 ? "ies" : "y"} shown
        </div>

        {/* Shared content for all tabs */}
        {(["all", "tickets", "audits", "capa"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-6 w-6" />}
                title="No SLA policies yet"
                description="Create your first policy to start tracking service levels."
                action={{
                  label: "Create Policy",
                  onClick: () => router.push(`/${locale}/sla/new/`),
                }}
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onToggle={handleToggle}
                    onClick={(id) => router.push(`/${locale}/sla/${id}/`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
