export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "critical" | "high" | "medium" | "low";
export type TicketCategory = "fb" | "housekeeping" | "maintenance" | "compliance" | "guest_relations";

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: TicketCategory;
  assignee_id: string | null;
  reporter_id?: string;
  location_id: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  sla_breach_at?: string | null;
  resolved_at?: string | null;
  linked_audit_id?: string | null;
  linked_capa_id?: string | null;
  attachments?: Array<{ name: string; type: string; size: string }>;
  comments_count?: number;
  watchers?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  location_id: string;
  created_at: string;
}

// SOP Types
export type SOPStatus = "draft" | "in_review" | "published" | "archived";
export type SOPCategory = "safety" | "operations" | "customer_service" | "compliance" | "maintenance" | "hr";
export type SOPStepType = "instruction" | "checklist" | "decision" | "warning" | "reference";

export interface SOPStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: SOPStepType;
  required: boolean;
  attachments?: SOPAttachment[];
  decision_branches?: {
    label: string;
    goto_step_id: string;
  }[];
  checklist_items?: string[];
}

export interface SOPAttachment {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document";
  url: string;
  size: string;
}

export interface SOPVersion {
  id: string;
  version: string;
  created_at: string;
  created_by: string;
  change_summary: string;
  status: SOPStatus;
}

export interface SOPAcknowledgment {
  id: string;
  user_id: string;
  acknowledged_at: string | null;
  version: string;
}

export interface SOP {
  id: string;
  title: string;
  description: string;
  version: string;
  status: SOPStatus;
  category: SOPCategory;
  tags: string[];
  steps: SOPStep[];
  location_ids: string[];
  role_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  auto_publish_kb: boolean;
  linked_kb_article_id: string | null;
  linked_audit_template_ids: string[];
  linked_capa_ids: string[];
  versions: SOPVersion[];
  acknowledgments: SOPAcknowledgment[];
  acknowledgment_required: boolean;
  estimated_read_time_minutes: number;
}

// --- CAPA Types ---

export type CAPAStatus = "open" | "in_progress" | "verified" | "closed";
export type CAPASeverity = "critical" | "high" | "medium" | "low";
export type CAPASource = "audit" | "ticket" | "manual";
export type RootCauseMethod = "five_why" | "fishbone" | "freeform";

export interface RootCauseAnalysis {
  method: RootCauseMethod;
  whys?: string[];
  fishbone?: {
    people?: string[];
    process?: string[];
    equipment?: string[];
    materials?: string[];
    environment?: string[];
    measurement?: string[];
  };
  narrative?: string;
  conclusion: string;
}

export interface CAPAAction {
  id: string;
  type: "corrective" | "preventive";
  description: string;
  assignee_id: string | null;
  due_date: string;
  status: "pending" | "in_progress" | "completed";
  completed_at?: string | null;
  evidence?: Array<{
    name: string;
    type: string;
    url: string;
    uploaded_at: string;
  }>;
  notes?: string;
}

export interface CAPAEffectivenessReview {
  id: string;
  reviewer_id: string;
  reviewed_at: string;
  effective: boolean;
  criteria: Array<{
    label: string;
    met: boolean;
    comment?: string;
  }>;
  follow_up_required: boolean;
  follow_up_capa_id?: string | null;
  sign_off_comment?: string;
}

export interface CAPA {
  id: string;
  title: string;
  description?: string;
  status: CAPAStatus;
  severity: CAPASeverity;
  source: CAPASource;
  source_id: string | null;
  source_title?: string;

  root_cause: string;
  root_cause_analysis?: RootCauseAnalysis;

  corrective_action: string;
  preventive_action: string;
  actions?: CAPAAction[];

  owner_id: string;
  location_id: string;
  due_date: string;

  linked_ticket_ids?: string[];
  linked_audit_ids?: string[];
  linked_sop_ids?: string[];

  effectiveness_review?: CAPAEffectivenessReview;

  created_at: string;
  updated_at?: string;
  closed_at?: string | null;

  tags?: string[];
  category?: string;
}

// ─── Audit Status ─────────────────────────────────────────────
export type AuditStatus = "scheduled" | "in_progress" | "completed" | "failed";
export type AuditItemResultValue = "pass" | "fail" | "na" | "pending";
export type AuditQuestionType = "yes_no" | "rating" | "photo" | "text" | "checkbox";
export type AuditSeverity = "critical" | "major" | "minor" | "observation";

// ─── Audit Template ───────────────────────────────────────────
export interface AuditTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: AuditTemplateSection[];
  total_items: number;
  pass_threshold: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: string;
  linked_sop_ids: string[];
}

export interface AuditTemplateSection {
  id: string;
  title: string;
  description?: string;
  weight: number;
  items: AuditTemplateItem[];
}

