import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { automationRules, ruleConditions, ruleActions, ruleExecutions } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListRulesQuery {
  status?: string;
  module?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface ListExecutionsQuery {
  ruleId?: string;
  status?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface RuleParams {
  id: string;
}

interface CreateRuleBody {
  name: string;
  description?: string;
  triggerEvent: string;
  triggerModule?: string;
  locationId?: string;
  locationScope?: string[];
  templateId?: string;
}

interface UpdateRuleBody {
  name?: string;
  description?: string;
  status?: string;
  triggerEvent?: string;
  triggerModule?: string;
  locationScope?: string[];
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function automationRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/automation/rules
   * List automation rules with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListRulesQuery }>(
    '/api/v1/automation/rules',
    {
      preHandler: requirePermission('workflow', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        module,
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
      conditions.push(eq(automationRules.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(automationRules.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(automationRules.status, status as typeof automationRules.status.enumValues[number]));
      }
      if (module) {
        conditions.push(eq(automationRules.triggerModule, module));
      }
      if (search) {
        conditions.push(ilike(automationRules.name, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'name' ? automationRules.name
        : sortBy === 'status' ? automationRules.status
        : sortBy === 'lastTriggeredAt' ? automationRules.lastTriggeredAt
        : sortBy === 'updatedAt' ? automationRules.updatedAt
        : automationRules.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(automationRules)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(automationRules)
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
   * GET /api/v1/automation/rules/:id
   * Get a single rule with conditions, actions, and executions.
   */
  app.get<{ Params: RuleParams }>(
    '/api/v1/automation/rules/:id',
    {
      preHandler: requirePermission('workflow', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const rule = await db.query.automationRules.findFirst({
        where: and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          conditions: true,
          actions: true,
          executions: true,
        },
      });

      if (!rule) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Rule ${id} not found`,
        });
      }

      return reply.send({ data: rule });
    }
  );

  /**
   * POST /api/v1/automation/rules
   * Create a new automation rule.
   */
  app.post<{ Body: CreateRuleBody }>(
    '/api/v1/automation/rules',
    {
      preHandler: requirePermission('workflow', 'create'),
    },
    async (request, reply) => {
      const {
        name,
        description,
        triggerEvent,
        triggerModule,
        locationId,
        locationScope,
        templateId,
      } = request.body;

      const [created] = await db
        .insert(automationRules)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          name,
          description: description ?? null,
          triggerEvent: triggerEvent as typeof automationRules.triggerEvent.enumValues[number],
          triggerModule: triggerModule ?? null,
          locationId: locationId ?? null,
          locationScope: locationScope ?? null,
          templateId: templateId ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/automation/rules/:id
   * Update an existing automation rule.
   */
  app.put<{ Params: RuleParams; Body: UpdateRuleBody }>(
    '/api/v1/automation/rules/:id',
    {
      preHandler: requirePermission('workflow', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        name,
        description,
        status,
        triggerEvent,
        triggerModule,
        locationScope,
      } = request.body;

      // Verify rule exists and belongs to this org
      const existing = await db.query.automationRules.findFirst({
        where: and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Rule ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (triggerEvent !== undefined) updateData.triggerEvent = triggerEvent;
      if (triggerModule !== undefined) updateData.triggerModule = triggerModule;
      if (locationScope !== undefined) updateData.locationScope = locationScope;

      const [updated] = await db
        .update(automationRules)
        .set(updateData)
        .where(and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/automation/rules/:id
   * Delete an automation rule.
   */
  app.delete<{ Params: RuleParams }>(
    '/api/v1/automation/rules/:id',
    {
      preHandler: requirePermission('workflow', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify rule exists and belongs to this org
      const existing = await db.query.automationRules.findFirst({
        where: and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Rule ${id} not found`,
        });
      }

      await db
        .delete(automationRules)
        .where(and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * POST /api/v1/automation/rules/:id/toggle
   * Enable or disable an automation rule.
   */
  app.post<{ Params: RuleParams }>(
    '/api/v1/automation/rules/:id/toggle',
    {
      preHandler: requirePermission('workflow', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify rule exists and belongs to this org
      const existing = await db.query.automationRules.findFirst({
        where: and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Rule ${id} not found`,
        });
      }

      const newStatus = existing.status === 'active' ? 'paused' : 'active';

      const [updated] = await db
        .update(automationRules)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(and(
          eq(automationRules.id, id),
          eq(automationRules.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * GET /api/v1/automation/executions
   * List recent rule executions.
   */
  app.get<{ Querystring: ListExecutionsQuery }>(
    '/api/v1/automation/executions',
    {
      preHandler: requirePermission('workflow', 'view'),
    },
    async (request, reply) => {
      const {
        ruleId,
        status,
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
      conditions.push(eq(ruleExecutions.orgId, request.user.orgId));

      // Optional filters
      if (ruleId) {
        conditions.push(eq(ruleExecutions.ruleId, ruleId));
      }
      if (status) {
        conditions.push(eq(ruleExecutions.status, status as typeof ruleExecutions.status.enumValues[number]));
      }

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(ruleExecutions)
          .where(whereClause)
          .orderBy(orderFn(ruleExecutions.triggeredAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(ruleExecutions)
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
