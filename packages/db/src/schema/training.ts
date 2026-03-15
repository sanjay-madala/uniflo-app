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

export const trainingModuleStatusEnum = pgEnum('training_module_status', [
  'draft',
  'published',
  'archived',
]);

export const trainingCategoryEnum = pgEnum('training_category', [
  'safety',
  'operations',
  'compliance',
  'customer_service',
  'onboarding',
  'leadership',
]);

export const trainingDifficultyEnum = pgEnum('training_difficulty', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const contentBlockTypeEnum = pgEnum('content_block_type', [
  'text',
  'video',
  'image',
  'embed',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'assigned',
  'in_progress',
  'completed',
  'failed',
  'overdue',
]);

export const quizQuestionTypeEnum = pgEnum('quiz_question_type', [
  'single_choice',
  'multiple_choice',
  'true_false',
]);

export const assignmentTriggerEnum = pgEnum('assignment_trigger', [
  'manual',
  'sop_version_change',
  'role_assignment',
  'schedule',
  'audit_failure',
]);

// ─── Training Modules ────────────────────────────────────────────────────────

export const trainingModules = pgTable('training_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  locationId: uuid('location_id').references(() => locations.id),
  createdBy: uuid('created_by').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: trainingModuleStatusEnum('status').notNull().default('draft'),
  category: trainingCategoryEnum('category'),
  difficulty: trainingDifficultyEnum('difficulty').notNull().default('beginner'),
  tags: text('tags').array(),
  coverImage: text('cover_image'),
  estimatedDurationMinutes: integer('estimated_duration_minutes').default(0),
  version: text('version').default('1.0'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  assignedRoleIds: uuid('assigned_role_ids').array(),
  assignedLocationIds: uuid('assigned_location_ids').array(),
  linkedSopId: uuid('linked_sop_id'),
  linkedGoalIds: uuid('linked_goal_ids').array(),
  linkedAuditTemplateIds: uuid('linked_audit_template_ids').array(),
  autoAssignOnSopChange: boolean('auto_assign_on_sop_change').notNull().default(false),
  autoAssignOnRoleJoin: boolean('auto_assign_on_role_join').notNull().default(false),
  passThreshold: real('pass_threshold').default(70),
  timeLimitMinutes: integer('time_limit_minutes'),
  maxAttempts: integer('max_attempts').default(3),
  shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
  shuffleOptions: boolean('shuffle_options').notNull().default(false),
  showCorrectAnswers: boolean('show_correct_answers').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingModulesRelations = relations(trainingModules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainingModules.orgId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [trainingModules.locationId],
    references: [locations.id],
  }),
  creator: one(users, {
    fields: [trainingModules.createdBy],
    references: [users.id],
  }),
  contentBlocks: many(trainingContentBlocks),
  enrollments: many(trainingEnrollments),
  quizQuestions: many(quizQuestions),
  certificates: many(certificates),
}));

// ─── Training Content Blocks ─────────────────────────────────────────────────

export const trainingContentBlocks = pgTable('training_content_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  moduleId: uuid('module_id').notNull().references(() => trainingModules.id),
  sortOrder: integer('sort_order').notNull().default(0),
  type: contentBlockTypeEnum('type').notNull(),
  title: text('title'),
  bodyHtml: text('body_html'),
  mediaUrl: text('media_url'),
  mediaThumbnail: text('media_thumbnail'),
  durationSeconds: integer('duration_seconds'),
  altText: text('alt_text'),
  caption: text('caption'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingContentBlocksRelations = relations(trainingContentBlocks, ({ one }) => ({
  organization: one(organizations, {
    fields: [trainingContentBlocks.orgId],
    references: [organizations.id],
  }),
  module: one(trainingModules, {
    fields: [trainingContentBlocks.moduleId],
    references: [trainingModules.id],
  }),
}));

// ─── Training Enrollments ────────────────────────────────────────────────────

export const trainingEnrollments = pgTable('training_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  moduleId: uuid('module_id').notNull().references(() => trainingModules.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: enrollmentStatusEnum('status').notNull().default('assigned'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignmentTrigger: assignmentTriggerEnum('assignment_trigger').notNull().default('manual'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  progressPercent: real('progress_percent').notNull().default(0),
  lastContentBlockId: uuid('last_content_block_id'),
  bestScore: real('best_score'),
  certificateIssued: boolean('certificate_issued').notNull().default(false),
  certificateId: uuid('certificate_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingEnrollmentsRelations = relations(trainingEnrollments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainingEnrollments.orgId],
    references: [organizations.id],
  }),
  module: one(trainingModules, {
    fields: [trainingEnrollments.moduleId],
    references: [trainingModules.id],
  }),
  user: one(users, {
    fields: [trainingEnrollments.userId],
    references: [users.id],
    relationName: 'enrollmentUser',
  }),
  assigner: one(users, {
    fields: [trainingEnrollments.assignedBy],
    references: [users.id],
    relationName: 'enrollmentAssigner',
  }),
  quizAttempts: many(quizAttempts),
}));

// ─── Quiz Questions ──────────────────────────────────────────────────────────

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  moduleId: uuid('module_id').notNull().references(() => trainingModules.id),
  sortOrder: integer('sort_order').notNull().default(0),
  questionText: text('question_text').notNull(),
  type: quizQuestionTypeEnum('type').notNull(),
  options: jsonb('options').notNull().default([]),
  explanation: text('explanation'),
  points: integer('points').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  organization: one(organizations, {
    fields: [quizQuestions.orgId],
    references: [organizations.id],
  }),
  module: one(trainingModules, {
    fields: [quizQuestions.moduleId],
    references: [trainingModules.id],
  }),
}));

// ─── Quiz Attempts ───────────────────────────────────────────────────────────

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  enrollmentId: uuid('enrollment_id').notNull().references(() => trainingEnrollments.id),
  moduleId: uuid('module_id').notNull().references(() => trainingModules.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  answers: jsonb('answers').notNull().default([]),
  score: real('score').notNull().default(0),
  passed: boolean('passed').notNull().default(false),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
  attemptNumber: integer('attempt_number').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  organization: one(organizations, {
    fields: [quizAttempts.orgId],
    references: [organizations.id],
  }),
  enrollment: one(trainingEnrollments, {
    fields: [quizAttempts.enrollmentId],
    references: [trainingEnrollments.id],
  }),
  module: one(trainingModules, {
    fields: [quizAttempts.moduleId],
    references: [trainingModules.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));

// ─── Certificates ────────────────────────────────────────────────────────────

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  enrollmentId: uuid('enrollment_id').notNull().references(() => trainingEnrollments.id),
  moduleId: uuid('module_id').notNull().references(() => trainingModules.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  score: real('score').notNull(),
  certificateNumber: text('certificate_number').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  organization: one(organizations, {
    fields: [certificates.orgId],
    references: [organizations.id],
  }),
  enrollment: one(trainingEnrollments, {
    fields: [certificates.enrollmentId],
    references: [trainingEnrollments.id],
  }),
  module: one(trainingModules, {
    fields: [certificates.moduleId],
    references: [trainingModules.id],
  }),
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
}));
