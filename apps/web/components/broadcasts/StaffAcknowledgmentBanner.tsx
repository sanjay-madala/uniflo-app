"use client";

import { useState } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@uniflo/ui";
import type { Broadcast, BroadcastPriority } from "@uniflo/mock-data";
import { StaffAcknowledgmentModal } from "./StaffAcknowledgmentModal";

interface StaffAcknowledgmentBannerProps {
  pendingBroadcasts: Broadcast[];
}

const priorityConfig: Record<BroadcastPriority, { border: string; bg: string; icon: string }> = {
  normal: {
    border: "var(--accent-blue)",
    bg: "color-mix(in srgb, var(--accent-blue) 10%, transparent)",
    icon: "var(--accent-blue)",
  },
  urgent: {
    border: "var(--accent-yellow)",
    bg: "color-mix(in srgb, var(--accent-yellow) 10%, transparent)",
    icon: "var(--accent-yellow)",
  },
  critical: {
    border: "var(--accent-red)",
    bg: "color-mix(in srgb, var(--accent-red) 10%, transparent)",
    icon: "var(--accent-red)",
  },
};

function getHighestPriority(broadcasts: Broadcast[]): BroadcastPriority {
  if (broadcasts.some((b) => b.priority === "critical")) return "critical";
  if (broadcasts.some((b) => b.priority === "urgent")) return "urgent";
  return "normal";
}

export function StaffAcknowledgmentBanner({ pendingBroadcasts }: StaffAcknowledgmentBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (pendingBroadcasts.length === 0 || dismissed) return null;

  const highestPriority = getHighestPriority(pendingBroadcasts);
  const config = priorityConfig[highestPriority];
  const isCritical = highestPriority === "critical";

  const priorityCounts: Record<string, number> = {};
  for (const b of pendingBroadcasts) {
    priorityCounts[b.priority] = (priorityCounts[b.priority] ?? 0) + 1;
  }
  const breakdown = Object.entries(priorityCounts)
    .map(([p, c]) => `${c} ${p}`)
    .join(", ");

  return (
    <>
      <div
        className="flex items-center justify-between rounded-md px-4 py-3 mb-4"
        style={{
          borderLeft: `4px solid ${config.border}`,
          backgroundColor: config.bg,
        }}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <BellRing className="h-5 w-5 flex-shrink-0" style={{ color: config.icon }} />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              You have {pendingBroadcasts.length} broadcast{pendingBroadcasts.length !== 1 ? "s" : ""} requiring
              acknowledgment
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Priority: {breakdown}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
            View All
          </Button>
          {!isCritical && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <StaffAcknowledgmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        broadcasts={pendingBroadcasts}
      />
    </>
  );
}
