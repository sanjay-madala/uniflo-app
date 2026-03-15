"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrainingEnrollmentsData } from "@/lib/data/useTrainingData";
import type {
  TrainingModule,
  TrainingEnrollment,
  TrainingCertificate,
  TrainingNotification,
  EnrollmentStatus,
} from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  KPICard,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
} from "@uniflo/ui";
import {
  BookMarked,
  AlertTriangle,
  Clock,
  GraduationCap,
  ArrowRight,
  X,
} from "lucide-react";
import { CompletionRateBar } from "@/components/training/CompletionRateBar";
import { TrainingProgressRing } from "@/components/training/TrainingProgressRing";
import { DifficultyBadge } from "@/components/training/DifficultyBadge";
import { CertificateBadge } from "@/components/training/CertificateBadge";
import { LinkedSOPChip } from "@/components/training/LinkedSOPChip";

const CURRENT_USER = "user_001";

const categoryLabels: Record<string, string> = {
  safety: "Safety",
  operations: "Operations",
  compliance: "Compliance",
  customer_service: "Customer Service",
  onboarding: "Onboarding",
  leadership: "Leadership",
};

export default function MyTrainingPage() {
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const {
    data: allEnrollments,
    modules,
    certificates,
    notifications,
  } = useTrainingEnrollmentsData();

  const enrollments = allEnrollments.filter((e) => e.user_id === CURRENT_USER);
  const userCertificates = certificates.filter((c) => c.user_id === CURRENT_USER);
  const unreadNotifications = notifications.filter(
    (n) => n.user_id === CURRENT_USER && !n.read && n.type === "auto_assigned"
  );

  // Summary stats
  const assignedCount = enrollments.filter((e) => e.status === "assigned").length;
  const inProgressCount = enrollments.filter((e) => e.status === "in_progress").length;
  const completedCount = enrollments.filter((e) => e.status === "completed").length;
  const overdueCount = enrollments.filter((e) => e.status === "overdue").length;
  const totalCount = enrollments.length;
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const avgScore = (() => {
    const scores = enrollments.filter((e) => e.best_score !== null).map((e) => e.best_score as number);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    let result = [...enrollments];
    if (activeTab !== "all") {
      result = result.filter((e) => e.status === activeTab);
    }
    // Sort based on tab
    result.sort((a, b) => {
      if (activeTab === "assigned" || activeTab === "all") {
        const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aDue - bDue;
      }
      if (activeTab === "in_progress") {
        const aStart = a.started_at ? new Date(a.started_at).getTime() : 0;
        const bStart = b.started_at ? new Date(b.started_at).getTime() : 0;
        return bStart - aStart;
      }
      if (activeTab === "completed") {
        const aEnd = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const bEnd = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return bEnd - aEnd;
      }
      if (activeTab === "overdue") {
        const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aDue - bDue;
      }
      return 0;
    });
    return result;
  }, [enrollments, activeTab]);

  function getModule(moduleId: string): TrainingModule | undefined {
    return modules.find((m) => m.id === moduleId);
  }

  function getCtaLabel(status: EnrollmentStatus): string {
    switch (status) {
      case "assigned": return "Start";
      case "in_progress": return "Continue";
      case "completed": return "Review";
      case "failed": return "Retake";
      case "overdue": return "Continue";
      default: return "View";
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="My Training"
        subtitle="Track your learning progress"
        actions={
          <Link href={`/${locale}/training/`}>
            <Button variant="secondary" size="sm">View All Training</Button>
          </Link>
        }
        className="px-0 py-0 border-0"
      />

      {/* Overdue banner */}
      {overdueCount > 0 && !dismissedBanner && (
        <div
          className="flex items-center justify-between p-3 rounded-sm border-l-4"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            borderLeftColor: "var(--accent-red)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--accent-red)]" />
            <span className="text-sm text-[var(--text-primary)]">
              You have {overdueCount} overdue training module{overdueCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-[var(--accent-red)] hover:underline"
              onClick={() => setActiveTab("overdue")}
            >
              View Overdue
            </button>
            <button onClick={() => setDismissedBanner(true)}>
              <X className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-assignment notification banner */}
      {unreadNotifications.length > 0 && (
        <div
          className="flex items-center justify-between p-3 rounded-sm border-l-4"
          style={{
            backgroundColor: "rgba(88, 166, 255, 0.08)",
            borderLeftColor: "var(--accent-blue)",
          }}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[var(--accent-blue)]" />
            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                New training assigned: &quot;{unreadNotifications[0].module_title}&quot;
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                {unreadNotifications[0].trigger_reason}
              </p>
            </div>
          </div>
          <Link href={unreadNotifications[0].action_url}>
            <Button size="sm">Start Training</Button>
          </Link>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setActiveTab("assigned")} className="text-left">
          <KPICard title="Assigned" value={assignedCount} />
        </button>
        <button onClick={() => setActiveTab("in_progress")} className="text-left">
          <KPICard title="In Progress" value={inProgressCount} />
        </button>
        <button onClick={() => setActiveTab("completed")} className="text-left">
          <KPICard title="Completed" value={completedCount} />
        </button>
      </div>

      {/* Overall progress */}
      <Card className="p-6">
        <div className="flex items-center gap-8">
          <TrainingProgressRing percent={overallPercent} />
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-[var(--text-secondary)]">
              Total: <span className="font-semibold text-[var(--text-primary)]">{totalCount}</span> modules
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Completed: <span className="font-semibold text-[var(--text-primary)]">{completedCount}</span> ({overallPercent}%)
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Avg Score: <span className="font-semibold text-[var(--text-primary)]">{avgScore}%</span>
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Certificates: <span className="font-semibold text-[var(--text-primary)]">{userCertificates.length}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedCount})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          {overdueCount > 0 && (
            <TabsTrigger value="overdue">
              <span style={{ color: activeTab === "overdue" ? "var(--accent-red)" : undefined }}>
                Overdue ({overdueCount})
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Enrollment list (shared content for all tabs) */}
        <div className="mt-4 flex flex-col gap-3">
          {filteredEnrollments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookMarked className="h-10 w-10 text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">No training modules in this category</p>
            </div>
          )}

          {filteredEnrollments.map((enrollment) => {
            const mod = getModule(enrollment.module_id);
            if (!mod) return null;
            const isOverdue = enrollment.status === "overdue";

            return (
              <Card key={enrollment.id} className="p-4 hover:border-[var(--accent-blue)]/30 transition-all">
                <div className="flex items-start gap-4">
                  {/* Cover thumbnail */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-sm"
                    style={{
                      background: `linear-gradient(135deg, ${getCatColor(mod.category)}30, ${getCatColor(mod.category)}10)`,
                    }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/${locale}/training/${mod.id}/`}
                        className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors line-clamp-1"
                      >
                        {mod.title}
                      </Link>
                      {enrollment.due_date && (
                        <span
                          className="text-xs shrink-0 inline-flex items-center gap-1"
                          style={{ color: isOverdue ? "var(--accent-red)" : "var(--text-secondary)" }}
                        >
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          Due: {new Date(enrollment.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[var(--text-muted)]">
                        {categoryLabels[mod.category]}
                      </span>
                      <DifficultyBadge difficulty={mod.difficulty} />
                      <span className="text-xs text-[var(--text-muted)] inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {mod.estimated_duration_minutes} min
                      </span>
                    </div>

                    {/* Progress + CTA */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <CompletionRateBar rate={enrollment.progress_percent} />
                      </div>
                      <Link href={`/${locale}/training/${mod.id}/`}>
                        <Button size="sm" variant={enrollment.status === "completed" ? "secondary" : "default"}>
                          {getCtaLabel(enrollment.status)} <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>

                    {/* Linked SOP */}
                    {mod.linked_sop_id && mod.linked_sop_title && (
                      <div className="mt-2">
                        <LinkedSOPChip sopId={mod.linked_sop_id} sopTitle={mod.linked_sop_title} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Tabs>

      {/* Recent Certificates */}
      {userCertificates.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Certificates</h2>
          <div className="flex items-start gap-6 overflow-x-auto pb-2">
            {userCertificates.slice(0, 6).map((cert) => (
              <Link key={cert.id} href={`/${locale}/training/${cert.module_id}/certificate/`}>
                <CertificateBadge certificate={cert} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getCatColor(category: string): string {
  const colors: Record<string, string> = {
    safety: "var(--accent-red)",
    operations: "var(--accent-blue)",
    compliance: "var(--accent-purple)",
    customer_service: "var(--accent-pink)",
    onboarding: "var(--accent-green)",
    leadership: "var(--accent-yellow)",
  };
  return colors[category] ?? "var(--text-muted)";
}
