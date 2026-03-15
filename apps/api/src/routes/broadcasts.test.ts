import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Broadcast routes', () => {
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

  it('GET /api/v1/broadcasts returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/broadcasts' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List broadcasts ────────────────────────────────────────────────────────

  it('GET /api/v1/broadcasts returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/broadcasts');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  // ─── Get single broadcast ────────────────────────────────────────────────

  it('GET /api/v1/broadcasts/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/broadcasts/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/broadcasts/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'bc-1',
      title: 'Announcement',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/broadcasts/bc-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('bc-1');
  });

  // ─── Create broadcast ──────────────────────────────────────────────────────

  it('POST /api/v1/broadcasts returns 201', async () => {
    const res = await authPost(app, '/api/v1/broadcasts', {
      title: 'New Broadcast',
    });
    expect(res.statusCode).toBe(201);
  });

  // ─── Update broadcast ──────────────────────────────────────────────────────

  it('PUT /api/v1/broadcasts/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/broadcasts/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/broadcasts/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'bc-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/broadcasts/bc-1', { title: 'Updated Broadcast' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete broadcast ──────────────────────────────────────────────────────

  it('DELETE /api/v1/broadcasts/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/broadcasts/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/broadcasts/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'bc-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/broadcasts/bc-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Send broadcast ────────────────────────────────────────────────────────

  it('POST /api/v1/broadcasts/:id/send returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPost(app, '/api/v1/broadcasts/nonexistent/send', {});
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/broadcasts/:id/send returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'bc-1',
      orgId: 'org_001',
      status: 'draft',
    });
    const res = await authPost(app, '/api/v1/broadcasts/bc-1/send', {});
    expect(res.statusCode).toBe(200);
  });
});
