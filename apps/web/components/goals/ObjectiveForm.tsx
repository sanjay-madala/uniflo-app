"use client";

import type { GoalLevel, GoalTimeframe } from "@uniflo/mock-data";
import { users, goals as allGoals } from "@uniflo/mock-data";
import {
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@uniflo/ui";

interface ObjectiveFormProps {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  level: GoalLevel;
  onLevelChange: (v: GoalLevel) => void;
  ownerId: string;
  onOwnerIdChange: (v: string) => void;
  teamId: string;
  onTeamIdChange: (v: string) => void;
  timeframe: GoalTimeframe;
  onTimeframeChange: (v: GoalTimeframe) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  parentGoalId: string | null;
  onParentGoalIdChange: (v: string | null) => void;
  errors: Record<string, string>;
}

const CATEGORIES = ["Safety", "Customer Experience", "Operations", "Compliance", "Quality"];
const TEAMS = [
  { id: "team_ops", name: "Operations" },
  { id: "team_support", name: "Support" },
  { id: "team_mgmt", name: "Management" },
];

export function ObjectiveForm(props: ObjectiveFormProps) {
  function handleTimeframeChange(tf: GoalTimeframe) {
    props.onTimeframeChange(tf);
    if (tf === "Q1") { props.onStartDateChange("2026-01-01"); props.onEndDateChange("2026-03-31"); }
    if (tf === "Q2") { props.onStartDateChange("2026-04-01"); props.onEndDateChange("2026-06-30"); }
    if (tf === "Q3") { props.onStartDateChange("2026-07-01"); props.onEndDateChange("2026-09-30"); }
    if (tf === "Q4") { props.onStartDateChange("2026-10-01"); props.onEndDateChange("2026-12-31"); }
    if (tf === "annual") { props.onStartDateChange("2026-01-01"); props.onEndDateChange("2026-12-31"); }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
        Objective Details
      </h2>

      {/* Title */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Title *</label>
        <Input
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          placeholder="e.g. Achieve 90% Compliance Across All Locations"
          maxLength={200}
        />
        {props.errors.title && <p className="text-xs text-[var(--accent-red)] mt-1">{props.errors.title}</p>}
        {props.title.length > 180 && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{props.title.length}/200</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Description</label>
        <Textarea
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          placeholder="Describe the objective..."
          rows={3}
        />
      </div>

      {/* Row: Level, Owner, Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Level *</label>
          <Select value={props.level} onValueChange={(v) => props.onLevelChange(v as GoalLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Owner *</label>
          <Select value={props.ownerId} onValueChange={props.onOwnerIdChange}>
            <SelectTrigger><SelectValue placeholder="Select owner..." /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {props.errors.ownerId && <p className="text-xs text-[var(--accent-red)] mt-1">{props.errors.ownerId}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Team</label>
          <Select value={props.teamId || "none"} onValueChange={(v) => props.onTeamIdChange(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select team..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Team</SelectItem>
              {TEAMS.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row: Timeframe, Start Date, End Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Timeframe *</label>
          <Select value={props.timeframe} onValueChange={(v) => handleTimeframeChange(v as GoalTimeframe)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1 2026</SelectItem>
              <SelectItem value="Q2">Q2 2026</SelectItem>
              <SelectItem value="Q3">Q3 2026</SelectItem>
              <SelectItem value="Q4">Q4 2026</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Start Date *</label>
          <Input
            type="date"
            value={props.startDate}
            onChange={(e) => props.onStartDateChange(e.target.value)}
          />
          {props.errors.startDate && <p className="text-xs text-[var(--accent-red)] mt-1">{props.errors.startDate}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">End Date *</label>
          <Input
            type="date"
            value={props.endDate}
            onChange={(e) => props.onEndDateChange(e.target.value)}
          />
          {props.errors.endDate && <p className="text-xs text-[var(--accent-red)] mt-1">{props.errors.endDate}</p>}
        </div>
      </div>

      {/* Row: Category, Parent Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Category</label>
          <Select value={props.category || "none"} onValueChange={(v) => props.onCategoryChange(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">Parent Goal (for alignment)</label>
          <Select
            value={props.parentGoalId ?? "none"}
            onValueChange={(v) => props.onParentGoalIdChange(v === "none" ? null : v)}
          >
            <SelectTrigger><SelectValue placeholder="None -- top-level goal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None -- top-level goal</SelectItem>
              {allGoals.filter(g => g.status === "active").map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.title} ({g.progress_pct}%)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
