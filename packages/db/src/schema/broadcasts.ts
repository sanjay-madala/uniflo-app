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

export const broadcastStatusEnum = pgEnum('broadcast_status', [
  'draft',
  'scheduled',
  'sent',
  'failed',
]);

export const broadcastPriorityEnum = pgEnum('broadcast_priority', [
  'normal',
  'urgent',
  'critical',
]);

export const readReceiptStatusEnum = pgEnum('read_receipt_status', [
  'undelivered',
  'delivered',
  'read',
  'acknowledged',
]);

// ─── Broadcasts ──────────────────────────────────────────────────────────────

export const broadcasts = pgTable('broadcasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  bodyHtml: text('body_html'),
  bodyPlain: text('body_plain'),
  status: broadcastStatusEnum('status').notNull().default('draft'),
  priority: broadcastPriorityEnum('priority').notNull().default('normal'),
  audience: jsonb('audience').default({}),
  acknowledgmentRequired: boolean('acknowledgment_required').notNull().default(false),
  templateId: uuid('template_id'),
  attachments: jsonb('attachments').default([]),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  stats: jsonb('stats'),
  tags: text('tags').array(),
  category: text('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const broadcastsRelations = relations(broadcasts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [broadcasts.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [broadcasts.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [broadcasts.createdBy],
    references: [users.id],
  }),
  readReceipts: many(readReceipts),
}));

// ─── Read Receipts ───────────────────────────────────────────────────────────

export const readReceipts = pgTable('read_receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  broadcastId: uuid('broadcast_id').notNull().references(() => broadcasts.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  locationId: uuid('location_id').references(() => locations.id),
  status: readReceiptStatusEnum('status').notNull().default('undelivered'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const readReceiptsRelations = relations(readReceipts, ({ one }) => ({
  organization: one(organizations, {
    fields: [readReceipts.orgId],
    references: [organizations.id],
  }),
  broadcast: one(broadcasts, {
    fields: [readReceipts.broadcastId],
    references: [broadcasts.id],
  }),
  user: one(users, {
    fields: [readReceipts.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [readReceipts.locationId],
    references: [locations.id],
  }),
}));
