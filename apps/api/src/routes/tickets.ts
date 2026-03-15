import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { tickets } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListTicketsQuery {
  status?: string;
  priority?: string;
  assigneeId?: string;
  locationId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface TicketParams {
  id: string;
}

interface CreateTicketBody {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  locationId: string;
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
}

interface UpdateTicketBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigneeId?: string;
  tags?: string[];
  resolvedAt?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function ticketRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/tickets
   * List tickets with filters, pagination, and sorting.
   * RLS enforces org scoping at the DB level.
   */
  app.get<{ Querystring: ListTicketsQuery }>(
    '/api/v1/tickets',
    {
      preHandler: requirePermission('tickets', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        priority,
        assigneeId,
        locationId,
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

      // Org scoping (RLS handles this at DB level, but we also filter explicitly)
      conditions.push(eq(tickets.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(tickets.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(tickets.status, status as typeof tickets.status.enumValues[number]));
      }
      if (priority) {
        conditions.push(eq(tickets.priority, priority as typeof tickets.priority.enumValues[number]));
      }
      if (assigneeId) {
        conditions.push(eq(tickets.assigneeId, assigneeId));
      }
      if (locationId) {
        conditions.push(eq(tickets.locationId, locationId));
      }
      if (search) {
        conditions.push(ilike(tickets.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'priority' ? tickets.priority
        : sortBy === 'status' ? tickets.status
        : sortBy === 'title' ? tickets.title
        : sortBy === 'updatedAt' ? tickets.updatedAt
        : tickets.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(tickets)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(tickets)
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
   * GET /api/v1/tickets/:id
   * Get a single ticket by ID.
   */
  app.get<{ Params: TicketParams }>(
    '/api/v1/tickets/:id',
    {
      preHandler: requirePermission('tickets', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, id),
          eq(tickets.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          assignee: true,
          reporter: true,
          creator: true,
          comments: true,
          attachments: true,
        },
      });

      if (!ticket) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Ticket ${id} not found`,
        });
      }

      return reply.send({ data: ticket });
    }
  );

  /**
   * POST /api/v1/tickets
   * Create a new ticket.
   */
  app.post<{ Body: CreateTicketBody }>(
    '/api/v1/tickets',
    {
      preHandler: requirePermission('tickets', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        priority,
        category,
        locationId,
        assigneeId,
        reporterId,
        tags,
      } = request.body;

      const [created] = await db
        .insert(tickets)
        .values({
          orgId: request.user.orgId,
          locationId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          priority: (priority as typeof tickets.priority.enumValues[number]) ?? 'medium',
          category: (category as typeof tickets.category.enumValues[number]) ?? null,
          assigneeId: assigneeId ?? null,
          reporterId: reporterId ?? null,
          tags: tags ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/tickets/:id
   * Update an existing ticket.
   */
  app.put<{ Params: TicketParams; Body: UpdateTicketBody }>(
    '/api/v1/tickets/:id',
    {
      preHandler: requirePermission('tickets', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        status,
        priority,
        category,
        assigneeId,
        tags,
        resolvedAt,
      } = request.body;

      // Verify ticket exists and belongs to this org
      const existing = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, id),
          eq(tickets.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Ticket ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (category !== undefined) updateData.category = category;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
      if (tags !== undefined) updateData.tags = tags;
      if (resolvedAt !== undefined) updateData.resolvedAt = new Date(resolvedAt);

      const [updated] = await db
        .update(tickets)
        .set(updateData)
        .where(and(
          eq(tickets.id, id),
          eq(tickets.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/tickets/:id
   * Delete a ticket (soft delete could be added later).
   */
  app.delete<{ Params: TicketParams }>(
    '/api/v1/tickets/:id',
    {
      preHandler: requirePermission('tickets', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify ticket exists and belongs to this org
      const existing = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, id),
          eq(tickets.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Ticket ${id} not found`,
        });
      }

      await db
        .delete(tickets)
        .where(and(
          eq(tickets.id, id),
          eq(tickets.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );
}
