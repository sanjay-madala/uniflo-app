"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Badge,
  Checkbox,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Input,
  Textarea,
} from "@uniflo/ui";
import { Zap, Camera, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import type {
  Audit,
  AuditTemplate,
  ProposedTicket,
  ProposedCapa,
  TicketPriority,
  User,
} from "@uniflo/mock-data";

interface AutoTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit: Audit;
  template: AuditTemplate;
  users: User[];
  locationName: string;
  onConfirm: (tickets: ProposedTicket[], capas: ProposedCapa[]) => void;
  onSkip: () => void;
}

const severityToPriority: Record<string, TicketPriority> = {
  critical: "critical",
  major: "high",
  minor: "medium",
  observation: "low",
};

function buildProposedTickets(audit: Audit, locationName: string): ProposedTicket[] {
  const tickets: ProposedTicket[] = [];
  let counter = 0;

  for (const section of audit.sections) {
    for (const item of section.items) {
      if (item.result === "fail" && (item.severity_if_fail === "critical" || item.severity_if_fail === "major" || item.severity_if_fail === "minor")) {
        counter++;
        tickets.push({
          temp_id: `proposed_tkt_${counter}`,
          title: `${item.question} \u2014 ${locationName}`,
          priority: severityToPriority[item.severity_if_fail] ?? "medium",
          category: "compliance",
          assignee_id: audit.auditor_id,
          description: `Auto-created from audit: ${audit.title}\nSection: ${section.title}\nItem: ${item.question}${item.notes ? `\nNotes: ${item.notes}` : ""}`,
          location_id: audit.location_id,
          source_section: section.title,
          source_item: item.question,
          photo_count: item.photo_urls.length,
          tags: ["auto-audit", `audit:${audit.id}`],
        });
      }
    }
  }

  return tickets;
}

function buildProposedCapas(audit: Audit, locationName: string): ProposedCapa[] {
  const capas: ProposedCapa[] = [];
  const sectionFailures = new Map<string, { title: string; items: string[] }>();

  for (const section of audit.sections) {
    const failedItems = section.items.filter(
      (item) => item.result === "fail" && (item.severity_if_fail === "critical" || item.severity_if_fail === "major")
    );
    if (failedItems.length > 0) {
      sectionFailures.set(section.section_id, {
        title: section.title,
        items: failedItems.map((i) => i.question),
      });
    }
  }

  let counter = 0;
  for (const [, failure] of sectionFailures) {
    counter++;
    const dueDate = new Date(audit.completed_at ?? Date.now());
    dueDate.setDate(dueDate.getDate() + 14);

    capas.push({
      temp_id: `proposed_capa_${counter}`,
      title: `${failure.title} remediation \u2014 ${locationName}`,
      root_cause: "To be determined",
      corrective_action: `Immediate remediation of ${failure.items.length} failed item(s) in ${failure.title}`,
      preventive_action: "Review and update related SOPs and training materials",
      owner_id: audit.auditor_id,
      due_date: dueDate.toISOString().split("T")[0],
      source_section: failure.title,
    });
  }

  return capas;
}

