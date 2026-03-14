"use client";

import { KPICard } from "@uniflo/ui";
import { capaAnalytics } from "@uniflo/mock-data";
import { AnalyticsPageShell } from "@/components/analytics/AnalyticsPageShell";
import { CAPAClosureRateChart } from "@/components/analytics/CAPAClosureRateChart";
import { CAPASeverityBreakdown } from "@/components/analytics/CAPASeverityBreakdown";
import { CAPARecurrenceChart } from "@/components/analytics/CAPARecurrenceChart";

export default function CAPAAnalyticsPage() {
  const latest = capaAnalytics[capaAnalytics.length - 1];
  const totalClosed = capaAnalytics.reduce((s, d) => s + d.total_closed, 0);
  const avgClosure = Math.round(capaAnalytics.reduce((s, d) => s + d.avg_closure_days, 0) / capaAnalytics.length);

  return (
    <AnalyticsPageShell title="CAPA Analytics" breadcrumb="CAPA Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard title="Open" value={latest.total_open} unit="CAPAs" color="#D29922" />
          <KPICard title="Closed" value={totalClosed} unit="total" color="#3FB950" />
          <KPICard title="Avg Closure" value={avgClosure} unit="days" color="#58A6FF" />
          <KPICard title="Overdue" value={latest.overdue_count} color="#F85149" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CAPAClosureRateChart data={capaAnalytics} />
          </div>
          <div className="lg:col-span-5">
            <CAPASeverityBreakdown data={latest} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CAPARecurrenceChart data={latest} />
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-4">
              <KPICard
                title="Recurrence Rate"
                value={latest.recurrence_rate}
                unit="%"
                color="#F85149"
                isPositive={false}
                trend={-2}
                trendLabel="vs last period"
              />
              <KPICard
                title="Effectiveness Rate"
                value={latest.effectiveness_rate}
                unit="%"
                color="#3FB950"
                isPositive
                trend={3}
                trendLabel="vs last period"
              />
            </div>
          </div>
        </div>
      </div>
    </AnalyticsPageShell>
  );
}
