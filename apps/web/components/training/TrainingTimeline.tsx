"use client";

import type { TrainingEnrollment } from "@uniflo/mock-data";
import { BookOpen, PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface TrainingTimelineProps {
  enrollment: TrainingEnrollment;
}

interface TimelineEvent {
  icon: React.ReactNode;
  label: string;
  date: string | null;
  color: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TrainingTimeline({ enrollment }: TrainingTimelineProps) {
  const events: TimelineEvent[] = [
    {
      icon: <BookOpen className="h-3.5 w-3.5" />,
      label: "Assigned",
      date: enrollment.assigned_at,
      color: "var(--accent-blue)",
    },
  ];

  if (enrollment.started_at) {
    events.push({
      icon: <PlayCircle className="h-3.5 w-3.5" />,
      label: "Started",
      date: enrollment.started_at,
      color: "var(--accent-blue)",
    });
  }

  for (const attempt of enrollment.quiz_attempts) {
    events.push({
      icon: attempt.passed
        ? <CheckCircle className="h-3.5 w-3.5" />
        : <XCircle className="h-3.5 w-3.5" />,
      label: `Quiz attempt #${attempt.attempt_number}: ${attempt.score}%`,
      date: attempt.completed_at,
      color: attempt.passed ? "var(--accent-green)" : "var(--accent-red)",
    });
  }

  if (enrollment.completed_at) {
    events.push({
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: "Completed",
      date: enrollment.completed_at,
      color: "var(--accent-green)",
    });
  }

  if (enrollment.status === "overdue") {
    events.push({
      icon: <Clock className="h-3.5 w-3.5" />,
      label: `Overdue — Due ${formatDate(enrollment.due_date)}`,
      date: null,
      color: "var(--accent-red)",
    });
  }

  return (
    <div className="flex flex-col gap-0">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${event.color}15`, color: event.color }}
            >
              {event.icon}
            </div>
            {idx < events.length - 1 && (
              <div className="w-px h-6" style={{ backgroundColor: "var(--border-default)" }} />
            )}
          </div>
          <div className="pt-1">
            <p className="text-xs font-medium text-[var(--text-primary)]">{event.label}</p>
            {event.date && (
              <p className="text-xs text-[var(--text-muted)]">{formatDate(event.date)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
