import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../lib/db.js';
import { eq, and, desc, asc, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { requirePermission, getLocationFilter } from '../middleware/rbac.js';
import '../types.js';

const { kbArticles, kbCategories } = schema;

// ─── Query parameter types ──────────────────────────────────────────────────

interface ListArticlesQuery {
  categoryId?: string;
  status?: string;
  visibility?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface ArticleParams {
  id: string;
}

interface CreateArticleBody {
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  status?: string;
  visibility?: string;
  categoryId?: string;
  authorId: string;
  locationId?: string;
  tags?: string[];
  featuredImage?: string;
}

interface UpdateArticleBody {
  title?: string;
  slug?: string;
  excerpt?: string;
  bodyHtml?: string;
  status?: string;
  visibility?: string;
  categoryId?: string;
  tags?: string[];
  featuredImage?: string;
  publishedAt?: string;
}

interface CreateCategoryBody {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder?: number;
}

// ─── Route registration ─────────────────────────────────────────────────────

export async function knowledgeRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/kb/articles
   * List articles with filters, pagination, and sorting.
   */
  app.get<{ Querystring: ListArticlesQuery }>(
    '/api/v1/kb/articles',
    {
      preHandler: requirePermission('kb', 'view'),
    },
    async (request, reply) => {
      const {
        categoryId,
        status,
        visibility,
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
      conditions.push(eq(kbArticles.orgId, request.user.orgId));

      // Location scoping based on RBAC
      const locationFilter = getLocationFilter(request);
      if (locationFilter !== null && locationFilter.length > 0) {
        conditions.push(inArray(kbArticles.locationId, locationFilter));
      }

      // Optional filters
      if (categoryId) {
        conditions.push(eq(kbArticles.categoryId, categoryId));
      }
      if (status) {
        conditions.push(eq(kbArticles.status, status as typeof kbArticles.status.enumValues[number]));
      }
      if (visibility) {
        conditions.push(eq(kbArticles.visibility, visibility as typeof kbArticles.visibility.enumValues[number]));
      }
      if (search) {
        conditions.push(ilike(kbArticles.title, `%${search}%`));
      }

      // Determine sort column
      const sortColumn = sortBy === 'title' ? kbArticles.title
        : sortBy === 'status' ? kbArticles.status
        : sortBy === 'publishedAt' ? kbArticles.publishedAt
        : sortBy === 'updatedAt' ? kbArticles.updatedAt
        : kbArticles.createdAt;

      const orderFn = sortOrder === 'asc' ? asc : desc;

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(kbArticles)
          .where(whereClause)
          .orderBy(orderFn(sortColumn))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(kbArticles)
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
   * GET /api/v1/kb/articles/:id
   * Get a single article by ID.
   */
  app.get<{ Params: ArticleParams }>(
    '/api/v1/kb/articles/:id',
    {
      preHandler: requirePermission('kb', 'view'),
    },
    async (request, reply) => {
      const { id } = request.params;

      const article = await db.query.kbArticles.findFirst({
        where: and(
          eq(kbArticles.id, id),
          eq(kbArticles.orgId, request.user.orgId)
        ),
        with: {
          category: true,
          author: true,
          lastEditor: true,
          location: true,
        },
      });

      if (!article) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Article ${id} not found`,
        });
      }

      return reply.send({ data: article });
    }
  );

  /**
   * POST /api/v1/kb/articles
   * Create a new article.
   */
  app.post<{ Body: CreateArticleBody }>(
    '/api/v1/kb/articles',
    {
      preHandler: requirePermission('kb', 'create'),
    },
    async (request, reply) => {
      const {
        title,
        slug,
        excerpt,
        bodyHtml,
        status,
        visibility,
        categoryId,
        authorId,
        locationId,
        tags,
        featuredImage,
      } = request.body;

      const [created] = await db
        .insert(kbArticles)
        .values({
          orgId: request.user.orgId,
          createdBy: request.user.uid,
          title,
          slug,
          excerpt: excerpt ?? null,
          bodyHtml: bodyHtml ?? null,
          status: (status as typeof kbArticles.status.enumValues[number]) ?? 'draft',
          visibility: (visibility as typeof kbArticles.visibility.enumValues[number]) ?? 'internal',
          categoryId: categoryId ?? null,
          authorId,
          locationId: locationId ?? null,
          tags: tags ?? null,
          featuredImage: featuredImage ?? null,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );

  /**
   * PUT /api/v1/kb/articles/:id
   * Update an existing article.
   */
  app.put<{ Params: ArticleParams; Body: UpdateArticleBody }>(
    '/api/v1/kb/articles/:id',
    {
      preHandler: requirePermission('kb', 'edit'),
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        title,
        slug,
        excerpt,
        bodyHtml,
        status,
        visibility,
        categoryId,
        tags,
        featuredImage,
        publishedAt,
      } = request.body;

      // Verify article exists and belongs to this org
      const existing = await db.query.kbArticles.findFirst({
        where: and(
          eq(kbArticles.id, id),
          eq(kbArticles.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Article ${id} not found`,
        });
      }

      // Build update object — only include provided fields
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
        lastEditedBy: request.user.uid,
      };

      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (bodyHtml !== undefined) updateData.bodyHtml = bodyHtml;
      if (status !== undefined) updateData.status = status;
      if (visibility !== undefined) updateData.visibility = visibility;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (tags !== undefined) updateData.tags = tags;
      if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
      if (publishedAt !== undefined) updateData.publishedAt = new Date(publishedAt);

      const [updated] = await db
        .update(kbArticles)
        .set(updateData)
        .where(and(
          eq(kbArticles.id, id),
          eq(kbArticles.orgId, request.user.orgId)
        ))
        .returning();

      return reply.send({ data: updated });
    }
  );

  /**
   * DELETE /api/v1/kb/articles/:id
   * Delete an article.
   */
  app.delete<{ Params: ArticleParams }>(
    '/api/v1/kb/articles/:id',
    {
      preHandler: requirePermission('kb', 'delete'),
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verify article exists and belongs to this org
      const existing = await db.query.kbArticles.findFirst({
        where: and(
          eq(kbArticles.id, id),
          eq(kbArticles.orgId, request.user.orgId)
        ),
      });

      if (!existing) {
        return reply.code(404).send({
          error: 'Not Found',
          message: `Article ${id} not found`,
        });
      }

      await db
        .delete(kbArticles)
        .where(and(
          eq(kbArticles.id, id),
          eq(kbArticles.orgId, request.user.orgId)
        ));

      return reply.code(204).send();
    }
  );

  /**
   * GET /api/v1/kb/categories
   * List all categories for the org.
   */
  app.get(
    '/api/v1/kb/categories',
    {
      preHandler: requirePermission('kb', 'view'),
    },
    async (request, reply) => {
      const rows = await db
        .select()
        .from(kbCategories)
        .where(eq(kbCategories.orgId, request.user.orgId))
        .orderBy(asc(kbCategories.sortOrder));

      return reply.send({ data: rows });
    }
  );

  /**
   * POST /api/v1/kb/categories
   * Create a new category.
   */
  app.post<{ Body: CreateCategoryBody }>(
    '/api/v1/kb/categories',
    {
      preHandler: requirePermission('kb', 'create'),
    },
    async (request, reply) => {
      const {
        name,
        slug,
        description,
        icon,
        color,
        parentId,
        sortOrder,
      } = request.body;

      const [created] = await db
        .insert(kbCategories)
        .values({
          orgId: request.user.orgId,
          name,
          slug,
          description: description ?? null,
          icon: icon ?? null,
          color: color ?? null,
          parentId: parentId ?? null,
          sortOrder: sortOrder ?? 0,
        })
        .returning();

      return reply.code(201).send({ data: created });
    }
  );
}
