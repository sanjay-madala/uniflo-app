import * as React from "react";
import { cn } from "../lib/utils";

function SkeletonBase({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-sm bg-[var(--bg-tertiary)]", className)} {...props} />;
}

export interface SkeletonLoaderProps {
  variant?: "text" | "card" | "table-row";
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ variant = "text", lines = 3, className }: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div className={cn("rounded-lg border border-[var(--border-default)] p-4 space-y-3", className)}>
        <div className="flex items-center gap-3">
          <SkeletonBase className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
        <SkeletonBase className="h-3 w-4/5" />
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={cn("flex items-center gap-4 px-4 py-3 border-b border-[var(--border-muted)]", className)}>
        <SkeletonBase className="h-4 w-4 rounded" />
        <SkeletonBase className="h-4 flex-1" />
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-16" />
      </div>
    );
  }

  // text lines
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/5" : i % 3 === 0 ? "w-full" : "w-4/5")}
        />
      ))}
    </div>
  );
}
