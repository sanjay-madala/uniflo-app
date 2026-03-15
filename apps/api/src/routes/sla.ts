import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { slaPolicies, slaTargets, slaBreaches } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListPoliciesQuery {
  module?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface PolicyParams {
  id: string;
}

interface ListBreachesQuery {
  status?: string;
  severity?: string;
  policyId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface ComplianceQuery {
  module?: string;
  locationId?: string;
}

interface CreatePolicyBody {
  name: string;
  description?: string;
  module: string;
  status?: string;
  locationId?: string;
  conditions?: unknown[];
  escalationEnabled?: boolean;
  escalationConfig?: unknown;
  businessHours?: unknown;
  priorityOrder?: number;
  locationScope?: string[];
}

interface UpdatePolicyBody {
  name?: string;
  description?: string;
  module?: string;
  status?: string;
  conditions?: unknown[];
  escalationEnabled?: boolean;
  escalationConfig?: unknown;
  businessHours?: unknown;
  priorityOrder?: number;
  locationScope?: string[];
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function slaRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/sla/policies
   * List SLA policies with filters.
   */
  app.get<{ Querystring: ListPoliciesQuery }>(
    '/api/v1/sla/policies',
    {
      preHandler: requirePermission('sla', 'view'),
    },
    async (request, reply) => {
      const {
        module,
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
      conditions.push(eq(slaPolicies.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(slaPolicies.locationId, locationFilter));
      }

      // Optional filters
      if (module) {
        conditions.push(eq(slaPolicies.module, module as typeof slaPolicies.module.enumValues[number]));
      }
      if (status) {
        conditions.push(eq(slaPolicies.status, status as typeof slaPolicies.status.enumValues[number]));
      }
      if (search) {
        conditions.push(ilike(slaPolicies.name, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'name' ? slaPolicies.name
        : sortBy === 'module' ? slaPolicies.module
        : sortBy === 'status' ? slaPolicies.status
        : sortBy === 'updatedAt' ? slaPolicies.updatedAt
        : slaPolicies.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(slaPolicies)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaPolicies)
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
   * GET /api/v1/sla/policies/:id
   * Get a single policy with its targets.
   */
  app.get<{ Params: PolicyParams }>(
    '/api/v1/sla/policies/:id',
    {
      preHandler: requirePermission('sla', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const policy = await db.query.slaPolicies.findFirst({
        where: and(
          eq(slaPolicies.id, id),
          eq(slaPolicies.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          targets: true,
        },
      });

      if (!policy) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Policy ${id} not found`,
        });
      }

      return reply.send({ data: policy });
    }
  );

  /**
   * POST /api/v1/sla/policies
   * Create a new SLA policy.
   */
  app.post<{ Body: CreatePolicyBody }>(
    '/api/v1/sla/policies',
    {
      preHandler: requirePermission('sla', 'create'),
    },
    async (request, reply) => {
      const {
        name,
        description,
        module,
        status,
        locationId,
        conditions,
        escalationEnabled,
        escalationConfig,
        businessHours,
        priorityOrder,
        locationScope,
      } = request.body;

      const [created] = await db
        .insert(slaPolicies)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          name,
          description: description ?? null,
          module: module as typeof slaPolicies.module.enumValues[number],
          status: (status as typeof slaPolicies.status.enumValues[number]) ?? 'draft',
          locationId: locationId ?? null,
          conditions: conditions ?? [],
          escalationEnabled: escalationEnabled ?? false,
          escalationConfig: escalationConfig ?? null,
          businessHours: businessHours ?? null,
          priorityOrder: priorityOrder ?? 0,
          locationScope: locationScope ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/sla/policies/:id
   * Update an existing SLA policy.
   */
  app.put<{ Params: PolicyParams; Body: UpdatePolicyBody }>(
    '/api/v1/sla/policies/:id',
    {
      preHandler: requirePermission('sla', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        name,
        description,
        module,
        status,
        conditions,
        escalationEnabled,
        escalationConfig,
        businessHours,
        priorityOrder,
        locationScope,
      } = request.body;

      // Verify policy exists and belongs to this org
      const existing = await db.query.slaPolicies.findFirst({
        where: and(
          eq(slaPolicies.id, id),
          eq(slaPolicies.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Policy ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (module !== undefined) updateData.module = module;
      if (status !== undefined) updateData.status = status;
      if (conditions !== undefined) updateData.conditions = conditions;
      if (escalationEnabled !== undefined) updateData.escalationEnabled = escalationEnabled;
      if (escalationConfig !== undefined) updateData.escalationConfig = escalationConfig;
      if (businessHours !== undefined) updateData.businessHours = businessHours;
      if (priorityOrder !== undefined) updateData.priorityOrder = priorityOrder;
      if (locationScope !== undefined) updateData.locationScope = locationScope;

      const [updated] = await db
        .update(slaPolicies)
        .set(updateData)
        .where(and(
          eq(slaPolicies.id, id),
          eq(slaPolicies.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/sla/policies/:id
   * Delete an SLA policy.
   */
  app.delete<{ Params: PolicyParams }>(
    '/api/v1/sla/policies/:id',
    {
      preHandler: requirePermission('sla', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify policy exists and belongs to this org
      const existing = await db.query.slaPolicies.findFirst({
        where: and(
          eq(slaPolicies.id, id),
          eq(slaPolicies.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Policy ${id} not found`,
        });
      }

      await db
        .delete(slaPolicies)
        .where(and(
          eq(slaPolicies.id, id),
          eq(slaPolicies.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * GET /api/v1/sla/breaches
   * List SLA breaches with filters.
   */
  app.get<{ Querystring: ListBreachesQuery }>(
    '/api/v1/sla/breaches',
    {
      preHandler: requirePermission('sla', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        severity,
        policyId,
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
      conditions.push(eq(slaBreaches.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(slaBreaches.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(slaBreaches.breachStatus, status as typeof slaBreaches.breachStatus.enumValues[number]));
      }
      if (severity) {
        conditions.push(eq(slaBreaches.breachSeverity, severity as typeof slaBreaches.breachSeverity.enumValues[number]));
      }
      if (policyId) {
        conditions.push(eq(slaBreaches.policyId, policyId));
      }

      // Determine sort column
      const sortColumn = sortBy === 'severity' ? slaBreaches.breachSeverity
        : sortBy === 'status' ? slaBreaches.breachStatus
        : sortBy === 'breachedAt' ? slaBreaches.breachedAt
        : sortBy === 'updatedAt' ? slaBreaches.updatedAt
        : slaBreaches.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(slaBreaches)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaBreaches)
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
   * GET /api/v1/sla/compliance
   * Compliance report — aggregated breach/policy stats.
   */
  app.get<{ Querystring: ComplianceQuery }>(
    '/api/v1/sla/compliance',
    {
      preHandler: requirePermission('sla', 'view'),
    },
    async (request, reply) => {
      const { module, locationId } = request.query;

      // Build conditions for policies
      const policyConditions: SQL[] = [];
      policyConditions.push(eq(slaPolicies.orgId, request.user.orgId));

      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        policyConditions.push(inArray(slaPolicies.locationId, locationFilter));
      }
      if (module) {
        policyConditions.push(eq(slaPolicies.module, module as typeof slaPolicies.module.enumValues[number]));
      }
      if (locationId) {
        policyConditions.push(eq(slaPolicies.locationId, locationId));
      }

      const policyWhere = policyConditions.length > 0 ? and(...policyConditions) : undefined;

      // Build conditions for breaches
      const breachConditions: SQL[] = [];
      breachConditions.push(eq(slaBreaches.orgId, request.user.orgId));

      if (locationFilter !== null && locationFilter.length > 0) {
        breachConditions.push(inArray(slaBreaches.locationId, locationFilter));
      }
      if (module) {
        breachConditions.push(eq(slaBreaches.module, module as typeof slaBreaches.module.enumValues[number]));
      }
      if (locationId) {
        breachConditions.push(eq(slaBreaches.locationId, locationId));
      }

      const breachWhere = breachConditions.length > 0 ? and(...breachConditions) : undefined;

      const [totalPolicies, totalBreaches, activeBreaches, resolvedBreaches] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaPolicies)
          .where(policyWhere),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaBreaches)
          .where(breachWhere),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaBreaches)
          .where(and(
            ...(breachConditions),
            inArray(slaBreaches.breachStatus, ['at_risk', 'breached', 'escalated'])
          )),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(slaBreaches)
          .where(and(
            ...(breachConditions),
            eq(slaBreaches.breachStatus, 'resolved')
          )),
      ]);

      const totalBreachCount = totalBreaches[0]?.count ?? 0;
      const resolvedCount = resolvedBreaches[0]?.count ?? 0;
      const complianceRate = totalBreachCount > 0
        ? Math.round((resolvedCount / totalBreachCount) * 10000) / 100
        : 100;

      return reply.send({
        data: {
          totalPolicies: totalPolicies[0]?.count ?? 0,
          totalBreaches: totalBreachCount,
          activeBreaches: activeBreaches[0]?.count ?? 0,
          resolvedBreaches: resolvedCount,
          complianceRate,
        },
      });
    }
  );
}
