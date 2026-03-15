import type { FastifyInstance, FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, sql, SQL } from 'drizzle-orm';
import '../types.js';

const {
  users,
  roles,
  rolePermissions,
  userRoles,
  locations,
  organizations,
} = schema;

// ─── Admin guard ────────────────────────────────────────────────────────────

function requireAdmin(): preHandlerHookHandler {
  return async function checkAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (request.user.role !== 'admin') {
      reply.code(403).send({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }
  };
}

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListUsersQuery {
  search?: string;
  roleId?: string;
  locationId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface UserParams {
  id: string;
}

interface RoleParams {
  id: string;
}

interface LocationParams {
  id: string;
}

interface InviteUserBody {
  email: string;
  name: string;
  roleId: string;
  locationIds?: string[];
}

interface UpdateUserBody {
  name?: string;
  roleId?: string;
  locationIds?: string[];
  locale?: string;
  timezone?: string;
}

interface CreateRoleBody {
  name: string;
  permissions: {
    module: string;
    actions: string[];
    locationScope?: string;
  }[];
}

interface UpdateRoleBody {
  name?: string;
  permissions?: {
    module: string;
    actions: string[];
    locationScope?: string;
  }[];
}

interface CreateLocationBody {
  name: string;
  type: string;
  parentId?: string;
  address?: Record<string, unknown>;
}

interface UpdateLocationBody {
  name?: string;
  type?: string;
  parentId?: string;
  address?: Record<string, unknown>;
}

interface UpdateOrgBody {
  name?: string;
  domain?: string;
  plan?: string;
  settings?: Record<string, unknown>;
  branding?: Record<string, unknown>;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // ─── Users ──────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/users
   * List org users with filters and pagination.
   */
  app.get<{ Querystring: ListUsersQuery }>(
    '/api/v1/admin/users',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const {
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
      conditions.push(eq(users.orgId, request.user.orgId));

      // Optional filters
      if (search) {
        conditions.push(ilike(users.name, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'name' ? users.name
        : sortBy === 'email' ? users.email
        : sortBy === 'updatedAt' ? users.updatedAt
        : users.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
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
   * POST /api/v1/admin/users
   * Invite a new user to the org.
   */
  app.post<{ Body: InviteUserBody }>(
    '/api/v1/admin/users',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { email, name, roleId, locationIds } = request.body;

      // Create the user record
      const [created] = await db
        .insert(users)
        .values({
          orgId: request.user.orgId,
          email,
          name,
        })
        .returning();

      // Assign role to the user
      await db
        .insert(userRoles)
        .values({
          userId: created.id,
          roleId,
          locationIds: locationIds ?? null,
        });

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/admin/users/:id
   * Update a user's role, location, or profile.
   */
  app.put<{ Params: UserParams; Body: UpdateUserBody }>(
    '/api/v1/admin/users/:id',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, roleId, locationIds, locale, timezone } = request.body;

      // Verify user exists and belongs to this org
      const existing = await db.query.users.findFirst({
        where: and(
          eq(users.id, id),
          eq(users.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `User ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (locale !== undefined) updateData.locale = locale;
      if (timezone !== undefined) updateData.timezone = timezone;

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(and(
          eq(users.id, id),
          eq(users.orgId, request.user.orgId)
        ))
        .returning();

      // Update role assignment if provided
      if (roleId !== undefined || locationIds !== undefined) {
        const existingRole = await db.query.userRoles.findFirst({
          where: eq(userRoles.userId, id),
        });

        if (existingRole) {
          // Delete existing role and re-insert with new values
          await db
            .delete(userRoles)
            .where(eq(userRoles.userId, id));
        }

        await db
          .insert(userRoles)
          .values({
            userId: id,
            roleId: roleId ?? existingRole?.roleId ?? '',
            locationIds: locationIds ?? existingRole?.locationIds ?? null,
          });
      }

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/admin/users/:id
   * Deactivate a user (soft delete — removes role assignment).
   */
  app.delete<{ Params: UserParams }>(
    '/api/v1/admin/users/:id',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify user exists and belongs to this org
      const existing = await db.query.users.findFirst({
        where: and(
          eq(users.id, id),
          eq(users.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `User ${id} not found`,
        });
      }

      // Remove role assignments (deactivate)
      await db
        .delete(userRoles)
        .where(eq(userRoles.userId, id));

      // Delete the user record
      await db
        .delete(users)
        .where(and(
          eq(users.id, id),
          eq(users.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  // ─── Roles ──────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/roles
   * List roles with their permissions.
   */
  app.get(
    '/api/v1/admin/roles',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const rows = await db.query.roles.findMany({
        where: eq(roles.orgId, request.user.orgId),
        with: {
          permissions: true,
        },
        orderBy: [asc(roles.name)],
      });

      return reply.send({ data: rows });
    }
  );

  /**
   * POST /api/v1/admin/roles
   * Create a custom role with permissions.
   */
  app.post<{ Body: CreateRoleBody }>(
    '/api/v1/admin/roles',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { name, permissions } = request.body;

      const [created] = await db
        .insert(roles)
        .values({
          orgId: request.user.orgId,
          name,
        })
        .returning();

      // Insert permissions for the role
      if (permissions.length > 0) {
        await db
          .insert(rolePermissions)
          .values(
            permissions.map((p) => ({
              roleId: created.id,
              module: p.module,
              actions: p.actions,
              locationScope: (p.locationScope as typeof rolePermissions.locationScope.enumValues[number]) ?? 'assigned',
            }))
          );
      }

      // Re-fetch with permissions
      const role = await db.query.roles.findFirst({
        where: eq(roles.id, created.id),
        with: {
          permissions: true,
        },
      });

      return reply.code(201).send({ data: role });
    }
  );

  /**
   * PUT /api/v1/admin/roles/:id
   * Update a role's name and/or permissions.
   */
  app.put<{ Params: RoleParams; Body: UpdateRoleBody }>(
    '/api/v1/admin/roles/:id',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, permissions } = request.body;

      // Verify role exists and belongs to this org
      const existing = await db.query.roles.findFirst({
        where: and(
          eq(roles.id, id),
          eq(roles.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Role ${id} not found`,
        });
      }

      if (existing.isSystem) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'System roles cannot be modified',
        });
      }

      // Update role name if provided
      if (name !== undefined) {
        await db
          .update(roles)
          .set({ name, updatedAt: new Date() })
          .where(eq(roles.id, id));
      }

      // Replace permissions if provided
      if (permissions !== undefined) {
        // Delete existing permissions
        await db
          .delete(rolePermissions)
          .where(eq(rolePermissions.roleId, id));

        // Insert new permissions
        if (permissions.length > 0) {
          await db
            .insert(rolePermissions)
            .values(
              permissions.map((p) => ({
                roleId: id,
                module: p.module,
                actions: p.actions,
                locationScope: (p.locationScope as typeof rolePermissions.locationScope.enumValues[number]) ?? 'assigned',
              }))
            );
        }
      }

      // Re-fetch with permissions
      const role = await db.query.roles.findFirst({
        where: eq(roles.id, id),
        with: {
          permissions: true,
        },
      });

      return reply.send({ data: role });
    }
  );

  // ─── Locations ──────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/locations
   * List location hierarchy.
   */
  app.get(
    '/api/v1/admin/locations',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const rows = await db.query.locations.findMany({
        where: eq(locations.orgId, request.user.orgId),
        with: {
          children: true,
        },
        orderBy: [asc(locations.name)],
      });

      return reply.send({ data: rows });
    }
  );

  /**
   * POST /api/v1/admin/locations
   * Create a new location.
   */
  app.post<{ Body: CreateLocationBody }>(
    '/api/v1/admin/locations',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { name, type, parentId, address } = request.body;

      // If parentId is provided, verify it exists and belongs to this org
      if (parentId) {
        const parent = await db.query.locations.findFirst({
          where: and(
            eq(locations.id, parentId),
            eq(locations.orgId, request.user.orgId)
          ),
        });

        if (!parent) {
          return reply.code(404).send({
            error: 'Not Found',
            message: `Parent location ${parentId} not found`,
          });
        }
      }

      const [created] = await db
        .insert(locations)
        .values({
          orgId: request.user.orgId,
          name,
          type: type as typeof locations.type.enumValues[number],
          parentId: parentId ?? null,
          address: address ?? {},
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/admin/locations/:id
   * Update a location.
   */
  app.put<{ Params: LocationParams; Body: UpdateLocationBody }>(
    '/api/v1/admin/locations/:id',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, type, parentId, address } = request.body;

      // Verify location exists and belongs to this org
      const existing = await db.query.locations.findFirst({
        where: and(
          eq(locations.id, id),
          eq(locations.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Location ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (parentId !== undefined) updateData.parentId = parentId;
      if (address !== undefined) updateData.address = address;

      const [updated] = await db
        .update(locations)
        .set(updateData)
        .where(and(
          eq(locations.id, id),
          eq(locations.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  // ─── Organization settings ────────────────────────────────────────────────

  /**
   * GET /api/v1/admin/org
   * Get organization settings.
   */
  app.get(
    '/api/v1/admin/org',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, request.user.orgId),
      });

      if (!org) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      return reply.send({ data: org });
    }
  );

  /**
   * PUT /api/v1/admin/org
   * Update organization settings.
   */
  app.put<{ Body: UpdateOrgBody }>(
    '/api/v1/admin/org',
    {
      preHandler: requireAdmin(),
    },
    async (request, reply) => {
      const { name, domain, plan, settings, branding } = request.body;

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (domain !== undefined) updateData.domain = domain;
      if (plan !== undefined) updateData.plan = plan;
      if (settings !== undefined) updateData.settings = settings;
      if (branding !== undefined) updateData.branding = branding;

      const [updated] = await db
        .update(organizations)
        .set(updateData)
        .where(eq(organizations.id, request.user.orgId))
        .returning();

      return reply.send({ data: updated });
    }
  );
}
