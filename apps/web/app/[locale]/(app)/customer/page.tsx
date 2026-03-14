"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Search, Inbox } from "lucide-react";
import { portalTickets } from "@uniflo/mock-data";
import type { PortalTicket, PortalTicketStatus } from "@uniflo/mock-data";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { TicketCard } from "@/components/portal/TicketCard";

type SortOption = "newest" | "oldest" | "priority" | "updated";
type StatusFilter = PortalTicketStatus | "all";

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
const PER_PAGE = 10;

export default function CustomerPortalPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const tickets = portalTickets as PortalTicket[];

  const summaryCounters = useMemo(() => {
    const open = tickets.filter(
      (t) => t.status === "submitted" || t.status === "in_progress"
    ).length;
    const awaiting = tickets.filter((t) => t.status === "awaiting_reply").length;
    const resolved = tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;
    return { open, awaiting_reply: awaiting, resolved };
  }, [tickets]);

  const filtered = useMemo(() => {
    let result = [...tickets];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "submitted") {
        result = result.filter(
          (t) => t.status === "submitted" || t.status === "in_progress"
        );
      } else {
        result = result.filter((t) => t.status === statusFilter);
      }
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "priority":
        result.sort(
          (a, b) =>
            (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
        );
        break;
      case "updated":
        result.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    return result;
  }, [tickets, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSummaryClick(filter: StatusFilter) {
    setStatusFilter(filter);
    setPage(1);
  }

  const summaryCards: { label: string; count: number; filter: StatusFilter }[] = [
    { label: "Open Tickets", count: summaryCounters.open, filter: "submitted" },
    { label: "Awaiting Reply", count: summaryCounters.awaiting_reply, filter: "awaiting_reply" },
    { label: "Resolved", count: summaryCounters.resolved, filter: "resolved" },
  ];

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--portal-bg": "#FFFFFF",
          "--portal-surface": "#F9FAFB",
          "--portal-surface-elevated": "#FFFFFF",
          "--portal-border": "#E5E7EB",
          "--portal-text-primary": "#111827",
          "--portal-text-secondary": "#6B7280",
          "--portal-text-muted": "#9CA3AF",
          "--portal-accent": "#2563EB",
          "--portal-accent-hover": "#1D4ED8",
          "--portal-success": "#059669",
          "--portal-warning": "#D97706",
          "--portal-danger": "#DC2626",
        } as React.CSSProperties
      }
    >
      <PortalHeader title="My Support Portal" />

      <main
        className="mx-auto w-full max-w-[960px] flex-1 px-6 py-8"
        style={{ backgroundColor: "var(--portal-bg)" }}
      >
        {/* Welcome */}
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--portal-text-primary)" }}
        >
          Welcome back, Jamie
        </h1>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <button
              key={card.label}
              onClick={() => handleSummaryClick(card.filter)}
              className="rounded-lg border p-5 text-left transition-all hover:shadow-md"
              style={{
                backgroundColor: "var(--portal-surface)",
                borderColor: "var(--portal-border)",
                borderLeftWidth: statusFilter === card.filter ? 4 : 1,
                borderLeftColor:
                  statusFilter === card.filter
                    ? "var(--portal-accent)"
                    : "var(--portal-border)",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--portal-text-secondary)" }}
              >
                {card.label}
              </p>
              <p
                className="mt-2 text-3xl font-bold"
                style={{ color: "var(--portal-text-primary)" }}
              >
                {card.count}
              </p>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--portal-text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--portal-surface)",
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-primary)",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="h-10 rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--portal-surface)",
              borderColor: "var(--portal-border)",
              color: "var(--portal-text-primary)",
            }}
          >
            <option value="all">All Status</option>
            <option value="submitted">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_reply">Awaiting Reply</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--portal-surface)",
              borderColor: "var(--portal-border)",
              color: "var(--portal-text-primary)",
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="updated">Recently Updated</option>
          </select>

          <button
            onClick={() => router.push(`/${locale}/customer/submit`)}
            className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--portal-accent)" }}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>

        {/* Results count */}
        <p
          className="mt-3 text-xs"
          style={{ color: "var(--portal-text-muted)" }}
        >
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Ticket List */}
        {pageData.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--portal-surface)" }}
            >
              <Inbox className="h-8 w-8" style={{ color: "var(--portal-text-muted)" }} />
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--portal-text-primary)" }}
            >
              No tickets yet
            </p>
            <p
              className="max-w-xs text-sm"
              style={{ color: "var(--portal-text-secondary)" }}
            >
              Submit your first support request to get started.
            </p>
            <button
              onClick={() => router.push(`/${locale}/customer/submit`)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--portal-accent)" }}
            >
              <Plus className="h-4 w-4" />
              Submit a Ticket
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pageData.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() =>
                  router.push(`/${locale}/customer/tickets/${ticket.id}`)
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-secondary)",
              }}
            >
              Previous
            </button>
            <span
              className="text-sm"
              style={{ color: "var(--portal-text-secondary)" }}
            >
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-secondary)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
