"use client";

import { useState, useEffect } from "react";
import { Drawer, Button, Input, useToast, Toaster } from "@uniflo/ui";
import type { RuleTemplate } from "@uniflo/mock-data";
import { RuleTriggerChip } from "./RuleTriggerChip";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown",
  loc_002: "Airport",
  loc_003: "Resort",
};

const operatorLabels: Record<string, string> = {
  equals: "equals",
  not_equals: "not equals",
  greater_than: ">",
  less_than: "<",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

const actionTypeLabels: Record<string, string> = {
  create_ticket: "Create Ticket",
  create_capa: "Create CAPA",
  create_task: "Create Task",
  assign_to: "Assign To",
  send_notification: "Send Notification",
  change_status: "Change Status",
  add_tag: "Add Tag",
  update_field: "Update Field",
  trigger_audit: "Trigger Audit",
};

interface TemplatePreviewDrawerProps {
  template: RuleTemplate | null;
  onClose: () => void;
  onActivate: (name: string, locations: string[], template: RuleTemplate) => void;
  onCustomize: (template: RuleTemplate) => void;
}

export function TemplatePreviewDrawer({ template, onClose, onActivate, onCustomize }: TemplatePreviewDrawerProps) {
  const { toasts, toast, dismiss } = useToast();
  const [name, setName] = useState(template?.name ?? "");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Reset state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSelectedLocations([]);
    }
  }, [template]);

  function handleActivate() {
    if (!template || !name.trim()) return;
    toast({ title: "Rule activated successfully", variant: "success" });
    onActivate(name.trim(), selectedLocations, template);
    setName("");
    setSelectedLocations([]);
  }

  function handleClose() {
    setName("");
    setSelectedLocations([]);
    onClose();
  }

  function toggleLocation(locId: string) {
    setSelectedLocations(prev =>
      prev.includes(locId) ? prev.filter(l => l !== locId) : [...prev, locId],
    );
  }

  return (
    <>
    <Drawer
      open={!!template}
      onOpenChange={open => { if (!open) handleClose(); }}
      title={template?.name ?? "Template Preview"}
      description="Review the template and customize before activating"
      width="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleActivate} disabled={!name.trim()}>Activate Rule</Button>
        </>
      }
    >
      {template && (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>

          {/* Rule summary */}
          <div className="space-y-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)]">TRIGGER</span>
              <div className="mt-1">
                <RuleTriggerChip trigger={template.trigger} />
              </div>
            </div>

            {template.conditions.length > 0 && (
              <div>
                <span className="text-xs font-medium text-[var(--text-muted)]">CONDITIONS</span>
                <div className="mt-1 space-y-1">
                  {template.conditions.map((c, i) => (
                    <p key={c.id} className="text-xs text-[var(--text-secondary)]">
                      {i > 0 && <span className="text-[var(--accent-blue)] font-medium">AND </span>}
                      {c.field} {operatorLabels[c.operator]} {String(c.value)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-medium text-[var(--text-muted)]">ACTIONS</span>
              <div className="mt-1 space-y-1">
                {template.actions.map((a, i) => (
                  <p key={a.id} className="text-xs text-[var(--text-secondary)]">
                    {i + 1}. {actionTypeLabels[a.type] ?? a.type}
                    {a.config.title && (
                      <span className="text-[var(--text-muted)]"> - "{String(a.config.title)}"</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Customization form */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Rule Name *</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter a name for this rule"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Location Scope</label>
              <p className="mb-2 text-xs text-[var(--text-muted)]">
                {selectedLocations.length === 0 ? "All locations (default)" : `${selectedLocations.length} selected`}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(locationLabels).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => toggleLocation(id)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      selectedLocations.includes(id)
                        ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                        : "border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customize link */}
          <button
            onClick={() => template && onCustomize(template)}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            Customize in Builder
          </button>
        </div>
      )}
    </Drawer>
    <Toaster toasts={toasts} dismiss={dismiss} />
    </>
  );
}
