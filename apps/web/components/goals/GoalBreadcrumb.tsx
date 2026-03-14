"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface GoalBreadcrumbProps {
  crumbs: Crumb[];
  locale: string;
}

export function GoalBreadcrumb({ crumbs, locale }: GoalBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href={`/${locale}/goals`}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        Goals
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]" title={crumb.label}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
