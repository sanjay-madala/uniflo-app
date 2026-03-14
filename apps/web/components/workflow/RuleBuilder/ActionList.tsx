"use client";

import { useState } from "react";
import { Card, CardContent, Button } from "@uniflo/ui";
import {
  Plus,
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
import { ActionBlock } from "./ActionBlock";

interface ActionOption {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

const actionOptions: ActionOption[] = [
  { type: "create_ticket", label: "Create Ticket", description: "Open a new ticket with specified details", icon: "ClipboardList", IconComponent: ClipboardList },
  { type: "create_capa", label: "Create CAPA", description: "Create a corrective action item", icon: "AlertTriangle", IconComponent: AlertTriangle },
  { type: "create_task", label: "Create Task", description: "Assign a new task to a team member", icon: "CheckSquare", IconComponent: CheckSquare },
  { type: "assign_to", label: "Assign To", description: "Re-assign the triggering item", icon: "UserPlus", IconComponent: UserPlus },
  { type: "send_notification", label: "Send Notification", description: "Email or in-app notification", icon: "Bell", IconComponent: Bell },
  { type: "change_status", label: "Change Status", description: "Update the status of the triggering item", icon: "ArrowRightCircle", IconComponent: ArrowRightCircle },
  { type: "add_tag", label: "Add Tag", description: "Tag the triggering item", icon: "Tag", IconComponent: Tag },
  { type: "update_field", label: "Update Field", description: "Change a field value", icon: "Edit", IconComponent: Edit },
  { type: "trigger_audit", label: "Trigger Audit", description: "Schedule an audit from a template", icon: "ClipboardCheck", IconComponent: ClipboardCheck },
];

interface ActionListProps {
  actions: RuleAction[];
  onAddAction: (type: ActionType) => void;
  onUpdateAction: (id: string, updates: Partial<RuleAction>) => void;
  onRemoveAction: (id: string) => void;
  error?: string;
}

export function ActionList({ actions, onAddAction, onUpdateAction, onRemoveAction, error }: ActionListProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const maxActions = 5;

  return (
    <Card role="region" aria-label="Actions">
      <CardContent className="p-4">
        <div className="mb-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">Then do:</span>
        </div>

        {actions.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] mb-3">
            No actions configured yet. Add at least one action.
          </p>
        )}
        {error && <p className="text-xs text-[var(--accent-red)] mb-2">{error}</p>}

        <div className="space-y-3">
          {actions.map((action, i) => (
            <ActionBlock
              key={action.id}
              action={action}
              index={i}
              onUpdate={updates => onUpdateAction(action.id, updates)}
              onRemove={() => onRemoveAction(action.id)}
            />
          ))}
        </div>

        {/* Add action button + dropdown */}
        {actions.length < maxActions && (
          <div className="relative mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(prev => !prev)}
            >
              <Plus className="h-4 w-4" /> Add action
            </Button>

            {showDropdown && (
              <div className="absolute top-full left-0 z-20 mt-1 w-72 rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] shadow-lg">
                {actionOptions.map(option => (
                  <button
                    key={option.type}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                    onClick={() => {
                      onAddAction(option.type);
                      setShowDropdown(false);
                    }}
                  >
                    <option.IconComponent className="h-4 w-4 mt-0.5 shrink-0 text-[var(--text-secondary)]" />
                    <div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{option.label}</span>
                      <p className="text-[11px] text-[var(--text-muted)]">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
