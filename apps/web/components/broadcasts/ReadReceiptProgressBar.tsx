"use client";

interface ReadReceiptProgressBarProps {
  acknowledged: number;
  read: number;
  delivered: number;
  unread: number;
  total: number;
}

export function ReadReceiptProgressBar({
  acknowledged,
  read,
  delivered,
  unread,
  total,
}: ReadReceiptProgressBarProps) {
  if (total === 0) return null;

  const segments = [
    { count: acknowledged, label: "Acknowledged", color: "var(--accent-green)" },
    { count: read, label: "Read", color: "var(--accent-blue)" },
    { count: delivered, label: "Delivered", color: "var(--accent-yellow)" },
    { count: unread, label: "Unread", color: "var(--text-muted)" },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-all"
            style={{
              width: `${(seg.count / total) * 100}%`,
              backgroundColor: seg.color,
            }}
            title={`${seg.label}: ${seg.count} (${((seg.count / total) * 100).toFixed(1)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[var(--text-secondary)]">
              {seg.label} ({seg.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