export interface AuditTemplateItem {
  id: string;
  question: string;
  type: AuditQuestionType;
  required: boolean;
  severity_if_fail: AuditSeverity;
  linked_sop_id?: string;
  photo_required_on_fail: boolean;
  help_text?: string;
}

// ─── Audit Instance ───────────────────────────────────────────
export interface Audit {
  id: string;
  title: string;
  template_id: string;
  status: AuditStatus;
  location_id: string;
  auditor_id: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  score: number | null;
  pass: boolean | null;
  sections: AuditSectionResult[];
  findings: string[];
  auto_created_ticket_ids: string[];
  auto_created_capa_ids: string[];
  notes?: string;
  attachments: AuditAttachment[];
}

export interface AuditSectionResult {
  section_id: string;
  title: string;
  score: number;
  total_items: number;
  passed_items: number;
  failed_items: number;
  na_items: number;
  items: AuditItemResultFull[];
}

export interface AuditItemResultFull {
  item_id: string;
  question: string;
  type: AuditQuestionType;
  result: AuditItemResultValue;
  score: number;
  severity_if_fail: AuditSeverity;
  notes?: string;
  photo_urls: string[];
  auto_ticket_id?: string;
}

export interface AuditAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  item_id?: string;
  uploaded_at: string;
}

// ─── Audit Trend Data ─────────────────────────────────────────
export interface AuditTrendPoint {
  month: string;
  score: number;
  audit_count: number;
  pass_rate: number;
}

// ─── Auto-Ticket Proposal ─────────────────────────────────────
export interface ProposedTicket {
  temp_id: string;
  title: string;
  priority: TicketPriority;
  category: TicketCategory;
  assignee_id: string | null;
  description: string;
  location_id: string;
  source_section: string;
  source_item: string;
  photo_count: number;
  tags: string[];
}

export interface ProposedCapa {
  temp_id: string;
  title: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  owner_id: string;
  due_date: string;
  linked_sop_id?: string;
  source_section: string;
}

export type TriggerEvent =
  | "ticket_created"
  | "ticket_updated"
  | "ticket_closed"
  | "audit_completed"
  | "audit_failed"
  | "audit_score_below"
  | "capa_created"
  | "capa_overdue"
  | "capa_closed"
  | "task_overdue"
  | "task_completed"
  | "sop_published"
  | "sla_breach";

export interface RuleTrigger {
  event: TriggerEvent;
  label: string;
  icon: string;
  module: "tickets" | "audits" | "capa" | "tasks" | "sops" | "sla";
}

// --- Condition ---

export type ConditionField =
  | "score"
  | "priority"
  | "status"
  | "category"
  | "location"
  | "assignee"
  | "severity"
  | "due_date_days"
  | "tags_include";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "contains"
  | "is_empty"
  | "is_not_empty";

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | string[];
  logic?: "AND" | "OR";
}

// --- Action ---

export type ActionType =
  | "create_ticket"
  | "create_capa"
  | "create_task"
  | "update_field"
  | "assign_to"
  | "send_notification"
  | "change_status"
  | "add_tag"
  | "trigger_audit";

export interface RuleAction {
  id: string;
  type: ActionType;
  label: string;
  icon: string;
  config: Record<string, string | number | boolean>;
}

// --- Execution Log ---

export type ExecutionStatus = "success" | "partial" | "failed" | "skipped";

export interface RuleExecution {
  id: string;
  rule_id: string;
  triggered_at: string;
  trigger_event: TriggerEvent;
  trigger_source_id: string;
  trigger_source_label: string;
  conditions_met: boolean;
  actions_executed: Array<{
    action_type: ActionType;
    status: ExecutionStatus;
    result_id?: string;
    result_label?: string;
    error?: string;
  }>;
  status: ExecutionStatus;
  duration_ms: number;
}

// --- Rule ---

export type RuleStatus = "active" | "paused" | "draft" | "error";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: RuleStatus;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  created_by: string;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
  execution_count: number;
  success_count: number;
  failure_count: number;
  template_id: string | null;
  location_scope: string[];
}

// --- Template ---

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: "compliance" | "operations" | "support" | "safety" | "quality" | "efficiency";
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  popularity: number;
  tags: string[];
  icon: string;
}

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body_html: string;
  status: KBArticleStatus;
  visibility: KBVisibility;
  category_id: string;
  collection_ids: string[];
  tags: string[];
  author_id: string;
  last_edited_by: string;
  sop_source_id: string | null;
  sop_source_name: string | null;
  featured_image: string | null;
  table_of_contents: TOCHeading[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
}

