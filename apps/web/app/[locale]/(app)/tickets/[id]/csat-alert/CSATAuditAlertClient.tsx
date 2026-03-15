"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  FileWarning,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Settings,
  Star,
  ExternalLink,
} from "lucide-react";
import { useCSATDashboardData } from "@/lib/data/useCSATData";
import { auditTemplates } from "@uniflo/mock-data";
import type {
  CSATAlert,
  CSATLowScoreEntry,
  CSATTrendPoint,
  AuditTemplate,
} from "@uniflo/mock-data";
import { PageHeader } from "@uniflo/ui";
import { CSATTrendChart } from "@/components/csat/CSATTrendChart";

export default function CSATAuditAlertClient() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const { alerts: csatAlerts, lowScores: csatLowScoreEntries, trend: csatTrendData } = useCSATDashboardData();

  const alert = useMemo(
    () =>
      csatAlerts.find((a) => a.status === "active") ?? null,
    [csatAlerts]
  );

  const contributingTickets = useMemo(() => {
    if (!alert) return [];
    return csatLowScoreEntries.filter((e) =>
      alert.contributing_ticket_ids.includes(e.ticket_id)
    );
  }, [alert, csatLowScoreEntries]);

  const trendData = csatTrendData;
  const templates = auditTemplates as AuditTemplate[];

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]?.id ?? ""
  );
  const [isTriggering, setIsTriggering] = useState(false);
  const [auditTriggered, setAuditTriggered] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  function handleTriggerAudit() {
    if (!selectedTemplate) return;
    setIsTriggering(true);
    setTimeout(() => {
      setIsTriggering(false);
      setAuditTriggered(true);
    }, 1000);
  }

  function handleAcknowledge() {
    setIsAcknowledging(true);
    setTimeout(() => {
      setIsAcknowledging(false);
      setAcknowledged(true);
    }, 600);
  }

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

  if (!alert) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Link
          href={`/${locale}/analytics/csat`}
          className="flex items-center gap-1 text-sm text-[var(--accent-blue)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CSAT Dashboard
        </Link>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-[var(--text-muted)]">
            No active CSAT alerts found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <Link
        href={`/${locale}/analytics/csat`}
        className="flex w-fit items-center gap-1 text-sm text-[var(--accent-blue)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CSAT Dashboard
      </Link>

      {/* Alert Card */}
      <div
        className="rounded-lg border-l-4 p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
          borderLeftColor: "var(--accent-yellow)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(217,119,6,0.1)" }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: "var(--accent-yellow)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              CSAT Score Below Threshold
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {alert.location_name}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Current Avg CSAT
                </p>
                <p className="mt-0.5">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {alert.current_avg_score.toFixed(1)}
                  </span>
                  <span
                    className="ml-1 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    / 5.0
                  </span>
                  <span
                    className="ml-2 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    (was {alert.previous_avg_score.toFixed(1)})
                  </span>
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Threshold
                </p>
                <p
                  className="mt-0.5 text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {alert.threshold.toFixed(1)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Period
                </p>
                <p
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Last{" "}
                  {alert.period === "7d"
                    ? "7 days"
                    : alert.period === "30d"
                      ? "30 days"
                      : "90 days"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Triggered
                </p>
                <p
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date(alert.triggered_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing Tickets */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Contributing Tickets
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Recent low-scoring tickets at this location
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b text-left text-xs font-medium"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-muted)",
                }}
              >
                <th className="px-4 py-2.5">Ticket</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {contributingTickets.map((entry) => (
                <tr
                  key={entry.ticket_id}
                  className="border-b"
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
              {contributingTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No contributing tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Mini-Chart */}
      <CSATTrendChart
        data={trendData}
        height={200}
        showThreshold
        thresholdValue={alert.threshold}
      />

      {/* Recommended Actions */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recommended Actions
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
          {/* Trigger Audit */}
          <div
            className="flex items-start gap-4 border-l-4 p-4"
            style={{
              borderLeftColor: "var(--accent-blue)",
              borderBottomColor: "var(--border-default)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(88,166,255,0.1)" }}
            >
              <ClipboardCheck
                className="h-5 w-5"
                style={{ color: "var(--accent-blue)" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Trigger Audit
              </h3>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Launch a targeted audit at {alert.location_name}
              </p>
              {!auditTriggered && (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="h-8 rounded-sm border px-2 text-xs"
                    style={{
                      backgroundColor: "var(--bg-primary, var(--bg-secondary))",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTriggerAudit}
                    disabled={isTriggering}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--accent-blue)" }}
                  >
                    {isTriggering && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Trigger Audit
                  </button>
                </div>
              )}
              {auditTriggered && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: "var(--accent-green)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-green)" }}
                  >
                    Audit Scheduled
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Create CAPA */}
          <div
            className="flex items-start gap-4 p-4"
            style={{ borderBottomColor: "var(--border-default)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(217,119,6,0.1)" }}
            >
              <FileWarning
                className="h-5 w-5"
                style={{ color: "var(--accent-yellow)" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Create CAPA
              </h3>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Open a CAPA investigation for this location
              </p>
              <button
                onClick={() => router.push(`/${locale}/capa`)}
                className="mt-3 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                Create CAPA
              </button>
            </div>
          </div>

          {/* Acknowledge */}
          <div className="flex items-start gap-4 p-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(107,114,128,0.1)" }}
            >
              <CheckCircle2
                className="h-5 w-5"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Acknowledge
              </h3>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Mark as reviewed, no immediate action needed
              </p>
              {!acknowledged ? (
                <button
                  onClick={handleAcknowledge}
                  disabled={isAcknowledging}
                  className="mt-3 flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)] disabled:opacity-60"
                  style={{
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  {isAcknowledging && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  Acknowledge
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: "var(--accent-green)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-green)" }}
                  >
                    Acknowledged
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Automation Status */}
      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Automation Status
            </h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Rule: &ldquo;Low CSAT → Trigger Audit&rdquo; &middot; Status:{" "}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "rgba(52,211,153,0.1)",
                  color: "var(--accent-green)",
                }}
              >
                Active
              </span>
            </p>
          </div>
          <Link
            href={`/${locale}/workflow`}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--accent-blue)" }}
          >
            <Settings className="h-3.5 w-3.5" />
            Configure Rule
          </Link>
        </div>
      </div>
    </div>
  );
}
