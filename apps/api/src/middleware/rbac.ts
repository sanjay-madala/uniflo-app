import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and } from 'drizzle-orm';
import '../types.js';

const { rolePermissions, userRoles, roles, users } = schema;

/**
 * Returns a Fastify preHandler that checks if the authenticated user's role
 * has the required action for the given module.
 *
 * Usage:
 *   { preHandler: requirePermission('tickets', 'create') }
 */
export function requirePermission(
  module: string,
  action: string
): preHandlerHookHandler {
  return async function checkPermission(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { orgId, uid } = request.user;

    if (!orgId) {
      reply.code(403).send({
        error: 'Forbidden',
        message: 'No organization context found',
      });
      return;
    }

    // Look up the internal user by Firebase UID
    const dbUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, uid),
    });

    if (!dbUser) {
      reply.code(403).send({
        error: 'Forbidden',
        message: 'User not found in database',
      });
      return;
    }

    // Look up the user's role assignment using internal user ID
    const userRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.userId, dbUser.id),
      with: {
        role: {
          with: {
            permissions: true,
          },
        },
      },
    });

    if (!userRole) {
      reply.code(403).send({
        error: 'Forbidden',
        message: 'No role assignment found for this user',
      });
      return;
    }

    // Find the permission entry for this module
    const permission = userRole.role.permissions.find(
      (p) => p.module === module
    );

    if (!permission || !permission.actions.includes(action)) {
      reply.code(403).send({
        error: 'Forbidden',
        message: `Missing permission: ${module}.${action}`,
      });
      return;
    }

    // Inject location scope into request for query filtering
    request.locationScope = permission.locationScope;
    request.userLocationIds = userRole.locationIds || [];
  };
}

/**
 * Builds a location filter condition based on the user's location scope.
 *
 * - 'all': no additional filter (user sees all locations)
 * - 'assigned': filter to only the user's assigned locations
 * - 'children': filter to assigned locations + their children (TODO: recursive)
 */
export function getLocationFilter(request: FastifyRequest): string[] | null {
  if (request.locationScope === 'all') {
    return null; // No filter — user sees everything
  }

  // For 'assigned' and 'children' scopes, use the user's location IDs
  return request.userLocationIds;
}
