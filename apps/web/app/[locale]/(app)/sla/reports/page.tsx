"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSLAComplianceData } from "@/lib/data/useSLAData";
import type { SLAComplianceTrendPoint, SLABreach, SLAComplianceReport } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Badge,
} from "@uniflo/ui";
import { Download, ArrowLeft } from "lucide-react";
import { ComplianceKPICards } from "@/components/sla/ComplianceKPICards";
import { ComplianceChart } from "@/components/sla/ComplianceChart";
import { ComplianceBreakdownTable } from "@/components/sla/ComplianceBreakdownTable";
import { PolicyModuleBadge } from "@/components/sla/PolicyModuleBadge";

const PER_PAGE = 10;

export default function SLAComplianceReportPage() {
  const { locale } = useParams<{ locale: string }>();
  const { report: rawReport, trend: rawTrend, breaches: rawBreaches, policies: slaPolicies, isLoading, error } = useSLAComplianceData();
  const [dateRange, setDateRange] = useState<string>("30d");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [policyFilter, setPolicyFilter] = useState<string>("all");
  const [breakdownTab, setBreakdownTab] = useState<string>("priority");
  const [breachPage, setBreachPage] = useState(1);

  const report = rawReport as unknown as SLAComplianceReport;
  const trendData = rawTrend as unknown as SLAComplianceTrendPoint[];
  const breaches = rawBreaches as unknown as SLABreach[];

  // Filter trend data by module
  const filteredTrend = useMemo(() => {
    if (moduleFilter === "all") return trendData;
    return trendData.filter((t) => t.module === moduleFilter);
  }, [trendData, moduleFilter]);

  // Filter breaches for the recent breaches table
  const recentBreaches = useMemo(() => {
    let result = [...breaches];
    if (moduleFilter !== "all") result = result.filter((b) => b.module === moduleFilter);
    if (policyFilter !== "all") result = result.filter((b) => b.policy_id === policyFilter);
    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return result;
  }, [breaches, moduleFilter, policyFilter]);

  const totalBreachPages = Math.ceil(recentBreaches.length / PER_PAGE);
  const pageBreaches = recentBreaches.slice(
    (breachPage - 1) * PER_PAGE,
    breachPage * PER_PAGE
  );

  // Breakdown data from report
  const breakdownData = useMemo(() => {
    switch (breakdownTab) {
      case "priority":
        return { data: report.by_priority, label: "Priority" };
      case "location":
        return { data: report.by_location, label: "Location" };
      case "category":
        return { data: report.by_category, label: "Category" };
      default:
        return { data: report.by_priority, label: "Priority" };
    }
  }, [report, breakdownTab]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded bg-[var(--bg-tertiary)] animate-pulse mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load compliance report: {error.message}</p>
        </div>
      </div>
    );
  }

  function getItemRoute(module: string, itemId: string): string {
    switch (module) {
      case "tickets":
        return `/${locale}/tickets/${itemId}/`;
      case "audits":
        return `/${locale}/audit/${itemId}/`;
      case "capa":
        return `/${locale}/capa/${itemId}/`;
      default:
        return "#";
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="SLA Compliance"
        subtitle="Historical SLA performance analysis"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/sla/`}>
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" /> Policies
              </Button>
            </Link>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="tickets">Tickets</SelectItem>
            <SelectItem value="audits">Audits</SelectItem>
            <SelectItem value="capa">CAPA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={policyFilter} onValueChange={setPolicyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Policies</SelectItem>
            {(slaPolicies as Array<{ id: string; name: string }>).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <ComplianceKPICards
        compliancePercent={report.compliance_percent}
        totalItems={report.total_items}
        breachCount={report.breached_count}
        avgResolutionMinutes={report.avg_resolution_time_minutes}
        prevCompliancePercent={89.1}
        prevTotalItems={327}
        prevBreachCount={35}
        prevAvgResolutionMinutes={152}
      />

      {/* Compliance trend chart */}
      <ComplianceChart
        data={filteredTrend}
        moduleFilter={moduleFilter}
        height={320}
      />

      {/* Breakdown tabs */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <Tabs value={breakdownTab} onValueChange={setBreakdownTab}>
          <TabsList>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
            <TabsTrigger value="location">By Location</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>
          {(["priority", "location", "category"] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <ComplianceBreakdownTable
                data={breakdownData.data}
                dimensionLabel={breakdownData.label}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Recent breaches table */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          Recent Breaches
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Elapsed</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageBreaches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Link
                      href={getItemRoute(b.module, b.item_id)}
                      className="text-sm text-[var(--accent-blue)] hover:underline"
                    >
                      {b.item_title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PolicyModuleBadge module={b.module} />
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {b.metric_label}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {b.target_value} {b.target_unit}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--accent-red)]">
                    {b.elapsed_value} {b.elapsed_unit}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {b.assignee_name || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)]">
                    {new Date(b.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalBreachPages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Page {breachPage} of {totalBreachPages}
            </span>
            <Pagination
              currentPage={breachPage}
              totalPages={totalBreachPages}
              onPageChange={setBreachPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
