"use client";

import type { RootCauseAnalysis } from "@uniflo/mock-data";

interface RootCauseFormProps {
  analysis?: RootCauseAnalysis;
  rootCause: string;
}

const methodLabels: Record<string, string> = {
  five_why: "5-Why Analysis",
  fishbone: "Fishbone (Ishikawa) Analysis",
  freeform: "Freeform Analysis",
};

const fishboneCategories: Array<{ key: string; label: string }> = [
  { key: "people", label: "People" },
  { key: "process", label: "Process" },
  { key: "equipment", label: "Equipment" },
  { key: "materials", label: "Materials" },
  { key: "environment", label: "Environment" },
  { key: "measurement", label: "Measurement" },
];

export function RootCauseForm({ analysis, rootCause }: RootCauseFormProps) {
  if (!analysis) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Root Cause</h3>
        <p className="text-sm text-[var(--text-primary)]">{rootCause}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Method header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Method</span>
        <span className="text-sm font-medium text-[var(--accent-blue)]">
          {methodLabels[analysis.method] ?? analysis.method}
        </span>
      </div>

      {/* 5-Why */}
      {analysis.method === "five_why" && analysis.whys && (
        <div className="space-y-3">
          {analysis.whys.map((why, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-xs font-medium text-[var(--accent-blue)]">
                {i + 1}
              </div>
              <p className="text-sm text-[var(--text-primary)] pt-0.5">{why}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fishbone */}
      {analysis.method === "fishbone" && analysis.fishbone && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fishboneCategories.map(({ key, label }) => {
            const causes = (analysis.fishbone as Record<string, string[]>)[key];
            if (!causes || causes.length === 0) return null;
            return (
              <div key={key} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  {label}
                </h4>
                <ul className="space-y-1">
                  {causes.map((cause, i) => (
                    <li key={i} className="text-sm text-[var(--text-primary)] flex gap-2">
                      <span className="text-[var(--text-muted)]">&bull;</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Freeform */}
      {analysis.method === "freeform" && analysis.narrative && (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {analysis.narrative}
          </p>
        </div>
      )}

      {/* Conclusion */}
      <div className="rounded-md border-l-2 border-l-[var(--accent-blue)] bg-[var(--accent-blue)]/5 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Conclusion</h4>
        <p className="text-sm font-medium text-[var(--text-primary)]">{analysis.conclusion}</p>
      </div>
    </div>
  );
}
