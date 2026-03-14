"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { capas as allCapas, users } from "@uniflo/mock-data";
import type { CAPA } from "@uniflo/mock-data";
import { PageHeader, Button } from "@uniflo/ui";
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { CAPAStatusTimeline } from "@/components/capa/CAPAStatusTimeline";
import { EffectivenessForm } from "@/components/capa/EffectivenessForm";

export default function EffectivenessReviewPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();

  const capa = useMemo(() => (allCapas as CAPA[]).find(c => c.id === id), [id]);

  if (!capa) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-lg text-[var(--text-primary)]">CAPA not found</p>
        <Link href={`/${locale}/capa/`}>
          <Button variant="secondary">Back to CAPA List</Button>
        </Link>
      </div>
    );
  }

  const hasReview = !!capa.effectiveness_review;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/${locale}/capa/`}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CAPA
        </Link>
        <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
        <Link
          href={`/${locale}/capa/${capa.id}/`}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {capa.id.replace("capa_", "CAPA-")}
        </Link>
        <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
        <span className="text-[var(--text-primary)] font-medium">Effectiveness Review</span>
      </div>

      <PageHeader
        title="Effectiveness Review"
        subtitle={`${capa.id.replace("capa_", "CAPA-")}: ${capa.title}`}
        className="px-0 py-0 border-0"
      />

      {/* Review status banner */}
      <div className={`flex items-center gap-3 rounded-md border p-4 ${
        hasReview
          ? capa.effectiveness_review?.effective
            ? "border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10"
            : "border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10"
          : "border-[var(--border-default)] bg-[var(--bg-secondary)]"
      }`}>
        {hasReview ? (
          capa.effectiveness_review?.effective ? (
            <CheckCircle className="h-5 w-5 text-[var(--accent-green)]" />
          ) : (
            <XCircle className="h-5 w-5 text-[var(--accent-red)]" />
          )
        ) : (
          <Clock className="h-5 w-5 text-[var(--text-muted)]" />
        )}
        <span className={`text-sm font-medium ${
          hasReview
            ? capa.effectiveness_review?.effective
              ? "text-[var(--accent-green)]"
              : "text-[var(--accent-red)]"
            : "text-[var(--text-secondary)]"
        }`}>
          {hasReview
            ? capa.effectiveness_review?.effective
              ? "Completed: Effective"
              : "Completed: Not Effective"
            : "Not Started"
          }
        </span>
      </div>

      {/* Status timeline */}
      <CAPAStatusTimeline
        status={capa.status}
        variant="full"
        dates={{
          opened_at: capa.created_at,
          in_progress_at: capa.updated_at,
          verified_at: capa.status === "verified" || capa.status === "closed" ? capa.updated_at : undefined,
          closed_at: capa.closed_at ?? undefined,
        }}
      />

      {/* Review form */}
      <div className="mx-auto w-full max-w-[720px]">
        <EffectivenessForm
          existingReview={capa.effectiveness_review}
          users={users}
        />
      </div>
    </div>
  );
}
