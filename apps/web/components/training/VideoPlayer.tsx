"use client";

import { Play } from "lucide-react";

interface VideoPlayerProps {
  title?: string;
  mediaUrl: string;
  thumbnail?: string;
  durationSeconds: number;
  caption?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ title, durationSeconds, caption }: VideoPlayerProps) {
  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
          {title}
        </h3>
      )}
      <div
        className="relative w-full rounded-sm overflow-hidden border border-[var(--border-default)]"
        style={{ aspectRatio: "16/9", backgroundColor: "var(--bg-tertiary)" }}
      >
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: "var(--accent-blue)" }}
            aria-label="Play video"
          >
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3">
          <span
            className="px-2 py-1 rounded text-xs font-mono"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
            }}
          >
            {formatDuration(durationSeconds)}
          </span>
        </div>

        {/* Progress bar placeholder */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "var(--border-default)" }}>
          <div className="h-full w-0 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }} />
        </div>
      </div>

      {caption && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{caption}</p>
      )}
    </div>
  );
}
