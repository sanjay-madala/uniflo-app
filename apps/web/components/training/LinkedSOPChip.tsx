"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";

interface LinkedSOPChipProps {
  sopId: string;
  sopTitle: string;
  sopVersion?: string | null;
}

export function LinkedSOPChip({ sopId, sopTitle, sopVersion }: LinkedSOPChipProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Link
      href={`/${locale}/sops/${sopId}/`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border transition-colors hover:border-[var(--accent-blue)]"
      style={{
        borderColor: "var(--border-default)",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--accent-blue)",
      }}
    >
      <FileText className="h-3 w-3" />
      <span className="truncate max-w-[160px]">{sopTitle}</span>
      {sopVersion && (
        <span style={{ color: "var(--text-muted)" }}>v{sopVersion}</span>
      )}
    </Link>
  );
}
