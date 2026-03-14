"use client";

import { useState } from "react";
import { Drawer, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Switch } from "@uniflo/ui";

interface CreateSOPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { title: string; category: string; description: string; acknowledgment_required: boolean }) => void;
}

export function CreateSOPModal({ open, onOpenChange, onSubmit }: CreateSOPModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("operations");
  const [ackRequired, setAckRequired] = useState(false);

  function handleSubmit() {
    if (!title.trim()) return;
    onSubmit?.({
      title: title.trim(),
      category,
      description: description.trim(),
      acknowledgment_required: ackRequired,
    });
    setTitle("");
    setDescription("");
    setCategory("operations");
    setAckRequired(false);
    onOpenChange(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create SOP"
      description="Set up a new Standard Operating Procedure"
      width="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Create SOP</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name of the procedure" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the SOP..." rows={3} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="customer_service">Customer Service</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)]">Require Acknowledgment</label>
            <p className="text-xs text-[var(--text-secondary)]">Staff must acknowledge they have read this SOP</p>
          </div>
          <Switch checked={ackRequired} onCheckedChange={setAckRequired} />
        </div>
      </div>
    </Drawer>
  );
}
