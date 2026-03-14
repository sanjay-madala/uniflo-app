"use client";

import { Input } from "@uniflo/ui";

interface SchedulePickerProps {
  mode: "now" | "scheduled";
  onModeChange: (mode: "now" | "scheduled") => void;
  scheduledDate: string;
  onDateChange: (date: string) => void;
  scheduledTime: string;
  onTimeChange: (time: string) => void;
}

export function SchedulePicker({
  mode,
  onModeChange,
  scheduledDate,
  onDateChange,
  scheduledTime,
  onTimeChange,
}: SchedulePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--text-secondary)]">Schedule</label>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="schedule"
            checked={mode === "now"}
            onChange={() => onModeChange("now")}
            className="accent-[var(--accent-blue)]"
          />
          <span className="text-sm text-[var(--text-primary)]">Send immediately</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="schedule"
            checked={mode === "scheduled"}
            onChange={() => onModeChange("scheduled")}
            className="accent-[var(--accent-blue)]"
          />
          <span className="text-sm text-[var(--text-primary)]">Schedule for later</span>
        </label>
      </div>
      {mode === "scheduled" && (
        <div className="flex gap-2 mt-1">
          <Input
            type="date"
            value={scheduledDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1"
          />
          <Input
            type="time"
            value={scheduledTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-28"
          />
        </div>
      )}
    </div>
  );
}
