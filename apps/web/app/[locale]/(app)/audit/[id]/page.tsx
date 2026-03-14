"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { audits, auditTemplates, users } from "@uniflo/mock-data";
import type { Audit, AuditTemplate } from "@uniflo/mock-data";
import { PageHeader, Button, Badge, Card, BreadcrumbBar } from "@uniflo/ui";
import { FileText, Play, BarChart3, Download } from "lucide-react";
import { AuditStatusChip } from "@/components/audit/AuditStatusChip";
import { AuditScoreRing } from "@/components/audit/AuditScoreRing";
import { AuditSectionAccordion } from "@/components/audit/AuditSectionAccordion";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

function getUserName(id: string): string {
  const u = users.find((u) => u.id === id);
  return u?.name ?? "Unknown";
}

export default function AuditDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const audit = (audits as Audit[]).find((a) => a.id === id);
  const template = audit
    ? (auditTemplates as AuditTemplate[]).find((t) => t.id === audit.template_id)
    : null;

  if (!audit) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-[var(--text-secondary)]">Audit not found.</p>
      </div>
    );
  }

  const hasSections = audit.sections.length > 0;
  const totalItems = hasSections
    ? audit.sections.reduce((sum, s) => sum + s.total_items, 0)
    : 0;
  const passedItems = hasSections
    ? audit.sections.reduce((sum, s) => sum + s.passed_items, 0)
    : 0;
  const failedItems = hasSections
    ? audit.sections.reduce((sum, s) => sum + s.failed_items, 0)
    : 0;
  const naItems = hasSections
    ? audit.sections.reduce((sum, s) => sum + s.na_items, 0)
    : 0;

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function toggleItem(itemId: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const dateStr = audit.completed_at || audit.started_at || audit.scheduled_at;
  const dateLabel = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "\u2014";

  return (
    <div className="flex flex-col gap-4 p-6">
      <BreadcrumbBar
        items={[
          { label: "Audits", href: `/${locale}/audit/` },
          { label: `AUD-${id.replace("aud_", "")}` },
        ]}
      />

      {/* Linked badges */}
      {(audit.auto_created_ticket_ids.length > 0 || audit.auto_created_capa_ids.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {audit.auto_created_ticket_ids.map((tktId) => (
            <Link key={tktId} href={`/${locale}/tickets/${tktId}/`}>
              <Badge variant="blue" className="cursor-pointer hover:opacity-80 transition-opacity">
                Ticket: {tktId.replace("tkt_", "TKT-")}
              </Badge>
            </Link>
          ))}
          {audit.auto_created_capa_ids.map((capaId) => (
            <Link key={capaId} href={`/${locale}/capa/${capaId}/`}>
              <Badge variant="warning" className="cursor-pointer hover:opacity-80 transition-opacity">
                CAPA: {capaId.replace("capa_", "CAPA-")}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{audit.title}</h1>
            {template && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Template: {template.title} v{template.version}
              </p>
            )}
          </div>

          {/* Score Summary Card */}
          {audit.score !== null && (
            <Card className="p-6">
              <div className="flex items-center gap-6">
                <AuditScoreRing
                  score={audit.score}
                  pass={audit.pass ?? false}
                  size={120}
                />
                <div className="space-y-1">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">{passedItems}</span>{" "}
                    of {totalItems} passed
                  </p>
                  {failedItems > 0 && (
                    <p className="text-sm text-[var(--accent-red)]">
                      {failedItems} failed
                    </p>
                  )}
                  {naItems > 0 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {naItems} N/A
                    </p>
                  )}
                  {template && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Pass threshold: {template.pass_threshold}%
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Section Accordions */}
          {hasSections && (
            <div className="space-y-2">
              {audit.sections.map((section) => (
                <AuditSectionAccordion
                  key={section.section_id}
                  section={section}
                  expanded={expandedSections.has(section.section_id)}
                  onToggle={() => toggleSection(section.section_id)}
                  expandedItems={expandedItems}
                  onToggleItem={toggleItem}
                />
              ))}
            </div>
          )}

          {!hasSections && (audit.status === "scheduled" || audit.status === "in_progress") && (
            <Card className="p-6">
              <p className="text-sm text-[var(--text-secondary)]">
                {audit.status === "scheduled"
                  ? "This audit has not been started yet. Click \"Conduct Audit\" to begin."
                  : "This audit is in progress. Resume by clicking \"Conduct Audit\"."}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Status
              </p>
              <AuditStatusChip status={audit.status} />
            </div>

            {audit.score !== null && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Score
                </p>
                <p className="text-sm text-[var(--text-primary)]">
                  {audit.score}%
                  {template && (
                    <span className="text-[var(--text-muted)]">
                      {" "}(threshold: {template.pass_threshold}%)
                    </span>
                  )}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Auditor
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                {getUserName(audit.auditor_id)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Location
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                {locationLabels[audit.location_id] ?? audit.location_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {audit.completed_at ? "Conducted" : audit.started_at ? "Started" : "Scheduled"}
              </p>
              <p className="text-sm text-[var(--text-primary)]">{dateLabel}</p>
            </div>

            {template && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Template
                </p>
                <p className="text-sm text-[var(--text-primary)]">
                  {template.title} v{template.version}
                </p>
              </div>
            )}

            {audit.findings.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Findings
                </p>
                <ul className="space-y-1">
                  {audit.findings.map((f, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)]">
                      &bull; {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            {(audit.status === "scheduled" || audit.status === "in_progress") && (
              <Link href={`/${locale}/audit/${audit.id}/conduct/`} className="block">
                <Button className="w-full">
                  <Play className="h-4 w-4" /> Conduct Audit
                </Button>
              </Link>
            )}
            {(audit.status === "completed" || audit.status === "failed") && (
              <Link href={`/${locale}/audit/${audit.id}/results/`} className="block">
                <Button variant="secondary" className="w-full">
                  <BarChart3 className="h-4 w-4" /> View Results
                </Button>
              </Link>
            )}
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
