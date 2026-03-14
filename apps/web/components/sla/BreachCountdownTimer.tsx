"use client";

interface BreachCountdownTimerProps {
  remainingMs: number;
  targetValue: number;
  targetUnit: string;
}

function formatCountdown(ms: number): string {
  const absMs = Math.abs(ms);
  const days = Math.floor(absMs / 86400000);
  const hours = Math.floor((absMs % 86400000) / 3600000);
  const minutes = Math.floor((absMs % 3600000) / 60000);

  const prefix = ms < 0 ? "Breached " : "";
  const suffix = ms < 0 ? " ago" : " remaining";

  if (days > 0) return `${prefix}${days}d ${hours}h${suffix}`;
  if (hours > 0) return `${prefix}${hours}h ${minutes}m${suffix}`;
  return `${prefix}${minutes}m${suffix}`;
}

function getTargetMs(targetValue: number, targetUnit: string): number {
  switch (targetUnit) {
    case "minutes":
      return targetValue * 60000;
    case "hours":
      return targetValue * 3600000;
    case "days":
      return targetValue * 86400000;
    default:
      return targetValue * 3600000;
  }
}

export function BreachCountdownTimer({
  remainingMs,
  targetValue,
  targetUnit,
}: BreachCountdownTimerProps) {
  const totalMs = getTargetMs(targetValue, targetUnit);
  const elapsedMs = totalMs - remainingMs;
  const progressPercent = Math.min(Math.max((elapsedMs / totalMs) * 100, 0), 100);

  const isBreached = remainingMs < 0;
  const percentRemaining = remainingMs > 0 ? (remainingMs / totalMs) * 100 : 0;

  let barColor: string;
  if (isBreached) {
    barColor = "var(--accent-red)";
  } else if (percentRemaining <= 25) {
    barColor = "var(--accent-yellow)";
  } else {
    barColor = "var(--accent-green)";
  }

  const textColor = isBreached
    ? "var(--accent-red)"
    : percentRemaining <= 25
      ? "var(--accent-yellow)"
      : "var(--text-secondary)";

  return (
    <div className="w-full" role="timer" aria-live="polite">
      <div className="h-2 w-full rounded-full bg-[var(--border-default)]" style={{ opacity: 0.5 }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <p
        className="mt-1 text-xs font-medium"
        style={{ color: textColor }}
      >
        {formatCountdown(remainingMs)}
      </p>
    </div>
  );
}
