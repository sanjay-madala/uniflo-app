import type { FastifyInstance } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { capas, capaEffectivenessReviews } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListCapasQuery {
  status?: string;
  severity?: string;
  source?: string;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface CapaParams {
  id: string;
}

interface CreateCapaBody {
  title: string;
  description?: string;
  severity?: string;
  source?: string;
  sourceId?: string;
  locationId: string;
  ownerId: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  dueDate?: string;
  linkedTicketIds?: string[];
  linkedAuditIds?: string[];
  linkedSopIds?: string[];
  tags?: string[];
  category?: string;
}

interface UpdateCapaBody {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  ownerId?: string;
  rootCause?: string;
  rootCauseAnalysis?: Record<string, unknown>;
  correctiveAction?: string;
  preventiveAction?: string;
  dueDate?: string;
  closedAt?: string;
  linkedTicketIds?: string[];
  linkedAuditIds?: string[];
  linkedSopIds?: string[];
  tags?: string[];
  category?: string;
}

interface ReviewBody {
  effective: boolean;
  criteria?: Record<string, unknown>[];
  followUpRequired?: boolean;
  followUpCapaId?: string;
  signOffComment?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function capaRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/capas
   * List CAPAs with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListCapasQuery }>(
    '/api/v1/capas',
    {
      preHandler: requirePermission('capa', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        severity,
        source,
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
      conditions.push(eq(capas.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(capas.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(capas.status, status as typeof capas.status.enumValues[number]));
      }
      if (severity) {
        conditions.push(eq(capas.severity, severity as typeof capas.severity.enumValues[number]));
      }
      if (source) {
        conditions.push(eq(capas.source, source as typeof capas.source.enumValues[number]));
      }
      if (ownerId) {
        conditions.push(eq(capas.ownerId, ownerId));
      }
      if (search) {
        conditions.push(ilike(capas.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'status' ? capas.status
        : sortBy === 'severity' ? capas.severity
        : sortBy === 'title' ? capas.title
        : sortBy === 'dueDate' ? capas.dueDate
        : sortBy === 'updatedAt' ? capas.updatedAt
        : capas.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(capas)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(capas)
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
   * GET /api/v1/capas/:id
   * Get a single CAPA by ID with actions and effectiveness reviews.
   */
  app.get<{ Params: CapaParams }>(
    '/api/v1/capas/:id',
    {
      preHandler: requirePermission('capa', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const capa = await db.query.capas.findFirst({
        where: and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          creator: true,
          owner: true,
          actions: true,
          effectivenessReviews: true,
        },
      });

      if (!capa) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `CAPA ${id} not found`,
        });
      }

      return reply.send({ data: capa });
    }
  );

  /**
   * POST /api/v1/capas
   * Create a new CAPA.
   */
  app.post<{ Body: CreateCapaBody }>(
    '/api/v1/capas',
    {
      preHandler: requirePermission('capa', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        severity,
        source,
        sourceId,
        locationId,
        ownerId,
        rootCause,
        correctiveAction,
        preventiveAction,
        dueDate,
        linkedTicketIds,
        linkedAuditIds,
        linkedSopIds,
        tags,
        category,
      } = request.body;

      const [created] = await db
        .insert(capas)
        .values({
          orgId: request.user.orgId,
          locationId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          severity: (severity as typeof capas.severity.enumValues[number]) ?? 'medium',
          source: (source as typeof capas.source.enumValues[number]) ?? 'manual',
          sourceId: sourceId ?? null,
          ownerId,
          rootCause: rootCause ?? null,
          correctiveAction: correctiveAction ?? null,
          preventiveAction: preventiveAction ?? null,
          dueDate: dueDate ? new Date(dueDate) : null,
          linkedTicketIds: linkedTicketIds ?? null,
          linkedAuditIds: linkedAuditIds ?? null,
          linkedSopIds: linkedSopIds ?? null,
          tags: tags ?? null,
          category: category ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/capas/:id
   * Update an existing CAPA.
   */
  app.put<{ Params: CapaParams; Body: UpdateCapaBody }>(
    '/api/v1/capas/:id',
    {
      preHandler: requirePermission('capa', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        status,
        severity,
        ownerId,
        rootCause,
        rootCauseAnalysis,
        correctiveAction,
        preventiveAction,
        dueDate,
        closedAt,
        linkedTicketIds,
        linkedAuditIds,
        linkedSopIds,
        tags,
        category,
      } = request.body;

      // Verify CAPA exists and belongs to this org
      const existing = await db.query.capas.findFirst({
        where: and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `CAPA ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (severity !== undefined) updateData.severity = severity;
      if (ownerId !== undefined) updateData.ownerId = ownerId;
      if (rootCause !== undefined) updateData.rootCause = rootCause;
      if (rootCauseAnalysis !== undefined) updateData.rootCauseAnalysis = rootCauseAnalysis;
      if (correctiveAction !== undefined) updateData.correctiveAction = correctiveAction;
      if (preventiveAction !== undefined) updateData.preventiveAction = preventiveAction;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
      if (closedAt !== undefined) updateData.closedAt = new Date(closedAt);
      if (linkedTicketIds !== undefined) updateData.linkedTicketIds = linkedTicketIds;
      if (linkedAuditIds !== undefined) updateData.linkedAuditIds = linkedAuditIds;
      if (linkedSopIds !== undefined) updateData.linkedSopIds = linkedSopIds;
      if (tags !== undefined) updateData.tags = tags;
      if (category !== undefined) updateData.category = category;

      const [updated] = await db
        .update(capas)
        .set(updateData)
        .where(and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/capas/:id
   * Delete a CAPA.
   */
  app.delete<{ Params: CapaParams }>(
    '/api/v1/capas/:id',
    {
      preHandler: requirePermission('capa', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await db.query.capas.findFirst({
        where: and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `CAPA ${id} not found`,
        });
      }

      await db
        .delete(capas)
        .where(and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * POST /api/v1/capas/:id/review
   * Submit an effectiveness review for a CAPA.
   */
  app.post<{ Params: CapaParams; Body: ReviewBody }>(
    '/api/v1/capas/:id/review',
    {
      preHandler: requirePermission('capa', 'approve'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        effective,
        criteria,
        followUpRequired,
        followUpCapaId,
        signOffComment,
      } = request.body;

      // Verify CAPA exists and belongs to this org
      const existing = await db.query.capas.findFirst({
        where: and(
          eq(capas.id, id),
          eq(capas.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `CAPA ${id} not found`,
        });
      }

      const [review] = await db
        .insert(capaEffectivenessReviews)
        .values({
          orgId: request.user.orgId,
          capaId: id,
          reviewerId: request.user.uid,
          reviewedAt: new Date(),
          effective,
          criteria: criteria ?? [],
          followUpRequired: followUpRequired ?? false,
          followUpCapaId: followUpCapaId ?? null,
          signOffComment: signOffComment ?? null,
        })
        .returning();

      return reply.code(201).send({ data: review });
    }
  );
}
