import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

export interface UserTagProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  className?: string;
}

export function UserTag({ name, avatarUrl, size = "md", className }: UserTagProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Avatar className={size === "sm" ? "h-5 w-5" : "h-6 w-6"}>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className={size === "sm" ? "text-[9px]" : "text-[11px]"}>{initials}</AvatarFallback>
      </Avatar>
      <span className={cn("font-medium text-[var(--text-primary)]", size === "sm" ? "text-xs" : "text-sm")}>
        {name}
      </span>
    </span>
  );
}
