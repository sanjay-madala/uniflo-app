import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, locations } from './core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const kbArticleStatusEnum = pgEnum('kb_article_status', [
  'draft',
  'published',
  'archived',
]);

export const kbVisibilityEnum = pgEnum('kb_visibility', [
  'internal',
  'public',
  'restricted',
]);

// ─── KB Categories ───────────────────────────────────────────────────────────

export const kbCategories = pgTable('kb_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const kbCategoriesRelations = relations(kbCategories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [kbCategories.orgId],
    references: [organizations.id],
  }),
  parent: one(kbCategories, {
    fields: [kbCategories.parentId],
    references: [kbCategories.id],
    relationName: 'categoryParentChild',
  }),
  children: many(kbCategories, { relationName: 'categoryParentChild' }),
  articles: many(kbArticles),
}));

// ─── KB Articles ─────────────────────────────────────────────────────────────

export const kbArticles = pgTable('kb_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  excerpt: text('excerpt'),
  bodyHtml: text('body_html'),
  status: kbArticleStatusEnum('status').notNull().default('draft'),
  visibility: kbVisibilityEnum('visibility').notNull().default('internal'),
  categoryId: uuid('category_id').references(() => kbCategories.id),
  collectionIds: uuid('collection_ids').array(),
  tags: text('tags').array(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  lastEditedBy: uuid('last_edited_by').references(() => users.id),
  sopSourceId: uuid('sop_source_id'),
  featuredImage: text('featured_image'),
  tableOfContents: jsonb('table_of_contents').default([]),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  viewsCount: integer('views_count').notNull().default(0),
  helpfulCount: integer('helpful_count').notNull().default(0),
  notHelpfulCount: integer('not_helpful_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const kbArticlesRelations = relations(kbArticles, ({ one }) => ({
  organization: one(organizations, {
    fields: [kbArticles.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [kbArticles.locationId],
    references: [locations.id],
  }),
  category: one(kbCategories, {
    fields: [kbArticles.categoryId],
    references: [kbCategories.id],
  }),
  author: one(users, {
    fields: [kbArticles.authorId],
    references: [users.id],
    relationName: 'articleAuthor',
  }),
  lastEditor: one(users, {
    fields: [kbArticles.lastEditedBy],
    references: [users.id],
    relationName: 'articleLastEditor',
  }),
}));

// ─── KB Collections ──────────────────────────────────────────────────────────

export const kbCollections = pgTable('kb_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  articleIds: uuid('article_ids').array(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const kbCollectionsRelations = relations(kbCollections, ({ one }) => ({
  organization: one(organizations, {
    fields: [kbCollections.orgId],
    references: [organizations.id],
  }),
}));
