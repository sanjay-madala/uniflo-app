import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const capaStatusEnum = pgEnum('capa_status', [
  'open',
  'in_progress',
  'verified',
  'closed',
]);

export const capaSeverityEnum = pgEnum('capa_severity', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const capaSourceEnum = pgEnum('capa_source', [
  'audit',
  'ticket',
  'manual',
]);

export const capaActionTypeEnum = pgEnum('capa_action_type', [
  'corrective',
  'preventive',
]);

export const capaActionStatusEnum = pgEnum('capa_action_status', [
  'pending',
  'in_progress',
  'completed',
]);

// ─── CAPAs ───────────────────────────────────────────────────────────────────

export const capas = pgTable('capas', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: capaStatusEnum('status').notNull().default('open'),
  severity: capaSeverityEnum('severity').notNull().default('medium'),
  source: capaSourceEnum('source').notNull().default('manual'),
  sourceId: uuid('source_id'),
  rootCause: text('root_cause'),
  rootCauseAnalysis: jsonb('root_cause_analysis'),
  correctiveAction: text('corrective_action'),
  preventiveAction: text('preventive_action'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  linkedTicketIds: uuid('linked_ticket_ids').array(),
  linkedAuditIds: uuid('linked_audit_ids').array(),
  linkedSopIds: uuid('linked_sop_ids').array(),
  tags: text('tags').array(),
  category: text('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const capasRelations = relations(capas, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [capas.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [capas.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [capas.createdBy],
    references: [users.id],
    relationName: 'capaCreator',
  }),
  owner: one(users, {
    fields: [capas.ownerId],
    references: [users.id],
    relationName: 'capaOwner',
  }),
  actions: many(capaActions),
  effectivenessReviews: many(capaEffectivenessReviews),
}));

// ─── CAPA Actions ────────────────────────────────────────────────────────────

export const capaActions = pgTable('capa_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  type: capaActionTypeEnum('type').notNull(),
  description: text('description').notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: capaActionStatusEnum('status').notNull().default('pending'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  evidence: jsonb('evidence').default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const capaActionsRelations = relations(capaActions, ({ one }) => ({
  organization: one(organizations, {
    fields: [capaActions.orgId],
    references: [organizations.id],
  }),
  capa: one(capas, {
    fields: [capaActions.capaId],
    references: [capas.id],
  }),
  assignee: one(users, {
    fields: [capaActions.assigneeId],
    references: [users.id],
  }),
}));

// ─── CAPA Effectiveness Reviews ──────────────────────────────────────────────

export const capaEffectivenessReviews = pgTable('capa_effectiveness_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  reviewerId: uuid('reviewer_id').notNull().references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull(),
  effective: boolean('effective').notNull(),
  criteria: jsonb('criteria').default([]),
  followUpRequired: boolean('follow_up_required').notNull().default(false),
  followUpCapaId: uuid('follow_up_capa_id'),
  signOffComment: text('sign_off_comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const capaEffectivenessReviewsRelations = relations(capaEffectivenessReviews, ({ one }) => ({
  organization: one(organizations, {
    fields: [capaEffectivenessReviews.orgId],
    references: [organizations.id],
  }),
  capa: one(capas, {
    fields: [capaEffectivenessReviews.capaId],
    references: [capas.id],
  }),
  reviewer: one(users, {
    fields: [capaEffectivenessReviews.reviewerId],
    references: [users.id],
  }),
}));
