"use client";

import Link from "next/link";
import type { TrainingNotification } from "@uniflo/mock-data";
import { GraduationCap, Clock, CheckCircle, XCircle } from "lucide-react";

interface AssignmentNotificationCardProps {
  notification: TrainingNotification;
}

const typeConfig: Record<
  TrainingNotification["type"],
  { icon: React.ReactNode; title: string; color: string }
> = {
  auto_assigned: {
    icon: <GraduationCap className="h-4 w-4" />,
    title: "New training assigned",
    color: "var(--accent-blue)",
  },
  deadline_reminder: {
    icon: <Clock className="h-4 w-4" />,
    title: "Training deadline approaching",
    color: "var(--accent-yellow)",
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Training completed",
    color: "var(--accent-green)",
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    title: "Quiz failed",
    color: "var(--accent-red)",
  },
};

function timeAgo(dateStr: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function AssignmentNotificationCard({ notification }: AssignmentNotificationCardProps) {
  const config = typeConfig[notification.type];

  return (
    <Link
      href={notification.action_url}
      className="flex items-start gap-3 p-3 rounded-sm transition-colors hover:bg-[var(--bg-tertiary)] relative"
    >
      {/* Icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            {config.title}
          </p>
          {!notification.read && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "var(--accent-blue)" }}
            />
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {notification.module_title}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate">
          {notification.trigger_reason}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </Link>
  );
}
