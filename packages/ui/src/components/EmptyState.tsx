import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 px-6 text-center", className)}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && <p className="text-sm text-[var(--text-secondary)] max-w-[320px]">{description}</p>}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
