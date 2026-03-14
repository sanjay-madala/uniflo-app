"use client";

interface ResponseRateGaugeProps {
  rate: number;
  size?: number;
  strokeWidth?: number;
}

export function ResponseRateGauge({
  rate,
  size = 80,
  strokeWidth = 8,
}: ResponseRateGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;
  const center = size / 2;

  const color =
    rate >= 70
      ? "var(--accent-green, #059669)"
      : rate >= 50
        ? "var(--accent-blue, #2563EB)"
        : "var(--accent-red, #DC2626)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-default, #374151)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {rate}%
        </span>
      </div>
    </div>
  );
}
