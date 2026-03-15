import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const {
  trainingModules,
  trainingEnrollments,
  quizAttempts,
  certificates,
} = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListModulesQuery {
  category?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface ModuleParams {
  id: string;
}

interface CreateModuleBody {
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  locationId?: string;
  tags?: string[];
  coverImage?: string;
  estimatedDurationMinutes?: number;
  version?: string;
  assignedRoleIds?: string[];
  assignedLocationIds?: string[];
  linkedSopId?: string;
  passThreshold?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
}

interface UpdateModuleBody {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  locationId?: string;
  tags?: string[];
  coverImage?: string;
  estimatedDurationMinutes?: number;
  version?: string;
  assignedRoleIds?: string[];
  assignedLocationIds?: string[];
  linkedSopId?: string;
  passThreshold?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  publishedAt?: string;
}

interface ListEnrollmentsQuery {
  moduleId?: string;
  userId?: string;
  status?: string;
  page?: string;
  limit?: string;
}

interface EnrollBody {
  moduleId: string;
  userId: string;
  dueDate?: string;
  assignmentTrigger?: string;
}

interface SubmitQuizBody {
  enrollmentId: string;
  answers: unknown[];
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  attemptNumber: number;
}

interface ListCertificatesQuery {
  moduleId?: string;
  userId?: string;
  page?: string;
  limit?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function trainingRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/training/modules
   * List training modules with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListModulesQuery }>(
    '/api/v1/training/modules',
    {
      preHandler: requirePermission('training', 'view'),
    },
    async (request, reply) => {
      const {
        category,
        difficulty,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const conditions: SQL[] = [];

      // Org scoping
      conditions.push(eq(trainingModules.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(trainingModules.locationId, locationFilter));
      }

      // Optional filters
      if (category) {
        conditions.push(eq(trainingModules.category, category as typeof trainingModules.category.enumValues[number]));
      }
      if (difficulty) {
        conditions.push(eq(trainingModules.difficulty, difficulty as typeof trainingModules.difficulty.enumValues[number]));
      }
      if (status) {
        conditions.push(eq(trainingModules.status, status as typeof trainingModules.status.enumValues[number]));
      }
      if (search) {
        conditions.push(ilike(trainingModules.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'title' ? trainingModules.title
        : sortBy === 'category' ? trainingModules.category
        : sortBy === 'difficulty' ? trainingModules.difficulty
        : sortBy === 'status' ? trainingModules.status
        : sortBy === 'updatedAt' ? trainingModules.updatedAt
        : trainingModules.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(trainingModules)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(trainingModules)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      return reply.send({
        data: rows,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }
  );

  /**
   * GET /api/v1/training/modules/:id
   * Get a single training module with content blocks.
   */
  app.get<{ Params: ModuleParams }>(
    '/api/v1/training/modules/:id',
    {
      preHandler: requirePermission('training', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const module = await db.query.trainingModules.findFirst({
        where: and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          contentBlocks: true,
          quizQuestions: true,
        },
      });

      if (!module) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Training module ${id} not found`,
        });
      }

      return reply.send({ data: module });
    }
  );

  /**
   * POST /api/v1/training/modules
   * Create a new training module.
   */
  app.post<{ Body: CreateModuleBody }>(
    '/api/v1/training/modules',
    {
      preHandler: requirePermission('training', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        category,
        difficulty,
        locationId,
        tags,
        coverImage,
        estimatedDurationMinutes,
        version,
        assignedRoleIds,
        assignedLocationIds,
        linkedSopId,
        passThreshold,
        timeLimitMinutes,
        maxAttempts,
        shuffleQuestions,
        shuffleOptions,
        showCorrectAnswers,
      } = request.body;

      const [created] = await db
        .insert(trainingModules)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          category: (category as typeof trainingModules.category.enumValues[number]) ?? null,
          difficulty: (difficulty as typeof trainingModules.difficulty.enumValues[number]) ?? 'beginner',
          locationId: locationId ?? null,
          tags: tags ?? null,
          coverImage: coverImage ?? null,
          estimatedDurationMinutes: estimatedDurationMinutes ?? 0,
          version: version ?? '1.0',
          assignedRoleIds: assignedRoleIds ?? null,
          assignedLocationIds: assignedLocationIds ?? null,
          linkedSopId: linkedSopId ?? null,
          passThreshold: passThreshold ?? 70,
          timeLimitMinutes: timeLimitMinutes ?? null,
          maxAttempts: maxAttempts ?? 3,
          shuffleQuestions: shuffleQuestions ?? false,
          shuffleOptions: shuffleOptions ?? false,
          showCorrectAnswers: showCorrectAnswers ?? true,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/training/modules/:id
   * Update an existing training module.
   */
  app.put<{ Params: ModuleParams; Body: UpdateModuleBody }>(
    '/api/v1/training/modules/:id',
    {
      preHandler: requirePermission('training', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        status,
        category,
        difficulty,
        locationId,
        tags,
        coverImage,
        estimatedDurationMinutes,
        version,
        assignedRoleIds,
        assignedLocationIds,
        linkedSopId,
        passThreshold,
        timeLimitMinutes,
        maxAttempts,
        shuffleQuestions,
        shuffleOptions,
        showCorrectAnswers,
        publishedAt,
      } = request.body;

      // Verify module exists and belongs to this org
      const existing = await db.query.trainingModules.findFirst({
        where: and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Training module ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (category !== undefined) updateData.category = category;
      if (difficulty !== undefined) updateData.difficulty = difficulty;
      if (locationId !== undefined) updateData.locationId = locationId;
      if (tags !== undefined) updateData.tags = tags;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (estimatedDurationMinutes !== undefined) updateData.estimatedDurationMinutes = estimatedDurationMinutes;
      if (version !== undefined) updateData.version = version;
      if (assignedRoleIds !== undefined) updateData.assignedRoleIds = assignedRoleIds;
      if (assignedLocationIds !== undefined) updateData.assignedLocationIds = assignedLocationIds;
      if (linkedSopId !== undefined) updateData.linkedSopId = linkedSopId;
      if (passThreshold !== undefined) updateData.passThreshold = passThreshold;
      if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = timeLimitMinutes;
      if (maxAttempts !== undefined) updateData.maxAttempts = maxAttempts;
      if (shuffleQuestions !== undefined) updateData.shuffleQuestions = shuffleQuestions;
      if (shuffleOptions !== undefined) updateData.shuffleOptions = shuffleOptions;
      if (showCorrectAnswers !== undefined) updateData.showCorrectAnswers = showCorrectAnswers;
      if (publishedAt !== undefined) updateData.publishedAt = new Date(publishedAt);

      const [updated] = await db
        .update(trainingModules)
        .set(updateData)
        .where(and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/training/modules/:id
   * Delete a training module.
   */
  app.delete<{ Params: ModuleParams }>(
    '/api/v1/training/modules/:id',
    {
      preHandler: requirePermission('training', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify module exists and belongs to this org
      const existing = await db.query.trainingModules.findFirst({
        where: and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Training module ${id} not found`,
        });
      }

      await db
        .delete(trainingModules)
        .where(and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * GET /api/v1/training/enrollments
   * List user enrollments with filters and pagination.
   */
  app.get<{ Querystring: ListEnrollmentsQuery }>(
    '/api/v1/training/enrollments',
    {
      preHandler: requirePermission('training', 'view'),
    },
    async (request, reply) => {
      const {
        moduleId,
        userId,
        status,
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const conditions: SQL[] = [];

      // Org scoping
      conditions.push(eq(trainingEnrollments.orgId, request.user.orgId));

      // Optional filters
      if (moduleId) {
        conditions.push(eq(trainingEnrollments.moduleId, moduleId));
      }
      if (userId) {
        conditions.push(eq(trainingEnrollments.userId, userId));
      }
      if (status) {
        conditions.push(eq(trainingEnrollments.status, status as typeof trainingEnrollments.status.enumValues[number]));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(trainingEnrollments)
          .where(whereClause)
          .orderBy(desc(trainingEnrollments.assignedAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(trainingEnrollments)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      return reply.send({
        data: rows,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }
  );

  /**
   * POST /api/v1/training/enroll
   * Enroll a user in a training module.
   */
  app.post<{ Body: EnrollBody }>(
    '/api/v1/training/enroll',
    {
      preHandler: requirePermission('training', 'create'),
    },
    async (request, reply) => {
      const {
        moduleId,
        userId,
        dueDate,
        assignmentTrigger,
      } = request.body;

      // Verify module exists and belongs to this org
      const module = await db.query.trainingModules.findFirst({
        where: and(
          eq(trainingModules.id, moduleId),
          eq(trainingModules.orgId, request.user.orgId)
        ),
      });

      if (!module) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Training module ${moduleId} not found`,
        });
      }

      const [created] = await db
        .insert(trainingEnrollments)
        .values({
          orgId: request.user.orgId,
          moduleId,
          userId,
          assignedBy: request.user.uid,
          assignmentTrigger: (assignmentTrigger as typeof trainingEnrollments.assignmentTrigger.enumValues[number]) ?? 'manual',
          dueDate: dueDate ? new Date(dueDate) : null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * POST /api/v1/training/modules/:id/quiz/submit
   * Submit a quiz attempt for a training module.
   */
  app.post<{ Params: ModuleParams; Body: SubmitQuizBody }>(
    '/api/v1/training/modules/:id/quiz/submit',
    {
      preHandler: requirePermission('training', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        enrollmentId,
        answers,
        score,
        passed,
        startedAt,
        completedAt,
        attemptNumber,
      } = request.body;

      // Verify module exists and belongs to this org
      const module = await db.query.trainingModules.findFirst({
        where: and(
          eq(trainingModules.id, id),
          eq(trainingModules.orgId, request.user.orgId)
        ),
      });

      if (!module) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Training module ${id} not found`,
        });
      }

      // Verify enrollment exists
      const enrollment = await db.query.trainingEnrollments.findFirst({
        where: and(
          eq(trainingEnrollments.id, enrollmentId),
          eq(trainingEnrollments.orgId, request.user.orgId)
        ),
      });

      if (!enrollment) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Enrollment ${enrollmentId} not found`,
        });
      }

      const [created] = await db
        .insert(quizAttempts)
        .values({
          orgId: request.user.orgId,
          enrollmentId,
          moduleId: id,
          userId: request.user.uid,
          answers,
          score,
          passed,
          startedAt: new Date(startedAt),
          completedAt: new Date(completedAt),
          attemptNumber,
        })
        .returning();

      // Update enrollment best score and status if passed
      const enrollUpdateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (enrollment.bestScore === null || score > enrollment.bestScore) {
        enrollUpdateData.bestScore = score;
      }

      if (passed) {
        enrollUpdateData.status = 'completed';
        enrollUpdateData.completedAt = new Date();
        enrollUpdateData.progressPercent = 100;
      }

      await db
        .update(trainingEnrollments)
        .set(enrollUpdateData)
        .where(eq(trainingEnrollments.id, enrollmentId));

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * GET /api/v1/training/certificates
   * List certificates with filters and pagination.
   */
  app.get<{ Querystring: ListCertificatesQuery }>(
    '/api/v1/training/certificates',
    {
      preHandler: requirePermission('training', 'view'),
    },
    async (request, reply) => {
      const {
        moduleId,
        userId,
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const conditions: SQL[] = [];

      // Org scoping
      conditions.push(eq(certificates.orgId, request.user.orgId));

      // Optional filters
      if (moduleId) {
        conditions.push(eq(certificates.moduleId, moduleId));
      }
      if (userId) {
        conditions.push(eq(certificates.userId, userId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(certificates)
          .where(whereClause)
          .orderBy(desc(certificates.issuedAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(certificates)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      return reply.send({
        data: rows,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }
  );
}
