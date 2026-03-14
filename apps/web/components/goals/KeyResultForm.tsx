"use client";

import type { KRTrackingType, KRUnit, KRDirection, KRDataSource } from "@uniflo/mock-data";
import { users } from "@uniflo/mock-data";
import {
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Button,
} from "@uniflo/ui";
import { Trash2 } from "lucide-react";

export interface KeyResultFormState {
  tempId: string;
  title: string;
  trackingType: KRTrackingType;
  dataSource?: KRDataSource;
  dataSourceModule?: string;
  unit: KRUnit;
  direction: KRDirection;
  startValue: number | "";
  targetValue: number | "";
  ownerId: string;
}

const DATA_SOURCE_OPTIONS: { module: string; metrics: { value: KRDataSource; label: string }[] }[] = [
  {
    module: "Audits",
    metrics: [
      { value: "audit_compliance_score", label: "Compliance Score" },
      { value: "audit_pass_rate", label: "Pass Rate" },
    ],
  },
  {
    module: "Tickets",
    metrics: [
      { value: "ticket_resolution_time", label: "Resolution Time" },
      { value: "ticket_sla_compliance", label: "SLA Compliance" },
      { value: "ticket_volume", label: "Volume" },
    ],
  },
  {
    module: "CAPA",
    metrics: [
      { value: "capa_closure_rate", label: "Closure Rate" },
      { value: "capa_overdue_count", label: "Overdue Count" },
    ],
  },
  {
    module: "Tasks",
    metrics: [
      { value: "task_completion_rate", label: "Completion Rate" },
      { value: "task_overdue_count", label: "Overdue Count" },
    ],
  },
  {
    module: "Training",
    metrics: [
      { value: "training_completion_rate", label: "Completion Rate" },
      { value: "training_pass_rate", label: "Pass Rate" },
    ],
  },
  {
    module: "SOPs",
    metrics: [
      { value: "sop_acknowledgment_rate", label: "Acknowledgment Rate" },
    ],
  },
  {
    module: "CSAT",
    metrics: [
      { value: "csat_score", label: "Score" },
      { value: "csat_response_rate", label: "Response Rate" },
    ],
  },
];

interface KeyResultFormProps {
  kr: KeyResultFormState;
  index: number;
  onChange: (tempId: string, field: keyof KeyResultFormState, value: string | number) => void;
  onRemove: (tempId: string) => void;
  canRemove: boolean;
}

export function KeyResultForm({
  kr,
  index,
  onChange,
  onRemove,
  canRemove,
}: KeyResultFormProps) {
  const selectedModuleObj = DATA_SOURCE_OPTIONS.find((m) =>
    m.metrics.some((met) => met.value === kr.dataSource)
  );

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Key Result {index + 1}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={() => onRemove(kr.tempId)}>
            <Trash2 className="h-3.5 w-3.5 text-[var(--accent-red)]" />
          </Button>
        )}
      </div>

      {/* KR Title */}
      <div className="mb-3">
        <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
          KR Title *
        </label>
        <Input
          value={kr.title}
          onChange={(e) => onChange(kr.tempId, "title", e.target.value)}
          placeholder="e.g. Audit compliance score >= 90%"
        />
      </div>

      {/* Tracking Type */}
      <div className="mb-3">
        <span className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Tracking</span>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`tracking-${kr.tempId}`}
              checked={kr.trackingType === "manual"}
              onChange={() => onChange(kr.tempId, "trackingType", "manual")}
              className="accent-[var(--accent-blue)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Manual</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`tracking-${kr.tempId}`}
              checked={kr.trackingType === "auto"}
              onChange={() => onChange(kr.tempId, "trackingType", "auto")}
              className="accent-[var(--accent-blue)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Auto-Linked</span>
          </label>
        </div>
      </div>

      {/* Data Source Picker (auto only) */}
      {kr.trackingType === "auto" && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Source Module</label>
            <Select
              value={kr.dataSourceModule ?? ""}
              onValueChange={(v) => {
                onChange(kr.tempId, "dataSourceModule", v);
                onChange(kr.tempId, "dataSource", "" as KRDataSource);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select module..." /></SelectTrigger>
              <SelectContent>
                {DATA_SOURCE_OPTIONS.map((m) => (
                  <SelectItem key={m.module} value={m.module}>{m.module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Metric</label>
            <Select
              value={kr.dataSource ?? ""}
              onValueChange={(v) => onChange(kr.tempId, "dataSource", v)}
              disabled={!kr.dataSourceModule}
            >
              <SelectTrigger><SelectValue placeholder="Select metric..." /></SelectTrigger>
              <SelectContent>
                {(DATA_SOURCE_OPTIONS.find((m) => m.module === kr.dataSourceModule)?.metrics ?? []).map((met) => (
                  <SelectItem key={met.value} value={met.value}>{met.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Measurement Fields */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Unit *</label>
          <Select value={kr.unit} onValueChange={(v) => onChange(kr.tempId, "unit", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">%</SelectItem>
              <SelectItem value="number">#</SelectItem>
              <SelectItem value="currency">$</SelectItem>
              <SelectItem value="boolean">Yes/No</SelectItem>
              <SelectItem value="score">Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Direction *</label>
          <Select value={kr.direction} onValueChange={(v) => onChange(kr.tempId, "direction", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="increase">Increase</SelectItem>
              <SelectItem value="decrease">Decrease</SelectItem>
              <SelectItem value="maintain">Maintain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Start *</label>
          <Input
            type="number"
            value={kr.startValue}
            onChange={(e) => onChange(kr.tempId, "startValue", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Target *</label>
          <Input
            type="number"
            value={kr.targetValue}
            onChange={(e) => onChange(kr.tempId, "targetValue", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="100"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Owner</label>
          <Select value={kr.ownerId} onValueChange={(v) => onChange(kr.tempId, "ownerId", v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
