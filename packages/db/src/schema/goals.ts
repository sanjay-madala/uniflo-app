import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  real,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const goalStatusEnum = pgEnum('goal_status', [
  'draft',
  'active',
  'achieved',
  'missed',
  'archived',
]);

export const goalHealthEnum = pgEnum('goal_health', [
  'on_track',
  'at_risk',
  'behind',
  'achieved',
]);

export const goalTimeframeEnum = pgEnum('goal_timeframe', [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'annual',
  'custom',
]);

export const goalLevelEnum = pgEnum('goal_level', [
  'organization',
  'team',
  'individual',
]);

export const krTrackingTypeEnum = pgEnum('kr_tracking_type', [
  'manual',
  'auto',
]);

export const krUnitEnum = pgEnum('kr_unit', [
  'percent',
  'number',
  'currency',
  'boolean',
  'score',
]);

export const krDirectionEnum = pgEnum('kr_direction', [
  'increase',
  'decrease',
  'maintain',
]);

// ─── Goals ───────────────────────────────────────────────────────────────────

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  level: goalLevelEnum('level').notNull().default('team'),
  status: goalStatusEnum('status').notNull().default('draft'),
  health: goalHealthEnum('health').notNull().default('on_track'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  teamId: uuid('team_id'),
  teamName: text('team_name'),
  timeframe: goalTimeframeEnum('timeframe').notNull(),
  timeframeLabel: text('timeframe_label'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  progressPct: real('progress_pct').notNull().default(0),
  parentGoalId: uuid('parent_goal_id'),
  tags: text('tags').array(),
  category: text('category'),
  linkedModules: jsonb('linked_modules').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const goalsRelations = relations(goals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [goals.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [goals.locationId],
    references: [locations.id],
  }),
  owner: one(users, {
    fields: [goals.ownerId],
    references: [users.id],
    relationName: 'goalOwner',
  }),
  creator: one(users, {
    fields: [goals.createdBy],
    references: [users.id],
    relationName: 'goalCreator',
  }),
  parent: one(goals, {
    fields: [goals.parentGoalId],
    references: [goals.id],
    relationName: 'goalParentChild',
  }),
  children: many(goals, { relationName: 'goalParentChild' }),
  keyResults: many(keyResults),
}));

// ─── Key Results ─────────────────────────────────────────────────────────────

export const keyResults = pgTable('key_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  goalId: uuid('goal_id').notNull().references(() => goals.id),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  unit: krUnitEnum('unit').notNull().default('percent'),
  direction: krDirectionEnum('direction').notNull().default('increase'),
  startValue: real('start_value').notNull().default(0),
  currentValue: real('current_value').notNull().default(0),
  targetValue: real('target_value').notNull(),
  progressPct: real('progress_pct').notNull().default(0),
  trackingType: krTrackingTypeEnum('tracking_type').notNull().default('manual'),
  dataSource: text('data_source'),
  dataSourceLabel: text('data_source_label'),
  dataSourceModule: text('data_source_module'),
  lastAutoUpdate: timestamp('last_auto_update', { withTimezone: true }),
  health: goalHealthEnum('health').notNull().default('on_track'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  linkedAuditIds: uuid('linked_audit_ids').array(),
  linkedTicketIds: uuid('linked_ticket_ids').array(),
  linkedCapaIds: uuid('linked_capa_ids').array(),
  linkedTrainingIds: uuid('linked_training_ids').array(),
  linkedSopIds: uuid('linked_sop_ids').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const keyResultsRelations = relations(keyResults, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [keyResults.orgId],
    references: [organizations.id],
  }),
  goal: one(goals, {
    fields: [keyResults.goalId],
    references: [goals.id],
  }),
  owner: one(users, {
    fields: [keyResults.ownerId],
    references: [users.id],
  }),
  progress: many(krProgress),
}));

// ─── KR Progress Entries ─────────────────────────────────────────────────────

export const krProgress = pgTable('kr_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  keyResultId: uuid('key_result_id').notNull().references(() => keyResults.id),
  value: real('value').notNull(),
  previousValue: real('previous_value').notNull().default(0),
  source: text('source').notNull().default('manual'),
  sourceLabel: text('source_label'),
  sourceEntityId: uuid('source_entity_id'),
  note: text('note'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  recordedBy: uuid('recorded_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const krProgressRelations = relations(krProgress, ({ one }) => ({
  organization: one(organizations, {
    fields: [krProgress.orgId],
    references: [organizations.id],
  }),
  keyResult: one(keyResults, {
    fields: [krProgress.keyResultId],
    references: [keyResults.id],
  }),
  recorder: one(users, {
    fields: [krProgress.recordedBy],
    references: [users.id],
  }),
}));