export interface TOCHeading {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export interface ArticleAnalytics {
  article_id: string;
  period: string;
  views: number;
  unique_views: number;
  helpful_votes: number;
  not_helpful_votes: number;
  avg_read_time_seconds: number;
  referral_source: ArticleReferralSource[];
}

export interface ArticleReferralSource {
  source: "search" | "direct" | "ticket_sidebar" | "sop_link" | "external";
  count: number;
}

export interface KBSearchGap {
  id: string;
  query: string;
  search_count: number;
  last_searched_at: string;
  has_results: boolean;
  result_count: number;
}

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "cancelled";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskSource = "manual" | "audit" | "capa" | "ticket" | "automation";

export interface Subtask {
  id: string;
  title: string;
  status: "todo" | "done";
  assignee_id?: string | null;
  due_date?: string;
  completed_at?: string | null;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id?: string;
  project_id?: string | null;
  location_id: string;
  due_date: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  tags?: string[];
  subtasks?: Subtask[];
  source: TaskSource;
  linked_audit_id?: string | null;
  linked_audit_item?: string | null;
  linked_capa_id?: string | null;
  linked_ticket_id?: string | null;
  linked_sop_id?: string | null;
  attachments?: Array<{ name: string; type: string; size: string }>;
  comments_count?: number;
  watchers?: string[];
  estimated_hours?: number;
  custom_fields?: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on_hold" | "archived";
  owner_id: string;
  location_id?: string;
  created_at: string;
  updated_at?: string;
  due_date?: string;
  task_count: number;
  completed_task_count: number;
  color: string;
  tags?: string[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  text: string;
  created_at: string;
  is_system?: boolean;
}

// ─── Portal & CSAT Types (EPIC-013) ──────────────────────────────

export type PortalTicketStatus =
  | "submitted"
  | "in_progress"
  | "awaiting_reply"
  | "resolved"
  | "closed";

export type PortalTicketCategory =
  | "fb"
  | "housekeeping"
  | "maintenance"
  | "compliance"
  | "guest_relations"
  | "general";

export interface PortalAttachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  size: string;
  url: string;
  thumbnail_url?: string;
  uploaded_at: string;
}

export interface PortalTicket {
  id: string;
  title: string;
  description: string;
  status: PortalTicketStatus;
  priority: "low" | "medium" | "high";
  category: PortalTicketCategory;
  location_id: string;
  location_name: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  attachments: PortalAttachment[];
  csat_score?: number | null;
  csat_submitted_at?: string | null;
}

export type PortalTimelineEntryType =
  | "submitted"
  | "status_change"
  | "agent_reply"
  | "customer_reply"
  | "attachment_added"
  | "resolved"
  | "reopened"
  | "closed";

export interface PortalTimelineEntry {
  id: string;
  ticket_id: string;
  type: PortalTimelineEntryType;
  actor: "customer" | "agent" | "system";
  actor_name: string;
  content: string;
  attachments?: PortalAttachment[];
  created_at: string;
}

export interface CSATSurvey {
  id: string;
  ticket_id: string;
  token: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  rating_mode: "stars" | "emoji" | "both";
  score: number | null;
  comment: string | null;
  submitted_at: string | null;
  dismissed: boolean;
  expires_at: string;
  created_at: string;
}

export interface CSATTrendPoint {
  date: string;
  avg_score: number;
  response_count: number;
  response_rate: number;
}

export interface CSATDistribution {
  star_1: number;
  star_2: number;
  star_3: number;
  star_4: number;
  star_5: number;
  total: number;
}

export interface CSATCategoryScore {
  category: PortalTicketCategory;
  category_label: string;
  avg_score: number;
  response_count: number;
}

export interface CSATLowScoreEntry {
  ticket_id: string;
  ticket_title: string;
  score: number;
  customer_name: string;
  agent_name: string;
  agent_id: string;
  category: PortalTicketCategory;
  category_label: string;
  location_id: string;
  location_name: string;
  resolved_at: string;
  rated_at: string;
  comment?: string;
}

export interface CSATDashboardSummary {
  avg_score: number;
  avg_score_previous: number;
  response_rate: number;
  response_rate_previous: number;
  total_responses: number;
  total_responses_previous: number;
  low_score_count: number;
  low_score_count_previous: number;
  threshold: number;
}

export type CSATAlertStatus = "active" | "acknowledged" | "resolved";

export interface CSATAlert {
  id: string;
  location_id: string;
  location_name: string;
  current_avg_score: number;
  previous_avg_score: number;
  threshold: number;
  period: "7d" | "30d" | "90d";
  triggered_at: string;
  status: CSATAlertStatus;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  triggered_audit_id?: string | null;
  triggered_capa_id?: string | null;
  contributing_ticket_ids: string[];
}
