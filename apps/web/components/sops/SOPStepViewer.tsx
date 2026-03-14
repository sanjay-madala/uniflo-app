"use client";

import { useState } from "react";
import { Badge, Checkbox } from "@uniflo/ui";
import type { SOPStep } from "@uniflo/mock-data";
import { StepTypeIcon, getStepTypeLabel } from "./StepTypeIcon";
import { ArrowRight, Paperclip, FileText, Image, Video, File } from "lucide-react";

interface SOPStepViewerProps {
  step: SOPStep;
  stepNumber: number;
  totalSteps: number;
  onBranchClick?: (stepId: string) => void;
  highlightedStepId?: string | null;
}

function AttachmentIcon({ type }: { type: string }) {
  switch (type) {
    case "pdf": return <FileText className="h-3.5 w-3.5" />;
    case "image": return <Image className="h-3.5 w-3.5" />;
    case "video": return <Video className="h-3.5 w-3.5" />;
    default: return <File className="h-3.5 w-3.5" />;
  }
}

export function SOPStepViewer({ step, stepNumber, totalSteps, onBranchClick, highlightedStepId }: SOPStepViewerProps) {
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const isHighlighted = highlightedStepId === step.id;

  function toggleChecklistItem(index: number) {
    setChecklistState(prev => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <div
      id={`step-${step.id}`}
      className={`rounded-lg border bg-[var(--bg-secondary)] p-5 transition-all ${
        isHighlighted
          ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/30"
          : "border-[var(--border-default)]"
      }`}
    >
      {/* Step header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-xs font-semibold text-[var(--accent-blue)]">
            {stepNumber}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Step {stepNumber} of {totalSteps}: {step.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <StepTypeIcon type={step.type} className="h-3 w-3" />
              <span>{getStepTypeLabel(step.type)}</span>
            </div>
          </div>
        </div>
        {step.required && (
          <Badge variant="blue">Required</Badge>
        )}
      </div>

      {/* Step content */}
      <div
        className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)] [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: step.description }}
      />

      {/* Checklist items */}
      {step.type === "checklist" && step.checklist_items && (
        <div className="mt-3 space-y-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
          {step.checklist_items.map((item, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={checklistState[idx] ?? false}
                onCheckedChange={() => toggleChecklistItem(idx)}
              />
              <span className={`text-sm ${checklistState[idx] ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Decision branches */}
      {step.type === "decision" && step.decision_branches && (
        <div className="mt-3 flex flex-wrap gap-2">
          {step.decision_branches.map((branch, idx) => (
            <button
              key={idx}
              onClick={() => onBranchClick?.(branch.goto_step_id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20 transition-colors"
            >
              {branch.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Attachments */}
      {step.attachments && step.attachments.length > 0 && (
        <div className="mt-3 border-t border-[var(--border-default)] pt-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2">
            <Paperclip className="h-3 w-3" />
            Attachments
          </div>
          <div className="flex flex-wrap gap-2">
            {step.attachments.map(att => (
              <a
                key={att.id}
                href={att.url}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <AttachmentIcon type={att.type} />
                <span>{att.name}</span>
                <span className="text-[var(--text-muted)]">({att.size})</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
