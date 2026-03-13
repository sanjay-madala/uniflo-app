import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date: Date, start: Date, end: Date) {
  return date > start && date < end;
}

export interface DatepickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  clearable?: boolean;
  className?: string;
}

export function Datepicker({ value, onChange, placeholder = "Pick a date", disabled, label, clearable = true, className }: DatepickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(value ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>}
      <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <Popover.Trigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 h-9 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-sm text-start transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            )}
          >
            <CalendarDays className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
            <span className="flex-1">{value ? formatDate(value) : placeholder}</span>
            {clearable && value && (
              <X
                className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={(e) => { e.stopPropagation(); onChange?.(undefined); }}
              />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-72 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-xl p-3"
            sideOffset={4}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {/* Day names */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-[var(--text-muted)] py-1">{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const selected = value && isSameDay(date, value);
                const today = isSameDay(date, new Date());
                return (
                  <button
                    key={idx}
                    onClick={() => { onChange?.(date); setOpen(false); }}
                    className={cn(
                      "h-8 w-8 mx-auto flex items-center justify-center rounded-md text-sm transition-colors",
                      selected
                        ? "bg-[var(--accent-blue)] text-white font-medium"
                        : today
                        ? "border border-[var(--accent-blue)] text-[var(--accent-blue)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (range: { start?: Date; end?: Date }) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onChange, placeholder = "Pick a range", disabled, label, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState<Date | undefined>();
  const [viewDate, setViewDate] = React.useState(startDate ?? new Date());
  const [selecting, setSelecting] = React.useState<"start" | "end">("start");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const displayValue = startDate
    ? endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : formatDate(startDate)
    : "";

  const handleDayClick = (date: Date) => {
    if (selecting === "start" || !startDate) {
      onChange?.({ start: date, end: undefined });
      setSelecting("end");
    } else {
      if (date < startDate) {
        onChange?.({ start: date, end: startDate });
      } else {
        onChange?.({ start: startDate, end: date });
      }
      setSelecting("start");
      setOpen(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>}
      <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <Popover.Trigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 h-9 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 text-sm text-start transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              displayValue ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            )}
          >
            <CalendarDays className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
            <span className="flex-1">{displayValue || placeholder}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-50 w-72 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-xl p-3" sideOffset={4}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-[var(--text-primary)]">{MONTHS[month]} {year}</span>
              <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-medium text-[var(--text-muted)] py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const isStart = startDate && isSameDay(date, startDate);
                const isEnd = endDate && isSameDay(date, endDate);
                const inRange = startDate && endDate && isBetween(date, startDate, endDate);
                const inHover = startDate && !endDate && hover && selecting === "end" && date > startDate && date <= hover;
                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => setHover(date)}
                    onMouseLeave={() => setHover(undefined)}
                    className={cn(
                      "h-8 w-8 mx-auto flex items-center justify-center rounded-md text-sm transition-colors",
                      (isStart || isEnd) ? "bg-[var(--accent-blue)] text-white font-medium" :
                      (inRange || inHover) ? "bg-[var(--accent-blue)]/20 text-[var(--text-primary)]" :
                      "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-center text-[var(--text-muted)]">
              {selecting === "start" ? "Select start date" : "Select end date"}
            </p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
