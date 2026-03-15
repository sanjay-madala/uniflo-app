import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authHeader, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockDb, mockQueryTable } from '../test/setup.js';

describe('Audit routes', () => {
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

  it('GET /api/v1/audits returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/audits' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/v1/audits returns 401 without token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/audits',
      headers: { 'content-type': 'application/json' },
      payload: { title: 'test' },
    });
    expect(res.statusCode).toBe(401);
  });

  // ─── List audits ───────────────────────────────────────────────────────────

  it('GET /api/v1/audits returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/audits');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('limit');
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/v1/audits respects pagination', async () => {
    const res = await authGet(app, '/api/v1/audits?page=3&limit=5');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.meta.page).toBe(3);
    expect(body.meta.limit).toBe(5);
  });

  it('GET /api/v1/audits respects filter params', async () => {
    const res = await authGet(app, '/api/v1/audits?status=completed&auditorId=user-1');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single audit ─────────────────────────────────────────────────────

  it('GET /api/v1/audits/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/audits/nonexistent');
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('Not Found');
  });

  it('GET /api/v1/audits/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'audit-1',
      title: 'Safety Audit',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/audits/audit-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveProperty('id', 'audit-1');
  });

  // ─── Create audit ─────────────────────────────────────────────────────────

  it('POST /api/v1/audits returns 201', async () => {
    const res = await authPost(app, '/api/v1/audits', {
      title: 'New Audit',
      templateId: 'tpl-1',
      locationId: 'loc-1',
      auditorId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update audit ─────────────────────────────────────────────────────────

  it('PUT /api/v1/audits/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/audits/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/audits/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'audit-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/audits/audit-1', { title: 'Updated Audit', score: 95 });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Delete audit ─────────────────────────────────────────────────────────

  it('DELETE /api/v1/audits/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/audits/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/audits/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'audit-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/audits/audit-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Audit Templates ─────────────────────────────────────────────────────

  it('GET /api/v1/audit-templates returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/audit-templates');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('POST /api/v1/audit-templates returns 201', async () => {
    const res = await authPost(app, '/api/v1/audit-templates', {
      title: 'Safety Template',
      passThreshold: 80,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('GET /api/v1/audit-templates returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/audit-templates' });
    expect(res.statusCode).toBe(401);
  });
});
