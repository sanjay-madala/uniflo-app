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

export const sopStatusEnum = pgEnum('sop_status', [
  'draft',
  'in_review',
  'published',
  'archived',
]);

export const sopCategoryEnum = pgEnum('sop_category', [
  'safety',
  'operations',
  'customer_service',
  'compliance',
  'maintenance',
  'hr',
]);

export const sopStepTypeEnum = pgEnum('sop_step_type', [
  'instruction',
  'checklist',
  'decision',
  'warning',
  'reference',
]);

// ─── SOPs ────────────────────────────────────────────────────────────────────

export const sops = pgTable('sops', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  version: text('version').default('1.0'),
  status: sopStatusEnum('status').notNull().default('draft'),
  category: sopCategoryEnum('category'),
  tags: text('tags').array(),
  locationIds: uuid('location_ids').array(),
  roleIds: uuid('role_ids').array(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  autoPublishKb: boolean('auto_publish_kb').notNull().default(false),
  linkedKbArticleId: uuid('linked_kb_article_id'),
  linkedAuditTemplateIds: uuid('linked_audit_template_ids').array(),
  linkedCapaIds: uuid('linked_capa_ids').array(),
  acknowledgmentRequired: boolean('acknowledgment_required').notNull().default(false),
  estimatedReadTimeMinutes: integer('estimated_read_time_minutes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sopsRelations = relations(sops, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sops.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [sops.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [sops.createdBy],
    references: [users.id],
  }),
  steps: many(sopSteps),
  versions: many(sopVersions),
  acknowledgments: many(sopAcknowledgments),
}));

// ─── SOP Steps ───────────────────────────────────────────────────────────────

export const sopSteps = pgTable('sop_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  sopId: uuid('sop_id').notNull().references(() => sops.id),
  sortOrder: integer('sort_order').notNull().default(0),
  title: text('title').notNull(),
  description: text('description'),
  type: sopStepTypeEnum('type').notNull().default('instruction'),
  required: boolean('required').notNull().default(true),
  attachments: jsonb('attachments').default([]),
  decisionBranches: jsonb('decision_branches').default([]),
  checklistItems: text('checklist_items').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sopStepsRelations = relations(sopSteps, ({ one }) => ({
  organization: one(organizations, {
    fields: [sopSteps.orgId],
    references: [organizations.id],
  }),
  sop: one(sops, {
    fields: [sopSteps.sopId],
    references: [sops.id],
  }),
}));

// ─── SOP Versions ────────────────────────────────────────────────────────────

export const sopVersions = pgTable('sop_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  sopId: uuid('sop_id').notNull().references(() => sops.id),
  version: text('version').notNull(),
  changeSummary: text('change_summary'),
  status: sopStatusEnum('status').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sopVersionsRelations = relations(sopVersions, ({ one }) => ({
  organization: one(organizations, {
    fields: [sopVersions.orgId],
    references: [organizations.id],
  }),
  sop: one(sops, {
    fields: [sopVersions.sopId],
    references: [sops.id],
  }),
  creator: one(users, {
    fields: [sopVersions.createdBy],
    references: [users.id],
  }),
}));

// ─── SOP Acknowledgments ─────────────────────────────────────────────────────

export const sopAcknowledgments = pgTable('sop_acknowledgments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  sopId: uuid('sop_id').notNull().references(() => sops.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  version: text('version').notNull(),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sopAcknowledgmentsRelations = relations(sopAcknowledgments, ({ one }) => ({
  organization: one(organizations, {
    fields: [sopAcknowledgments.orgId],
    references: [organizations.id],
  }),
  sop: one(sops, {
    fields: [sopAcknowledgments.sopId],
    references: [sops.id],
  }),
  user: one(users, {
    fields: [sopAcknowledgments.userId],
    references: [users.id],
  }),
}));
