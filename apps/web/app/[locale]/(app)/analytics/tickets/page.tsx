"use client";

import { KPICard } from "@uniflo/ui";
import { ticketAnalytics } from "@uniflo/mock-data";
import { AnalyticsPageShell } from "@/components/analytics/AnalyticsPageShell";
import { TicketVolumeChart } from "@/components/analytics/TicketVolumeChart";
import { TicketCategoryBreakdown } from "@/components/analytics/TicketCategoryBreakdown";
import { TicketResolutionChart } from "@/components/analytics/TicketResolutionChart";
import { TicketSLAComplianceChart } from "@/components/analytics/TicketSLAComplianceChart";

export default function TicketAnalyticsPage() {
  const latest = ticketAnalytics[ticketAnalytics.length - 1];
  const totalCreated = ticketAnalytics.reduce((s, d) => s + d.created, 0);
  const totalResolved = ticketAnalytics.reduce((s, d) => s + d.resolved, 0);
  const avgResolution = +(ticketAnalytics.reduce((s, d) => s + d.avg_resolution_hours, 0) / ticketAnalytics.length).toFixed(1);
  const totalSLAMet = ticketAnalytics.reduce((s, d) => s + d.sla_met, 0);
  const totalSLABreached = ticketAnalytics.reduce((s, d) => s + d.sla_breached, 0);
  const slaPct = Math.round((totalSLAMet / (totalSLAMet + totalSLABreached)) * 100);

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="Created" value={totalCreated} unit="tickets" color="var(--accent-blue)" />
        <KPICard title="Resolved" value={totalResolved} unit="tickets" color="var(--accent-green)" />
        <KPICard title="Avg Resolution" value={avgResolution} unit="hrs" color="var(--accent-yellow)" />
        <KPICard title="SLA Compliance" value={slaPct} unit="%" color="var(--accent-blue)" isPositive />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TicketVolumeChart data={ticketAnalytics} />
        </div>
        <div className="lg:col-span-5">
          <TicketCategoryBreakdown data={latest} />
        </div>
      </div>

      <TicketResolutionChart data={ticketAnalytics} />
    </div>
  );

  const slaContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="SLA Met" value={totalSLAMet} color="var(--accent-green)" />
        <KPICard title="SLA Breached" value={totalSLABreached} color="var(--accent-red)" />
        <KPICard title="SLA Rate" value={slaPct} unit="%" color="var(--accent-blue)" isPositive />
        <KPICard title="Avg First Response" value={latest.avg_first_response_hours} unit="hrs" color="var(--accent-yellow)" />
      </div>
      <TicketSLAComplianceChart data={ticketAnalytics} />
    </div>
  );

  return (
    <AnalyticsPageShell
      title="Ticket Analytics"
      breadcrumb="Ticket Analytics"
      tabs={[
        { value: "overview", label: "Overview", content: overviewContent },
        {
          value: "volume",
          label: "Volume",
          content: <TicketVolumeChart data={ticketAnalytics} />,
        },
        { value: "sla", label: "SLA", content: slaContent },
        {
          value: "satisfaction",
          label: "Satisfaction",
          content: (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard title="CSAT Score" value={latest.csat_avg ?? "N/A"} unit="/5" color="var(--accent-purple)" isPositive />
              <KPICard title="Responses" value={latest.csat_responses} color="var(--accent-blue)" />
            </div>
          ),
        },
      ]}
    />
  );
}
