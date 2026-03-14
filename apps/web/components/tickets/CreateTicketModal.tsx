"use client";

import { useState } from "react";
import { Drawer, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import type { Ticket, User } from "@uniflo/mock-data";

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onSubmit?: (data: Partial<Ticket>) => void;
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

export function CreateTicketModal({ open, onOpenChange, users, onSubmit }: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("maintenance");
  const [assigneeId, setAssigneeId] = useState("");
  const [locationId, setLocationId] = useState("loc_001");
  const [tags, setTags] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    const data: Partial<Ticket> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority as Ticket["priority"],
      category: category as Ticket["category"],
      assignee_id: assigneeId || null,
      location_id: locationId,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: "open",
      created_at: new Date().toISOString(),
    };
    onSubmit?.(data);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("maintenance");
    setAssigneeId("");
    setLocationId("loc_001");
    setTags("");
    onOpenChange(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create Ticket"
      description="Fill in the details to create a new ticket"
      width="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Create Ticket</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about the issue..." rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
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
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fb">F&B</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="guest_relations">Guest Relations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Assignee</label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Comma-separated tags (e.g. urgent, food-safety)" />
        </div>
      </div>
    </Drawer>
  );
}
