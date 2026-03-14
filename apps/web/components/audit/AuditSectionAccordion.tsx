"use client";

import { ChevronRight, Check, X, Minus } from "lucide-react";
import type { AuditSectionResult, AuditItemResultFull } from "@uniflo/mock-data";
import { Badge } from "@uniflo/ui";

interface AuditSectionAccordionProps {
  section: AuditSectionResult;
  expanded: boolean;
  onToggle: () => void;
  expandedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
}

function ResultIcon({ result }: { result: AuditItemResultFull["result"] }) {
  switch (result) {
    case "pass":
      return <Check className="h-4 w-4 text-[var(--accent-green)]" />;
    case "fail":
      return <X className="h-4 w-4 text-[var(--accent-red)]" />;
    case "na":
      return <Minus className="h-4 w-4 text-[var(--text-muted)]" />;
    default:
      return <div className="h-4 w-4 rounded-full border border-[var(--border-default)]" />;
  }
}

const severityColors: Record<string, string> = {
  critical: "destructive",
  major: "warning",
  minor: "blue",
  observation: "default",
};

export function AuditSectionAccordion({
  section,
  expanded,
  onToggle,
  expandedItems,
  onToggleItem,
}: AuditSectionAccordionProps) {
  const hasFailed = section.failed_items > 0;
  const scoreColor = section.score >= 80 ? "var(--accent-green)" : section.score >= 60 ? "var(--accent-yellow)" : "var(--accent-red)";

  return (
    <div
      className={`rounded-lg border bg-[var(--bg-secondary)] ${
        hasFailed ? "border-[var(--accent-red)]/30 border-s-2 border-s-[var(--accent-red)]" : "border-[var(--border-default)]"
      }`}
    >
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-[var(--bg-tertiary)] transition-colors"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={`h-4 w-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
          {section.title}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {section.passed_items}/{section.total_items} passed
        </span>
        <span className="text-sm font-semibold" style={{ color: scoreColor }}>
          {section.score}%
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border-default)] px-4 py-2">
          {section.items.map((item) => (
            <div key={item.item_id} className="py-2">
              <button
                className="flex w-full items-start gap-3 text-start"
                onClick={() => item.result === "fail" && onToggleItem(item.item_id)}
              >
                <ResultIcon result={item.result} />
                <span
                  className={`flex-1 text-sm ${
                    item.result === "fail"
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {item.question}
                  {item.result === "fail" && (
                    <span className="ms-2 text-xs text-[var(--accent-red)] font-medium">FAIL</span>
                  )}
                </span>
                {item.result === "fail" && (
                  <Badge variant={severityColors[item.severity_if_fail] as "destructive" | "warning" | "blue" | "default"}>
                    {item.severity_if_fail}
                  </Badge>
                )}
              </button>

              {item.result === "fail" && expandedItems.has(item.item_id) && (
                <div className="ms-7 mt-2 space-y-2">
                  {item.notes && (
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded p-2">
                      {item.notes}
                    </p>
                  )}
                  {item.photo_urls.length > 0 && (
                    <div className="flex gap-2">
                      {item.photo_urls.map((url, idx) => (
                        <div
                          key={idx}
                          className="h-12 w-12 rounded border border-[var(--border-default)] bg-[var(--bg-tertiary)] flex items-center justify-center text-xs text-[var(--text-muted)]"
                        >
                          IMG
                        </div>
                      ))}
                    </div>
                  )}
                  {item.auto_ticket_id && (
                    <p className="text-xs text-[var(--accent-blue)]">
                      Ticket: {item.auto_ticket_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
