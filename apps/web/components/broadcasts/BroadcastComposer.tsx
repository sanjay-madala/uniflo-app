"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PageHeader,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
} from "@uniflo/ui";
import { Send, X, FileText, Paperclip } from "lucide-react";
import type { BroadcastPriority, BroadcastAudience, BroadcastAttachment } from "@uniflo/mock-data";
import { PrioritySelector } from "./PrioritySelector";
import { AcknowledgmentToggle } from "./AcknowledgmentToggle";
import { AudiencePreviewCount } from "./AudiencePreviewCount";
import { SchedulePicker } from "./SchedulePicker";
import { AttachmentUploader } from "./AttachmentUploader";
import { AudienceSelector } from "./AudienceSelector";

export function BroadcastComposer() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  // State
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [priority, setPriority] = useState<BroadcastPriority>("normal");
  const [audience, setAudience] = useState<BroadcastAudience | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [acknowledgmentRequired, setAcknowledgmentRequired] = useState(false);
  const [attachments] = useState<BroadcastAttachment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [audienceSelectorOpen, setAudienceSelectorOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const handleRemoveAttachment = useCallback((_id: string) => {
    // Mock: no-op in mock UI
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!subject.trim() || subject.trim().length < 5) {
      errs.subject = subject.trim().length === 0 ? "Subject is required" : "Subject must be at least 5 characters";
    }
    if (!bodyHtml.trim() || bodyHtml.replace(/<[^>]*>/g, "").trim().length < 10) {
      errs.body = "Message body cannot be empty";
    }
    if (!audience || audience.total_recipients === 0) {
      errs.audience = "Select at least one audience";
    }
    if (scheduleMode === "scheduled" && !scheduledDate) {
      errs.schedule = "Scheduled date must be in the future";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;
    setIsSending(true);
    // Mock send
    setTimeout(() => {
      setIsSending(false);
      router.push(`/${locale}/comms/`);
    }, 1000);
  };

  const handleDiscard = () => {
    router.push(`/${locale}/comms/`);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Broadcast"
        subtitle="Compose a broadcast message for your team"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              <X className="h-4 w-4" />
              Discard
            </Button>
            <Button size="sm" onClick={handleSend} disabled={isSending}>
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : scheduleMode === "scheduled" ? "Schedule" : "Send"}
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Subject */}
          <div className="flex flex-col gap-1">
            <Input
              placeholder="Subject line..."
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
              }}
              className={errors.subject ? "border-[var(--accent-red)]" : ""}
            />
            {errors.subject && (
              <span className="text-xs text-[var(--accent-red)]">{errors.subject}</span>
            )}
          </div>

          {/* Tabs: Compose / Preview */}
          <Tabs defaultValue="compose">
            <TabsList>
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="compose">
              <div className="flex flex-col gap-1">
                <textarea
                  value={bodyHtml}
                  onChange={(e) => {
                    setBodyHtml(e.target.value);
                    if (errors.body) setErrors((prev) => ({ ...prev, body: "" }));
                  }}
                  placeholder="Write your message... (HTML supported)"
                  className={`min-h-[400px] w-full rounded-md border bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] resize-y ${
                    errors.body
                      ? "border-[var(--accent-red)]"
                      : "border-[var(--border-default)]"
                  }`}
                />
                {errors.body && (
                  <span className="text-xs text-[var(--accent-red)]">{errors.body}</span>
                )}
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-6">
                <div className="rounded-md bg-[var(--bg-tertiary)] p-3 mb-4 text-xs text-[var(--text-muted)]">
                  This is how your broadcast will appear to recipients
                </div>
                {priority !== "normal" && (
                  <div className="flex justify-end mb-4">
                    <Badge variant={priority === "critical" ? "destructive" : "warning"}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Badge>
                  </div>
                )}
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                  {subject || "(No subject)"}
                </h1>
                <div
                  className="prose prose-sm max-w-none text-[var(--text-primary)]"
                  dangerouslySetInnerHTML={{ __html: bodyHtml || "<p class='text-[var(--text-muted)]'>(No content)</p>" }}
                />
                {attachments.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 text-sm text-[var(--accent-blue)]">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{att.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">({att.size})</span>
                      </div>
                    ))}
                  </div>
                )}
                {acknowledgmentRequired && (
                  <div className="mt-6 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Staff will see: <strong>[I acknowledge this message]</strong> button
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Attachments */}
          <AttachmentUploader
            attachments={attachments}
            onRemove={handleRemoveAttachment}
          />

          {/* Use Template link */}
          <button
            type="button"
            onClick={() => router.push(`/${locale}/comms/templates/`)}
            className="flex items-center gap-2 rounded-md border border-dashed border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Browse Templates
          </button>
        </div>

        {/* Right: Settings Panel */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* Audience */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Audience</label>
            <button
              type="button"
              onClick={() => setAudienceSelectorOpen(true)}
              className={`flex items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm transition-colors ${
                errors.audience
                  ? "border-[var(--accent-red)] text-[var(--accent-red)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]"
              }`}
            >
              {audience ? "Change Audience" : "Select Audience"}
            </button>
            {audience && (
              <AudiencePreviewCount
                regionCount={audience.region_ids.length}
                zoneCount={audience.zone_ids.length}
                totalRecipients={audience.total_recipients}
              />
            )}
            {errors.audience && (
              <span className="text-xs text-[var(--accent-red)]">{errors.audience}</span>
            )}
          </div>

          <SchedulePicker
            mode={scheduleMode}
            onModeChange={setScheduleMode}
            scheduledDate={scheduledDate}
            onDateChange={setScheduledDate}
            scheduledTime={scheduledTime}
            onTimeChange={setScheduledTime}
          />

          <AcknowledgmentToggle
            checked={acknowledgmentRequired}
            onCheckedChange={setAcknowledgmentRequired}
          />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-sm bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-[var(--accent-red)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AudienceSelector
        open={audienceSelectorOpen}
        onOpenChange={setAudienceSelectorOpen}
        value={audience}
        onApply={(a) => {
          setAudience(a);
          if (errors.audience) setErrors((prev) => ({ ...prev, audience: "" }));
        }}
      />
    </div>
  );
}
