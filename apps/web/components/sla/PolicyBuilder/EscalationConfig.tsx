"use client";

import { Switch, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Checkbox } from "@uniflo/ui";
import { users } from "@uniflo/mock-data";

interface EscalationConfigProps {
  enabled: boolean;
  escalateTo: string;
  afterBreachMinutes: number;
  notifyChannels: string[];
  onToggle: (enabled: boolean) => void;
  onUpdate: (updates: {
    escalate_to?: string;
    escalate_after_breach_minutes?: number;
    notify_channels?: string[];
  }) => void;
}

export function EscalationConfig({
  enabled,
  escalateTo,
  afterBreachMinutes,
  notifyChannels,
  onToggle,
  onUpdate,
}: EscalationConfigProps) {
  function toggleChannel(channel: string) {
    const updated = notifyChannels.includes(channel)
      ? notifyChannels.filter((c) => c !== channel)
      : [...notifyChannels, channel];
    onUpdate({ notify_channels: updated });
  }

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Escalation
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Auto-escalate when SLA is breached
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label="Enable auto-escalation"
        />
      </div>

      {enabled && (
        <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                Escalate to
              </label>
              <Select value={escalateTo} onValueChange={(v) => onUpdate({ escalate_to: v })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {(users as Array<{ id: string; name: string }>).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                After breach (minutes)
              </label>
              <Input
                type="number"
                min={1}
                value={afterBreachMinutes}
                onChange={(e) =>
                  onUpdate({
                    escalate_after_breach_minutes: Math.max(
                      1,
                      Number(e.target.value)
                    ),
                  })
                }
                className="w-24"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2">
              Notify via
            </label>
            <div className="flex items-center gap-4">
              {[
                { key: "email", label: "Email" },
                { key: "in_app", label: "In-app" },
                { key: "sms", label: "SMS" },
              ].map((ch) => (
                <label key={ch.key} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Checkbox
                    checked={notifyChannels.includes(ch.key)}
                    onCheckedChange={() => toggleChannel(ch.key)}
                  />
                  {ch.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
