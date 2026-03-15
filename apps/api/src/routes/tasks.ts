import type { FastifyInstance } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { tasks, projects } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListTasksQuery {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  source?: string;
  locationId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface TaskParams {
  id: string;
}

interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: string;
  locationId: string;
  assigneeId?: string;
  reporterId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  source?: string;
  linkedAuditId?: string;
  linkedAuditItem?: string;
  linkedCapaId?: string;
  linkedTicketId?: string;
  linkedSopId?: string;
  estimatedHours?: number;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  projectId?: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  watchers?: string[];
  estimatedHours?: number;
  customFields?: Record<string, unknown>;
}

interface ListProjectsQuery {
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}

interface CreateProjectBody {
  name: string;
  description?: string;
  locationId?: string;
  ownerId: string;
  dueDate?: string;
  color?: string;
  tags?: string[];
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function taskRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/tasks
   * List tasks with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListTasksQuery }>(
    '/api/v1/tasks',
    {
      preHandler: requirePermission('tasks', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        priority,
        assigneeId,
        projectId,
        source,
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

      // Org scoping
      conditions.push(eq(tasks.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(tasks.locationId, locationFilter));
      }

      // Optional filters
      if (status) {
        conditions.push(eq(tasks.status, status as typeof tasks.status.enumValues[number]));
      }
      if (priority) {
        conditions.push(eq(tasks.priority, priority as typeof tasks.priority.enumValues[number]));
      }
      if (assigneeId) {
        conditions.push(eq(tasks.assigneeId, assigneeId));
      }
      if (projectId) {
        conditions.push(eq(tasks.projectId, projectId));
      }
      if (source) {
        conditions.push(eq(tasks.source, source as typeof tasks.source.enumValues[number]));
      }
      if (locationId) {
        conditions.push(eq(tasks.locationId, locationId));
      }
      if (search) {
        conditions.push(ilike(tasks.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'priority' ? tasks.priority
        : sortBy === 'status' ? tasks.status
        : sortBy === 'title' ? tasks.title
        : sortBy === 'dueDate' ? tasks.dueDate
        : sortBy === 'updatedAt' ? tasks.updatedAt
        : tasks.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(tasks)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(tasks)
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
   * GET /api/v1/tasks/:id
   * Get a single task by ID with subtasks and comments.
   */
  app.get<{ Params: TaskParams }>(
    '/api/v1/tasks/:id',
    {
      preHandler: requirePermission('tasks', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const task = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, id),
          eq(tasks.orgId, request.user.orgId)
        ),
        with: {
          location: true,
          assignee: true,
          reporter: true,
          creator: true,
          project: true,
          subtasks: true,
          comments: true,
        },
      });

      if (!task) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Task ${id} not found`,
        });
      }

      return reply.send({ data: task });
    }
  );

  /**
   * POST /api/v1/tasks
   * Create a new task.
   */
  app.post<{ Body: CreateTaskBody }>(
    '/api/v1/tasks',
    {
      preHandler: requirePermission('tasks', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        description,
        priority,
        locationId,
        assigneeId,
        reporterId,
        projectId,
        dueDate,
        tags,
        source,
        linkedAuditId,
        linkedAuditItem,
        linkedCapaId,
        linkedTicketId,
        linkedSopId,
        estimatedHours,
      } = request.body;

      const [created] = await db
        .insert(tasks)
        .values({
          orgId: request.user.orgId,
          locationId,
          createdBy: request.user.uid,
          title,
          description: description ?? null,
          priority: (priority as typeof tasks.priority.enumValues[number]) ?? 'medium',
          assigneeId: assigneeId ?? null,
          reporterId: reporterId ?? null,
          projectId: projectId ?? null,
          dueDate: dueDate ? new Date(dueDate) : null,
          tags: tags ?? null,
          source: (source as typeof tasks.source.enumValues[number]) ?? 'manual',
          linkedAuditId: linkedAuditId ?? null,
          linkedAuditItem: linkedAuditItem ?? null,
          linkedCapaId: linkedCapaId ?? null,
          linkedTicketId: linkedTicketId ?? null,
          linkedSopId: linkedSopId ?? null,
          estimatedHours: estimatedHours ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/tasks/:id
   * Update an existing task.
   */
  app.put<{ Params: TaskParams; Body: UpdateTaskBody }>(
    '/api/v1/tasks/:id',
    {
      preHandler: requirePermission('tasks', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        description,
        status,
        priority,
        assigneeId,
        reporterId,
        projectId,
        dueDate,
        completedAt,
        tags,
        watchers,
        estimatedHours,
        customFields,
      } = request.body;

      // Verify task exists and belongs to this org
      const existing = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, id),
          eq(tasks.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Task ${id} not found`,
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
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
      if (reporterId !== undefined) updateData.reporterId = reporterId;
      if (projectId !== undefined) updateData.projectId = projectId;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
      if (completedAt !== undefined) updateData.completedAt = new Date(completedAt);
      if (tags !== undefined) updateData.tags = tags;
      if (watchers !== undefined) updateData.watchers = watchers;
      if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
      if (customFields !== undefined) updateData.customFields = customFields;

      const [updated] = await db
        .update(tasks)
        .set(updateData)
        .where(and(
          eq(tasks.id, id),
          eq(tasks.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task.
   */
  app.delete<{ Params: TaskParams }>(
    '/api/v1/tasks/:id',
    {
      preHandler: requirePermission('tasks', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, id),
          eq(tasks.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Task ${id} not found`,
        });
      }

      await db
        .delete(tasks)
        .where(and(
          eq(tasks.id, id),
          eq(tasks.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  // ─── Projects ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/projects
   * List projects.
   */
  app.get<{ Querystring: ListProjectsQuery }>(
    '/api/v1/projects',
    {
      preHandler: requirePermission('tasks', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        search,
        page = '1',
        limit = '25',
      } = request.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
      const offset = (pageNum - 1) * limitNum;

      const conditions: SQL[] = [];
      conditions.push(eq(projects.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(projects.locationId, locationFilter));
      }

      if (status) {
        conditions.push(eq(projects.status, status as typeof projects.status.enumValues[number]));
      }
      if (search) {
        conditions.push(ilike(projects.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(projects)
          .where(whereClause)
          .orderBy(desc(projects.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(projects)
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
   * POST /api/v1/projects
   * Create a new project.
   */
  app.post<{ Body: CreateProjectBody }>(
    '/api/v1/projects',
    {
      preHandler: requirePermission('tasks', 'create'),
    },
    async (request, reply) => {
      const {
        name,
        description,
        locationId,
        ownerId,
        dueDate,
        color,
        tags,
      } = request.body;

      const [created] = await db
        .insert(projects)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          name,
          description: description ?? null,
          locationId: locationId ?? null,
          ownerId,
          dueDate: dueDate ? new Date(dueDate) : null,
          color: color ?? '#3B82F6',
          tags: tags ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );
}
