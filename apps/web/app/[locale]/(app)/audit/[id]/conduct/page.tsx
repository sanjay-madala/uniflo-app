"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  audits,
  auditTemplates,
  users,
} from "@uniflo/mock-data";
import type {
  Audit,
  AuditTemplate,
  AuditTemplateItem,
  AuditItemResultValue,
  ProposedTicket,
  ProposedCapa,
} from "@uniflo/mock-data";
import {
  Button,
  Badge,
  Card,
  Textarea,
  BreadcrumbBar,
  ConfirmDialog,
} from "@uniflo/ui";
import {
  Check,
  X,
  Minus,
  ChevronLeft,
  ChevronRight,
  Camera,
  BookOpen,
  Save,
  LogOut,
} from "lucide-react";
import { AuditProgressBar } from "@/components/audit/AuditProgressBar";
import { AutoTicketModal } from "@/components/audit/AutoTicketModal";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

interface ItemAnswer {
  result: AuditItemResultValue;
  notes: string;
  photos: string[];
}

function computeScore(
  template: AuditTemplate,
  answers: Record<string, ItemAnswer>
): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const section of template.sections) {
    const applicableItems = section.items.filter((item) => {
      const ans = answers[item.id];
      return ans && ans.result !== "na" && ans.result !== "pending";
    });

    if (applicableItems.length === 0) continue;

    const sectionScore =
      applicableItems.filter((item) => answers[item.id]?.result === "pass").length /
      applicableItems.length;

    totalWeight += section.weight;
    weightedScore += sectionScore * section.weight;
  }

  return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
}

