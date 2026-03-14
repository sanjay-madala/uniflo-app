"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tickets as allTickets, users, audits, capas } from "@uniflo/mock-data";
import type { Ticket, User } from "@uniflo/mock-data";
import { Badge, Button, Avatar, AvatarFallback, Drawer, EmptyState } from "@uniflo/ui";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { StatusChip } from "@/components/tickets/StatusChip";
import { SLABar } from "@/components/tickets/SLABar";
import { AICopilotPanel } from "@/components/tickets/AICopilotPanel";
import { Bot, Paperclip, MessageSquare, Clock, Link2, AlertCircle, FileText, ArrowLeft, UserPlus, XCircle } from "lucide-react";

const NOW = new Date("2026-03-13T12:00:00Z");

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

const categoryLabels: Record<string, string> = {
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  compliance: "Compliance",
  guest_relations: "Guest Relations",
};

function getUser(id: string | null): User | undefined {
  if (!id) return undefined;
  return users.find(u => u.id === id);
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatSLADetail(ticket: Ticket): { text: string; breached: boolean } {
  if (!ticket.sla_breach_at) return { text: "No SLA", breached: false };
  const breach = new Date(ticket.sla_breach_at);
  const diffMs = breach.getTime() - NOW.getTime();
  if (diffMs < 0) {
    const ago = Math.abs(diffMs);
    const hours = Math.floor(ago / 3600000);
    const mins = Math.floor((ago % 3600000) / 60000);
    return { text: `Breached ${hours}h ${mins}m ago`, breached: true };
  }
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { text: `${hours}h ${mins}m remaining`, breached: false };
}

function generateTimeline(ticket: Ticket): Array<{ icon: string; text: string; time: string }> {
  const events: Array<{ icon: string; text: string; time: string }> = [];
  const reporter = getUser(ticket.reporter_id ?? null);
  const assignee = getUser(ticket.assignee_id);
  const created = new Date(ticket.created_at);

  events.push({ icon: "create", text: `Ticket created by ${reporter?.name ?? "System"}`, time: ticket.created_at });

  if (assignee) {
    const t = new Date(created.getTime() + 30 * 60000);
    events.push({ icon: "assign", text: `Assigned to ${assignee.name}`, time: t.toISOString() });
  }

  if (ticket.status === "in_progress" || ticket.status === "resolved" || ticket.status === "closed") {
    const t = new Date(created.getTime() + 2 * 3600000);
    events.push({ icon: "status", text: "Status changed to In Progress", time: t.toISOString() });
  }

  if ((ticket.comments_count ?? 0) > 0) {
    const t = new Date(created.getTime() + 4 * 3600000);
    const commenter = getUser(ticket.assignee_id) ?? getUser(ticket.reporter_id ?? null);
    events.push({ icon: "comment", text: `Comment added by ${commenter?.name ?? "Team member"}`, time: t.toISOString() });
  }

  if (ticket.sla_breach_at && new Date(ticket.sla_breach_at) < NOW) {
    events.push({ icon: "sla", text: "SLA warning triggered", time: ticket.sla_breach_at });
  }

  if (ticket.resolved_at) {
    events.push({ icon: "resolved", text: "Ticket resolved", time: ticket.resolved_at });
  }

  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

const mockComments = [
  { id: "c1", author_id: "usr_002", text: "Assigned to maintenance team. Technician will be on site within 2 hours.", created_at: "2026-03-10T09:15:00Z" },
  { id: "c2", author_id: "usr_004", text: "On site now. Identified faulty compressor seal. Ordering replacement part.", created_at: "2026-03-10T11:30:00Z" },
  { id: "c3", author_id: "usr_001", text: "Escalating to critical priority due to potential food safety risk. All perishables moved to backup unit.", created_at: "2026-03-10T14:00:00Z" },
];

export default function TicketDetailClient() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const tickets = allTickets as Ticket[];
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Ticket not found"
          description={`No ticket with ID "${id}" exists.`}
          action={{ label: "Back to Tickets", onClick: () => window.history.back() }}
        />
      </div>
    );
  }

  const assignee = getUser(ticket.assignee_id);
  const reporter = getUser(ticket.reporter_id ?? null);
  const sla = formatSLADetail(ticket);
  const timeline = generateTimeline(ticket);

  const timelineIcons: Record<string, React.ReactNode> = {
    create: <div className="h-6 w-6 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center"><Clock className="h-3 w-3 text-[var(--accent-blue)]" /></div>,
    assign: <div className="h-6 w-6 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center"><UserPlus className="h-3 w-3 text-[var(--accent-green)]" /></div>,
    status: <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Clock className="h-3 w-3 text-purple-400" /></div>,
    comment: <div className="h-6 w-6 rounded-full bg-[var(--accent-yellow)]/20 flex items-center justify-center"><MessageSquare className="h-3 w-3 text-[var(--accent-yellow)]" /></div>,
    sla: <div className="h-6 w-6 rounded-full bg-[var(--accent-red)]/20 flex items-center justify-center"><AlertCircle className="h-3 w-3 text-[var(--accent-red)]" /></div>,
    resolved: <div className="h-6 w-6 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center"><XCircle className="h-3 w-3 text-[var(--accent-green)]" /></div>,
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/${locale}/tickets/`} className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Tickets
        </Link>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{ticket.id.replace("tkt_", "TKT-").toUpperCase()}</span>
      </div>

      {/* Linked chips */}
      <div className="flex flex-wrap gap-2">
        {ticket.linked_audit_id && (
          <Link href={`/${locale}/audit/${ticket.linked_audit_id}/`}>
            <Badge variant="blue" className="cursor-pointer">
              <Link2 className="h-3 w-3 me-1" />
              Audit: {ticket.linked_audit_id.replace("aud_", "AUD-").toUpperCase()}
            </Badge>
          </Link>
        )}
        {ticket.linked_capa_id && (
          <Link href={`/${locale}/capa/${ticket.linked_capa_id}/`}>
            <Badge variant="warning" className="cursor-pointer">
              <Link2 className="h-3 w-3 me-1" />
              CAPA: {ticket.linked_capa_id.replace("capa_", "CAPA-").toUpperCase()}
            </Badge>
          </Link>
        )}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{ticket.title}</h1>
            {ticket.description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{ticket.description}</p>
            )}
          </div>

          {/* SLA Bar */}
          {ticket.sla_breach_at && (
            <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">SLA Status</span>
                <span className={sla.breached ? "text-sm font-medium text-[var(--accent-red)]" : "text-sm font-medium text-[var(--accent-green)]"}>
                  {sla.text}
                </span>
              </div>
              <SLABar totalTickets={1} breachedCount={sla.breached ? 1 : 0} showCounts={false} />
            </div>
          )}

          {/* Timeline */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Timeline</h2>
            <div className="relative space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="relative flex gap-3 pb-4">
                  {i < timeline.length - 1 && (
                    <div className="absolute start-3 top-6 bottom-0 w-px bg-[var(--border-default)]" />
                  )}
                  <div className="shrink-0">{timelineIcons[event.icon] ?? timelineIcons.create}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{event.text}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                <Paperclip className="inline h-4 w-4 me-1" />
                Attachments ({ticket.attachments.length})
              </h2>
              <div className="space-y-2">
                {ticket.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3"
                  >
                    <FileText className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{att.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{att.type} · {att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              <MessageSquare className="inline h-4 w-4 me-1" />
              Comments
            </h2>
            <div className="space-y-3">
              {mockComments.map(c => {
                const author = getUser(c.author_id);
                return (
                  <div key={c.id} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{author ? getInitials(author.name) : "?"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{author?.name ?? "Unknown"}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.text}</p>
                  </div>
                );
              })}

              {/* Add comment */}
              <div className="space-y-2">
                <textarea
                  className="flex min-h-[80px] w-full rounded-sm border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={!commentText.trim()}
                  onClick={() => setCommentText("")}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Status</p>
              <StatusChip status={ticket.status} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Priority</p>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Assignee</p>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{getInitials(assignee.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[var(--text-primary)]">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
              )}
            </div>
            {reporter && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Reporter</p>
                <span className="text-sm text-[var(--text-primary)]">{reporter.name}</span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Location</p>
              <span className="text-sm text-[var(--text-primary)]">{locationLabels[ticket.location_id] ?? ticket.location_id}</span>
            </div>
            {ticket.category && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Category</p>
                <Badge>{categoryLabels[ticket.category] ?? ticket.category}</Badge>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Created</p>
              <span className="text-xs text-[var(--text-secondary)]">{formatDate(ticket.created_at)}</span>
            </div>
            {ticket.updated_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Updated</p>
                <span className="text-xs text-[var(--text-secondary)]">{formatDate(ticket.updated_at)}</span>
              </div>
            )}
            {ticket.tags && ticket.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {ticket.watchers && ticket.watchers.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Watchers</p>
                <div className="flex -space-x-1">
                  {ticket.watchers.map(wId => {
                    const w = getUser(wId);
                    return w ? (
                      <Avatar key={wId} className="h-6 w-6 border-2 border-[var(--bg-secondary)]">
                        <AvatarFallback className="text-[10px]">{getInitials(w.name)}</AvatarFallback>
                      </Avatar>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button variant="secondary" className="w-full" size="sm">
              <UserPlus className="h-3.5 w-3.5" /> Assign to Me
            </Button>
            <Button variant="destructive" className="w-full" size="sm">
              <XCircle className="h-3.5 w-3.5" /> Close Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* AI Copilot floating button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 end-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-blue)] text-white shadow-lg hover:bg-[var(--accent-blue)]/90 transition-colors"
        aria-label="AI Copilot"
      >
        <Bot className="h-5 w-5" />
      </button>

      <AICopilotPanel open={copilotOpen} onOpenChange={setCopilotOpen} ticketTitle={ticket.title} />
    </div>
  );
}