export function AutoTicketModal({
  open,
  onOpenChange,
  audit,
  template,
  users,
  locationName,
  onConfirm,
  onSkip,
}: AutoTicketModalProps) {
  const [proposedTickets, setProposedTickets] = useState<ProposedTicket[]>([]);
  const [proposedCapas, setProposedCapas] = useState<ProposedCapa[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [selectedCapaIds, setSelectedCapaIds] = useState<Set<string>>(new Set());
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [staggerReady, setStaggerReady] = useState<Set<number>>(new Set());

  // Build proposals when modal opens
  useEffect(() => {
    if (open) {
      const tickets = buildProposedTickets(audit, locationName);
      const capas = buildProposedCapas(audit, locationName);
      setProposedTickets(tickets);
      setProposedCapas(capas);
      setSelectedTicketIds(new Set(tickets.map((t) => t.temp_id)));
      setSelectedCapaIds(new Set(capas.map((c) => c.temp_id)));
      setExpandedTicketId(null);
      setIsCreating(false);
      setShowSkipConfirm(false);
      setStaggerReady(new Set());

      // Staggered entrance animation
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        const total = tickets.length + capas.length;
        for (let i = 0; i < total; i++) {
          setTimeout(() => {
            setStaggerReady((prev) => new Set([...prev, i]));
          }, 100 + i * 150);
        }
      } else {
        const all = new Set(Array.from({ length: tickets.length + capas.length }, (_, i) => i));
        setStaggerReady(all);
      }
    }
  }, [open, audit, locationName]);

  const totalSelected = selectedTicketIds.size + selectedCapaIds.size;

  function toggleTicket(id: string) {
    setSelectedTicketIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCapa(id: string) {
    setSelectedCapaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateTicketAssignee(ticketId: string, assigneeId: string) {
    setProposedTickets((prev) =>
      prev.map((t) => (t.temp_id === ticketId ? { ...t, assignee_id: assigneeId || null } : t))
    );
  }

  function updateTicketTitle(ticketId: string, title: string) {
    setProposedTickets((prev) =>
      prev.map((t) => (t.temp_id === ticketId ? { ...t, title } : t))
    );
  }

  function updateTicketDescription(ticketId: string, description: string) {
    setProposedTickets((prev) =>
      prev.map((t) => (t.temp_id === ticketId ? { ...t, description } : t))
    );
  }

  async function handleCreate() {
    setIsCreating(true);
    // Simulate creation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedTickets = proposedTickets.filter((t) => selectedTicketIds.has(t.temp_id));
    const selectedCapaList = proposedCapas.filter((c) => selectedCapaIds.has(c.temp_id));
    onConfirm(selectedTickets, selectedCapaList);
  }

  function handleSkip() {
    if (!showSkipConfirm) {
      setShowSkipConfirm(true);
      return;
    }
    onSkip();
  }

  function getUserName(id: string | null): string {
    if (!id) return "Auto-assign";
    const user = users.find((u) => u.id === id);
    return user?.name ?? "Unknown";
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setShowSkipConfirm(true);
          return;
        }
        onOpenChange(v);
      }}
      size="lg"
      title=""
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            {totalSelected} action{totalSelected !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            {showSkipConfirm ? (
              <>
                <span className="text-xs text-[var(--text-secondary)]">Skip all actions?</span>
                <Button variant="ghost" size="sm" onClick={() => setShowSkipConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={onSkip}>
                  Skip
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleSkip}>
                  Skip All
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={totalSelected === 0 || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Selected Actions"}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto -mx-6 px-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-blue)]/10">
            <Zap className="h-4 w-4 text-[var(--accent-blue)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Auto-Actions from Audit Failure
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {proposedTickets.length} ticket{proposedTickets.length !== 1 ? "s" : ""} and{" "}
              {proposedCapas.length} CAPA action{proposedCapas.length !== 1 ? "s" : ""} will be created
            </p>
          </div>
        </div>

        {/* Audit Summary Strip */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {audit.title} &mdash; {locationName}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1">
              Score:{" "}
              <span className="font-semibold text-[var(--accent-red)]">
                {audit.score}%
              </span>
              <Badge variant="destructive">FAIL</Badge>
            </span>
            <span>Auditor: {getUserName(audit.auditor_id)}</span>
            {audit.completed_at && (
              <span>
                {new Date(audit.completed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Auto-Created Tickets */}
        {proposedTickets.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Auto-Created Tickets ({proposedTickets.length})
            </h4>
            <div className="space-y-2">
              {proposedTickets.map((ticket, idx) => {
                const isVisible = staggerReady.has(idx);
                const isExpanded = expandedTicketId === ticket.temp_id;

                return (
                  <div
                    key={ticket.temp_id}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 transition-all duration-300"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(8px)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTicketIds.has(ticket.temp_id)}
                        onCheckedChange={() => toggleTicket(ticket.temp_id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {ticket.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <PriorityBadge priority={ticket.priority} />
                          <Badge>Compliance</Badge>
                          <span className="text-xs text-[var(--text-muted)]">
                            Assignee: {getUserName(ticket.assignee_id)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          Source: Section &quot;{ticket.source_section}&quot;
                        </p>
                        {ticket.photo_count > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Camera className="h-3 w-3" />
                            {ticket.photo_count} photo{ticket.photo_count !== 1 ? "s" : ""} attached
                          </div>
                        )}

                        {/* Edit Details toggle */}
                        <button
                          className="mt-2 flex items-center gap-1 text-xs text-[var(--accent-blue)] hover:underline"
                          onClick={() =>
                            setExpandedTicketId(isExpanded ? null : ticket.temp_id)
                          }
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Edit Details
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-3 border-t border-[var(--border-default)] pt-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[var(--text-primary)]">
                                Title
                              </label>
                              <Input
                                value={ticket.title}
                                onChange={(e) =>
                                  updateTicketTitle(ticket.temp_id, e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[var(--text-primary)]">
                                Description
                              </label>
                              <Textarea
                                value={ticket.description}
                                onChange={(e) =>
                                  updateTicketDescription(ticket.temp_id, e.target.value)
                                }
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[var(--text-primary)]">
                                Assignee
                              </label>
                              <Select
                                value={ticket.assignee_id ?? "auto"}
                                onValueChange={(v) =>
                                  updateTicketAssignee(
                                    ticket.temp_id,
                                    v === "auto" ? "" : v
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">Auto-assign</SelectItem>
                                  {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      {u.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Auto-Created CAPAs */}
        {proposedCapas.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Auto-Created CAPA Actions ({proposedCapas.length})
            </h4>
            <div className="space-y-2">
              {proposedCapas.map((capa, idx) => {
                const staggerIdx = proposedTickets.length + idx;
                const isVisible = staggerReady.has(staggerIdx);

                return (
                  <div
                    key={capa.temp_id}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 transition-all duration-300"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(8px)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedCapaIds.has(capa.temp_id)}
                        onCheckedChange={() => toggleCapa(capa.temp_id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {capa.title}
                        </p>
                        <div className="mt-1.5 space-y-1">
                          <p className="text-xs text-[var(--text-secondary)]">
                            <span className="text-[var(--text-muted)]">Root Cause:</span>{" "}
                            {capa.root_cause}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            <span className="text-[var(--text-muted)]">Corrective:</span>{" "}
                            {capa.corrective_action}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            <span className="text-[var(--text-muted)]">Owner:</span>{" "}
                            {getUserName(capa.owner_id)}
                            <span className="ms-3 text-[var(--text-muted)]">Due:</span>{" "}
                            {new Date(capa.due_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skip confirmation inline warning */}
        {showSkipConfirm && (
          <div className="rounded-lg border border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--accent-yellow)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)]">
              Skipping will record the audit but no follow-up tickets or CAPA actions will be created.
              You can always create them manually later.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
