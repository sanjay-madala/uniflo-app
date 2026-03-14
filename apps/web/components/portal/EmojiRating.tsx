"use client";

import { useState } from "react";

const emojis: { emoji: string; label: string; color: string; bg: string }[] = [
  { emoji: "\uD83D\uDE20", label: "Angry", color: "var(--portal-danger, var(--accent-red))", bg: "color-mix(in srgb, var(--portal-danger, var(--accent-red)) 10%, transparent)" },
  { emoji: "\uD83D\uDE1E", label: "Unhappy", color: "var(--portal-warning, var(--accent-yellow))", bg: "color-mix(in srgb, var(--portal-warning, var(--accent-yellow)) 10%, transparent)" },
  { emoji: "\uD83D\uDE10", label: "Neutral", color: "var(--portal-text-muted, var(--text-muted))", bg: "color-mix(in srgb, var(--portal-text-muted, var(--text-muted)) 10%, transparent)" },
  { emoji: "\uD83D\uDE0A", label: "Happy", color: "var(--portal-success, var(--accent-green))", bg: "color-mix(in srgb, var(--portal-success, var(--accent-green)) 10%, transparent)" },
  { emoji: "\uD83E\uDD29", label: "Delighted", color: "var(--portal-success, var(--accent-green))", bg: "color-mix(in srgb, var(--portal-success, var(--accent-green)) 15%, transparent)" },
];

interface EmojiRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function EmojiRating({
  value,
  onChange,
  readonly = false,
  size = 48,
}: EmojiRatingProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3" role="radiogroup" aria-label="Emoji rating">
        {emojis.map((item, i) => {
          const starValue = i + 1;
          const isSelected = value === starValue;
          const isHovered = hoverIndex === starValue;
          const isDimmed = value !== null && !isSelected && !isHovered;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${item.label} (${starValue})`}
              disabled={readonly}
              className="flex flex-col items-center gap-1 transition-all duration-200 disabled:cursor-default"
              style={{
                opacity: isDimmed ? 0.5 : 1,
                transform: isSelected ? "scale(1.2)" : "scale(1)",
              }}
              onMouseEnter={() => !readonly && setHoverIndex(starValue)}
              onMouseLeave={() => !readonly && setHoverIndex(null)}
              onClick={() => {
                if (readonly || !onChange) return;
                onChange(value === starValue ? 0 : starValue);
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: isSelected || isHovered ? item.bg : "transparent",
                  fontSize: size * 0.6,
                  filter: isDimmed ? "grayscale(1)" : "none",
                }}
              >
                {item.emoji}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isSelected ? item.color : "var(--portal-text-muted)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
