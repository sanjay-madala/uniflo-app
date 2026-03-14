"use client";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ percentage, size = 48, strokeWidth = 4, className }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const color = percentage >= 80
    ? "var(--accent-green)"
    : percentage >= 50
      ? "var(--accent-amber)"
      : "var(--accent-red)";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
      aria-label={`${percentage}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500 ease-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="text-[10px] font-semibold"
        fill="var(--text-primary)"
      >
        {percentage}%
      </text>
    </svg>
  );
}
