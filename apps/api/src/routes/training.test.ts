import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Training routes', () => {
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

  it('GET /api/v1/training/modules returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/training/modules' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List modules ──────────────────────────────────────────────────────────

  it('GET /api/v1/training/modules returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/training/modules');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/training/modules respects filters', async () => {
    const res = await authGet(app, '/api/v1/training/modules?category=safety&difficulty=beginner');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single module ──────────────────────────────────────────────────────

  it('GET /api/v1/training/modules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/training/modules/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/training/modules/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'mod-1',
      title: 'Safety Training',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/training/modules/mod-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('mod-1');
  });

  // ─── Create module ─────────────────────────────────────────────────────────

  it('POST /api/v1/training/modules returns 201', async () => {
    const res = await authPost(app, '/api/v1/training/modules', {
      title: 'New Module',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update module ─────────────────────────────────────────────────────────

  it('PUT /api/v1/training/modules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/training/modules/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/training/modules/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'mod-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/training/modules/mod-1', { title: 'Updated Module' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete module ─────────────────────────────────────────────────────────

  it('DELETE /api/v1/training/modules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/training/modules/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/training/modules/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'mod-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/training/modules/mod-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Enrollments ────────────────────────────────────────────────────────────

  it('GET /api/v1/training/enrollments returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/training/enrollments');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  // ─── Enroll ─────────────────────────────────────────────────────────────────

  it('POST /api/v1/training/enroll returns 404 when module not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPost(app, '/api/v1/training/enroll', {
      moduleId: 'nonexistent',
      userId: 'user-1',
    });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/training/enroll returns 201 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'mod-1', orgId: 'org_001' });
    const res = await authPost(app, '/api/v1/training/enroll', {
      moduleId: 'mod-1',
      userId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
  });

  // ─── Certificates ──────────────────────────────────────────────────────────

  it('GET /api/v1/training/certificates returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/training/certificates');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });
});
