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
