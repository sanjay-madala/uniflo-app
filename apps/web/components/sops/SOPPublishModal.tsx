"use client";

import { useState } from "react";
import { Modal, Button, Textarea, Checkbox, Switch, Badge } from "@uniflo/ui";
import type { SOP } from "@uniflo/mock-data";

interface SOPPublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sop: SOP;
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  field_staff: "Staff",
  support_agent: "Support Agent",
  auditor: "Auditor",
};

export function SOPPublishModal({ open, onOpenChange, sop }: SOPPublishModalProps) {
  const [publishStep, setPublishStep] = useState<1 | 2>(1);
  const [changeSummary, setChangeSummary] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set(sop.location_ids));
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(sop.role_ids));
  const [ackRequired, setAckRequired] = useState(sop.acknowledgment_required);
  const [autoPublishKB, setAutoPublishKB] = useState(sop.auto_publish_kb);
  const [confirmChecked, setConfirmChecked] = useState(false);

  function toggleLocation(locId: string) {
    setSelectedLocations(prev => {
      const next = new Set(prev);
      if (next.has(locId)) next.delete(locId);
      else next.add(locId);
      return next;
    });
  }

  function toggleRole(roleId: string) {
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  function handlePublish() {
    onOpenChange(false);
    setPublishStep(1);
    setChangeSummary("");
    setConfirmChecked(false);
  }

  const nextVersion = (() => {
    const parts = sop.version.split(".");
    const minor = parseInt(parts[1] ?? "0", 10) + 1;
    return `${parts[0]}.${minor}`;
  })();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Publish SOP"
      size="lg"
      footer={
        publishStep === 1 ? (
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => setPublishStep(2)} disabled={!changeSummary.trim()}>
              Publish Now
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setPublishStep(1)}>Back</Button>
            <Button onClick={handlePublish} disabled={!confirmChecked}>
              Confirm &amp; Publish
            </Button>
          </>
        )
      }
    >
      {publishStep === 1 ? (
        <div className="space-y-5">
          <p className="text-xs text-[var(--text-muted)]">Step 1 of 2: Review</p>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">SOP:</span>
            <span className="font-medium text-[var(--text-primary)]">{sop.title}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Version:</span>
            <Badge variant="blue">v{nextVersion} (new)</Badge>
            <span className="text-[var(--text-secondary)]">Steps:</span>
            <Badge>{sop.steps.length}</Badge>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Change Summary *</label>
            <Textarea
              value={changeSummary}
              onChange={e => setChangeSummary(e.target.value)}
              placeholder="Describe changes in this version..."
              rows={3}
            />
          </div>

          {/* Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">Distribution</h4>
            <div className="rounded-md border border-[var(--border-default)] p-3 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Locations</p>
              {Object.entries(locationLabels).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedLocations.has(id)}
                    onCheckedChange={() => toggleLocation(id)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{name}</span>
                </label>
              ))}
            </div>
            <div className="rounded-md border border-[var(--border-default)] p-3 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Roles</p>
              {Object.entries(roleLabels).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedRoles.has(id)}
                    onCheckedChange={() => toggleRole(id)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="flex items-center gap-2">
            <Checkbox checked={ackRequired} onCheckedChange={(v) => setAckRequired(v === true)} />
            <span className="text-sm text-[var(--text-primary)]">Require acknowledgment from assigned staff</span>
          </div>

          {/* KB Auto-Publish */}
          <div className="flex items-center justify-between rounded-md border border-[var(--border-default)] p-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">KB Auto-Publish</p>
              {autoPublishKB && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  This will create/update KB article: &ldquo;{sop.title}&rdquo;
                </p>
              )}
            </div>
            <Switch checked={autoPublishKB} onCheckedChange={setAutoPublishKB} />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-[var(--text-muted)]">Step 2 of 2: Confirm</p>

          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 space-y-2">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">Summary</h4>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li>Publishing v{nextVersion} of &ldquo;{sop.title}&rdquo;</li>
              <li>Distributed to {selectedLocations.size} location{selectedLocations.size !== 1 ? "s" : ""}, {selectedRoles.size} role{selectedRoles.size !== 1 ? "s" : ""}</li>
              <li>Acknowledgment required: {ackRequired ? "Yes" : "No"}</li>
              {autoPublishKB && <li>KB article will be updated</li>}
            </ul>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={confirmChecked}
              onCheckedChange={(v) => setConfirmChecked(v === true)}
            />
            <span className="text-sm text-[var(--text-primary)]">
              I confirm this SOP is ready for distribution
            </span>
          </label>
        </div>
      )}
    </Modal>
  );
}
