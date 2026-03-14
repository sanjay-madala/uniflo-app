"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LocationReceiptSummary, ReadReceipt } from "@uniflo/mock-data";
import { TableRow, TableCell } from "@uniflo/ui";

const statusConfig: Record<string, { label: string; color: string }> = {
  acknowledged: { label: "Acknowledged", color: "var(--accent-green)" },
  read: { label: "Read", color: "var(--accent-blue)" },
  delivered: { label: "Delivered", color: "var(--accent-yellow)" },
  undelivered: { label: "Undelivered", color: "var(--text-muted)" },
};

interface ReadReceiptRowProps {
  summary: LocationReceiptSummary;
  receipts: ReadReceipt[];
  showAck: boolean;
}

export function ReadReceiptRow({ summary, receipts, showAck }: ReadReceiptRowProps) {
  const [expanded, setExpanded] = useState(false);

  const complianceColor =
    summary.compliance_pct >= 90
      ? "var(--accent-green)"
      : summary.compliance_pct >= 70
        ? "var(--accent-yellow)"
        : "var(--accent-red)";

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
            )}
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {summary.location_name}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-sm text-[var(--text-secondary)]">
          {summary.region_name} &gt; {summary.zone_name}
        </TableCell>
        <TableCell className="text-sm text-[var(--text-secondary)]">{summary.total_staff}</TableCell>
        <TableCell className="text-sm text-[var(--text-secondary)]">{summary.delivered}</TableCell>
        <TableCell className="text-sm text-[var(--text-secondary)]">{summary.read}</TableCell>
        {showAck && (
          <TableCell className="text-sm text-[var(--text-secondary)]">{summary.acknowledged}</TableCell>
        )}
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${summary.compliance_pct}%`,
                  backgroundColor: complianceColor,
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: complianceColor }}>
              {summary.compliance_pct.toFixed(0)}%
            </span>
          </div>
        </TableCell>
      </TableRow>
      {expanded && receipts.length > 0 && (
        <TableRow>
          <TableCell colSpan={showAck ? 7 : 6} className="p-0">
            <div className="bg-[var(--bg-tertiary)] px-8 py-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[var(--text-muted)]">
                    <th className="text-left py-1 font-medium">Staff Member</th>
                    <th className="text-left py-1 font-medium">Role</th>
                    <th className="text-left py-1 font-medium">Status</th>
                    <th className="text-left py-1 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => {
                    const cfg = statusConfig[receipt.status];
                    const when = receipt.acknowledged_at ?? receipt.read_at ?? receipt.delivered_at;
                    return (
                      <tr key={receipt.id} className="border-t border-[var(--border-default)]">
                        <td className="py-1.5 text-[var(--text-primary)]">{receipt.user_name}</td>
                        <td className="py-1.5 text-[var(--text-secondary)]">{receipt.user_role}</td>
                        <td className="py-1.5">
                          <span
                            className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${cfg.color} 15%, transparent)`,
                              color: cfg.color,
                            }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-1.5 text-[var(--text-muted)]">
                          {when
                            ? new Date(when).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
