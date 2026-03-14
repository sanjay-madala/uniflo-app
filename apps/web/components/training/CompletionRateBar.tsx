"use client";

interface CompletionRateBarProps {
  rate: number;
  showLabel?: boolean;
  className?: string;
}

function getBarColor(rate: number): string {
  if (rate >= 90) return "var(--accent-green)";
  if (rate >= 70) return "var(--accent-blue)";
  if (rate >= 50) return "var(--accent-yellow, #EAB308)";
  return "var(--accent-red)";
}

export function CompletionRateBar({ rate, showLabel = true, className = "" }: CompletionRateBarProps) {
  const color = getBarColor(rate);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium shrink-0" style={{ color }}>
          {rate}%
        </span>
      )}
    </div>
  );
}
