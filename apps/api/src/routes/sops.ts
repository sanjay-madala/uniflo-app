import type { FastifyInstance } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { sops, sopAcknowledgments } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListSopsQuery {
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface SopParams {
  id: string;
}

interface CreateSopBody {
  title: string;
  description?: string;
  category?: string;
  locationId?: string;
  locationIds?: string[];
  roleIds?: string[];
  tags?: string[];
  acknowledgmentRequired?: boolean;
  autoPublishKb?: boolean;
}

interface UpdateSopBody {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  version?: string;
  locationId?: string;
  locationIds?: string[];
  roleIds?: string[];
  tags?: string[];
  acknowledgmentRequired?: boolean;
  autoPublishKb?: boolean;
  estimatedReadTimeMinutes?: number;
}

interface AcknowledgeBody {
  version: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function sopRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/sops
   * List SOPs with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListSopsQuery }>(
    '/api/v1/sops',
    {
      preHandler: requirePermission('sops', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        category,
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
      conditions.push(eq(sops.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(sops.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(sops.status, status as typeof sops.status.enumValues[number]));
      }
      if (category) {
        conditions.push(eq(sops.category, category as typeof sops.category.enumValues[number]));
      }
      if (search) {
        conditions.push(ilike(sops.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'status' ? sops.status
        : sortBy === 'title' ? sops.title
        : sortBy === 'category' ? sops.category
        : sortBy === 'publishedAt' ? sops.publishedAt
        : sortBy === 'updatedAt' ? sops.updatedAt
        : sops.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(sops)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(sops)
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
   * GET /api/v1/sops/:id
   * Get a single SOP by ID with steps and versions.
   */
  app.get<{ Params: SopParams }>(
    '/api/v1/sops/:id',
    {
      preHandler: requirePermission('sops', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const sop = await db.query.sops.findFirst({
        where: and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          steps: true,
          versions: true,
          acknowledgments: true,
        },
      });

      if (!sop) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `SOP ${id} not found`,
        });
      }

      return reply.send({ data: sop });
    }
  );

  /**
   * POST /api/v1/sops
   * Create a new SOP.
   */
  app.post<{ Body: CreateSopBody }>(
    '/api/v1/sops',
    {
      preHandler: requirePermission('sops', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        category,
        locationId,
        locationIds,
        roleIds,
        tags,
        acknowledgmentRequired,
        autoPublishKb,
      } = request.body;

      const [created] = await db
        .insert(sops)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          category: (category as typeof sops.category.enumValues[number]) ?? null,
          locationId: locationId ?? null,
          locationIds: locationIds ?? null,
          roleIds: roleIds ?? null,
          tags: tags ?? null,
          acknowledgmentRequired: acknowledgmentRequired ?? false,
          autoPublishKb: autoPublishKb ?? false,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/sops/:id
   * Update an existing SOP.
   */
  app.put<{ Params: SopParams; Body: UpdateSopBody }>(
    '/api/v1/sops/:id',
    {
      preHandler: requirePermission('sops', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        status,
        category,
        version,
        locationId,
        locationIds,
        roleIds,
        tags,
        acknowledgmentRequired,
        autoPublishKb,
        estimatedReadTimeMinutes,
      } = request.body;

      // Verify SOP exists and belongs to this org
      const existing = await db.query.sops.findFirst({
        where: and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `SOP ${id} not found`,
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
      if (version !== undefined) updateData.version = version;
      if (locationId !== undefined) updateData.locationId = locationId;
      if (locationIds !== undefined) updateData.locationIds = locationIds;
      if (roleIds !== undefined) updateData.roleIds = roleIds;
      if (tags !== undefined) updateData.tags = tags;
      if (acknowledgmentRequired !== undefined) updateData.acknowledgmentRequired = acknowledgmentRequired;
      if (autoPublishKb !== undefined) updateData.autoPublishKb = autoPublishKb;
      if (estimatedReadTimeMinutes !== undefined) updateData.estimatedReadTimeMinutes = estimatedReadTimeMinutes;

      const [updated] = await db
        .update(sops)
        .set(updateData)
        .where(and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/sops/:id
   * Delete a SOP.
   */
  app.delete<{ Params: SopParams }>(
    '/api/v1/sops/:id',
    {
      preHandler: requirePermission('sops', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await db.query.sops.findFirst({
        where: and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `SOP ${id} not found`,
        });
      }

      await db
        .delete(sops)
        .where(and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * POST /api/v1/sops/:id/publish
   * Publish a SOP (transition status to published).
   */
  app.post<{ Params: SopParams }>(
    '/api/v1/sops/:id/publish',
    {
      preHandler: requirePermission('sops', 'approve'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await db.query.sops.findFirst({
        where: and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `SOP ${id} not found`,
        });
      }

      const [updated] = await db
        .update(sops)
        .set({
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * POST /api/v1/sops/:id/acknowledge
   * Acknowledge a SOP for the current user.
   */
  app.post<{ Params: SopParams; Body: AcknowledgeBody }>(
    '/api/v1/sops/:id/acknowledge',
    {
      preHandler: requirePermission('sops', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { version } = request.body;

      // Verify SOP exists and belongs to this org
      const existing = await db.query.sops.findFirst({
        where: and(
          eq(sops.id, id),
          eq(sops.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `SOP ${id} not found`,
        });
      }

      const [acknowledgment] = await db
        .insert(sopAcknowledgments)
        .values({
          orgId: request.user.orgId,
          sopId: id,
          userId: request.user.uid,
          version,
          acknowledgedAt: new Date(),
        })
        .returning();

      return reply.code(201).send({ data: acknowledgment });
    }
  );
}
