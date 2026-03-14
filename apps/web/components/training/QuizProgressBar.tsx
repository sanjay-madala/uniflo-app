"use client";

interface QuizProgressBarProps {
  current: number;
  total: number;
  timeRemaining?: number | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function QuizProgressBar({ current, total, timeRemaining }: QuizProgressBarProps) {
  const progress = ((current + 1) / total) * 100;
  const timeLow = timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 60;
  const timeWarning = timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 150;

  return (
    <div>
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--border-default)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--accent-blue)",
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[var(--text-secondary)]">
          Question {current + 1} of {total}
        </span>
        {timeRemaining !== null && timeRemaining !== undefined && (
          <span
            className="text-xs font-mono"
            style={{
              color: timeLow
                ? "var(--accent-red)"
                : timeWarning
                  ? "var(--accent-yellow, #EAB308)"
                  : "var(--text-secondary)",
            }}
          >
            {formatTime(timeRemaining)} remaining
          </span>
        )}
      </div>
    </div>
  );
}
