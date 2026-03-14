"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Wand2, ExternalLink } from "lucide-react";

interface SOPSourceBadgeProps {
  sopSourceId: string;
  sopSourceName: string;
  variant?: "full" | "compact";
}

export function SOPSourceBadge({ sopSourceId, sopSourceName, variant = "full" }: SOPSourceBadgeProps) {
  const { locale } = useParams<{ locale: string }>();

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-[color-mix(in_srgb,var(--accent-purple)_15%,transparent)] text-[var(--accent-purple)]">
        <Wand2 className="h-3 w-3" />
        From SOP
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md px-4 py-3 bg-[color-mix(in_srgb,var(--accent-purple)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-purple)_30%,transparent)]">
      <Wand2 className="h-4 w-4 shrink-0 text-[var(--accent-purple)]" />
      <span className="text-[13px] text-[var(--text-secondary)]">
        Auto-generated from SOP:{" "}
        <Link
          href={`/${locale}/sop/${sopSourceId}/`}
          className="font-medium text-[var(--accent-purple)] hover:underline"
        >
          {sopSourceName}
        </Link>
      </span>
      <Link
        href={`/${locale}/sop/${sopSourceId}/`}
        className="ml-auto shrink-0 text-[var(--accent-purple)] hover:text-[var(--accent-purple)]/80"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
