import type { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../lib/firebase.js';
import { pool } from '../lib/db.js';
import '../types.js';

/**
 * Fastify preHandler hook for Firebase JWT authentication.
 *
 * 1. Reads Authorization: Bearer <token> header
 * 2. Verifies the Firebase JWT via auth.verifyIdToken(token)
 * 3. Extracts custom claims: org_id, role, location_ids
 * 4. Attaches user info to request.user
 * 5. Sets DB RLS context: SET LOCAL app.current_org_id
 * 6. Returns 401 if token is missing/invalid
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await auth.verifyIdToken(token);

    const orgId = (decoded.org_id as string) || '';
    const role = (decoded.role as string) || '';
    const locationIds = (decoded.location_ids as string[]) || [];

    request.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      orgId,
      role,
      locationIds,
    };

    // Set RLS context for the database connection
    if (orgId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(orgId)) {
        await pool.query(`SET LOCAL app.current_org_id = '${orgId}'`);
      }
    }
  } catch (error) {
    request.log.error({ error }, 'Firebase token verification failed');
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}
