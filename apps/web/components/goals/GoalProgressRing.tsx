"use client";

import { useEffect, useState } from "react";
import type { GoalHealthStatus } from "@uniflo/mock-data";

const healthColors: Record<GoalHealthStatus, string> = {
  on_track: "var(--accent-green)",
  at_risk: "var(--accent-yellow)",
  behind: "var(--accent-red)",
  achieved: "var(--accent-blue)",
};

interface GoalProgressRingProps {
  progress: number;
  health: GoalHealthStatus;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function GoalProgressRing({
  progress,
  health,
  size = 64,
  strokeWidth = 6,
  className,
}: GoalProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;
  const color = healthColors[health];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimatedProgress(progress);
      return;
    }

    let frame: number;
    const duration = 800;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(Math.round(progress * eased));
      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  const fontSize = size < 48 ? 10 : size < 80 ? 14 : 20;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
      aria-label={`Goal progress: ${progress} percent, ${health.replace("_", " ")}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
          style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold text-[var(--text-primary)]"
          style={{ fontSize, lineHeight: 1 }}
        >
          {animatedProgress}%
        </span>
      </div>
    </div>
  );
}
