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

// ====================================================================
// ANALYTICS & REPORTING TYPES (EPIC-008)
// ====================================================================

// -- Date Range --
export interface DateRange {
  start: string;
  end: string;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "custom";

// -- Location Hierarchy for Drill-Down --
export interface LocationNode {
  id: string;
  name: string;
  type: "org" | "region" | "zone" | "city" | "store";
  parent_id: string | null;
  children?: LocationNode[];
  metrics?: LocationMetrics;
}

export interface LocationMetrics {
  compliance_score: number;
  open_tickets: number;
  open_capas: number;
  overdue_tasks: number;
  audits_this_period: number;
  avg_resolution_hours: number;
  sla_compliance_pct: number;
  csat_score: number | null;
}

// -- Executive Dashboard KPIs --
export interface DashboardKPI {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend: number;
  trendLabel: string;
  isPositive: boolean;
  sparklineData: Array<{ name: string; value: number }>;
  color: string;
  module: "tickets" | "audits" | "capa" | "tasks" | "sla" | "overall";
  linkTo?: string;
}

// -- Trend Data Points --
export interface TrendDataPoint {
  date: string;
  compliance: number;
  csat: number;
  ticket_volume: number;
  resolution_hours: number;
  sla_compliance: number;
  audit_score: number;
}

// -- Activity Feed Event --
export type ActivityEventType =
  | "ticket_created"
  | "ticket_resolved"
  | "ticket_escalated"
  | "audit_completed"
  | "audit_failed"
  | "capa_created"
  | "capa_closed"
  | "capa_overdue"
  | "task_completed"
  | "task_overdue"
  | "sla_breach"
  | "sop_published"
  | "automation_fired";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  module: "tickets" | "audits" | "capa" | "tasks" | "sla" | "sops" | "automation";
  actor_id: string;
  actor_name: string;
  location_id: string;
  location_name: string;
  timestamp: string;
  severity?: "info" | "warning" | "critical";
  link_to?: string;
  source_id?: string;
}

// -- Ticket Analytics --
export interface TicketAnalytics {
  period: string;
  created: number;
  resolved: number;
  escalated: number;
  avg_resolution_hours: number;
  avg_first_response_hours: number;
  sla_met: number;
  sla_breached: number;
  by_category: Array<{ category: string; count: number; color: string }>;
  by_priority: Array<{ priority: string; count: number; color: string }>;
  by_location: Array<{ location_id: string; location_name: string; count: number }>;
  csat_avg: number | null;
  csat_responses: number;
}

// -- Audit Analytics --
export interface AuditAnalytics {
  period: string;
  audits_completed: number;
  audits_scheduled: number;
  avg_score: number;
  pass_rate: number;
  by_location: Array<{
    location_id: string;
    location_name: string;
    avg_score: number;
    audit_count: number;
    pass_rate: number;
  }>;
  by_category: Array<{ category: string; avg_score: number; count: number }>;
  findings_count: number;
  auto_tickets_created: number;
  auto_capas_created: number;
  score_trend: Array<{ date: string; score: number }>;
}

// -- CAPA Analytics --
export interface CAPAAnalytics {
  period: string;
  total_open: number;
  total_closed: number;
  avg_closure_days: number;
  overdue_count: number;
  by_severity: Array<{ severity: string; count: number; color: string }>;
  by_source: Array<{ source: string; count: number; color: string }>;
  by_location: Array<{
    location_id: string;
    location_name: string;
    open: number;
    closed: number;
    overdue: number;
  }>;
  closure_trend: Array<{ date: string; closed: number; opened: number }>;
  recurrence_rate: number;
  effectiveness_rate: number;
}

// -- Task Analytics --
export interface TaskAnalytics {
  period: string;
  total_created: number;
  total_completed: number;
  total_overdue: number;
  avg_completion_days: number;
  velocity: number;
  by_assignee: Array<{
    user_id: string;
    user_name: string;
    assigned: number;
    completed: number;
    overdue: number;
  }>;
  by_source: Array<{ source: string; count: number; color: string }>;
  by_status: Array<{ status: string; count: number; color: string }>;
  completion_trend: Array<{ date: string; completed: number; created: number }>;
  overdue_trend: Array<{ date: string; overdue: number; on_time: number }>;
}

// -- Custom Report Builder --
export type WidgetType =
  | "kpi_card"
  | "bar_chart"
  | "line_chart"
  | "donut_chart"
  | "table"
  | "activity_feed"
  | "heatmap"
  | "scorecard";

export type WidgetDataSource =
  | "tickets"
  | "audits"
  | "capa"
  | "tasks"
  | "sla"
  | "cross_module";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data_source: WidgetDataSource;
  metric?: string;
  chart_config?: {
    data_key: string;
    x_axis_key?: string;
    color?: string;
    secondary_color?: string;
    show_legend?: boolean;
    fill?: boolean;
  };
  position: { x: number; y: number };
  size: { w: number; h: number };
  filters?: Record<string, string>;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  owner_id: string;
  shared_with: string[];
  created_at: string;
  updated_at: string;
  is_default: boolean;
  grid_columns: number;
}

// -- Export Configuration --
export type ExportFormat = "pdf" | "csv" | "xlsx";

export interface ExportConfig {
  id: string;
  name: string;
  format: ExportFormat;
  scope: "current_view" | "custom_range" | "full_report";
  date_range?: DateRange;
  location_ids?: string[];
  modules?: WidgetDataSource[];
  include_charts: boolean;
  include_raw_data: boolean;
  scheduled?: {
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
    next_run: string;
  };
}

// -- Cross-Module Summary --
export interface CrossModuleSummary {
  date_range: DateRange;
  location_id: string | null;
  tickets: {
    open: number;
    resolved_this_period: number;
    avg_resolution_hours: number;
    sla_compliance_pct: number;
    trend_vs_prior: number;
  };
  audits: {
    completed_this_period: number;
    avg_score: number;
    pass_rate: number;
    findings_count: number;
    trend_vs_prior: number;
  };
  capa: {
    open: number;
    overdue: number;
    closure_rate: number;
    avg_closure_days: number;
    trend_vs_prior: number;
  };
  tasks: {
    open: number;
    overdue: number;
    completion_rate: number;
    velocity: number;
    trend_vs_prior: number;
  };
  sla: {
    overall_compliance_pct: number;
    breaches_this_period: number;
    avg_time_to_breach_hours: number;
    trend_vs_prior: number;
  };
  overall_health_score: number;
}
