import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ruleStatusEnum = pgEnum('rule_status', [
  'active',
  'paused',
  'draft',
  'error',
]);

export const executionStatusEnum = pgEnum('execution_status', [
  'success',
  'partial',
  'failed',
  'skipped',
]);

export const triggerEventEnum = pgEnum('trigger_event', [
  'ticket_created',
  'ticket_updated',
  'ticket_closed',
  'audit_completed',
  'audit_failed',
  'audit_score_below',
  'capa_created',
  'capa_overdue',
  'capa_closed',
  'task_overdue',
  'task_completed',
  'sop_published',
  'sla_breach',
]);

// ─── Automation Rules ────────────────────────────────────────────────────────

export const automationRules = pgTable('automation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  status: ruleStatusEnum('status').notNull().default('draft'),
  triggerEvent: triggerEventEnum('trigger_event').notNull(),
  triggerModule: text('trigger_module'),
  locationScope: uuid('location_scope').array(),
  templateId: uuid('template_id'),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  executionCount: integer('execution_count').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const automationRulesRelations = relations(automationRules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [automationRules.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [automationRules.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [automationRules.createdBy],
    references: [users.id],
  }),
  conditions: many(ruleConditions),
  actions: many(ruleActions),
  executions: many(ruleExecutions),
}));

// ─── Rule Conditions ─────────────────────────────────────────────────────────

export const ruleConditions = pgTable('rule_conditions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ruleId: uuid('rule_id').notNull().references(() => automationRules.id),
  field: text('field').notNull(),
  operator: text('operator').notNull(),
  value: jsonb('value'),
  logic: text('logic').default('AND'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ruleConditionsRelations = relations(ruleConditions, ({ one }) => ({
  organization: one(organizations, {
    fields: [ruleConditions.orgId],
    references: [organizations.id],
  }),
  rule: one(automationRules, {
    fields: [ruleConditions.ruleId],
    references: [automationRules.id],
  }),
}));

// ─── Rule Actions ────────────────────────────────────────────────────────────

export const ruleActions = pgTable('rule_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ruleId: uuid('rule_id').notNull().references(() => automationRules.id),
  type: text('type').notNull(),
  label: text('label'),
  icon: text('icon'),
  config: jsonb('config').default({}),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ruleActionsRelations = relations(ruleActions, ({ one }) => ({
  organization: one(organizations, {
    fields: [ruleActions.orgId],
    references: [organizations.id],
  }),
  rule: one(automationRules, {
    fields: [ruleActions.ruleId],
    references: [automationRules.id],
  }),
}));

// ─── Rule Executions ─────────────────────────────────────────────────────────

export const ruleExecutions = pgTable('rule_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ruleId: uuid('rule_id').notNull().references(() => automationRules.id),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull(),
  triggerEvent: triggerEventEnum('trigger_event').notNull(),
  triggerSourceId: uuid('trigger_source_id'),
  triggerSourceLabel: text('trigger_source_label'),
  conditionsMet: boolean('conditions_met').notNull(),
  actionsExecuted: jsonb('actions_executed').default([]),
  status: executionStatusEnum('status').notNull(),
  durationMs: integer('duration_ms').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ruleExecutionsRelations = relations(ruleExecutions, ({ one }) => ({
  organization: one(organizations, {
    fields: [ruleExecutions.orgId],
    references: [organizations.id],
  }),
  rule: one(automationRules, {
    fields: [ruleExecutions.ruleId],
    references: [automationRules.id],
  }),
}));
