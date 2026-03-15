"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { usePortalTicketsData } from "@/lib/data/useCSATData";
import type { CSATSurvey, PortalTicket } from "@uniflo/mock-data";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { StarRating } from "@/components/portal/StarRating";
import { EmojiRating } from "@/components/portal/EmojiRating";

const NOW = new Date("2026-03-14T12:00:00Z");

export default function CSATSurveyClient() {
  const { locale, surveyToken } = useParams<{
    locale: string;
    surveyToken: string;
  }>();

  const { data: portalTickets, surveys: csatSurveys } = usePortalTicketsData();

  const survey = useMemo(
    () =>
      csatSurveys.find((s) => s.token === surveyToken) ?? null,
    [surveyToken, csatSurveys]
  );

  const ticket = useMemo(
    () =>
      survey
        ? portalTickets.find(
            (t) => t.id === survey.ticket_id
          ) ?? null
        : null,
    [survey, portalTickets]
  );

  const [starRating, setStarRating] = useState<number | null>(null);
  const [emojiRating, setEmojiRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Determine token status
  const tokenStatus = useMemo((): "valid" | "expired" | "used" => {
    if (!survey) return "expired";
    if (survey.submitted_at) return "used";
    if (new Date(survey.expires_at) < NOW) return "expired";
    return "valid";
  }, [survey]);

  const effectiveRating = starRating ?? emojiRating;
  const ratingMode = survey?.rating_mode ?? "both";

  function handleSubmit() {
    if (!effectiveRating) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  }

  const dynamicPlaceholder =
    effectiveRating && effectiveRating <= 3
      ? "What could we have done better?"
      : "What made this experience great?";

  return (
    <div className="portal-theme flex min-h-screen flex-col">
      <PortalHeader title="How did we do?" />

      <main className="mx-auto flex w-full max-w-[560px] flex-1 items-center justify-center px-6 py-12">
        {/* Expired */}
        {tokenStatus === "expired" && (
          <div className="text-center">
            <p
              className="text-sm"
              style={{ color: "var(--portal-text-secondary)" }}
            >
              This survey has expired. Thank you for your interest.
            </p>
          </div>
        )}

        {/* Already submitted */}
        {tokenStatus === "used" && survey && (
          <div className="text-center">
            <p
              className="text-sm"
              style={{ color: "var(--portal-text-secondary)" }}
            >
              You&apos;ve already submitted feedback for this ticket. Thank you!
            </p>
            {survey.score && (
              <div className="mt-4">
                <StarRating value={survey.score} readonly size={28} />
              </div>
            )}
          </div>
        )}

        {/* Valid - show survey or submitted */}
        {tokenStatus === "valid" && (
          <>
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(5,150,105,0.1)" }}
                >
                  <Check
                    className="h-8 w-8"
                    style={{ color: "var(--portal-success)" }}
                  />
                </div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--portal-text-primary)" }}
                >
                  Thank you for your feedback!
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--portal-text-secondary)" }}
                >
                  Your response helps us improve.
                </p>
                <a
                  href={`/${locale}/customer`}
                  className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--portal-accent)" }}
                >
                  Back to Portal
                </a>
              </div>
            ) : (
              <div
                className="w-full rounded-lg border p-8"
                style={{
                  backgroundColor: "var(--portal-surface)",
                  borderColor: "var(--portal-border)",
                }}
              >
                {ticket && (
                  <p
                    className="mb-6 text-center text-sm"
                    style={{ color: "var(--portal-text-secondary)" }}
                  >
                    Your ticket &ldquo;{ticket.title}&rdquo; was resolved.
                  </p>
                )}

                {/* Star rating */}
                {(ratingMode === "stars" || ratingMode === "both") && (
                  <div className="mb-6">
                    <p
                      className="mb-3 text-center text-sm font-medium"
                      style={{ color: "var(--portal-text-primary)" }}
                    >
                      How would you rate your experience?
                    </p>
                    <StarRating value={starRating} onChange={setStarRating} />
                  </div>
                )}

                {/* Divider for "both" mode */}
                {ratingMode === "both" && (
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: "var(--portal-border)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--portal-text-muted)" }}
                    >
                      OR
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: "var(--portal-border)" }}
                    />
                  </div>
                )}

                {/* Emoji rating */}
                {(ratingMode === "emoji" || ratingMode === "both") && (
                  <div className="mb-6">
                    <p
                      className="mb-3 text-center text-sm font-medium"
                      style={{ color: "var(--portal-text-primary)" }}
                    >
                      How are you feeling about the resolution?
                    </p>
                    <EmojiRating value={emojiRating} onChange={setEmojiRating} />
                  </div>
                )}

                {/* Comment */}
                <div className="mb-6">
                  <label
                    className="mb-1.5 block text-sm"
                    style={{ color: "var(--portal-text-secondary)" }}
                  >
                    Tell us more (optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    placeholder={dynamicPlaceholder}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--portal-bg)",
                      borderColor: "var(--portal-border)",
                      color: "var(--portal-text-primary)",
                    }}
                  />
                  <p
                    className="mt-1 text-right text-xs"
                    style={{ color: "var(--portal-text-muted)" }}
                  >
                    {comment.length}/1000
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={!effectiveRating || effectiveRating === 0 || isSubmitting}
                    className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                    style={{ backgroundColor: "var(--portal-accent)" }}
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
