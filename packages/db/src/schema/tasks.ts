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

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'completed',
  'on_hold',
  'archived',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const taskSourceEnum = pgEnum('task_source', [
  'manual',
  'audit',
  'capa',
  'ticket',
  'automation',
]);

export const subtaskStatusEnum = pgEnum('subtask_status', [
  'todo',
  'done',
]);

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  status: projectStatusEnum('status').notNull().default('active'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  color: text('color').default('#3B82F6'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [projects.locationId],
    references: [locations.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
    relationName: 'projectOwner',
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
    relationName: 'projectCreator',
  }),
  tasks: many(tasks),
}));

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('todo'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  assigneeId: uuid('assignee_id').references(() => users.id),
  reporterId: uuid('reporter_id').references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  tags: text('tags').array(),
  source: taskSourceEnum('source').notNull().default('manual'),
  linkedAuditId: uuid('linked_audit_id'),
  linkedAuditItem: text('linked_audit_item'),
  linkedCapaId: uuid('linked_capa_id'),
  linkedTicketId: uuid('linked_ticket_id'),
  linkedSopId: uuid('linked_sop_id'),
  watchers: uuid('watchers').array(),
  estimatedHours: real('estimated_hours'),
  customFields: jsonb('custom_fields').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tasks.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [tasks.locationId],
    references: [locations.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'taskAssignee',
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: 'taskReporter',
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: 'taskCreator',
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  subtasks: many(subtasks),
  comments: many(taskComments),
}));

// ─── Subtasks ────────────────────────────────────────────────────────────────

export const subtasks = pgTable('subtasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  title: text('title').notNull(),
  status: subtaskStatusEnum('status').notNull().default('todo'),
  assigneeId: uuid('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [subtasks.orgId],
    references: [organizations.id],
  }),
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
  assignee: one(users, {
    fields: [subtasks.assigneeId],
    references: [users.id],
  }),
}));

// ─── Task Comments ───────────────────────────────────────────────────────────

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  organization: one(organizations, {
    fields: [taskComments.orgId],
    references: [organizations.id],
  }),
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [taskComments.authorId],
    references: [users.id],
  }),
}));
