import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const csatRatingModeEnum = pgEnum('csat_rating_mode', [
  'stars',
  'emoji',
  'both',
]);

// ─── CSAT Surveys ────────────────────────────────────────────────────────────

export const csatSurveys = pgTable('csat_surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  ticketId: uuid('ticket_id').notNull(),
  token: text('token').notNull().unique(),
  customerId: uuid('customer_id'),
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  ratingMode: csatRatingModeEnum('rating_mode').notNull().default('stars'),
  score: integer('score'),
  comment: text('comment'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  dismissed: boolean('dismissed').notNull().default(false),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const csatSurveysRelations = relations(csatSurveys, ({ one }) => ({
  organization: one(organizations, {
    fields: [csatSurveys.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [csatSurveys.locationId],
    references: [locations.id],
  }),
}));
