import type { FastifyInstance } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, gte, lte, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { audits, auditTemplates } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListAuditsQuery {
  status?: string;
  templateId?: string;
  locationId?: string;
  auditorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface AuditParams {
  id: string;
}

interface CreateAuditBody {
  title: string;
  templateId: string;
  locationId: string;
  auditorId: string;
  scheduledAt?: string;
  notes?: string;
}

interface UpdateAuditBody {
  title?: string;
  status?: string;
  auditorId?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  pass?: boolean;
  findings?: string[];
  notes?: string;
}

interface ListTemplatesQuery {
  search?: string;
  category?: string;
  page?: string;
  limit?: string;
}

interface CreateTemplateBody {
  title: string;
  description?: string;
  category?: string;
  passThreshold?: number;
  version?: string;
  linkedSopIds?: string[];
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/audits
   * List audits with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListAuditsQuery }>(
    '/api/v1/audits',
    {
      preHandler: requirePermission('audits', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        templateId,
        locationId,
        auditorId,
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
      conditions.push(eq(audits.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(audits.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(audits.status, status as typeof audits.status.enumValues[number]));
      }
      if (templateId) {
        conditions.push(eq(audits.templateId, templateId));
      }
      if (locationId) {
        conditions.push(eq(audits.locationId, locationId));
      }
      if (auditorId) {
        conditions.push(eq(audits.auditorId, auditorId));
      }
      if (dateFrom) {
        conditions.push(gte(audits.scheduledAt, new Date(dateFrom)));
      }
      if (dateTo) {
        conditions.push(lte(audits.scheduledAt, new Date(dateTo)));
      }
      if (search) {
        conditions.push(ilike(audits.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'status' ? audits.status
        : sortBy === 'title' ? audits.title
        : sortBy === 'score' ? audits.score
        : sortBy === 'scheduledAt' ? audits.scheduledAt
        : sortBy === 'updatedAt' ? audits.updatedAt
        : audits.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(audits)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(audits)
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
   * GET /api/v1/audits/:id
   * Get a single audit by ID with results.
   */
  app.get<{ Params: AuditParams }>(
    '/api/v1/audits/:id',
    {
      preHandler: requirePermission('audits', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const audit = await db.query.audits.findFirst({
        where: and(
          eq(audits.id, id),
          eq(audits.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          template: true,
          auditor: true,
          creator: true,
          results: true,
          itemResults: true,
        },
      });

      if (!audit) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Audit ${id} not found`,
        });
      }

      return reply.send({ data: audit });
    }
  );

  /**
   * POST /api/v1/audits
   * Create a new audit.
   */
  app.post<{ Body: CreateAuditBody }>(
    '/api/v1/audits',
    {
      preHandler: requirePermission('audits', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        templateId,
        locationId,
        auditorId,
        scheduledAt,
        notes,
      } = request.body;

      const [created] = await db
        .insert(audits)
        .values({
          orgId: request.user.orgId,
          locationId,
          createdBy: request.user.uid,
          templateId,
          title,
          auditorId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          notes: notes ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/audits/:id
   * Update an existing audit.
   */
  app.put<{ Params: AuditParams; Body: UpdateAuditBody }>(
    '/api/v1/audits/:id',
    {
      preHandler: requirePermission('audits', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        status,
        auditorId,
        scheduledAt,
        startedAt,
        completedAt,
        score,
        pass,
        findings,
        notes,
      } = request.body;

      // Verify audit exists and belongs to this org
      const existing = await db.query.audits.findFirst({
        where: and(
          eq(audits.id, id),
          eq(audits.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Audit ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (status !== undefined) updateData.status = status;
      if (auditorId !== undefined) updateData.auditorId = auditorId;
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
      if (startedAt !== undefined) updateData.startedAt = new Date(startedAt);
      if (completedAt !== undefined) updateData.completedAt = new Date(completedAt);
      if (score !== undefined) updateData.score = score;
      if (pass !== undefined) updateData.pass = pass;
      if (findings !== undefined) updateData.findings = findings;
      if (notes !== undefined) updateData.notes = notes;

      const [updated] = await db
        .update(audits)
        .set(updateData)
        .where(and(
          eq(audits.id, id),
          eq(audits.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/audits/:id
   * Delete an audit.
   */
  app.delete<{ Params: AuditParams }>(
    '/api/v1/audits/:id',
    {
      preHandler: requirePermission('audits', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await db.query.audits.findFirst({
        where: and(
          eq(audits.id, id),
          eq(audits.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Audit ${id} not found`,
        });
      }

      await db
        .delete(audits)
        .where(and(
          eq(audits.id, id),
          eq(audits.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  // ─── Audit Templates ────────────────────────────────────────────────────────

  /**
   * GET /api/v1/audit-templates
   * List audit templates.
   */
  app.get<{ Querystring: ListTemplatesQuery }>(
    '/api/v1/audit-templates',
    {
      preHandler: requirePermission('audits', 'view'),
    },
    async (request, reply) => {
      const {
        search,
        category,
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      const conditions: SQL[] = [];
      conditions.push(eq(auditTemplates.orgId, request.user.orgId));

      if (search) {
        conditions.push(ilike(auditTemplates.title, `%${search}%`));
      }
      if (category) {
        conditions.push(eq(auditTemplates.category, category));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(auditTemplates)
          .where(whereClause)
          .orderBy(desc(auditTemplates.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(auditTemplates)
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
   * POST /api/v1/audit-templates
   * Create a new audit template.
   */
  app.post<{ Body: CreateTemplateBody }>(
    '/api/v1/audit-templates',
    {
      preHandler: requirePermission('audits', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        category,
        passThreshold,
        version,
        linkedSopIds,
      } = request.body;

      const [created] = await db
        .insert(auditTemplates)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          category: category ?? null,
          passThreshold: passThreshold ?? 80,
          version: version ?? '1.0',
          linkedSopIds: linkedSopIds ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );
}
