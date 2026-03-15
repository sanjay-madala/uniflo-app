"use client";

import { KPICard } from "@uniflo/ui";
import { useAuditAnalyticsData } from "@/lib/data/useAnalyticsData";
import { AnalyticsPageShell } from "@/components/analytics/AnalyticsPageShell";
import { AuditTrendLineChart } from "@/components/analytics/AuditTrendLineChart";
import { AuditScoreByLocationChart } from "@/components/analytics/AuditScoreByLocationChart";
import { AuditComplianceHeatmapTable } from "@/components/analytics/AuditComplianceHeatmapTable";

export default function AuditAnalyticsPage() {
  const { data: auditAnalytics, heatmapData: auditHeatmapData } = useAuditAnalyticsData();
  const latest = auditAnalytics[auditAnalytics.length - 1];
  const totalCompleted = auditAnalytics.reduce((s, d) => s + d.audits_completed, 0);
  const avgScore = Math.round(auditAnalytics.reduce((s, d) => s + d.avg_score, 0) / auditAnalytics.length);
  const avgPassRate = Math.round(auditAnalytics.reduce((s, d) => s + d.pass_rate, 0) / auditAnalytics.length);
  const totalFindings = auditAnalytics.reduce((s, d) => s + d.findings_count, 0);

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="Completed" value={totalCompleted} unit="audits" color="var(--accent-green)" />
        <KPICard title="Avg Score" value={avgScore} unit="%" color="var(--accent-blue)" isPositive />
        <KPICard title="Pass Rate" value={avgPassRate} unit="%" color="var(--accent-blue)" isPositive />
        <KPICard title="Findings" value={totalFindings} color="var(--accent-red)" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AuditTrendLineChart data={auditAnalytics} />
        </div>
        <div className="lg:col-span-5">
          <AuditScoreByLocationChart data={latest} />
        </div>
      </div>

      <AuditComplianceHeatmapTable data={auditHeatmapData} />
    </div>
  );

  return (
    <AnalyticsPageShell
      title="Audit Analytics"
      breadcrumb="Audit Analytics"
      tabs={[
        { value: "overview", label: "Overview", content: overviewContent },
        {
          value: "scores",
          label: "Scores",
          content: <AuditTrendLineChart data={auditAnalytics} />,
        },
        {
          value: "locations",
          label: "Locations",
          content: (
            <div className="space-y-6">
              <AuditScoreByLocationChart data={latest} />
              <AuditComplianceHeatmapTable data={auditHeatmapData} />
            </div>
          ),
        },
        {
          value: "findings",
          label: "Findings",
          content: (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <KPICard title="Total Findings" value={totalFindings} color="var(--accent-red)" />
              <KPICard title="Auto Tickets" value={latest.auto_tickets_created} color="var(--accent-blue)" />
              <KPICard title="Auto CAPAs" value={latest.auto_capas_created} color="var(--accent-yellow)" />
            </div>
          ),
        },
      ]}
    />
  );
}
