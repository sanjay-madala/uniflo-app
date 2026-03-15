import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Task routes', () => {
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

  it('GET /api/v1/tasks returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/tasks' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List tasks ─────────────────────────────────────────────────────────────

  it('GET /api/v1/tasks returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/tasks');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/tasks respects filters', async () => {
    const res = await authGet(app, '/api/v1/tasks?status=open&priority=high&assigneeId=user-1');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single ─────────────────────────────────────────────────────────────

  it('GET /api/v1/tasks/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/tasks/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/tasks/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'task-1',
      title: 'Fix issue',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/tasks/task-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('task-1');
  });

  // ─── Create ─────────────────────────────────────────────────────────────────

  it('POST /api/v1/tasks returns 201', async () => {
    const res = await authPost(app, '/api/v1/tasks', {
      title: 'New task',
      locationId: 'loc-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update ─────────────────────────────────────────────────────────────────

  it('PUT /api/v1/tasks/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/tasks/nonexistent', { title: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/tasks/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'task-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/tasks/task-1', { title: 'Updated task' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  it('DELETE /api/v1/tasks/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/tasks/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/tasks/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'task-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/tasks/task-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Projects ───────────────────────────────────────────────────────────────

  it('GET /api/v1/projects returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/projects');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('POST /api/v1/projects returns 201', async () => {
    const res = await authPost(app, '/api/v1/projects', {
      name: 'New project',
      ownerId: 'user-1',
    });
    expect(res.statusCode).toBe(201);
  });
});
