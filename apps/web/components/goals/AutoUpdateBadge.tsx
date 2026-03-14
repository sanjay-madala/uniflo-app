"use client";

import { Zap, Pencil } from "lucide-react";
import { Badge } from "@uniflo/ui";
import type { KRTrackingType } from "@uniflo/mock-data";

interface AutoUpdateBadgeProps {
  trackingType: KRTrackingType;
  moduleLabel?: string;
  className?: string;
}

export function AutoUpdateBadge({ trackingType, moduleLabel, className = "" }: AutoUpdateBadgeProps) {
  if (trackingType === "auto") {
    return (
      <Badge
        variant="blue"
        className={`gap-1 ${className}`}
        aria-label={`Auto-updated from ${moduleLabel ?? "operational data"}`}
      >
        <Zap className="h-3 w-3" />
        Auto: {moduleLabel ?? "Linked"}
      </Badge>
    );
  }

  return (
    <Badge
      className={`gap-1 ${className}`}
      aria-label="Manually tracked"
    >
      <Pencil className="h-3 w-3" />
      Manual
    </Badge>
  );
}
