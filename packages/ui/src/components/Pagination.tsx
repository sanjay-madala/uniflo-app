import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function Pagination({ currentPage, totalPages, onPageChange, maxVisible = 7, className, dir }: PaginationProps) {
  const getPageNumbers = () => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    const pages: (number | "…")[] = [];

    if (currentPage <= half + 1) {
      for (let i = 1; i <= maxVisible - 2; i++) pages.push(i);
      pages.push("…", totalPages);
    } else if (currentPage >= totalPages - half) {
      pages.push(1, "…");
      for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "…");
      for (let i = currentPage - half + 2; i <= currentPage + half - 2; i++) pages.push(i);
      pages.push("…", totalPages);
    }

    return pages;
  };

  return (
    <nav
      dir={dir}
      className={cn("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "…" ? (
          <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-[var(--text-muted)]">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            aria-current={currentPage === page ? "page" : undefined}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
              currentPage === page
                ? "bg-[var(--accent-blue)] text-white font-medium"
                : "border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
