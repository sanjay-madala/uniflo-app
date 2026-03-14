"use client";

import type { TOCHeading } from "@uniflo/mock-data";

interface ArticleTableOfContentsProps {
  headings: TOCHeading[];
  activeId?: string;
}

export function ArticleTableOfContents({ headings, activeId }: ArticleTableOfContentsProps) {
  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
        On this page
      </p>
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        return (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(heading.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={`block text-sm py-1 transition-colors ${
              heading.level === 3 ? "ps-4" : ""
            } ${
              isActive
                ? "text-[var(--accent-blue)] border-s-2 border-[var(--accent-blue)] ps-3 font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-s-2 border-transparent ps-3"
            }`}
          >
            {heading.text}
          </a>
        );
      })}
    </nav>
  );
}