export default function AuditConductPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();

  const audit = (audits as Audit[]).find((a) => a.id === id);
  const template = audit
    ? (auditTemplates as AuditTemplate[]).find((t) => t.id === audit.template_id)
    : null;

  // Flatten all items from template
  const allItems = useMemo(() => {
    if (!template) return [];
    return template.sections.flatMap((section) =>
      section.items.map((item) => ({ ...item, sectionTitle: section.title }))
    );
  }, [template]);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ItemAnswer>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAutoTicketModal, setShowAutoTicketModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const currentItem = allItems[currentItemIndex] as (AuditTemplateItem & { sectionTitle: string }) | undefined;
  const currentSection = useMemo(() => {
    if (!template || !currentItem) return null;
    return template.sections.find((s) =>
      s.items.some((i) => i.id === currentItem.id)
    );
  }, [template, currentItem]);

  const sectionIndex = useMemo(() => {
    if (!template || !currentSection) return 0;
    return template.sections.indexOf(currentSection);
  }, [template, currentSection]);

  const runningScore = useMemo(
    () => (template ? computeScore(template, answers) : 0),
    [template, answers]
  );

  const completedCount = Object.values(answers).filter(
    (a) => a.result !== "pending"
  ).length;
  const totalCount = allItems.length;
  const passThreshold = template?.pass_threshold ?? 80;
  const isAboveThreshold = runningScore >= passThreshold;

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [answers]);

  function setAnswer(itemId: string, result: AuditItemResultValue) {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        result,
        notes: prev[itemId]?.notes ?? "",
        photos: prev[itemId]?.photos ?? [],
      },
    }));

    // Auto-advance on pass/na after 400ms
    if (result === "pass" || result === "na") {
      setTimeout(() => {
        if (currentItemIndex < allItems.length - 1) {
          setCurrentItemIndex((i) => i + 1);
        }
      }, 400);
    }
  }

  function setNotes(itemId: string, notes: string) {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        result: prev[itemId]?.result ?? "pending",
        notes,
        photos: prev[itemId]?.photos ?? [],
      },
    }));
  }

  function addMockPhoto(itemId: string) {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        result: prev[itemId]?.result ?? "pending",
        notes: prev[itemId]?.notes ?? "",
        photos: [...(prev[itemId]?.photos ?? []), `/mock/photos/capture_${Date.now()}.jpg`],
      },
    }));
  }

  function handleSubmitAudit() {
    setShowSubmitConfirm(false);

    // Check if there are failures that warrant auto-ticket creation
    const failedItems = allItems.filter(
      (item) =>
        answers[item.id]?.result === "fail" &&
        (item.severity_if_fail === "critical" || item.severity_if_fail === "major")
    );

    if (failedItems.length > 0 && runningScore < passThreshold) {
      setShowAutoTicketModal(true);
    } else {
      router.push(`/${locale}/audit/${id}/results/`);
    }
  }

  function handleAutoTicketConfirm(tickets: ProposedTicket[], capas: ProposedCapa[]) {
    setShowAutoTicketModal(false);
    router.push(`/${locale}/audit/${id}/results/`);
  }

  function handleAutoTicketSkip() {
    setShowAutoTicketModal(false);
    router.push(`/${locale}/audit/${id}/results/`);
  }

  if (!audit || !template) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-[var(--text-secondary)]">Audit or template not found.</p>
      </div>
    );
  }

  const currentAnswer = currentItem ? answers[currentItem.id] : undefined;
  const currentResult = currentAnswer?.result ?? "pending";

  const failedCount = Object.values(answers).filter((a) => a.result === "fail").length;

  // Build a conducted audit object from answers for the AutoTicketModal
  const conductedAudit = useMemo((): Audit => {
    const sections = template.sections.map((section) => {
      const items = section.items.map((item) => {
        const ans = answers[item.id];
        return {
          item_id: item.id,
          question: item.question,
          type: item.type,
          result: (ans?.result ?? "pending") as AuditItemResultValue,
          score: ans?.result === "pass" ? 1 : 0,
          severity_if_fail: item.severity_if_fail,
          notes: ans?.notes,
          photo_urls: ans?.photos ?? [],
        };
      });

      const applicable = items.filter((i) => i.result !== "na" && i.result !== "pending");
      const passed = applicable.filter((i) => i.result === "pass").length;
      const failed = applicable.filter((i) => i.result === "fail").length;
      const na = items.filter((i) => i.result === "na").length;
      const sectionScore = applicable.length > 0 ? Math.round((passed / applicable.length) * 100) : 0;

      return {
        section_id: section.id,
        title: section.title,
        score: sectionScore,
        total_items: items.length,
        passed_items: passed,
        failed_items: failed,
        na_items: na,
        items,
      };
    });

    return {
      ...audit,
      score: runningScore,
      pass: runningScore >= passThreshold,
      status: runningScore >= passThreshold ? "completed" as const : "failed" as const,
      completed_at: new Date().toISOString(),
      sections,
    };
  }, [audit, template, answers, runningScore, passThreshold]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <BreadcrumbBar
        items={[
          { label: "Audits", href: `/${locale}/audit/` },
          { label: `AUD-${id.replace("aud_", "")}`, href: `/${locale}/audit/${id}/` },
          { label: "Conduct" },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Desktop Section Nav */}
        <div className="hidden lg:block w-64 shrink-0 space-y-3">
          <AuditProgressBar
            completedItems={completedCount}
            totalItems={totalCount}
            currentSection={currentSection?.title ?? ""}
            sectionIndex={sectionIndex}
            totalSections={template.sections.length}
          />

          <div className="space-y-1">
            {template.sections.map((section, sIdx) => (
              <div key={section.id}>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const itemAnswer = answers[item.id];
                  const isCurrent = currentItem?.id === item.id;
                  const globalIdx = allItems.findIndex((i) => i.id === item.id);
                  const resultIcon =
                    itemAnswer?.result === "pass" ? (
                      <Check className="h-3 w-3 text-[var(--accent-green)]" />
                    ) : itemAnswer?.result === "fail" ? (
                      <X className="h-3 w-3 text-[var(--accent-red)]" />
                    ) : itemAnswer?.result === "na" ? (
                      <Minus className="h-3 w-3 text-[var(--text-muted)]" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-[var(--border-default)]" />
                    );

                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center gap-2 px-2 py-1.5 text-start text-xs rounded transition-colors ${
                        isCurrent
                          ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-s-2 border-s-[var(--accent-blue)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                      onClick={() => setCurrentItemIndex(globalIdx)}
                    >
                      {resultIcon}
                      <span className="truncate">{item.question}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full text-[var(--text-muted)]"
            onClick={() => setShowExitConfirm(true)}
          >
            <LogOut className="h-4 w-4" /> Exit Audit
          </Button>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-2xl">
          {/* Mobile progress */}
          <div className="lg:hidden mb-4">
            <AuditProgressBar
              completedItems={completedCount}
              totalItems={totalCount}
              currentSection={currentSection?.title ?? ""}
              sectionIndex={sectionIndex}
              totalSections={template.sections.length}
            />
          </div>

          {/* Running Score Banner */}
          <div
            className={`rounded-lg border p-3 mb-4 flex items-center justify-between transition-colors ${
              isAboveThreshold
                ? "border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5"
                : "border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5"
            }`}
          >
            <span className="text-sm text-[var(--text-secondary)]">Running Score</span>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold"
                style={{ color: isAboveThreshold ? "var(--accent-green)" : "var(--accent-red)" }}
              >
                {runningScore}%
              </span>
              <Badge variant={isAboveThreshold ? "success" : "destructive"}>
                {isAboveThreshold ? "PASS" : "FAIL"}
              </Badge>
            </div>
          </div>

          {/* Question Card */}
          {currentItem && (
            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-muted)]">
                  Q{currentItemIndex + 1} of {totalCount}
                </p>

                <h2 className="text-lg font-medium text-[var(--text-primary)]">
                  {currentItem.question}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      currentItem.severity_if_fail === "critical"
                        ? "destructive"
                        : currentItem.severity_if_fail === "major"
                        ? "warning"
                        : "default"
                    }
                  >
                    Severity if fail: {currentItem.severity_if_fail}
                  </Badge>
                  {currentItem.linked_sop_id && (
                    <button className="inline-flex items-center gap-1 text-xs text-[var(--accent-blue)] hover:underline">
                      <BookOpen className="h-3 w-3" /> See SOP
                    </button>
                  )}
                </div>

                {currentItem.help_text && (
                  <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded p-2">
                    {currentItem.help_text}
                  </p>
                )}

                {/* Pass / Fail / NA Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={currentResult === "pass" ? "primary" : "outline"}
                    className={`h-14 text-base ${
                      currentResult === "pass"
                        ? "bg-[var(--accent-green)] hover:bg-[var(--accent-green)]/90 border-[var(--accent-green)]"
                        : ""
                    }`}
                    onClick={() => setAnswer(currentItem.id, "pass")}
                  >
                    <Check className="h-5 w-5" /> PASS
                  </Button>
                  <Button
                    variant={currentResult === "fail" ? "primary" : "outline"}
                    className={`h-14 text-base ${
                      currentResult === "fail"
                        ? "bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 border-[var(--accent-red)]"
                        : ""
                    }`}
                    onClick={() => setAnswer(currentItem.id, "fail")}
                  >
                    <X className="h-5 w-5" /> FAIL
                  </Button>
                  <Button
                    variant={currentResult === "na" ? "primary" : "outline"}
                    className={`h-14 text-base ${
                      currentResult === "na"
                        ? "bg-[var(--text-muted)] hover:bg-[var(--text-muted)]/90 border-[var(--text-muted)]"
                        : ""
                    }`}
                    onClick={() => setAnswer(currentItem.id, "na")}
                  >
                    <Minus className="h-5 w-5" /> N/A
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={currentAnswer?.notes ?? ""}
                    onChange={(e) => setNotes(currentItem.id, e.target.value)}
                    placeholder="Add notes about this item..."
                    rows={2}
                  />
                </div>

                {/* Photo Capture */}
                <div>
                  {currentResult === "fail" && currentItem.photo_required_on_fail && (
                    <p className="text-xs text-[var(--accent-blue)] mb-1">
                      Photo required for failed items
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addMockPhoto(currentItem.id)}
                    >
                      <Camera className="h-4 w-4" /> Add Photo
                    </Button>
                    {(currentAnswer?.photos?.length ?? 0) > 0 && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {currentAnswer?.photos.length} photo{currentAnswer?.photos.length !== 1 ? "s" : ""} added
                      </span>
                    )}
                  </div>
                  {(currentAnswer?.photos?.length ?? 0) > 0 && (
                    <div className="flex gap-2 mt-2">
                      {currentAnswer?.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className="h-16 w-16 rounded border border-[var(--border-default)] bg-[var(--bg-tertiary)] flex items-center justify-center text-xs text-[var(--text-muted)]"
                        >
                          IMG {idx + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentItemIndex === 0}
              onClick={() => setCurrentItemIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-[var(--text-muted)]">
                  Saved {lastSaved.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <Button
                variant="secondary"
                onClick={() => setLastSaved(new Date())}
              >
                <Save className="h-4 w-4" /> Save Draft
              </Button>
            </div>

            {currentItemIndex < allItems.length - 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentItemIndex((i) => Math.min(allItems.length - 1, i + 1))}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitConfirm(true)}>
                Submit Audit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation */}
      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Audit?"
        description={`Score: ${runningScore}% \u2014 ${
          runningScore >= passThreshold ? "PASS" : "FAIL"
        } (threshold: ${passThreshold}%). ${completedCount} of ${totalCount} items answered. ${failedCount} item${failedCount !== 1 ? "s" : ""} failed.${
          failedCount > 0 && runningScore < passThreshold
            ? " This will trigger auto-actions for critical failures."
            : ""
        }`}
        confirmLabel="Submit Audit"
        cancelLabel="Cancel"
        onConfirm={handleSubmitAudit}
      />

      {/* Exit Confirmation */}
      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Exit Audit?"
        description="You have unsaved progress. Your answers will be saved as a draft."
        confirmLabel="Save & Exit"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowExitConfirm(false);
          router.push(`/${locale}/audit/${id}/`);
        }}
      />

      {/* Auto-Ticket Modal (THE DEMO MOMENT) */}
      <AutoTicketModal
        open={showAutoTicketModal}
        onOpenChange={setShowAutoTicketModal}
        audit={conductedAudit}
        template={template}
        users={users}
        locationName={locationLabels[audit.location_id] ?? audit.location_id}
        onConfirm={handleAutoTicketConfirm}
        onSkip={handleAutoTicketSkip}
      />
    </div>
  );
}
