import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const slaModuleEnum = pgEnum('sla_module', [
  'tickets',
  'audits',
  'capa',
]);

export const slaMetricTypeEnum = pgEnum('sla_metric_type', [
  'first_response',
  'resolution',
  'completion',
  'update_interval',
]);

export const slaPolicyStatusEnum = pgEnum('sla_policy_status', [
  'active',
  'paused',
  'draft',
]);

export const slaTimeUnitEnum = pgEnum('sla_time_unit', [
  'minutes',
  'hours',
  'days',
]);

export const slaBreachStatusEnum = pgEnum('sla_breach_status', [
  'at_risk',
  'breached',
  'escalated',
  'resolved',
]);

export const slaBreachSeverityEnum = pgEnum('sla_breach_severity', [
  'critical',
  'warning',
  'info',
]);

// ─── SLA Policies ────────────────────────────────────────────────────────────

export const slaPolicies = pgTable('sla_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  module: slaModuleEnum('module').notNull(),
  status: slaPolicyStatusEnum('status').notNull().default('draft'),
  conditions: jsonb('conditions').default([]),
  escalationEnabled: boolean('escalation_enabled').notNull().default(false),
  escalationConfig: jsonb('escalation_config'),
  businessHours: jsonb('business_hours'),
  priorityOrder: integer('priority_order').notNull().default(0),
  locationScope: uuid('location_scope').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const slaPoliciesRelations = relations(slaPolicies, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [slaPolicies.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [slaPolicies.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [slaPolicies.createdBy],
    references: [users.id],
  }),
  targets: many(slaTargets),
  breaches: many(slaBreaches),
}));

// ─── SLA Targets ─────────────────────────────────────────────────────────────

export const slaTargets = pgTable('sla_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  policyId: uuid('policy_id').notNull().references(() => slaPolicies.id),
  metric: slaMetricTypeEnum('metric').notNull(),
  label: text('label'),
  targetValue: integer('target_value').notNull(),
  targetUnit: slaTimeUnitEnum('target_unit').notNull(),
  businessHoursOnly: boolean('business_hours_only').notNull().default(false),
  warningThresholdPercent: integer('warning_threshold_percent').notNull().default(80),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const slaTargetsRelations = relations(slaTargets, ({ one }) => ({
  organization: one(organizations, {
    fields: [slaTargets.orgId],
    references: [organizations.id],
  }),
  policy: one(slaPolicies, {
    fields: [slaTargets.policyId],
    references: [slaPolicies.id],
  }),
}));

// ─── SLA Breaches ────────────────────────────────────────────────────────────

export const slaBreaches = pgTable('sla_breaches', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  policyId: uuid('policy_id').notNull().references(() => slaPolicies.id),
  module: slaModuleEnum('module').notNull(),
  itemId: uuid('item_id').notNull(),
  itemTitle: text('item_title'),
  metric: slaMetricTypeEnum('metric').notNull(),
  targetValue: integer('target_value').notNull(),
  targetUnit: slaTimeUnitEnum('target_unit').notNull(),
  elapsedValue: real('elapsed_value').notNull(),
  elapsedUnit: slaTimeUnitEnum('elapsed_unit').notNull(),
  remainingMs: integer('remaining_ms').default(0),
  breachStatus: slaBreachStatusEnum('breach_status').notNull(),
  breachSeverity: slaBreachSeverityEnum('breach_severity').notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  targetAt: timestamp('target_at', { withTimezone: true }).notNull(),
  breachedAt: timestamp('breached_at', { withTimezone: true }),
  escalatedAt: timestamp('escalated_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const slaBreachesRelations = relations(slaBreaches, ({ one }) => ({
  organization: one(organizations, {
    fields: [slaBreaches.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [slaBreaches.locationId],
    references: [locations.id],
  }),
  policy: one(slaPolicies, {
    fields: [slaBreaches.policyId],
    references: [slaPolicies.id],
  }),
  assignee: one(users, {
    fields: [slaBreaches.assigneeId],
    references: [users.id],
  }),
}));
