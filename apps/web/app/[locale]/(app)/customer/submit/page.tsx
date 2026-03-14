"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import type { PortalTicketCategory } from "@uniflo/mock-data";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { FileUploader } from "@/components/portal/FileUploader";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
}

interface FormData {
  category: PortalTicketCategory | null;
  subject: string;
  description: string;
  location_id: string | null;
  priority: "low" | "medium" | "high" | null;
}

const categories: { value: PortalTicketCategory; label: string }[] = [
  { value: "fb", label: "F&B" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "compliance", label: "Compliance" },
  { value: "guest_relations", label: "Guest Relations" },
  { value: "general", label: "General" },
];

const locations = [
  { id: "loc_001", name: "Downtown" },
  { id: "loc_002", name: "Airport" },
  { id: "loc_003", name: "Resort" },
];

const steps = ["Category & Details", "Attachments", "Review & Submit"];

export default function TicketSubmitPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>({
    category: null,
    subject: "",
    description: "",
    location_id: null,
    priority: null,
  });
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.category) newErrors.category = "Please select a category.";
    if (!form.subject.trim()) newErrors.subject = "Subject is required.";
    else if (form.subject.length > 200) newErrors.subject = "Subject must be 200 chars or fewer.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.length < 20) newErrors.description = "Description must be at least 20 characters.";
    else if (form.description.length > 5000) newErrors.description = "Description must be 5000 chars or fewer.";
    if (!form.location_id) newErrors.location_id = "Please select a location.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  function handleNext() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 3) setCurrentStep((s) => (s + 1) as 1 | 2 | 3);
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
  }

  function handleSubmit() {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedId("TKT-00046");
    }, 1200);
  }

  const locationName = locations.find((l) => l.id === form.location_id)?.name ?? "";
  const categoryLabel = categories.find((c) => c.value === form.category)?.label ?? "";

  // Success screen
  if (submittedId) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={
          {
            "--portal-bg": "#FFFFFF",
            "--portal-surface": "#F9FAFB",
            "--portal-surface-elevated": "#FFFFFF",
            "--portal-border": "#E5E7EB",
            "--portal-text-primary": "#111827",
            "--portal-text-secondary": "#6B7280",
            "--portal-text-muted": "#9CA3AF",
            "--portal-accent": "#2563EB",
            "--portal-success": "#059669",
            "--portal-warning": "#D97706",
            "--portal-danger": "#DC2626",
          } as React.CSSProperties
        }
      >
        <PortalHeader
          title="Submit a Request"
          backLabel="Back to Tickets"
          backHref={`/${locale}/customer`}
        />
        <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6 py-16">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(5,150,105,0.1)" }}
          >
            <Check className="h-8 w-8" style={{ color: "var(--portal-success)" }} />
          </div>
          <h2
            className="mt-4 text-xl font-semibold"
            style={{ color: "var(--portal-text-primary)" }}
          >
            Ticket Submitted
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--portal-text-secondary)" }}
          >
            Your ticket has been submitted. Reference:{" "}
            <span className="font-mono font-medium">{submittedId}</span>
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push(`/${locale}/customer`)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--portal-accent)" }}
            >
              View Ticket Status
            </button>
            <button
              onClick={() => {
                setSubmittedId(null);
                setCurrentStep(1);
                setForm({ category: null, subject: "", description: "", location_id: null, priority: null });
                setAttachments([]);
              }}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-secondary)",
              }}
            >
              Submit Another
            </button>
          </div>
        </main>
        <PortalFooter />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--portal-bg": "#FFFFFF",
          "--portal-surface": "#F9FAFB",
          "--portal-surface-elevated": "#FFFFFF",
          "--portal-border": "#E5E7EB",
          "--portal-text-primary": "#111827",
          "--portal-text-secondary": "#6B7280",
          "--portal-text-muted": "#9CA3AF",
          "--portal-accent": "#2563EB",
          "--portal-accent-hover": "#1D4ED8",
          "--portal-success": "#059669",
          "--portal-warning": "#D97706",
          "--portal-danger": "#DC2626",
        } as React.CSSProperties
      }
    >
      <PortalHeader
        title="Submit a Request"
        backLabel="Back to Tickets"
        backHref={`/${locale}/customer`}
      />

      <main className="mx-auto w-full max-w-[640px] flex-1 px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {steps.map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--portal-success)"
                        : isCurrent
                          ? "var(--portal-accent)"
                          : "transparent",
                      borderWidth: isCompleted || isCurrent ? 0 : 2,
                      borderStyle: "solid",
                      borderColor: "var(--portal-border)",
                      color: isCompleted || isCurrent ? "#FFFFFF" : "var(--portal-text-muted)",
                    }}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span
                    className="hidden text-xs font-medium sm:block"
                    style={{
                      color: isCurrent
                        ? "var(--portal-text-primary)"
                        : "var(--portal-text-muted)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="mx-4 h-0.5 w-16"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--portal-success)"
                        : "var(--portal-border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Category & Details */}
        {currentStep === 1 && (
          <div
            className="space-y-5 rounded-lg border p-6"
            style={{
              backgroundColor: "var(--portal-surface)",
              borderColor: "var(--portal-border)",
            }}
          >
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--portal-text-primary)" }}
              >
                What can we help with? <span style={{ color: "var(--portal-danger)" }}>*</span>
              </label>
              <select
                value={form.category ?? ""}
                onChange={(e) => {
                  setForm({ ...form, category: (e.target.value || null) as PortalTicketCategory | null });
                  setErrors({ ...errors, category: "" });
                }}
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--portal-bg)",
                  borderColor: errors.category ? "var(--portal-danger)" : "var(--portal-border)",
                  color: "var(--portal-text-primary)",
                }}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs" style={{ color: "var(--portal-danger)" }}>
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Subject <span style={{ color: "var(--portal-danger)" }}>*</span>
              </label>
              <input
                type="text"
                maxLength={200}
                value={form.subject}
                onChange={(e) => {
                  setForm({ ...form, subject: e.target.value });
                  setErrors({ ...errors, subject: "" });
                }}
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--portal-bg)",
                  borderColor: errors.subject ? "var(--portal-danger)" : "var(--portal-border)",
                  color: "var(--portal-text-primary)",
                }}
              />
              <div className="mt-1 flex justify-between">
                {errors.subject ? (
                  <p className="text-xs" style={{ color: "var(--portal-danger)" }}>
                    {errors.subject}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                  {form.subject.length}/200
                </span>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Description <span style={{ color: "var(--portal-danger)" }}>*</span>
              </label>
              <textarea
                maxLength={5000}
                rows={4}
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  setErrors({ ...errors, description: "" });
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--portal-bg)",
                  borderColor: errors.description ? "var(--portal-danger)" : "var(--portal-border)",
                  color: "var(--portal-text-primary)",
                }}
              />
              <div className="mt-1 flex justify-between">
                {errors.description ? (
                  <p className="text-xs" style={{ color: "var(--portal-danger)" }}>
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                  {form.description.length}/5000
                </span>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Location <span style={{ color: "var(--portal-danger)" }}>*</span>
              </label>
              <select
                value={form.location_id ?? ""}
                onChange={(e) => {
                  setForm({ ...form, location_id: e.target.value || null });
                  setErrors({ ...errors, location_id: "" });
                }}
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--portal-bg)",
                  borderColor: errors.location_id ? "var(--portal-danger)" : "var(--portal-border)",
                  color: "var(--portal-text-primary)",
                }}
              >
                <option value="">Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="mt-1 text-xs" style={{ color: "var(--portal-danger)" }}>
                  {errors.location_id}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Priority (optional)
              </label>
              <div className="flex gap-4">
                {(["low", "medium", "high"] as const).map((p) => (
                  <label
                    key={p}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    style={{ color: "var(--portal-text-primary)" }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      checked={form.priority === p}
                      onChange={() => setForm({ ...form, priority: p })}
                      className="accent-[var(--portal-accent)]"
                    />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Attachments */}
        {currentStep === 2 && (
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "var(--portal-surface)",
              borderColor: "var(--portal-border)",
            }}
          >
            <h2
              className="mb-4 text-lg font-semibold"
              style={{ color: "var(--portal-text-primary)" }}
            >
              Add Attachments
            </h2>
            <FileUploader files={attachments} onFilesChange={setAttachments} />
            <button
              onClick={handleNext}
              className="mt-4 text-sm underline"
              style={{ color: "var(--portal-text-muted)" }}
            >
              Skip this step
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div
            className="space-y-4 rounded-lg border p-6"
            style={{
              backgroundColor: "var(--portal-surface)",
              borderColor: "var(--portal-border)",
            }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--portal-text-primary)" }}
            >
              Review Your Request
            </h2>

            {[
              { label: "Category", value: categoryLabel, step: 1 as const },
              { label: "Subject", value: form.subject, step: 1 as const },
              { label: "Description", value: form.description, step: 1 as const },
              { label: "Location", value: locationName, step: 1 as const },
              {
                label: "Priority",
                value: form.priority
                  ? form.priority.charAt(0).toUpperCase() + form.priority.slice(1)
                  : "Not set",
                step: 1 as const,
              },
              {
                label: "Attachments",
                value: attachments.length > 0
                  ? attachments.map((a) => a.name).join(", ")
                  : "None",
                step: 2 as const,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-start justify-between border-b pb-3"
                style={{ borderColor: "var(--portal-border)" }}
              >
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--portal-text-muted)" }}
                  >
                    {field.label}
                  </p>
                  <p
                    className="mt-0.5 text-sm"
                    style={{ color: "var(--portal-text-primary)" }}
                  >
                    {field.value}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(field.step)}
                  className="text-xs font-medium"
                  style={{ color: "var(--portal-accent)" }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-secondary)",
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <button
              onClick={() => router.push(`/${locale}/customer`)}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--portal-border)",
                color: "var(--portal-text-secondary)",
              }}
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--portal-accent)" }}
            >
              Next Step
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--portal-accent)" }}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Ticket
            </button>
          )}
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
