import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Knowledge Base routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Auth ───────────────────────────────────────────────────────────────────

  it('GET /api/v1/kb/articles returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/kb/articles' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List articles ──────────────────────────────────────────────────────────

  it('GET /api/v1/kb/articles returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/kb/articles');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/kb/articles respects filters', async () => {
    const res = await authGet(app, '/api/v1/kb/articles?status=published&search=onboarding');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single article ───────────────────────────────────────────────────

  it('GET /api/v1/kb/articles/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/kb/articles/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/kb/articles/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'article-1',
      title: 'How to Clean',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/kb/articles/article-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('article-1');
  });

  // ─── Create article ──────────────────────────────────────────────────────

  it('POST /api/v1/kb/articles returns 201', async () => {
    const res = await authPost(app, '/api/v1/kb/articles', {
      title: 'New Article',
      slug: 'new-article',
      authorId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update article ──────────────────────────────────────────────────────

  it('PUT /api/v1/kb/articles/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/kb/articles/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/kb/articles/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'article-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/kb/articles/article-1', { title: 'Updated Article' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete article ──────────────────────────────────────────────────────

  it('DELETE /api/v1/kb/articles/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/kb/articles/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/kb/articles/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'article-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/kb/articles/article-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Categories ─────────────────────────────────────────────────────────────

  it('GET /api/v1/kb/categories returns 200 with data', async () => {
    const res = await authGet(app, '/api/v1/kb/categories');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/v1/kb/categories returns 201', async () => {
    const res = await authPost(app, '/api/v1/kb/categories', {
      name: 'New Category',
      slug: 'new-category',
    });
    expect(res.statusCode).toBe(201);
  });
});
