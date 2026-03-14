"use client";

import { useEffect, useState } from "react";

interface AuditScoreRingProps {
  score: number;
  pass: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function AuditScoreRing({
  score,
  pass,
  size = 160,
  strokeWidth = 12,
  className,
}: AuditScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = pass ? "var(--accent-green)" : "var(--accent-red)";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimatedScore(score);
      return;
    }

    let frame: number;
    const duration = 1000;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={className} style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
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
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-label={`Audit score: ${score} percent, ${pass ? "pass" : "fail"}`}
      >
        <span className="text-3xl font-bold" style={{ color }}>
          {animatedScore}%
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {pass ? "PASS" : "FAIL"}
        </span>
      </div>
    </div>
  );
}
