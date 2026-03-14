"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  trainingModules,
  trainingEnrollments,
  trainingQuizzes,
} from "@uniflo/mock-data";
import type {
  TrainingModule,
  TrainingEnrollment,
  Quiz,
} from "@uniflo/mock-data";
import {
  Button,
  Badge,
} from "@uniflo/ui";
import {
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { ContentRenderer } from "@/components/training/ContentRenderer";
import { DifficultyBadge } from "@/components/training/DifficultyBadge";
import { ModuleStatusBadge } from "@/components/training/ModuleStatusBadge";
import { CompletionRateBar } from "@/components/training/CompletionRateBar";
import { LinkedSOPChip } from "@/components/training/LinkedSOPChip";
import { LinkedGoalChip } from "@/components/training/LinkedGoalChip";
import { TrainingTimeline } from "@/components/training/TrainingTimeline";

const CURRENT_USER = "user_001";

const categoryLabels: Record<string, string> = {
  safety: "Safety",
  operations: "Operations",
  compliance: "Compliance",
  customer_service: "Customer Service",
  onboarding: "Onboarding",
  leadership: "Leadership",
};

const categoryColors: Record<string, string> = {
  safety: "var(--accent-red)",
  operations: "var(--accent-blue)",
  compliance: "var(--accent-purple)",
  customer_service: "var(--accent-pink)",
  onboarding: "var(--accent-green)",
  leadership: "var(--accent-yellow)",
};

export default function CourseViewClient() {
  const { locale, moduleId } = useParams<{ locale: string; moduleId: string }>();

  const module = (trainingModules as TrainingModule[]).find((m) => m.id === moduleId);
  const enrollment = (trainingEnrollments as TrainingEnrollment[]).find(
    (e) => e.module_id === moduleId && e.user_id === CURRENT_USER
  );
  const quiz = module?.quiz_id
    ? (trainingQuizzes as Quiz[]).find((q) => q.id === module.quiz_id)
    : null;

  const tocItems = useMemo(() => {
    if (!module) return [];
    const items = module.content_blocks
      .filter((b) => b.title)
      .sort((a, b) => a.order - b.order)
      .map((b) => ({ id: b.id, title: b.title ?? "" }));
    if (quiz) {
      items.push({ id: "quiz-cta", title: "Quiz" });
    }
    return items;
  }, [module, quiz]);

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-12 w-12 text-[var(--text-muted)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Module not found</h2>
        <Link href={`/${locale}/training/`}>
          <Button variant="secondary">Back to Training Library</Button>
        </Link>
      </div>
    );
  }

  const catColor = categoryColors[module.category] ?? "var(--text-muted)";
  const lastAttempt = enrollment?.quiz_attempts?.length
    ? enrollment.quiz_attempts[enrollment.quiz_attempts.length - 1]
    : null;
  const quizPassed = lastAttempt?.passed === true;
  const attemptsUsed = enrollment?.quiz_attempts?.length ?? 0;
  const maxAttempts = quiz?.max_attempts ?? 0;
  const attemptsExhausted = maxAttempts > 0 && attemptsUsed >= maxAttempts;

  return (
    <div className="flex flex-col gap-0">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-[var(--border-default)]">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Link href={`/${locale}/training/`} className="hover:text-[var(--accent-blue)] transition-colors">
            Training
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium truncate">{module.title}</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Content Area */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* Hero */}
          <div
            className="w-full h-48 rounded-sm mb-6 flex items-end p-6"
            style={{
              background: module.cover_image
                ? `url(${module.cover_image}) center/cover`
                : `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
            }}
          >
            <div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium mb-2"
                style={{
                  backgroundColor: `${catColor}20`,
                  color: catColor,
                  border: `1px solid ${catColor}40`,
                }}
              >
                {categoryLabels[module.category] ?? module.category}
              </span>
            </div>
          </div>

          {/* Title and meta */}
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {module.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] mb-4">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {module.estimated_duration_minutes} min
            </span>
            <DifficultyBadge difficulty={module.difficulty} />
            <span>Version {module.version}</span>
            {module.published_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Published {new Date(module.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {enrollment && (
            <div className="mb-6">
              <CompletionRateBar rate={enrollment.progress_percent} />
            </div>
          )}

          {/* Content blocks */}
          <ContentRenderer blocks={module.content_blocks} />

          {/* Quiz CTA */}
          {quiz && (
            <div
              id="quiz-cta"
              className="mt-8 p-6 rounded-sm scroll-mt-20"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "2px solid rgba(88, 166, 255, 0.3)",
              }}
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Ready for the quiz?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {quiz.questions.length} questions | {quiz.pass_threshold}% to pass
                {quiz.time_limit_minutes && ` | ${quiz.time_limit_minutes} min time limit`}
              </p>

              {quizPassed ? (
                <div className="flex items-center gap-3">
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" /> Passed ({lastAttempt?.score}%)
                  </Badge>
                  <Link href={`/${locale}/training/${moduleId}/quiz/`}>
                    <Button variant="secondary" size="sm">Retake Quiz</Button>
                  </Link>
                  <Link href={`/${locale}/training/${moduleId}/certificate/`}>
                    <Button size="sm">View Certificate</Button>
                  </Link>
                </div>
              ) : attemptsExhausted ? (
                <p className="text-sm text-[var(--text-muted)]">Maximum attempts reached</p>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href={`/${locale}/training/${moduleId}/quiz/`}>
                    <Button size="sm">
                      {attemptsUsed > 0 ? "Try Again" : "Start Quiz"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  {attemptsUsed > 0 && maxAttempts > 0 && (
                    <span className="text-xs" style={{ color: "var(--accent-yellow)" }}>
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Attempts remaining: {maxAttempts - attemptsUsed}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mark as Complete (no quiz) */}
          {!quiz && enrollment && enrollment.status !== "completed" && (
            <div className="mt-8">
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-1" /> Mark as Complete
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          {/* Module Info Card */}
          <div
            className="rounded-sm p-4 border flex flex-col gap-3"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-default)",
            }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Module Info</h3>
            <div className="flex flex-col gap-2">
              <InfoRow label="Category">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium"
                  style={{ backgroundColor: `${catColor}20`, color: catColor }}
                >
                  {categoryLabels[module.category]}
                </span>
              </InfoRow>
              <InfoRow label="Difficulty">
                <DifficultyBadge difficulty={module.difficulty} />
              </InfoRow>
              <InfoRow label="Duration">{module.estimated_duration_minutes} min</InfoRow>
              <InfoRow label="Version">{module.version}</InfoRow>
              {module.published_at && (
                <InfoRow label="Published">
                  {new Date(module.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </InfoRow>
              )}
              <InfoRow label="Status">
                <ModuleStatusBadge status={module.status} />
              </InfoRow>
            </div>
          </div>

          {/* Table of Contents */}
          {tocItems.length > 0 && (
            <div
              className="rounded-sm p-4 border sticky top-20"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
              }}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-1">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#block-${item.id}`}
                    className="text-xs py-1 px-2 rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Linked Resources */}
          {(module.linked_sop_id || module.linked_goal_ids.length > 0) && (
            <div
              className="rounded-sm p-4 border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
              }}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Linked Resources
              </h3>
              <div className="flex flex-col gap-2">
                {module.linked_sop_id && module.linked_sop_title && (
                  <LinkedSOPChip
                    sopId={module.linked_sop_id}
                    sopTitle={module.linked_sop_title}
                    sopVersion={module.linked_sop_version}
                  />
                )}
                {module.linked_goal_ids.map((goalId) => (
                  <LinkedGoalChip key={goalId} goalId={goalId} />
                ))}
              </div>
            </div>
          )}

          {/* Enrollment Status */}
          {enrollment && (
            <div
              className="rounded-sm p-4 border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
              }}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Enrollment Status
              </h3>
              <TrainingTimeline enrollment={enrollment} />
              <div className="mt-3 flex flex-col gap-1.5">
                <InfoRow label="Progress">{enrollment.progress_percent}%</InfoRow>
                {enrollment.due_date && (
                  <InfoRow label="Due">
                    <span
                      style={{
                        color: enrollment.status === "overdue" ? "var(--accent-red)" : "var(--text-primary)",
                      }}
                    >
                      {enrollment.status === "overdue" && (
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                      )}
                      {new Date(enrollment.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </InfoRow>
                )}
                {enrollment.best_score !== null && (
                  <InfoRow label="Best Score">{enrollment.best_score}%</InfoRow>
                )}
                {quiz && (
                  <InfoRow label="Attempts">
                    {attemptsUsed}/{maxAttempts === 0 ? "Unlimited" : maxAttempts}
                  </InfoRow>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-xs text-[var(--text-primary)]">{children}</span>
    </div>
  );
}
