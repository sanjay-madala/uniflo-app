import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const ticketCategoryEnum = pgEnum('ticket_category', [
  'fb',
  'housekeeping',
  'maintenance',
  'compliance',
  'guest_relations',
  'general',
]);

// ─── Tickets ─────────────────────────────────────────────────────────────────

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: ticketStatusEnum('status').notNull().default('open'),
  priority: ticketPriorityEnum('priority').notNull().default('medium'),
  category: ticketCategoryEnum('category'),
  assigneeId: uuid('assignee_id').references(() => users.id),
  reporterId: uuid('reporter_id').references(() => users.id),
  tags: text('tags').array(),
  slaBreachAt: timestamp('sla_breach_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  linkedAuditId: uuid('linked_audit_id'),
  linkedCapaId: uuid('linked_capa_id'),
  watchers: uuid('watchers').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tickets.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [tickets.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [tickets.createdBy],
    references: [users.id],
    relationName: 'ticketCreator',
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: 'ticketAssignee',
  }),
  reporter: one(users, {
    fields: [tickets.reporterId],
    references: [users.id],
    relationName: 'ticketReporter',
  }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
}));

// ─── Ticket Comments ─────────────────────────────────────────────────────────

export const ticketComments = pgTable('ticket_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  isInternal: text('is_internal').notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  organization: one(organizations, {
    fields: [ticketComments.orgId],
    references: [organizations.id],
  }),
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  author: one(users, {
    fields: [ticketComments.authorId],
    references: [users.id],
  }),
}));

// ─── Ticket Attachments ──────────────────────────────────────────────────────

export const ticketAttachments = pgTable('ticket_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
  name: text('name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  url: text('url').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ticketAttachmentsRelations = relations(ticketAttachments, ({ one }) => ({
  organization: one(organizations, {
    fields: [ticketAttachments.orgId],
    references: [organizations.id],
  }),
  ticket: one(tickets, {
    fields: [ticketAttachments.ticketId],
    references: [tickets.id],
  }),
  uploader: one(users, {
    fields: [ticketAttachments.uploadedBy],
    references: [users.id],
  }),
}));
