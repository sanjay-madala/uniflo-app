import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL, gte, lte } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { broadcasts, readReceipts } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListBroadcastsQuery {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface BroadcastParams {
  id: string;
}

interface CreateBroadcastBody {
  title: string;
  bodyHtml?: string;
  bodyPlain?: string;
  priority?: string;
  locationId?: string;
  audience?: Record<string, unknown>;
  acknowledgmentRequired?: boolean;
  templateId?: string;
  attachments?: unknown[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
}

interface UpdateBroadcastBody {
  title?: string;
  bodyHtml?: string;
  bodyPlain?: string;
  priority?: string;
  locationId?: string;
  audience?: Record<string, unknown>;
  acknowledgmentRequired?: boolean;
  templateId?: string;
  attachments?: unknown[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function broadcastRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/broadcasts
   * List broadcasts with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListBroadcastsQuery }>(
    '/api/v1/broadcasts',
    {
      preHandler: requirePermission('broadcasts', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        priority,
        dateFrom,
        dateTo,
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
      conditions.push(eq(broadcasts.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(broadcasts.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(broadcasts.status, status as typeof broadcasts.status.enumValues[number]));
      }
      if (priority) {
        conditions.push(eq(broadcasts.priority, priority as typeof broadcasts.priority.enumValues[number]));
      }
      if (dateFrom) {
        conditions.push(gte(broadcasts.createdAt, new Date(dateFrom)));
      }
      if (dateTo) {
        conditions.push(lte(broadcasts.createdAt, new Date(dateTo)));
      }
      if (search) {
        conditions.push(ilike(broadcasts.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'priority' ? broadcasts.priority
        : sortBy === 'status' ? broadcasts.status
        : sortBy === 'title' ? broadcasts.title
        : sortBy === 'sentAt' ? broadcasts.sentAt
        : sortBy === 'updatedAt' ? broadcasts.updatedAt
        : broadcasts.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(broadcasts)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(broadcasts)
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
   * GET /api/v1/broadcasts/:id
   * Get a single broadcast with read receipts.
   */
  app.get<{ Params: BroadcastParams }>(
    '/api/v1/broadcasts/:id',
    {
      preHandler: requirePermission('broadcasts', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const broadcast = await db.query.broadcasts.findFirst({
        where: and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          readReceipts: true,
        },
      });

      if (!broadcast) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Broadcast ${id} not found`,
        });
      }

      return reply.send({ data: broadcast });
    }
  );

  /**
   * POST /api/v1/broadcasts
   * Create a new broadcast.
   */
  app.post<{ Body: CreateBroadcastBody }>(
    '/api/v1/broadcasts',
    {
      preHandler: requirePermission('broadcasts', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        bodyHtml,
        bodyPlain,
        priority,
        locationId,
        audience,
        acknowledgmentRequired,
        templateId,
        attachments,
        scheduledAt,
        tags,
        category,
      } = request.body;

      const [created] = await db
        .insert(broadcasts)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          bodyHtml: bodyHtml ?? null,
          bodyPlain: bodyPlain ?? null,
          priority: (priority as typeof broadcasts.priority.enumValues[number]) ?? 'normal',
          locationId: locationId ?? null,
          audience: audience ?? {},
          acknowledgmentRequired: acknowledgmentRequired ?? false,
          templateId: templateId ?? null,
          attachments: attachments ?? [],
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          tags: tags ?? null,
          category: category ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/broadcasts/:id
   * Update an existing broadcast.
   */
  app.put<{ Params: BroadcastParams; Body: UpdateBroadcastBody }>(
    '/api/v1/broadcasts/:id',
    {
      preHandler: requirePermission('broadcasts', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        bodyHtml,
        bodyPlain,
        priority,
        locationId,
        audience,
        acknowledgmentRequired,
        templateId,
        attachments,
        scheduledAt,
        tags,
        category,
      } = request.body;

      // Verify broadcast exists and belongs to this org
      const existing = await db.query.broadcasts.findFirst({
        where: and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Broadcast ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (bodyHtml !== undefined) updateData.bodyHtml = bodyHtml;
      if (bodyPlain !== undefined) updateData.bodyPlain = bodyPlain;
      if (priority !== undefined) updateData.priority = priority;
      if (locationId !== undefined) updateData.locationId = locationId;
      if (audience !== undefined) updateData.audience = audience;
      if (acknowledgmentRequired !== undefined) updateData.acknowledgmentRequired = acknowledgmentRequired;
      if (templateId !== undefined) updateData.templateId = templateId;
      if (attachments !== undefined) updateData.attachments = attachments;
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
      if (tags !== undefined) updateData.tags = tags;
      if (category !== undefined) updateData.category = category;

      const [updated] = await db
        .update(broadcasts)
        .set(updateData)
        .where(and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/broadcasts/:id
   * Delete a broadcast.
   */
  app.delete<{ Params: BroadcastParams }>(
    '/api/v1/broadcasts/:id',
    {
      preHandler: requirePermission('broadcasts', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify broadcast exists and belongs to this org
      const existing = await db.query.broadcasts.findFirst({
        where: and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Broadcast ${id} not found`,
        });
      }

      await db
        .delete(broadcasts)
        .where(and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * POST /api/v1/broadcasts/:id/send
   * Send a broadcast (transition from draft/scheduled to sent).
   */
  app.post<{ Params: BroadcastParams }>(
    '/api/v1/broadcasts/:id/send',
    {
      preHandler: requirePermission('broadcasts', 'create'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify broadcast exists and belongs to this org
      const existing = await db.query.broadcasts.findFirst({
        where: and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Broadcast ${id} not found`,
        });
      }

      if (existing.status === 'sent') {
        return reply.code(409).send({
          error: 'Conflict',
          message: 'Broadcast has already been sent',
        });
      }

      const [updated] = await db
        .update(broadcasts)
        .set({
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * GET /api/v1/broadcasts/:id/receipts
   * List read receipts for a broadcast.
   */
  app.get<{ Params: BroadcastParams; Querystring: { page?: string; limit?: string } }>(
    '/api/v1/broadcasts/:id/receipts',
    {
      preHandler: requirePermission('broadcasts', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      // Verify broadcast exists and belongs to this org
      const existing = await db.query.broadcasts.findFirst({
        where: and(
          eq(broadcasts.id, id),
          eq(broadcasts.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Broadcast ${id} not found`,
        });
      }

      const whereClause = and(
        eq(readReceipts.broadcastId, id),
        eq(readReceipts.orgId, request.user.orgId)
      );

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(readReceipts)
          .where(whereClause)
          .orderBy(desc(readReceipts.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(readReceipts)
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
