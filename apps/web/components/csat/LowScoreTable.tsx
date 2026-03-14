"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CSATLowScoreEntry } from "@uniflo/mock-data";
import { Star, ExternalLink } from "lucide-react";

interface LowScoreTableProps {
  entries: CSATLowScoreEntry[];
  locale: string;
  filterByStar?: number | null;
}

const PER_PAGE = 10;

export function LowScoreTable({
  entries,
  locale,
  filterByStar,
}: LowScoreTableProps) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (filterByStar !== null && filterByStar !== undefined) {
      return entries.filter((e) => e.score === filterByStar);
    }
    return entries;
  }, [entries, filterByStar]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function renderStars(score: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className="h-3.5 w-3.5"
            fill={s <= score ? "var(--accent-yellow)" : "none"}
            stroke={s <= score ? "var(--accent-yellow)" : "var(--text-muted)"}
            strokeWidth={1.5}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Low Score Alerts
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Tickets with CSAT &le; 2 (requires attention)
          {filterByStar !== null && filterByStar !== undefined && (
            <span> &middot; Filtered to {filterByStar} star{filterByStar !== 1 ? "s" : ""}</span>
          )}
        </p>
      </div>

      {pageData.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          No low-scoring tickets found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b text-left text-xs font-medium"
                style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
              >
                <th className="px-4 py-2.5">Ticket</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((entry) => (
                <tr
                  key={entry.ticket_id}
                  className="border-b transition-colors"
                  style={{
                    borderColor: "var(--border-default)",
                    backgroundColor:
                      entry.score === 1
                        ? "rgba(220,38,38,0.04)"
                        : "transparent",
                  }}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className="font-mono text-xs font-medium"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      {entry.ticket_id.replace("tkt_", "TKT-")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{renderStars(entry.score)}</td>
                  <td
                    className="px-4 py-2.5 text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.customer_name}
                  </td>
                  <td
                    className="px-4 py-2.5 text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.agent_name}
                  </td>
                  <td
                    className="px-4 py-2.5 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {entry.category_label}
                  </td>
                  <td
                    className="px-4 py-2.5 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(entry.rated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/${locale}/tickets/${entry.ticket_id}/`}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{
                        color: "var(--accent-blue)",
                        backgroundColor: "rgba(88,166,255,0.1)",
                      }}
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between border-t px-4 py-2.5"
          style={{ borderColor: "var(--border-default)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
