"use client";

import { GraduationCap } from "lucide-react";
import type { TrainingCertificate } from "@uniflo/mock-data";

interface CertificateDownloadProps {
  certificate: TrainingCertificate;
}

export function CertificateDownload({ certificate }: CertificateDownloadProps) {
  return (
    <div
      className="max-w-[600px] mx-auto rounded-sm overflow-hidden"
      style={{
        border: "2px solid",
        borderImage: "linear-gradient(135deg, #D4A948, #F0D68A) 1",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <div
        className="p-12 flex flex-col items-center text-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Logo placeholder */}
        <div className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-6">
          UNIFLO TRAINING
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
          Certificate of Completion
        </h1>

        {/* Decorative rule */}
        <div className="flex items-center gap-2 w-48 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-default)" }} />
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: "#D4A948" }} />
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-default)" }} />
        </div>

        {/* Awarded to */}
        <p className="text-xs text-[var(--text-secondary)] mb-1">Awarded to:</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          {certificate.user_name}
        </p>

        {/* For completing */}
        <p className="text-xs text-[var(--text-secondary)] mb-1">For completing:</p>
        <p className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {certificate.module_title}
        </p>

        {/* Score */}
        {certificate.score > 0 && (
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-sm text-sm font-semibold mb-4"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "var(--accent-green)",
            }}
          >
            Score: {certificate.score}%
          </div>
        )}

        {/* Date */}
        <p className="text-sm text-[var(--text-primary)] mb-1">
          {new Date(certificate.issued_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {/* Certificate number */}
        <p className="text-xs font-mono text-[var(--text-muted)] mb-6">
          {certificate.certificate_number}
        </p>

        {/* Icon */}
        <GraduationCap className="h-12 w-12" style={{ color: "var(--accent-blue)" }} />
      </div>
    </div>
  );
}
