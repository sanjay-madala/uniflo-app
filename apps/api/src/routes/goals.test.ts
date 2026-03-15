import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Goal routes', () => {
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

  it('GET /api/v1/goals returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/goals' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List goals ─────────────────────────────────────────────────────────────

  it('GET /api/v1/goals returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/goals');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/goals respects filters', async () => {
    const res = await authGet(app, '/api/v1/goals?status=active&level=company&timeframe=Q1');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single goal ─────────────────────────────────────────────────────

  it('GET /api/v1/goals/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/goals/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/goals/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'goal-1',
      title: 'Improve NPS',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/goals/goal-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('goal-1');
  });

  // ─── Create goal ────────────────────────────────────────────────────────────

  it('POST /api/v1/goals returns 201', async () => {
    const res = await authPost(app, '/api/v1/goals', {
      title: 'New Goal',
      ownerId: 'user-1',
      timeframe: 'Q1',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update goal ────────────────────────────────────────────────────────────

  it('PUT /api/v1/goals/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/goals/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/goals/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'goal-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/goals/goal-1', { title: 'Updated Goal' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete goal ────────────────────────────────────────────────────────────

  it('DELETE /api/v1/goals/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/goals/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/goals/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'goal-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/goals/goal-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Key Results ────────────────────────────────────────────────────────────

  it('POST /api/v1/goals/:id/key-results returns 404 when goal not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPost(app, '/api/v1/goals/nonexistent/key-results', {
      title: 'KR 1',
      targetValue: 100,
      ownerId: 'user-1',
    });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/goals/:id/key-results returns 201 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'goal-1', orgId: 'org_001' });
    const res = await authPost(app, '/api/v1/goals/goal-1/key-results', {
      title: 'KR 1',
      targetValue: 100,
      ownerId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
  });
});
