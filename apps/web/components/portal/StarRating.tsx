"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const labels = ["Poor", "Fair", "Good", "Great", "Excellent"];

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 32,
}: StarRatingProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex !== null ? hoverIndex : value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeIndex !== null && star <= activeIndex;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star !== 1 ? "s" : ""} - ${labels[star - 1]}`}
              disabled={readonly}
              className="transition-transform duration-150 hover:scale-110 disabled:cursor-default"
              style={{ color: isFilled ? "var(--portal-accent)" : "var(--portal-border)" }}
              onMouseEnter={() => !readonly && setHoverIndex(star)}
              onMouseLeave={() => !readonly && setHoverIndex(null)}
              onClick={() => {
                if (readonly) return;
                if (onChange) {
                  onChange(value === star ? 0 : star);
                }
              }}
              onKeyDown={(e) => {
                if (readonly || !onChange) return;
                if (e.key === "ArrowRight" && (value ?? 0) < 5) {
                  onChange((value ?? 0) + 1);
                } else if (e.key === "ArrowLeft" && (value ?? 0) > 1) {
                  onChange((value ?? 0) - 1);
                }
              }}
            >
              <Star
                width={size}
                height={size}
                fill={isFilled ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      {activeIndex !== null && activeIndex > 0 && (
        <span
          className="text-sm font-medium"
          style={{ color: "var(--portal-text-secondary)" }}
        >
          {labels[activeIndex - 1]}
        </span>
      )}
    </div>
  );
}
