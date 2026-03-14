"use client";

import type { ContentBlock } from "@uniflo/mock-data";
import { VideoPlayer } from "./VideoPlayer";

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-8">
      {sorted.map((block) => (
        <div key={block.id} id={`block-${block.id}`} className="scroll-mt-20">
          {block.type === "text" && (
            <div>
              {block.title && (
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                  {block.title}
                </h2>
              )}
              {block.body_html && (
                <div
                  className="prose prose-sm max-w-none text-[var(--text-secondary)] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-3 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:text-sm [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:text-sm [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: block.body_html }}
                />
              )}
            </div>
          )}

          {block.type === "video" && (
            <VideoPlayer
              title={block.title}
              mediaUrl={block.media_url ?? ""}
              thumbnail={block.media_thumbnail}
              durationSeconds={block.duration_seconds ?? 0}
              caption={block.caption}
            />
          )}

          {block.type === "image" && (
            <figure>
              {block.title && (
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {block.title}
                </h3>
              )}
              <div
                className="w-full max-h-[480px] rounded-sm overflow-hidden border border-[var(--border-default)]"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <div
                  className="w-full h-64 flex items-center justify-center text-[var(--text-muted)] text-sm"
                  role="img"
                  aria-label={block.alt_text ?? block.title ?? "Training image"}
                >
                  {block.alt_text ?? "Image placeholder"}
                </div>
              </div>
              {block.caption && (
                <figcaption className="mt-2 text-xs italic text-[var(--text-secondary)]">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )}

          {block.type === "embed" && (
            <div>
              {block.title && (
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {block.title}
                </h3>
              )}
              <div
                className="w-full h-48 rounded-sm border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] text-sm"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                Embedded content placeholder
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
