"use client";

import { KPICard, DonutChart } from "@uniflo/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import { useTaskAnalyticsData } from "@/lib/data/useAnalyticsData";
import { AnalyticsPageShell } from "@/components/analytics/AnalyticsPageShell";
import { TaskVelocityChart } from "@/components/analytics/TaskVelocityChart";
import { TaskOverdueChart } from "@/components/analytics/TaskOverdueChart";
import { TaskWorkloadChart } from "@/components/analytics/TaskWorkloadChart";

export default function TaskAnalyticsPage() {
  const { data: taskAnalytics } = useTaskAnalyticsData();
  const latest = taskAnalytics[taskAnalytics.length - 1];
  const totalCreated = taskAnalytics.reduce((s, d) => s + d.total_created, 0);
  const totalCompleted = taskAnalytics.reduce((s, d) => s + d.total_completed, 0);
  const totalOverdue = latest.total_overdue;
  const velocity = latest.velocity;

  const statusData = latest.by_status.map((s) => ({
    name: s.status,
    value: s.count,
    color: s.color,
  }));

  const sourceData = latest.by_source.map((s) => ({
    name: s.source,
    value: s.count,
    color: s.color,
  }));

  return (
    <AnalyticsPageShell title="Task Analytics" breadcrumb="Task Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard title="Created" value={totalCreated} unit="tasks" color="var(--accent-blue)" />
          <KPICard title="Completed" value={totalCompleted} unit="tasks" color="var(--accent-green)" />
          <KPICard title="Overdue" value={totalOverdue} color="var(--accent-red)" />
          <KPICard title="Velocity" value={velocity} unit="/wk" color="var(--accent-purple)" isPositive />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TaskVelocityChart data={latest} />
          </div>
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
                  Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Donut chart showing tasks by status">
                  <DonutChart
                    data={statusData}
                    height={240}
                    innerRadius={45}
                    outerRadius={75}
                    centerLabel={String(latest.total_created)}
                    showLegend
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TaskOverdueChart data={latest} />
          </div>
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
                  Source Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Donut chart showing tasks by source">
                  <DonutChart
                    data={sourceData}
                    height={240}
                    innerRadius={45}
                    outerRadius={75}
                    showLegend
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <TaskWorkloadChart data={latest} />
      </div>
    </AnalyticsPageShell>
  );
}
