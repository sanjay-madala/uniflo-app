"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { audits, auditTemplates, users } from "@uniflo/mock-data";
import type { Audit, AuditTemplate, AuditSeverity } from "@uniflo/mock-data";
import {
  BreadcrumbBar,
  Button,
  Badge,
  Card,
  KPICard,
} from "@uniflo/ui";
import { Download, Share2, ArrowLeft, Camera } from "lucide-react";
import { AuditScoreRing } from "@/components/audit/AuditScoreRing";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

function getUserName(id: string): string {
  const u = users.find((u) => u.id === id);
  return u?.name ?? "Unknown";
}

const severityLabel: Record<AuditSeverity, string> = {
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  observation: "Observation",
};

const severityOrder: Record<AuditSeverity, number> = {
  critical: 0,
  major: 1,
  minor: 2,
  observation: 3,
};

const severityBadgeVariant: Record<AuditSeverity, "destructive" | "warning" | "blue" | "default"> = {
  critical: "destructive",
  major: "warning",
  minor: "blue",
  observation: "default",
};

export default function AuditResultsClient() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  const audit = (audits as Audit[]).find((a) => a.id === id);
  const template = audit
    ? (auditTemplates as AuditTemplate[]).find((t) => t.id === audit.template_id)
    : null;

  if (!audit || audit.score === null) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-[var(--text-secondary)]">Audit results not available.</p>
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
  const actionsCreated = audit.auto_created_ticket_ids.length + audit.auto_created_capa_ids.length;

  // Gather all failed items grouped by severity
  const failedItemsBySection = useMemo(() => {
    const failures: Array<{
      itemId: string;
      question: string;
      section: string;
      severity: AuditSeverity;
      notes?: string;
      photoCount: number;
      autoTicketId?: string;
    }> = [];

    for (const section of audit.sections) {
      for (const item of section.items) {
        if (item.result === "fail") {
          failures.push({
            itemId: item.item_id,
            question: item.question,
            section: section.title,
            severity: item.severity_if_fail,
            notes: item.notes,
            photoCount: item.photo_urls.length,
            autoTicketId: item.auto_ticket_id,
          });
        }
      }
    }

    failures.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return failures;
  }, [audit.sections]);

  // Group failures by severity
  const failuresBySeverity = useMemo(() => {
    const groups = new Map<AuditSeverity, typeof failedItemsBySection>();
    for (const f of failedItemsBySection) {
      if (!groups.has(f.severity)) groups.set(f.severity, []);
      groups.get(f.severity)!.push(f);
    }
    return groups;
  }, [failedItemsBySection]);

  function toggleFinding(itemId: string) {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const dateStr = audit.completed_at || audit.started_at || "";
  const dateLabel = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col gap-6 p-6">
      <BreadcrumbBar
        items={[
          { label: "Audits", href: `/${locale}/audit/` },
          { label: `AUD-${id.replace("aud_", "")}`, href: `/${locale}/audit/${id}/` },
          { label: "Results" },
        ]}
      />

      {/* Score Hero Card */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <AuditScoreRing
            score={audit.score}
            pass={audit.pass ?? false}
            size={160}
          />
          <div className="space-y-1 text-center sm:text-start">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {audit.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {locationLabels[audit.location_id] ?? audit.location_id} &mdash; {dateLabel}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Auditor: {getUserName(audit.auditor_id)}
            </p>
            {template && (
              <p className="text-xs text-[var(--text-muted)]">
                Threshold: {template.pass_threshold}%
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard title="Passed" value={passedItems} unit="items" color="var(--accent-green)" />
        <KPICard title="Failed" value={failedItems} unit="items" color="var(--accent-red)" />
        <KPICard title="N/A" value={naItems} unit="items" />
        <KPICard title="Actions" value={actionsCreated} unit="created" color="var(--accent-blue)" />
      </div>

      {/* Section Breakdown Bars */}
      {hasSections && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Section Breakdown
          </h3>
          <div className="space-y-3">
            {audit.sections.map((section, idx) => {
              const barColor =
                section.score >= 80
                  ? "var(--accent-green)"
                  : section.score >= 60
                  ? "var(--accent-yellow)"
                  : "var(--accent-red)";

              return (
                <div key={section.section_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-primary)]">{section.title}</span>
                    <span className="text-sm font-semibold" style={{ color: barColor }}>
                      {section.score}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${section.score}%`,
                        backgroundColor: barColor,
                        transitionDelay: `${idx * 200}ms`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {section.passed_items} passed, {section.failed_items} failed
                    {section.na_items > 0 ? `, ${section.na_items} N/A` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Findings List */}
      {failedItemsBySection.length > 0 && (
        <div className="space-y-4">
          {Array.from(failuresBySeverity.entries()).map(([severity, findings]) => (
            <div key={severity}>
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Badge variant={severityBadgeVariant[severity]}>
                  {severityLabel[severity]}
                </Badge>
                <span>Findings ({findings.length})</span>
              </h3>
              <div className="space-y-2">
                {findings.map((finding) => (
                  <Card key={finding.itemId} className="p-3">
                    <button
                      className="flex w-full items-start gap-2 text-start"
                      onClick={() => toggleFinding(finding.itemId)}
                    >
                      <span className="text-[var(--accent-red)] mt-0.5">&#10005;</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {finding.question}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Section: {finding.section}
                        </p>

                        {expandedFindings.has(finding.itemId) && (
                          <div className="mt-2 space-y-2">
                            {finding.notes && (
                              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded p-2">
                                {finding.notes}
                              </p>
                            )}
                            {finding.photoCount > 0 && (
                              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {finding.photoCount} photo{finding.photoCount !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {finding.autoTicketId && (
                            <Link
                              href={`/${locale}/tickets/${finding.autoTicketId}/`}
                              className="text-xs text-[var(--accent-blue)] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              &rarr; Ticket: {finding.autoTicketId.replace("tkt_", "TKT-")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4" /> Share Results
        </Button>
        <Link href={`/${locale}/audit/`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Back to Audits
          </Button>
        </Link>
      </div>
    </div>
  );
}
