import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { ticketRoutes } from '../routes/tickets.js';
import { auditRoutes } from '../routes/audits.js';
import { sopRoutes } from '../routes/sops.js';
import { capaRoutes } from '../routes/capa.js';
import { taskRoutes } from '../routes/tasks.js';
import { knowledgeRoutes } from '../routes/knowledge.js';
import { automationRoutes } from '../routes/automation.js';
import { slaRoutes } from '../routes/sla.js';
import { goalRoutes } from '../routes/goals.js';
import { broadcastRoutes } from '../routes/broadcasts.js';
import { trainingRoutes } from '../routes/training.js';
import { csatRoutes } from '../routes/csat.js';
import { adminRoutes } from '../routes/admin.js';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Health check (unauthenticated)
  app.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Auth middleware (skip health check and OPTIONS)
  app.addHook('preHandler', async (request, reply) => {
    const skipPaths = ['/health'];
    if (skipPaths.includes(request.url) || request.method === 'OPTIONS') {
      return;
    }
    await authMiddleware(request, reply);
  });

  // Register all route modules
  await app.register(ticketRoutes);
  await app.register(auditRoutes);
  await app.register(sopRoutes);
  await app.register(capaRoutes);
  await app.register(taskRoutes);
  await app.register(knowledgeRoutes);
  await app.register(automationRoutes);
  await app.register(slaRoutes);
  await app.register(goalRoutes);
  await app.register(broadcastRoutes);
  await app.register(trainingRoutes);
  await app.register(csatRoutes);
  await app.register(adminRoutes);

  await app.ready();
  return app;
}

export function authHeader(role = 'admin'): Record<string, string> {
  return { Authorization: `Bearer test-token-${role}` };
}

/**
 * Convenience: inject GET with auth
 */
export async function authGet(app: FastifyInstance, url: string) {
  return app.inject({
    method: 'GET',
    url,
    headers: authHeader(),
  });
}

/**
 * Convenience: inject POST with auth and JSON body
 */
export async function authPost(app: FastifyInstance, url: string, body: Record<string, unknown>) {
  return app.inject({
    method: 'POST',
    url,
    headers: { ...authHeader(), 'content-type': 'application/json' },
    payload: body,
  });
}

/**
 * Convenience: inject PUT with auth and JSON body
 */
export async function authPut(app: FastifyInstance, url: string, body: Record<string, unknown>) {
  return app.inject({
    method: 'PUT',
    url,
    headers: { ...authHeader(), 'content-type': 'application/json' },
    payload: body,
  });
}

/**
 * Convenience: inject DELETE with auth
 */
export async function authDelete(app: FastifyInstance, url: string) {
  return app.inject({
    method: 'DELETE',
    url,
    headers: authHeader(),
  });
}
