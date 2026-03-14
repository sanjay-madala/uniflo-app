"use client";

import { GraduationCap } from "lucide-react";
import type { TrainingCertificate } from "@uniflo/mock-data";

interface CertificateBadgeProps {
  certificate: TrainingCertificate;
}

export function CertificateBadge({ certificate }: CertificateBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 group" title={`${certificate.module_title} — Completed ${new Date(certificate.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{
          background: "linear-gradient(135deg, var(--accent-blue), var(--accent-green))",
        }}
      >
        <GraduationCap className="h-8 w-8 text-white" />
      </div>
      <span className="text-xs text-[var(--text-secondary)] text-center truncate w-20">
        {certificate.module_title}
      </span>
    </div>
  );
}
