"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuditsData } from "@/lib/data/useAuditsData";
import type { Audit } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  KPICard,
} from "@uniflo/ui";
import { Plus, Calendar, List } from "lucide-react";
import { AuditComplianceBar } from "@/components/audit/AuditComplianceBar";
import { AuditCalendarView } from "@/components/audit/AuditCalendarView";

export default function AuditCalendarPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: auditsData, isLoading, error } = useAuditsData();
  const audits = auditsData as Audit[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded bg-[var(--bg-tertiary)] animate-pulse mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load audits: {error.message}</p>
        </div>
      </div>
    );
  }

  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 2));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // KPI computations
  const kpis = useMemo(() => {
    const completed = audits.filter((a) => a.status === "completed" || a.status === "failed");
    const scheduled = audits.filter((a) => a.status === "scheduled").length;
    const inProgress = audits.filter((a) => a.status === "in_progress").length;
    const scores = completed.filter((a) => a.score !== null).map((a) => a.score as number);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const passRate = completed.length > 0
      ? Math.round((completed.filter((a) => a.pass === true).length / completed.length) * 100)
      : 0;

    return { scheduled, inProgress, avgScore, passRate };
  }, [audits]);

  const failedCount = useMemo(
    () => audits.filter((a) => a.status === "failed").length,
    [audits]
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Audits"
        subtitle="Schedule, conduct, and review compliance audits"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm">
              <Calendar className="h-4 w-4" /> Calendar
            </Button>
            <Link href={`/${locale}/audit/`}>
              <Button variant="secondary" size="sm">
                <List className="h-4 w-4" /> List
              </Button>
            </Link>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Audit
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard title="Scheduled" value={kpis.scheduled} />
        <KPICard title="In Progress" value={kpis.inProgress} />
        <KPICard title="Avg Score" value={`${kpis.avgScore}%`} />
        <KPICard title="Pass Rate" value={`${kpis.passRate}%`} />
      </div>

      <AuditComplianceBar
        avgScore={kpis.avgScore}
        totalAudits={audits.length}
        failedCount={failedCount}
      />

      {/* Calendar View */}
      <AuditCalendarView
        audits={audits}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
      />
    </div>
  );
}
