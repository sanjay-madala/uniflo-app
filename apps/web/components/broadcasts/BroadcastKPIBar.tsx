"use client";

import type { Broadcast } from "@uniflo/mock-data";

interface BroadcastKPIBarProps {
  broadcasts: Broadcast[];
}

export function BroadcastKPIBar({ broadcasts }: BroadcastKPIBarProps) {
  const sentBroadcasts = broadcasts.filter((b) => b.status === "sent");
  const totalSent = sentBroadcasts.length;

  const avgOpenRate =
    sentBroadcasts.length > 0
      ? sentBroadcasts.reduce((sum, b) => sum + (b.stats?.open_rate ?? 0), 0) / sentBroadcasts.length
      : 0;

  const scheduledCount = broadcasts.filter((b) => b.status === "scheduled").length;

  const pendingAck = sentBroadcasts.filter(
    (b) => b.acknowledgment_required && b.stats && b.stats.ack_rate < 100
  ).length;

  const openRateColor =
    avgOpenRate >= 80
      ? "var(--accent-green)"
      : avgOpenRate >= 60
        ? "var(--accent-yellow)"
        : "var(--accent-red)";

  const pendingAckColor = pendingAck > 0 ? "var(--accent-yellow)" : "var(--accent-green)";

  const cards = [
    { label: "Total Sent", value: String(totalSent), color: "var(--text-primary)" },
    { label: "Avg Open Rate", value: `${avgOpenRate.toFixed(1)}%`, color: openRateColor },
    { label: "Scheduled Upcoming", value: String(scheduledCount), color: "var(--accent-blue)" },
    { label: "Pending Acknowledgments", value: String(pendingAck), color: pendingAckColor },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4"
        >
          <p className="text-xs font-medium text-[var(--text-muted)]">{card.label}</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
