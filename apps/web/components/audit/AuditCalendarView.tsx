"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@uniflo/ui";
import type { Audit } from "@uniflo/mock-data";

interface AuditCalendarViewProps {
  audits: Audit[];
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDay: Date | null;
  onDaySelect: (day: Date) => void;
}

const statusDotColor: Record<string, string> = {
  completed: "#3FB950",
  failed: "#F85149",
  in_progress: "#58A6FF",
  scheduled: "#6E7681",
};

function getAuditDate(audit: Audit): Date | null {
  const dateStr = audit.completed_at || audit.started_at || audit.scheduled_at;
  return dateStr ? new Date(dateStr) : null;
}

export function AuditCalendarView({
  audits,
  month,
  onMonthChange,
  selectedDay,
  onDaySelect,
}: AuditCalendarViewProps) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => onMonthChange(new Date(year, monthIdx - 1));
  const nextMonth = () => onMonthChange(new Date(year, monthIdx + 1));

  // Build a map of day -> audits
  const dayAudits = new Map<number, Audit[]>();
  for (const audit of audits) {
    const d = getAuditDate(audit);
    if (d && d.getFullYear() === year && d.getMonth() === monthIdx) {
      const day = d.getDate();
      if (!dayAudits.has(day)) dayAudits.set(day, []);
      dayAudits.get(day)!.push(audit);
    }
  }

  const days: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const selectedDayNum = selectedDay && selectedDay.getFullYear() === year && selectedDay.getMonth() === monthIdx
    ? selectedDay.getDate()
    : null;

  const selectedAudits = selectedDayNum ? (dayAudits.get(selectedDayNum) ?? []) : [];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{monthLabel}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-xs text-[var(--text-muted)] py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-[var(--border-default)] border border-[var(--border-default)] rounded-lg overflow-hidden">
        {days.map((day, idx) => {
          const auditsForDay = day ? dayAudits.get(day) : undefined;
          const isSelected = day === selectedDayNum;

          return (
            <button
              key={idx}
              className={`min-h-[72px] p-2 text-start transition-colors ${
                day
                  ? isSelected
                    ? "bg-[var(--accent-blue)]/10"
                    : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]"
                  : "bg-[var(--bg-primary)]"
              }`}
              onClick={() => day && onDaySelect(new Date(year, monthIdx, day))}
              disabled={!day}
            >
              {day && (
                <>
                  <span className={`text-xs ${isSelected ? "font-bold text-[var(--accent-blue)]" : "text-[var(--text-secondary)]"}`}>
                    {day}
                  </span>
                  {auditsForDay && (
                    <div className="flex gap-1 mt-1">
                      {auditsForDay.map((a) => (
                        <div
                          key={a.id}
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: statusDotColor[a.status] ?? "#6E7681" }}
                          title={a.title}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            {selectedDay.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </h4>
          {selectedAudits.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No audits on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedAudits.map((audit) => {
                const time = getAuditDate(audit);
                const timeStr = time
                  ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <div
                    key={audit.id}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3"
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: statusDotColor[audit.status] ?? "#6E7681" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {audit.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {timeStr} · {audit.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
