import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { goals, keyResults, krProgress } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListGoalsQuery {
  status?: string;
  level?: string;
  timeframe?: string;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface GoalParams {
  id: string;
}

interface KeyResultParams {
  goalId: string;
  krId: string;
}

interface CreateGoalBody {
  title: string;
  description?: string;
  level?: string;
  status?: string;
  ownerId: string;
  teamId?: string;
  teamName?: string;
  timeframe: string;
  timeframeLabel?: string;
  startDate: string;
  endDate: string;
  parentGoalId?: string;
  locationId?: string;
  tags?: string[];
  category?: string;
}

interface UpdateGoalBody {
  title?: string;
  description?: string;
  level?: string;
  status?: string;
  health?: string;
  ownerId?: string;
  teamId?: string;
  teamName?: string;
  timeframe?: string;
  timeframeLabel?: string;
  startDate?: string;
  endDate?: string;
  progressPct?: number;
  tags?: string[];
  category?: string;
}

interface CreateKeyResultBody {
  title: string;
  description?: string;
  sortOrder?: number;
  unit?: string;
  direction?: string;
  startValue?: number;
  targetValue: number;
  trackingType?: string;
  dataSource?: string;
  dataSourceLabel?: string;
  dataSourceModule?: string;
  ownerId: string;
}

interface UpdateKrProgressBody {
  value: number;
  note?: string;
  source?: string;
  sourceLabel?: string;
  sourceEntityId?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function goalRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/goals
   * List goals with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListGoalsQuery }>(
    '/api/v1/goals',
    {
      preHandler: requirePermission('goals', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        level,
        timeframe,
        ownerId,
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
      conditions.push(eq(goals.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(goals.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(goals.status, status as typeof goals.status.enumValues[number]));
      }
      if (level) {
        conditions.push(eq(goals.level, level as typeof goals.level.enumValues[number]));
      }
      if (timeframe) {
        conditions.push(eq(goals.timeframe, timeframe as typeof goals.timeframe.enumValues[number]));
      }
      if (ownerId) {
        conditions.push(eq(goals.ownerId, ownerId));
      }
      if (search) {
        conditions.push(ilike(goals.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'title' ? goals.title
        : sortBy === 'status' ? goals.status
        : sortBy === 'level' ? goals.level
        : sortBy === 'progressPct' ? goals.progressPct
        : sortBy === 'endDate' ? goals.endDate
        : sortBy === 'updatedAt' ? goals.updatedAt
        : goals.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(goals)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(goals)
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
   * GET /api/v1/goals/:id
   * Get a single goal with key results and progress.
   */
  app.get<{ Params: GoalParams }>(
    '/api/v1/goals/:id',
    {
      preHandler: requirePermission('goals', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const goal = await db.query.goals.findFirst({
        where: and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          owner: true,
          creator: true,
          parent: true,
          children: true,
          keyResults: {
            with: {
              owner: true,
              progress: true,
            },
          },
        },
      });

      if (!goal) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Goal ${id} not found`,
        });
      }

      return reply.send({ data: goal });
    }
  );

  /**
   * POST /api/v1/goals
   * Create a new goal.
   */
  app.post<{ Body: CreateGoalBody }>(
    '/api/v1/goals',
    {
      preHandler: requirePermission('goals', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        level,
        status,
        ownerId,
        teamId,
        teamName,
        timeframe,
        timeframeLabel,
        startDate,
        endDate,
        parentGoalId,
        locationId,
        tags,
        category,
      } = request.body;

      const [created] = await db
        .insert(goals)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          level: (level as typeof goals.level.enumValues[number]) ?? 'team',
          status: (status as typeof goals.status.enumValues[number]) ?? 'draft',
          ownerId,
          teamId: teamId ?? null,
          teamName: teamName ?? null,
          timeframe: timeframe as typeof goals.timeframe.enumValues[number],
          timeframeLabel: timeframeLabel ?? null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          parentGoalId: parentGoalId ?? null,
          locationId: locationId ?? null,
          tags: tags ?? null,
          category: category ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/goals/:id
   * Update an existing goal.
   */
  app.put<{ Params: GoalParams; Body: UpdateGoalBody }>(
    '/api/v1/goals/:id',
    {
      preHandler: requirePermission('goals', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        level,
        status,
        health,
        ownerId,
        teamId,
        teamName,
        timeframe,
        timeframeLabel,
        startDate,
        endDate,
        progressPct,
        tags,
        category,
      } = request.body;

      // Verify goal exists and belongs to this org
      const existing = await db.query.goals.findFirst({
        where: and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Goal ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (level !== undefined) updateData.level = level;
      if (status !== undefined) updateData.status = status;
      if (health !== undefined) updateData.health = health;
      if (ownerId !== undefined) updateData.ownerId = ownerId;
      if (teamId !== undefined) updateData.teamId = teamId;
      if (teamName !== undefined) updateData.teamName = teamName;
      if (timeframe !== undefined) updateData.timeframe = timeframe;
      if (timeframeLabel !== undefined) updateData.timeframeLabel = timeframeLabel;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (progressPct !== undefined) updateData.progressPct = progressPct;
      if (tags !== undefined) updateData.tags = tags;
      if (category !== undefined) updateData.category = category;

      const [updated] = await db
        .update(goals)
        .set(updateData)
        .where(and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/goals/:id
   * Delete a goal.
   */
  app.delete<{ Params: GoalParams }>(
    '/api/v1/goals/:id',
    {
      preHandler: requirePermission('goals', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify goal exists and belongs to this org
      const existing = await db.query.goals.findFirst({
        where: and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Goal ${id} not found`,
        });
      }

      await db
        .delete(goals)
        .where(and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * POST /api/v1/goals/:id/key-results
   * Add a key result to a goal.
   */
  app.post<{ Params: GoalParams; Body: CreateKeyResultBody }>(
    '/api/v1/goals/:id/key-results',
    {
      preHandler: requirePermission('goals', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        sortOrder,
        unit,
        direction,
        startValue,
        targetValue,
        trackingType,
        dataSource,
        dataSourceLabel,
        dataSourceModule,
        ownerId,
      } = request.body;

      // Verify goal exists and belongs to this org
      const existing = await db.query.goals.findFirst({
        where: and(
          eq(goals.id, id),
          eq(goals.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Goal ${id} not found`,
        });
      }

      const [created] = await db
        .insert(keyResults)
        .values({
          orgId: request.user.orgId,
          goalId: id,
          title,
          description: description ?? null,
          sortOrder: sortOrder ?? 0,
          unit: (unit as typeof keyResults.unit.enumValues[number]) ?? 'percent',
          direction: (direction as typeof keyResults.direction.enumValues[number]) ?? 'increase',
          startValue: startValue ?? 0,
          targetValue,
          trackingType: (trackingType as typeof keyResults.trackingType.enumValues[number]) ?? 'manual',
          dataSource: dataSource ?? null,
          dataSourceLabel: dataSourceLabel ?? null,
          dataSourceModule: dataSourceModule ?? null,
          ownerId,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/goals/:goalId/key-results/:krId/progress
   * Update progress on a key result.
   */
  app.put<{ Params: KeyResultParams; Body: UpdateKrProgressBody }>(
    '/api/v1/goals/:goalId/key-results/:krId/progress',
    {
      preHandler: requirePermission('goals', 'edit'),
    },
    async (request, reply) => {
      const { goalId, krId } = request.params;
      const { value, note, source, sourceLabel, sourceEntityId } = request.body;

      // Verify goal exists and belongs to this org
      const existingGoal = await db.query.goals.findFirst({
        where: and(
          eq(goals.id, goalId),
          eq(goals.orgId, request.user.orgId)
        ),
      });

      if (!existingGoal) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Goal ${goalId} not found`,
        });
      }

      // Verify key result exists and belongs to this goal
      const existingKr = await db.query.keyResults.findFirst({
        where: and(
          eq(keyResults.id, krId),
          eq(keyResults.goalId, goalId),
          eq(keyResults.orgId, request.user.orgId)
        ),
      });

      if (!existingKr) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Key result ${krId} not found`,
        });
      }

      // Record the progress entry
      const [progressEntry] = await db
        .insert(krProgress)
        .values({
          orgId: request.user.orgId,
          keyResultId: krId,
          value,
          previousValue: existingKr.currentValue,
          source: source ?? 'manual',
          sourceLabel: sourceLabel ?? null,
          sourceEntityId: sourceEntityId ?? null,
          note: note ?? null,
          recordedAt: new Date(),
          recordedBy: request.user.uid,
        })
        .returning();

      // Update the key result's current value and progress percentage
      const range = existingKr.targetValue - existingKr.startValue;
      const progressPct = range !== 0
        ? Math.round(((value - existingKr.startValue) / range) * 10000) / 100
        : 0;

      const [updatedKr] = await db
        .update(keyResults)
        .set({
          currentValue: value,
          progressPct: Math.max(0, Math.min(100, progressPct)),
          updatedAt: new Date(),
        })
        .where(and(
          eq(keyResults.id, krId),
          eq(keyResults.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({
        data: {
          keyResult: updatedKr,
          progressEntry,
        },
      });
    }
  );
}
