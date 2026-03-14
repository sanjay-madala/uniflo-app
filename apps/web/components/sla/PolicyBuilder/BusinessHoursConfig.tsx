"use client";

import { Input, Checkbox } from "@uniflo/ui";

interface BusinessHoursConfigProps {
  timezone: string;
  startHour: number;
  endHour: number;
  workingDays: number[];
  onUpdate: (updates: {
    timezone?: string;
    start_hour?: number;
    end_hour?: number;
    working_days?: number[];
  }) => void;
}

const dayNames = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function BusinessHoursConfig({
  timezone,
  startHour,
  endHour,
  workingDays,
  onUpdate,
}: BusinessHoursConfigProps) {
  function toggleDay(day: number) {
    const updated = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day].sort();
    onUpdate({ working_days: updated });
  }

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        Business Hours
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Define working hours for business-hours-only targets.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            Timezone
          </label>
          <Input
            value={timezone}
            onChange={(e) => onUpdate({ timezone: e.target.value })}
            placeholder="e.g. America/Chicago"
            className="w-64"
          />
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Start
            </label>
            <Input
              type="number"
              min={0}
              max={23}
              value={startHour}
              onChange={(e) =>
                onUpdate({ start_hour: Math.min(23, Math.max(0, Number(e.target.value))) })
              }
              className="w-20"
            />
          </div>
          <span className="mt-5 text-xs text-[var(--text-muted)]">to</span>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              End
            </label>
            <Input
              type="number"
              min={0}
              max={24}
              value={endHour}
              onChange={(e) =>
                onUpdate({ end_hour: Math.min(24, Math.max(0, Number(e.target.value))) })
              }
              className="w-20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2">
            Working days
          </label>
          <div className="flex flex-wrap gap-3">
            {dayNames.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
              >
                <Checkbox
                  checked={workingDays.includes(day.value)}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
