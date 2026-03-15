import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { authMiddleware } from './middleware/auth.js';
import { ticketRoutes } from './routes/tickets.js';
import { auditRoutes } from './routes/audits.js';
import { sopRoutes } from './routes/sops.js';
import { capaRoutes } from './routes/capa.js';
import { taskRoutes } from './routes/tasks.js';
import { knowledgeRoutes } from './routes/knowledge.js';
import { automationRoutes } from './routes/automation.js';
import { slaRoutes } from './routes/sla.js';
import { goalRoutes } from './routes/goals.js';
import { broadcastRoutes } from './routes/broadcasts.js';
import { trainingRoutes } from './routes/training.js';
import { csatRoutes } from './routes/csat.js';
import { adminRoutes } from './routes/admin.js';
import './types.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ─── Plugins ────────────────────────────────────────────────────────────────

  await app.register(cors, {
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  // ─── Health check (unauthenticated) ─────────────────────────────────────────

  app.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ─── Auth middleware (applied to all routes after health check) ──────────────

  app.addHook('preHandler', async (request, reply) => {
    // Skip auth for health check and OPTIONS (CORS preflight)
    const skipPaths = ['/health'];
    if (
      skipPaths.includes(request.url) ||
      request.method === 'OPTIONS'
    ) {
      return;
    }
    await authMiddleware(request, reply);
  });

  // ─── Routes ─────────────────────────────────────────────────────────────────

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

  return app;
}

async function start() {
  const app = await buildServer();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
