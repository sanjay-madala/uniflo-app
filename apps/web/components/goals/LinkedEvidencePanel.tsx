"use client";

import { useState } from "react";
import type { Goal } from "@uniflo/mock-data";
import {
  Drawer,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@uniflo/ui";
import { LinkedEvidenceCard } from "./LinkedEvidenceCard";

interface LinkedEvidencePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

export function LinkedEvidencePanel({
  open,
  onOpenChange,
  goal,
}: LinkedEvidencePanelProps) {
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const filteredLinks = moduleFilter === "all"
    ? goal.linked_modules
    : goal.linked_modules.filter((l) => l.module === moduleFilter);

  const uniqueModules = [...new Set(goal.linked_modules.map((l) => l.module))];

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Linked Evidence"
      description="Operational data feeding into this goal"
      width="w-[480px]"
    >
      <div className="flex flex-col gap-4">
        {/* Module Summary Row */}
        {goal.linked_modules.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {goal.linked_modules.map((link) => (
              <button
                key={link.module}
                type="button"
                onClick={() => setModuleFilter(link.module === moduleFilter ? "all" : link.module)}
                className={`shrink-0 rounded-lg border p-3 text-center transition-colors min-w-[100px] ${
                  moduleFilter === link.module
                    ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10"
                    : "border-[var(--border-default)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                <div className="text-xs font-medium text-[var(--text-secondary)] capitalize">{link.module}</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{link.current_value}</div>
                <div className={`text-xs ${link.trend > 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
                  {link.trend > 0 ? "+" : ""}{link.trend}%
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {uniqueModules.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Evidence Cards */}
        {filteredLinks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredLinks.map((link) => {
              const feedingKR = goal.key_results.find(
                (kr) => kr.data_source_module === link.module
              );
              return (
                <LinkedEvidenceCard
                  key={link.module}
                  link={link}
                  krTitle={feedingKR?.title}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">
            No linked evidence found for the selected filter.
          </div>
        )}
      </div>
    </Drawer>
  );
}
