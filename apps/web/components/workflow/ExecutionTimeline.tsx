"use client";

import { useState, useMemo } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Pagination } from "@uniflo/ui";
import type { RuleExecution } from "@uniflo/mock-data";
import { ExecutionRow } from "./ExecutionRow";

const PER_PAGE = 10;

interface ExecutionTimelineProps {
  executions: RuleExecution[];
  locale: string;
}

export function ExecutionTimeline({ executions, locale }: ExecutionTimelineProps) {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...executions].sort(
      (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime(),
    );
    if (filter !== "all") {
      result = result.filter(e => e.status === filter);
    }
    return result;
  }, [executions, filter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Execution log</h3>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pageData.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          {executions.length === 0
            ? "This rule hasn't fired yet. It will execute when the trigger event occurs."
            : "No executions match your filter."}
        </p>
      ) : (
        <div className="space-y-2">
          {pageData.map(exec => (
            <ExecutionRow
              key={exec.id}
              execution={exec}
              locale={locale}
              expanded={expandedId === exec.id}
              onToggle={() => setExpandedId(prev => (prev === exec.id ? null : exec.id))}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
