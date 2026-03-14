"use client";

import { Card, CardContent, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Textarea } from "@uniflo/ui";
import { X, GripVertical } from "lucide-react";
import {
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  UserPlus,
  Bell,
  ArrowRightCircle,
  Tag,
  Edit,
  ClipboardCheck,
} from "lucide-react";
import type { RuleAction, ActionType } from "@uniflo/mock-data";

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  UserPlus,
  Bell,
  ArrowRightCircle,
  Tag,
  Edit,
  ClipboardCheck,
};

const actionTypeLabels: Record<ActionType, string> = {
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

const userOptions = [
  { value: "usr_001", label: "Sarah Chen" },
  { value: "usr_002", label: "Marcus Johnson" },
  { value: "usr_003", label: "Priya Sharma" },
  { value: "usr_004", label: "Tom Riley" },
  { value: "usr_005", label: "Ana Kowalski" },
];

interface ActionBlockProps {
  action: RuleAction;
  index: number;
  onUpdate: (updates: Partial<RuleAction>) => void;
  onRemove: () => void;
  errors?: Record<string, string>;
}

export function ActionBlock({ action, index, onUpdate, onRemove, errors }: ActionBlockProps) {
  const Icon = actionIcons[action.icon] ?? ClipboardCheck;

  function updateConfig(key: string, value: string | number | boolean) {
    onUpdate({ config: { ...action.config, [key]: value } });
  }

  function renderConfigForm() {
    switch (action.type) {
      case "create_capa":
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Title *</label>
              <Input
                value={String(action.config.title ?? "")}
                onChange={e => updateConfig("title", e.target.value)}
                placeholder='e.g. Fix: {{trigger.finding}}'
                className={errors?.title ? "border-[var(--accent-red)]" : ""}
              />
              {errors?.title && <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Owner *</label>
                <Select value={String(action.config.owner_id ?? "")} onValueChange={v => updateConfig("owner_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {userOptions.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Severity</label>
                <Select value={String(action.config.severity ?? "medium")} onValueChange={v => updateConfig("severity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "create_ticket":
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Title *</label>
              <Input
                value={String(action.config.title ?? "")}
                onChange={e => updateConfig("title", e.target.value)}
                placeholder="Ticket title"
                className={errors?.title ? "border-[var(--accent-red)]" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Priority</label>
                <Select value={String(action.config.priority ?? "medium")} onValueChange={v => updateConfig("priority", v)}>
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
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Category</label>
                <Select value={String(action.config.category ?? "")} onValueChange={v => updateConfig("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Assignee</label>
              <Select value={String(action.config.assignee_id ?? "")} onValueChange={v => updateConfig("assignee_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {userOptions.map(u => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "create_task":
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Title *</label>
              <Input
                value={String(action.config.title ?? "")}
                onChange={e => updateConfig("title", e.target.value)}
                placeholder="Task title"
                className={errors?.title ? "border-[var(--accent-red)]" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Assignee</label>
                <Select value={String(action.config.assignee_id ?? "")} onValueChange={v => updateConfig("assignee_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {userOptions.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Priority</label>
                <Select value={String(action.config.priority ?? "medium")} onValueChange={v => updateConfig("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "send_notification":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Channel</label>
                <Select value={String(action.config.channel ?? "email")} onValueChange={v => updateConfig("channel", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Recipients</label>
                <Select value={String(action.config.recipients ?? "")} onValueChange={v => updateConfig("recipients", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="assignee">Assignee</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Message</label>
              <Textarea
                value={String(action.config.message ?? "")}
                onChange={e => updateConfig("message", e.target.value)}
                placeholder="Notification message..."
                rows={2}
              />
            </div>
          </div>
        );

      case "assign_to":
        return (
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">User *</label>
            <Select value={String(action.config.user_id ?? "")} onValueChange={v => updateConfig("user_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {userOptions.map(u => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "change_status":
        return (
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">New Status *</label>
            <Select value={String(action.config.status ?? "")} onValueChange={v => updateConfig("status", v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "add_tag":
        return (
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Tag Value *</label>
            <Input
              value={String(action.config.tag ?? "")}
              onChange={e => updateConfig("tag", e.target.value)}
              placeholder="Tag value"
            />
          </div>
        );

      case "update_field":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Field</label>
              <Select value={String(action.config.field ?? "")} onValueChange={v => updateConfig("field", v)}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Value</label>
              <Input
                value={String(action.config.value ?? "")}
                onChange={e => updateConfig("value", e.target.value)}
                placeholder="New value"
              />
            </div>
          </div>
        );

      case "trigger_audit":
        return (
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Audit Template</label>
            <Select value={String(action.config.template ?? "")} onValueChange={v => updateConfig("template", v)}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="follow_up_audit">Follow-up Audit</SelectItem>
                <SelectItem value="verification_audit">Verification Audit</SelectItem>
                <SelectItem value="safety_inspection">Safety Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <div className="mt-0.5 cursor-grab text-[var(--text-muted)]" aria-label="Reorder action">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Number badge */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[10px] font-bold text-[var(--accent-blue)]">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {actionTypeLabels[action.type]}
                </span>
              </div>
              <button
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Remove action"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-t border-[var(--border-default)] pt-3">
              {renderConfigForm()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
