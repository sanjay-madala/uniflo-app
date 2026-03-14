"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, AvatarFallback } from "@uniflo/ui";
import {
  Tag,
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@uniflo/mock-data";

interface DashboardActivityFeedProps {
  events: ActivityEvent[];
  maxVisible?: number;
}

type ModuleFilter = "all" | "tickets" | "audits" | "capa" | "tasks" | "sla";

const MODULE_ICONS: Record<string, React.ElementType> = {
  tickets: Tag,
  audits: ClipboardCheck,
  capa: ShieldAlert,
  tasks: CheckCircle2,
  sla: Clock,
  sops: BookOpen,
  automation: Zap,
};

const MODULE_COLORS: Record<string, string> = {
  tickets: "#58A6FF",
  audits: "#3FB950",
  capa: "#D29922",
  tasks: "#BC8CFF",
  sla: "#F85149",
  sops: "#388BFD",
  automation: "#8B949E",
};

const SEVERITY_VARIANT: Record<string, "blue" | "warning" | "destructive"> = {
  info: "blue",
  warning: "warning",
  critical: "destructive",
};

function getRelativeTime(timestamp: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DashboardActivityFeed({ events, maxVisible = 10 }: DashboardActivityFeedProps) {
  const [filter, setFilter] = useState<ModuleFilter>("all");

  const filters: { key: ModuleFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "tickets", label: "Tickets" },
    { key: "audits", label: "Audits" },
    { key: "capa", label: "CAPA" },
    { key: "tasks", label: "Tasks" },
    { key: "sla", label: "SLA" },
  ];

  const filteredEvents = useMemo(() => {
    const list = filter === "all" ? events : events.filter((e) => e.module === filter);
    return list.slice(0, maxVisible);
  }, [events, filter, maxVisible]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            Latest Activity
          </CardTitle>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                filter === f.key
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto" style={{ maxHeight: 520 }}>
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No recent activity for this module</p>
          </div>
        ) : (
          <ul role="feed" className="space-y-1">
            {filteredEvents.map((event) => {
              const ModuleIcon = MODULE_ICONS[event.module] ?? Tag;
              const moduleColor = MODULE_COLORS[event.module] ?? "#8B949E";
              return (
                <li
                  key={event.id}
                  role="article"
                  aria-label={`${event.title}. ${event.description ?? ""}. ${getRelativeTime(event.timestamp)}`}
                  className="flex gap-3 p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(event.actor_name)}</AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full p-0.5"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <ModuleIcon size={10} style={{ color: moduleColor }} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        {getRelativeTime(event.timestamp)}
                      </span>
                      {event.severity && (
                        <Badge variant={SEVERITY_VARIANT[event.severity] ?? "blue"}>
                          {event.severity === "critical" && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse mr-1" />
                          )}
                          {event.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
