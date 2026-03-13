import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

export interface AvatarGroupItem {
  name: string;
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-10 w-10 text-sm",
};

const overflowSizes = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-10 w-10 text-sm",
};

export function AvatarGroup({ avatars, max = 5, size = "md", className }: AvatarGroupProps) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn("flex items-center", className)} role="group" aria-label={`${avatars.length} members`}>
      {shown.map((avatar, idx) => (
        <Avatar
          key={idx}
          className={cn(
            sizeClasses[size],
            "ring-2 ring-[var(--bg-primary)]",
            idx > 0 ? "-ms-2" : ""
          )}
          title={avatar.name}
        >
          <AvatarImage src={avatar.avatarUrl} alt={avatar.name} />
          <AvatarFallback>
            {avatar.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            overflowSizes[size],
            "-ms-2 flex items-center justify-center rounded-full ring-2 ring-[var(--bg-primary)] bg-[var(--bg-tertiary)] font-medium text-[var(--text-secondary)]"
          )}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
