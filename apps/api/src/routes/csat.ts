import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, sql, SQL, gte, lte, isNotNull } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { csatSurveys } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListSurveysQuery {
  status?: string;
  scoreMin?: string;
  scoreMax?: string;
  locationId?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface SurveyParams {
  id: string;
}

interface CreateSurveyBody {
  ticketId: string;
  locationId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  ratingMode?: string;
  expiresAt: string;
}

interface SubmitSurveyBody {
  token: string;
  score: number;
  comment?: string;
}

interface DashboardQuery {
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function csatRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/csat/surveys
   * List CSAT surveys with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListSurveysQuery }>(
    '/api/v1/csat/surveys',
    {
      preHandler: requirePermission('csat', 'view'),
    },
    async (request, reply) => {
      const {
        status,
        scoreMin,
        scoreMax,
        locationId,
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
      conditions.push(eq(csatSurveys.orgId, request.user.orgId));

      // Status filter: "submitted" means has a score, "pending" means no score yet
      if (status === 'submitted') {
        conditions.push(isNotNull(csatSurveys.submittedAt));
      } else if (status === 'pending') {
        conditions.push(sql`${csatSurveys.submittedAt} IS NULL`);
      }

      // Score range filters
      if (scoreMin) {
        conditions.push(gte(csatSurveys.score, parseInt(scoreMin, 10)));
      }
      if (scoreMax) {
        conditions.push(lte(csatSurveys.score, parseInt(scoreMax, 10)));
      }

      if (locationId) {
        conditions.push(eq(csatSurveys.locationId, locationId));
      }

      // Determine sort column
      const sortColumn = sortBy === 'score' ? csatSurveys.score
        : sortBy === 'submittedAt' ? csatSurveys.submittedAt
        : sortBy === 'updatedAt' ? csatSurveys.updatedAt
        : csatSurveys.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(csatSurveys)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(csatSurveys)
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
   * GET /api/v1/csat/surveys/:id
   * Get a single CSAT survey.
   */
  app.get<{ Params: SurveyParams }>(
    '/api/v1/csat/surveys/:id',
    {
      preHandler: requirePermission('csat', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const survey = await db.query.csatSurveys.findFirst({
        where: and(
          eq(csatSurveys.id, id),
          eq(csatSurveys.orgId, request.user.orgId)
        ),
        with: {
          location: true,
        },
      });

      if (!survey) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Survey ${id} not found`,
        });
      }

      return reply.send({ data: survey });
    }
  );

  /**
   * POST /api/v1/csat/surveys
   * Create a new CSAT survey (sent after ticket resolution).
   */
  app.post<{ Body: CreateSurveyBody }>(
    '/api/v1/csat/surveys',
    {
      preHandler: requirePermission('csat', 'create'),
    },
    async (request, reply) => {
      const {
        ticketId,
        locationId,
        customerId,
        customerName,
        customerEmail,
        ratingMode,
        expiresAt,
      } = request.body;

      // Generate a unique token for customer-facing survey access
      const token = crypto.randomUUID();

      const [created] = await db
        .insert(csatSurveys)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          ticketId,
          token,
          locationId: locationId ?? null,
          customerId: customerId ?? null,
          customerName: customerName ?? null,
          customerEmail: customerEmail ?? null,
          ratingMode: (ratingMode as typeof csatSurveys.ratingMode.enumValues[number]) ?? 'stars',
          expiresAt: new Date(expiresAt),
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/csat/surveys/:id
   * Submit a survey rating. Token-based auth — no Firebase JWT needed.
   * Customer-facing endpoint: authenticates via survey token instead of user session.
   */
  app.put<{ Params: SurveyParams; Body: SubmitSurveyBody }>(
    '/api/v1/csat/surveys/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { token, score, comment } = request.body;

      // Look up the survey by ID and token (no org scoping — public endpoint)
      const survey = await db.query.csatSurveys.findFirst({
        where: and(
          eq(csatSurveys.id, id),
          eq(csatSurveys.token, token)
        ),
      });

      if (!survey) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Survey not found or invalid token',
        });
      }

      // Check if already submitted
      if (survey.submittedAt) {
        return reply.code(409).send({
          error: 'Conflict',
          message: 'Survey has already been submitted',
        });
      }

      // Check if expired
      if (new Date() > survey.expiresAt) {
        return reply.code(410).send({
          error: 'Gone',
          message: 'Survey has expired',
        });
      }

      const [updated] = await db
        .update(csatSurveys)
        .set({
          score,
          comment: comment ?? null,
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(csatSurveys.id, id),
          eq(csatSurveys.token, token)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * GET /api/v1/csat/dashboard
   * Aggregated CSAT metrics: avg score, trend, distribution.
   */
  app.get<{ Querystring: DashboardQuery }>(
    '/api/v1/csat/dashboard',
    {
      preHandler: requirePermission('csat', 'view'),
    },
    async (request, reply) => {
      const { locationId, dateFrom, dateTo } = request.query;

      // Build where conditions
      const conditions: SQL[] = [];

      // Org scoping
      conditions.push(eq(csatSurveys.orgId, request.user.orgId));

      // Only include submitted surveys in metrics
      conditions.push(isNotNull(csatSurveys.submittedAt));

      if (locationId) {
        conditions.push(eq(csatSurveys.locationId, locationId));
      }
      if (dateFrom) {
        conditions.push(gte(csatSurveys.submittedAt, new Date(dateFrom)));
      }
      if (dateTo) {
        conditions.push(lte(csatSurveys.submittedAt, new Date(dateTo)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Aggregated metrics
      const [metricsResult] = await db
        .select({
          avgScore: sql<number>`COALESCE(AVG(${csatSurveys.score})::numeric(3,2), 0)`,
          totalResponses: sql<number>`count(*)::int`,
          minScore: sql<number>`COALESCE(MIN(${csatSurveys.score}), 0)`,
          maxScore: sql<number>`COALESCE(MAX(${csatSurveys.score}), 0)`,
        })
        .from(csatSurveys)
        .where(whereClause);

      // Score distribution (1-5)
      const distribution = await db
        .select({
          score: csatSurveys.score,
          count: sql<number>`count(*)::int`,
        })
        .from(csatSurveys)
        .where(whereClause)
        .groupBy(csatSurveys.score)
        .orderBy(asc(csatSurveys.score));

      // Monthly trend (last 12 months)
      const trend = await db
        .select({
          month: sql<string>`to_char(${csatSurveys.submittedAt}, 'YYYY-MM')`,
          avgScore: sql<number>`AVG(${csatSurveys.score})::numeric(3,2)`,
          count: sql<number>`count(*)::int`,
        })
        .from(csatSurveys)
        .where(whereClause)
        .groupBy(sql`to_char(${csatSurveys.submittedAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${csatSurveys.submittedAt}, 'YYYY-MM')`));

      return reply.send({
        data: {
          summary: metricsResult,
          distribution,
          trend,
        },
      });
    }
  );
}
