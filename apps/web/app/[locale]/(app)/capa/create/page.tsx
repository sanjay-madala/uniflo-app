"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTicketsData } from "@/lib/data/useTicketsData";
import { useAuditsData } from "@/lib/data/useAuditsData";
import type { CAPASeverity, CAPASource, RootCauseMethod, Audit, Ticket, User } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  FormSection,
} from "@uniflo/ui";
import { ArrowLeft, ChevronRight, Link2 } from "lucide-react";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

export default function CreateCAPAPage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const { data: audits, users: auditUsers, isLoading: auditsLoading, error: auditsError } = useAuditsData();
  const { data: tickets, users: ticketUsers, isLoading: ticketsLoading, error: ticketsError } = useTicketsData();

  const users = auditUsers;
  const isLoading = auditsLoading || ticketsLoading;
  const loadError = auditsError ?? ticketsError;

  const sourceParam = searchParams.get("source") as CAPASource | null;
  const sourceIdParam = searchParams.get("sourceId");

  // Pre-populate from source
  const prePopData = useMemo(() => {
    if (!sourceParam || !sourceIdParam) return null;

    if (sourceParam === "audit") {
      const audit = (audits as Audit[]).find(a => a.id === sourceIdParam);
      if (!audit) return null;
      const score = audit.score ?? 100;
      const severity: CAPASeverity = score < 50 ? "critical" : score < 70 ? "high" : score < 85 ? "medium" : "low";
      return {
        source: "audit" as CAPASource,
        sourceId: audit.id,
        sourceTitle: audit.title,
        title: `CAPA: ${audit.title}${audit.findings?.[0] ? ` — ${audit.findings[0]}` : ""}`,
        severity,
        locationId: audit.location_id,
        ownerId: audit.auditor_id,
        rootCause: audit.findings?.[0] ?? "",
        tags: "equipment,compliance",
      };
    }

    if (sourceParam === "ticket") {
      const ticket = (tickets as Ticket[]).find(t => t.id === sourceIdParam);
      if (!ticket) return null;
      return {
        source: "ticket" as CAPASource,
        sourceId: ticket.id,
        sourceTitle: ticket.title,
        title: `CAPA: ${ticket.title}`,
        severity: ticket.priority as CAPASeverity,
        locationId: ticket.location_id,
        ownerId: ticket.assignee_id ?? "",
        rootCause: "",
        tags: ticket.category ?? "",
      };
    }

    return null;
  }, [sourceParam, sourceIdParam, audits, tickets]);

  const [title, setTitle] = useState(prePopData?.title ?? "");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<CAPASeverity>(prePopData?.severity ?? "medium");
  const [source] = useState<CAPASource>(prePopData?.source ?? "manual");
  const [category, setCategory] = useState("");
  const [ownerId, setOwnerId] = useState(prePopData?.ownerId ?? "");
  const [locationId, setLocationId] = useState(prePopData?.locationId ?? "loc_001");
  const [dueDate, setDueDate] = useState("");
  const [rootCauseMethod, setRootCauseMethod] = useState<RootCauseMethod>("five_why");
  const [rootCauseConclusion, setRootCauseConclusion] = useState(prePopData?.rootCause ?? "");
  const [whys, setWhys] = useState<string[]>([""]);
  const [fishbone, setFishbone] = useState<Record<string, string[]>>({
    people: [], process: [], equipment: [], materials: [], environment: [], measurement: [],
  });
  const [narrative, setNarrative] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [linkedSopIds] = useState<string[]>([]);
  const [tags, setTags] = useState(prePopData?.tags ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!ownerId) newErrors.ownerId = "Owner is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (!rootCauseConclusion.trim()) newErrors.rootCauseConclusion = "Root cause conclusion is required";
    if (!correctiveAction.trim()) newErrors.correctiveAction = "Corrective action is required";
    if (!preventiveAction.trim()) newErrors.preventiveAction = "Preventive action is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;
    // Mock: navigate to list
    window.location.href = `/${locale}/capa/`;
  }

  const fishboneCategories = [
    { key: "people", label: "People" },
    { key: "process", label: "Process" },
    { key: "equipment", label: "Equipment" },
    { key: "materials", label: "Materials" },
    { key: "environment", label: "Environment" },
    { key: "measurement", label: "Measurement" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-4 w-32 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="mx-auto w-full max-w-[720px] space-y-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load data: {loadError.message}</p>
        </div>
      </div>
    );
  }

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
        <span className="text-[var(--text-primary)] font-medium">New CAPA</span>
      </div>

      <PageHeader
        title="Create CAPA"
        subtitle="Define corrective and preventive actions"
        className="px-0 py-0 border-0"
      />

      {/* Pre-populate banner */}
      {prePopData && (
        <div className="flex items-center gap-2 rounded-md border-l-2 border-l-[var(--accent-blue)] bg-[var(--accent-blue)]/5 px-4 py-3">
          <Link2 className="h-4 w-4 text-[var(--accent-blue)]" />
          <span className="text-sm text-[var(--accent-blue)]">
            Pre-populated from {prePopData.source === "audit" ? "Audit" : "Ticket"}: {prePopData.sourceId} &mdash; {prePopData.sourceTitle}
          </span>
        </div>
      )}

      {/* Form */}
      <div className="mx-auto w-full max-w-[720px] space-y-6">
        {/* Section 1: Basic Information */}
        <FormSection title="Basic Information">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Brief description of the CAPA"
                className={errors.title ? "border-[var(--accent-red)]" : ""}
                aria-required="true"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.title}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of the issue and context..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Severity</label>
                <Select value={severity} onValueChange={v => setSeverity(v as CAPASeverity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Source</label>
                <div className={`flex h-9 items-center rounded-md border border-[var(--border-default)] px-3 text-sm ${prePopData ? "bg-[var(--bg-secondary)] text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                  {source === "audit" ? "Audit" : source === "ticket" ? "Ticket" : "Manual"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Location</label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(locationLabels).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Section 2: Assignment */}
        <FormSection title="Assignment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Owner *</label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger className={errors.ownerId ? "border-[var(--accent-red)]" : ""}>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ownerId && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.ownerId}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Due Date *</label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={errors.dueDate ? "border-[var(--accent-red)]" : ""}
                aria-required="true"
                aria-invalid={!!errors.dueDate}
              />
              {errors.dueDate && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.dueDate}</p>}
            </div>
          </div>
        </FormSection>

        {/* Section 3: Root Cause */}
        <FormSection title="Root Cause Analysis">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Method</label>
              <div className="flex gap-2">
                {(["five_why", "fishbone", "freeform"] as RootCauseMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setRootCauseMethod(method)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      rootCauseMethod === method
                        ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                        : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {method === "five_why" ? "5-Why" : method === "fishbone" ? "Fishbone" : "Freeform"}
                  </button>
                ))}
              </div>
            </div>

            {/* 5-Why inputs */}
            {rootCauseMethod === "five_why" && (
              <div className="space-y-3">
                {whys.map((why, i) => (
                  <div key={i}>
                    <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Why {i + 1}</label>
                    <Input
                      value={why}
                      onChange={e => {
                        const newWhys = [...whys];
                        newWhys[i] = e.target.value;
                        // Progressive disclosure: add next input when current is filled
                        if (e.target.value && i === whys.length - 1 && whys.length < 5) {
                          newWhys.push("");
                        }
                        setWhys(newWhys);
                      }}
                      placeholder={`Why is this happening? (level ${i + 1})`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Fishbone inputs */}
            {rootCauseMethod === "fishbone" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fishboneCategories.map(({ key, label }) => (
                  <div key={key} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</h4>
                    {(fishbone[key] ?? []).map((cause, i) => (
                      <Input
                        key={i}
                        value={cause}
                        onChange={e => {
                          const newCauses = [...(fishbone[key] ?? [])];
                          newCauses[i] = e.target.value;
                          setFishbone({ ...fishbone, [key]: newCauses });
                        }}
                        placeholder={`${label} cause`}
                        className="mb-1 text-xs"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setFishbone({ ...fishbone, [key]: [...(fishbone[key] ?? []), ""] })}
                      className="mt-1 text-xs text-[var(--accent-blue)] hover:underline"
                    >
                      + Add cause
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Freeform */}
            {rootCauseMethod === "freeform" && (
              <Textarea
                value={narrative}
                onChange={e => setNarrative(e.target.value)}
                placeholder="Describe the root cause analysis in detail..."
                rows={6}
              />
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Root Cause Conclusion *</label>
              <Textarea
                value={rootCauseConclusion}
                onChange={e => setRootCauseConclusion(e.target.value)}
                placeholder="Final root cause statement"
                rows={2}
                className={errors.rootCauseConclusion ? "border-[var(--accent-red)]" : ""}
                aria-required="true"
                aria-invalid={!!errors.rootCauseConclusion}
              />
              {errors.rootCauseConclusion && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.rootCauseConclusion}</p>}
            </div>
          </div>
        </FormSection>

        {/* Section 4: Actions */}
        <FormSection title="Actions">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Corrective Action *</label>
              <Textarea
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                placeholder="What corrective action will be taken to fix the immediate issue?"
                rows={2}
                className={errors.correctiveAction ? "border-[var(--accent-red)]" : ""}
                aria-required="true"
                aria-invalid={!!errors.correctiveAction}
              />
              {errors.correctiveAction && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.correctiveAction}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Preventive Action *</label>
              <Textarea
                value={preventiveAction}
                onChange={e => setPreventiveAction(e.target.value)}
                placeholder="What preventive action will prevent this issue from recurring?"
                rows={2}
                className={errors.preventiveAction ? "border-[var(--accent-red)]" : ""}
                aria-required="true"
                aria-invalid={!!errors.preventiveAction}
              />
              {errors.preventiveAction && <p className="mt-1 text-xs text-[var(--accent-red)]" role="alert">{errors.preventiveAction}</p>}
            </div>
          </div>
        </FormSection>

        {/* Section 5: Linked References */}
        <FormSection title="Linked References">
          <div className="space-y-4">
            {prePopData && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Source {prePopData.source === "audit" ? "Audit" : "Ticket"}
                </label>
                <div className="flex h-9 items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-muted)]">
                  {prePopData.sourceId} &mdash; {prePopData.sourceTitle}
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Comma-separated tags (e.g. fire-safety, compliance)"
              />
            </div>
          </div>
        </FormSection>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Link href={`/${locale}/capa/`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => {}}>Save as Draft</Button>
            <Button onClick={handleCreate}>Create CAPA</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
