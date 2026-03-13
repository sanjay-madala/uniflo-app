import * as React from "react";
import { cn } from "../lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", default: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-blue)]", sizeMap[size], className)}
      {...props}
    />
  );
}
