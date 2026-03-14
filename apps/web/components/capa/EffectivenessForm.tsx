"use client";

import { useState } from "react";
import { Button, Checkbox, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, ConfirmDialog } from "@uniflo/ui";
import { CheckCircle, XCircle } from "lucide-react";
import type { CAPAEffectivenessReview, User } from "@uniflo/mock-data";

const DEFAULT_CRITERIA = [
  "Root cause was correctly identified and documented",
  "Corrective action was fully implemented as planned",
  "Preventive action prevents recurrence of the issue",
  "No similar issues have been reported since implementation",
  "Related SOPs have been updated to reflect changes",
];

interface EffectivenessFormProps {
  existingReview?: CAPAEffectivenessReview;
  users: User[];
  onSubmit?: (review: Omit<CAPAEffectivenessReview, "id" | "reviewed_at">) => void;
}

export function EffectivenessForm({ existingReview, users, onSubmit }: EffectivenessFormProps) {
  const [reviewerId, setReviewerId] = useState(existingReview?.reviewer_id ?? "");
  const [criteria, setCriteria] = useState<Array<{ label: string; met: boolean; comment: string }>>(
    existingReview?.criteria.map(c => ({ label: c.label, met: c.met, comment: c.comment ?? "" }))
      ?? DEFAULT_CRITERIA.map(c => ({ label: c, met: false, comment: "" }))
  );
  const [effective, setEffective] = useState<boolean | null>(existingReview?.effective ?? null);
  const [signOffComment, setSignOffComment] = useState(existingReview?.sign_off_comment ?? "");
  const [followUpRequired, setFollowUpRequired] = useState(existingReview?.follow_up_required ?? false);
  const [submitted, setSubmitted] = useState(!!existingReview);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isReadOnly = submitted;
  const canSubmit = reviewerId && effective !== null;

  function handleCriterionToggle(index: number) {
    if (isReadOnly) return;
    setCriteria(prev => prev.map((c, i) => i === index ? { ...c, met: !c.met } : c));
  }

  function handleCriterionComment(index: number, comment: string) {
    if (isReadOnly) return;
    setCriteria(prev => prev.map((c, i) => i === index ? { ...c, comment } : c));
  }

  function handleSubmit() {
    setSubmitted(true);
    setConfirmOpen(false);
    onSubmit?.({
      reviewer_id: reviewerId,
      effective: effective!,
      criteria: criteria.map(c => ({ label: c.label, met: c.met, comment: c.comment || undefined })),
      follow_up_required: followUpRequired,
      follow_up_capa_id: null,
      sign_off_comment: signOffComment || undefined,
    });
  }

  // Not started state
  if (!existingReview && !submitted) {
    return (
      <div className="space-y-6">
        {/* Reviewer */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Reviewer *</label>
          <Select value={reviewerId} onValueChange={setReviewerId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select reviewer" /></SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Criteria */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Effectiveness Criteria
          </h3>
          {criteria.map((criterion, i) => (
            <div key={i} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={criterion.met}
                  onCheckedChange={() => handleCriterionToggle(i)}
                  className="mt-0.5"
                />
                <span className="text-sm text-[var(--text-primary)]">{criterion.label}</span>
              </div>
              <Textarea
                value={criterion.comment}
                onChange={e => handleCriterionComment(i, e.target.value)}
                placeholder="Optional comment..."
                rows={1}
                className="text-xs"
              />
            </div>
          ))}
        </div>

        {/* Assessment */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Overall Assessment *
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setEffective(true); setFollowUpRequired(false); }}
              className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors ${
                effective === true
                  ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                  : "border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <CheckCircle className={`h-5 w-5 ${effective === true ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`} />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Effective</p>
                <p className="text-xs text-[var(--text-secondary)]">CAPA can be closed</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setEffective(false); setFollowUpRequired(true); }}
              className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors ${
                effective === false
                  ? "border-[var(--accent-red)] bg-[var(--accent-red)]/10"
                  : "border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <XCircle className={`h-5 w-5 ${effective === false ? "text-[var(--accent-red)]" : "text-[var(--text-muted)]"}`} />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Not Effective</p>
                <p className="text-xs text-[var(--text-secondary)]">Follow-up CAPA required</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sign-off comment */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Sign-off Comment</label>
          <Textarea
            value={signOffComment}
            onChange={e => setSignOffComment(e.target.value)}
            placeholder="Additional notes for the review record..."
            rows={3}
          />
        </div>

        {/* Follow-up (if not effective) */}
        {effective === false && (
          <div className="flex items-center gap-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
            <Checkbox checked={followUpRequired} onCheckedChange={(checked: boolean) => setFollowUpRequired(checked)} />
            <span className="text-sm text-[var(--text-primary)]">Create follow-up CAPA automatically</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSubmit}
          >
            Submit Review
          </Button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Submit Effectiveness Review?"
          description="This action cannot be undone. The review will be recorded permanently."
          confirmLabel="Submit Review"
          onConfirm={handleSubmit}
        />
      </div>
    );
  }

  // Submitted / read-only state
  const reviewer = users.find(u => u.id === reviewerId);
  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-md border p-4 ${
          effective
            ? "border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10"
            : "border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10"
        }`}
      >
        {effective ? (
          <CheckCircle className="h-5 w-5 text-[var(--accent-green)]" />
        ) : (
          <XCircle className="h-5 w-5 text-[var(--accent-red)]" />
        )}
        <div>
          <p className={`text-sm font-semibold ${effective ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
            {effective ? "Effective" : "Not Effective"}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Reviewed by {reviewer?.name ?? reviewerId}
            {existingReview?.reviewed_at && ` on ${new Date(existingReview.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </p>
        </div>
      </div>

      {/* Criteria results */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Criteria</h3>
        {criteria.map((c, i) => (
          <div key={i} className="flex items-start gap-3 py-1">
            {c.met ? (
              <CheckCircle className="h-4 w-4 text-[var(--accent-green)] shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-[var(--accent-red)] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm text-[var(--text-primary)]">{c.label}</p>
              {c.comment && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.comment}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Sign-off comment */}
      {signOffComment && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Sign-off Comment</h3>
          <p className="text-sm text-[var(--text-primary)]">{signOffComment}</p>
        </div>
      )}
    </div>
  );
}
