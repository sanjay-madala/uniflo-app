import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('CAPA routes', () => {
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

  it('GET /api/v1/capas returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/capas' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List ───────────────────────────────────────────────────────────────────

  it('GET /api/v1/capas returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/capas');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('total');
  });

  it('GET /api/v1/capas respects filters', async () => {
    const res = await authGet(app, '/api/v1/capas?status=open&severity=critical');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single ─────────────────────────────────────────────────────────────

  it('GET /api/v1/capas/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/capas/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/capas/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'capa-1',
      title: 'Root cause fix',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/capas/capa-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveProperty('id', 'capa-1');
  });

  // ─── Create ─────────────────────────────────────────────────────────────────

  it('POST /api/v1/capas returns 201', async () => {
    const res = await authPost(app, '/api/v1/capas', {
      title: 'New CAPA',
      locationId: 'loc-1',
      ownerId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update ─────────────────────────────────────────────────────────────────

  it('PUT /api/v1/capas/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/capas/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/capas/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'capa-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/capas/capa-1', { title: 'Updated CAPA' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  it('DELETE /api/v1/capas/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/capas/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/capas/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'capa-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/capas/capa-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Review ─────────────────────────────────────────────────────────────────

  it('POST /api/v1/capas/:id/review returns 404 when CAPA not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPost(app, '/api/v1/capas/nonexistent/review', { effective: true });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/capas/:id/review returns 201 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'capa-1', orgId: 'org_001' });
    const res = await authPost(app, '/api/v1/capas/capa-1/review', { effective: true });
    expect(res.statusCode).toBe(201);
  });
});
