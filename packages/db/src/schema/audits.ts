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

export const auditStatusEnum = pgEnum('audit_status', [
  'scheduled',
  'in_progress',
  'completed',
  'failed',
]);

export const auditQuestionTypeEnum = pgEnum('audit_question_type', [
  'yes_no',
  'rating',
  'photo',
  'text',
  'checkbox',
]);

export const auditSeverityEnum = pgEnum('audit_severity', [
  'critical',
  'major',
  'minor',
  'observation',
]);

export const auditItemResultValueEnum = pgEnum('audit_item_result_value', [
  'pass',
  'fail',
  'na',
  'pending',
]);

// ─── Audit Templates ─────────────────────────────────────────────────────────

export const auditTemplates = pgTable('audit_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  totalItems: integer('total_items').notNull().default(0),
  passThreshold: real('pass_threshold').notNull().default(80),
  version: text('version').default('1.0'),
  linkedSopIds: uuid('linked_sop_ids').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditTemplatesRelations = relations(auditTemplates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [auditTemplates.orgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [auditTemplates.createdBy],
    references: [users.id],
  }),
  sections: many(auditTemplateSections),
  audits: many(audits),
}));

// ─── Audit Template Sections ─────────────────────────────────────────────────

export const auditTemplateSections = pgTable('audit_template_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  templateId: uuid('template_id').notNull().references(() => auditTemplates.id),
  title: text('title').notNull(),
  description: text('description'),
  weight: real('weight').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditTemplateSectionsRelations = relations(auditTemplateSections, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [auditTemplateSections.orgId],
    references: [organizations.id],
  }),
  template: one(auditTemplates, {
    fields: [auditTemplateSections.templateId],
    references: [auditTemplates.id],
  }),
  items: many(auditTemplateItems),
}));

// ─── Audit Template Items ────────────────────────────────────────────────────

export const auditTemplateItems = pgTable('audit_template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  sectionId: uuid('section_id').notNull().references(() => auditTemplateSections.id),
  question: text('question').notNull(),
  type: auditQuestionTypeEnum('type').notNull().default('yes_no'),
  required: boolean('required').notNull().default(true),
  severityIfFail: auditSeverityEnum('severity_if_fail').notNull().default('minor'),
  linkedSopId: uuid('linked_sop_id'),
  photoRequiredOnFail: boolean('photo_required_on_fail').notNull().default(false),
  helpText: text('help_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditTemplateItemsRelations = relations(auditTemplateItems, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditTemplateItems.orgId],
    references: [organizations.id],
  }),
  section: one(auditTemplateSections, {
    fields: [auditTemplateItems.sectionId],
    references: [auditTemplateSections.id],
  }),
}));

// ─── Audits ──────────────────────────────────────────────────────────────────

export const audits = pgTable('audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  templateId: uuid('template_id').notNull().references(() => auditTemplates.id),
  title: text('title').notNull(),
  status: auditStatusEnum('status').notNull().default('scheduled'),
  auditorId: uuid('auditor_id').notNull().references(() => users.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  score: real('score'),
  pass: boolean('pass'),
  findings: text('findings').array(),
  autoCreatedTicketIds: uuid('auto_created_ticket_ids').array(),
  autoCreatedCapaIds: uuid('auto_created_capa_ids').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditsRelations = relations(audits, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [audits.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [audits.locationId],
    references: [locations.id],
  }),
  template: one(auditTemplates, {
    fields: [audits.templateId],
    references: [auditTemplates.id],
  }),
  auditor: one(users, {
    fields: [audits.auditorId],
    references: [users.id],
    relationName: 'auditAuditor',
  }),
  creator: one(users, {
    fields: [audits.createdBy],
    references: [users.id],
    relationName: 'auditCreator',
  }),
  results: many(auditResults),
  itemResults: many(auditItemResults),
}));

// ─── Audit Results (section-level) ──────────────────────────────────────────

export const auditResults = pgTable('audit_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  auditId: uuid('audit_id').notNull().references(() => audits.id),
  sectionId: uuid('section_id').notNull().references(() => auditTemplateSections.id),
  score: real('score').notNull().default(0),
  totalItems: integer('total_items').notNull().default(0),
  passedItems: integer('passed_items').notNull().default(0),
  failedItems: integer('failed_items').notNull().default(0),
  naItems: integer('na_items').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditResultsRelations = relations(auditResults, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditResults.orgId],
    references: [organizations.id],
  }),
  audit: one(audits, {
    fields: [auditResults.auditId],
    references: [audits.id],
  }),
  section: one(auditTemplateSections, {
    fields: [auditResults.sectionId],
    references: [auditTemplateSections.id],
  }),
}));

// ─── Audit Item Results ──────────────────────────────────────────────────────

export const auditItemResults = pgTable('audit_item_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  auditId: uuid('audit_id').notNull().references(() => audits.id),
  itemId: uuid('item_id').notNull().references(() => auditTemplateItems.id),
  result: auditItemResultValueEnum('result').notNull().default('pending'),
  score: real('score').notNull().default(0),
  notes: text('notes'),
  photoUrls: text('photo_urls').array(),
  autoTicketId: uuid('auto_ticket_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditItemResultsRelations = relations(auditItemResults, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditItemResults.orgId],
    references: [organizations.id],
  }),
  audit: one(audits, {
    fields: [auditItemResults.auditId],
    references: [audits.id],
  }),
  item: one(auditTemplateItems, {
    fields: [auditItemResults.itemId],
    references: [auditTemplateItems.id],
  }),
}));
