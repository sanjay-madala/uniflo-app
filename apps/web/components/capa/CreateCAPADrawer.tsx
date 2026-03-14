"use client";

import { useState } from "react";
import { Drawer, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { Link2 } from "lucide-react";
import type { CAPASeverity, CAPASource, RootCauseMethod, User } from "@uniflo/mock-data";

interface CreateCAPADrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  prePopulate?: {
    source: CAPASource;
    sourceId: string;
    sourceTitle: string;
    title?: string;
    severity?: CAPASeverity;
    locationId?: string;
    ownerId?: string;
    rootCause?: string;
    tags?: string;
  };
  onSubmit?: () => void;
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

export function CreateCAPADrawer({ open, onOpenChange, users, prePopulate, onSubmit }: CreateCAPADrawerProps) {
  const [title, setTitle] = useState(prePopulate?.title ?? "");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<CAPASeverity>(prePopulate?.severity ?? "medium");
  const [source] = useState<CAPASource>(prePopulate?.source ?? "manual");
  const [ownerId, setOwnerId] = useState(prePopulate?.ownerId ?? "");
  const [locationId, setLocationId] = useState(prePopulate?.locationId ?? "loc_001");
  const [dueDate, setDueDate] = useState("");
  const [rootCauseConclusion, setRootCauseConclusion] = useState(prePopulate?.rootCause ?? "");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [tags, setTags] = useState(prePopulate?.tags ?? "");

  const isLocked = !!prePopulate;

  function handleSubmit() {
    if (!title.trim() || !correctiveAction.trim() || !preventiveAction.trim()) return;
    onSubmit?.();
    onOpenChange(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create CAPA"
      description="Define corrective and preventive actions"
      width="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !correctiveAction.trim() || !preventiveAction.trim()}>
            Create CAPA
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Pre-populate banner */}
        {prePopulate && (
          <div className="flex items-center gap-2 rounded-md border-l-2 border-l-[var(--accent-blue)] bg-[var(--accent-blue)]/5 px-3 py-2">
            <Link2 className="h-4 w-4 text-[var(--accent-blue)]" />
            <span className="text-xs text-[var(--accent-blue)]">
              Pre-populated from {prePopulate.source === "audit" ? "Audit" : "Ticket"}: {prePopulate.sourceId} &mdash; {prePopulate.sourceTitle}
            </span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the CAPA" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description..." rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
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
            <div className={`flex h-9 items-center rounded-md border border-[var(--border-default)] px-3 text-sm ${isLocked ? "bg-[var(--bg-tertiary, var(--bg-secondary))] text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
              {source === "audit" ? "Audit" : source === "ticket" ? "Ticket" : "Manual"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Owner *</label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Due Date *</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Root Cause Conclusion *</label>
          <Textarea value={rootCauseConclusion} onChange={e => setRootCauseConclusion(e.target.value)} placeholder="What is the root cause?" rows={2} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Corrective Action *</label>
          <Textarea value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} placeholder="What corrective action will be taken?" rows={2} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Preventive Action *</label>
          <Textarea value={preventiveAction} onChange={e => setPreventiveAction(e.target.value)} placeholder="What preventive action will prevent recurrence?" rows={2} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Comma-separated tags" />
        </div>
      </div>
    </Drawer>
  );
}
