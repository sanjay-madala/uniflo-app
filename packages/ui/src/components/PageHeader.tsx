import * as React from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 py-5 px-6 border-b border-[var(--border-default)] bg-[var(--bg-primary)]", className)}>
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
