"use client";

import { Drawer, Badge } from "@uniflo/ui";
import { ExternalLink } from "lucide-react";

interface AICopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketTitle: string;
}

const mockSuggestions = [
  {
    id: "kb_001",
    title: "Refrigeration Equipment SOP",
    excerpt: "Standard operating procedures for temperature monitoring of refrigeration units, including corrective actions for out-of-range readings.",
    relevanceScore: 0.94,
    category: "Maintenance",
  },
  {
    id: "kb_002",
    title: "Food Safety Compliance Checklist",
    excerpt: "Comprehensive checklist for daily food safety compliance, covering storage temperatures, hygiene standards, and HACCP requirements.",
    relevanceScore: 0.87,
    category: "Compliance",
  },
  {
    id: "kb_003",
    title: "Incident Escalation Protocol",
    excerpt: "Guidelines for escalating critical maintenance issues to senior management, including response time requirements and communication templates.",
    relevanceScore: 0.72,
    category: "Operations",
  },
];

export function AICopilotPanel({ open, onOpenChange, ticketTitle }: AICopilotPanelProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="AI Copilot"
      description={`Suggestions for: "${ticketTitle}"`}
    >
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Knowledge Base Suggestions
        </p>
        {mockSuggestions.map(s => (
          <div
            key={s.id}
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">{s.title}</h4>
              <Badge>{s.category}</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{s.excerpt}</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Relevance</span>
                <span className="font-medium text-[var(--text-primary)]">{Math.round(s.relevanceScore * 100)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--accent-blue)]"
                  style={{ width: `${s.relevanceScore * 100}%` }}
                />
              </div>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-blue)] hover:underline">
              View Article <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
