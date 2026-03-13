import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function BreadcrumbBar({ items, separator, maxItems, className, dir }: BreadcrumbBarProps) {
  let displayed = items;
  let truncated = false;

  if (maxItems && items.length > maxItems) {
    displayed = [items[0], { label: "…" }, ...items.slice(items.length - (maxItems - 2))];
    truncated = true;
  }

  const sep = separator ?? <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />;

  return (
    <nav aria-label="Breadcrumb" dir={dir}>
      <ol className={cn("flex items-center gap-1 text-sm", className)}>
        {displayed.map((item, idx) => {
          const isLast = idx === displayed.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && <span aria-hidden="true">{sep}</span>}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    isLast ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Alias export
export { BreadcrumbBar as Breadcrumbs };
