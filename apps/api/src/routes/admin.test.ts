import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Admin routes', () => {
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

  it('GET /api/v1/admin/users returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/users' });
    expect(res.statusCode).toBe(401);
  });

  // ─── Users: List ────────────────────────────────────────────────────────────

  it('GET /api/v1/admin/users returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/admin/users');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/admin/users respects search filter', async () => {
    const res = await authGet(app, '/api/v1/admin/users?search=john');
    expect(res.statusCode).toBe(200);
  });

  // ─── Users: Create ─────────────────────────────────────────────────────────

  it('POST /api/v1/admin/users returns 201', async () => {
    const res = await authPost(app, '/api/v1/admin/users', {
      email: 'new@example.com',
      name: 'New User',
      roleId: 'role-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Users: Update ─────────────────────────────────────────────────────────

  it('PUT /api/v1/admin/users/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/admin/users/nonexistent', { name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/admin/users/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'user-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/admin/users/user-1', { name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Users: Delete ─────────────────────────────────────────────────────────

  it('DELETE /api/v1/admin/users/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/admin/users/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/admin/users/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'user-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/admin/users/user-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Roles ──────────────────────────────────────────────────────────────────

  it('GET /api/v1/admin/roles returns 200 with data', async () => {
    mockQueryTable.findMany.mockResolvedValueOnce([
      { id: 'role-1', name: 'Admin', permissions: [] },
    ]);
    const res = await authGet(app, '/api/v1/admin/roles');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/v1/admin/roles returns 201', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'role-new',
      name: 'Custom Role',
      permissions: [],
    });
    const res = await authPost(app, '/api/v1/admin/roles', {
      name: 'Custom Role',
      permissions: [{ module: 'tickets', actions: ['view', 'create'] }],
    });
    expect(res.statusCode).toBe(201);
  });

  it('PUT /api/v1/admin/roles/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/admin/roles/nonexistent', { name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  // ─── Locations ──────────────────────────────────────────────────────────────

  it('GET /api/v1/admin/locations returns 200 with data', async () => {
    mockQueryTable.findMany.mockResolvedValueOnce([
      { id: 'loc-1', name: 'HQ', children: [] },
    ]);
    const res = await authGet(app, '/api/v1/admin/locations');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/v1/admin/locations returns 201', async () => {
    const res = await authPost(app, '/api/v1/admin/locations', {
      name: 'New Location',
      type: 'branch',
    });
    expect(res.statusCode).toBe(201);
  });

  it('PUT /api/v1/admin/locations/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/admin/locations/nonexistent', { name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/admin/locations/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'loc-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/admin/locations/loc-1', { name: 'Updated Location' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Organization settings ──────────────────────────────────────────────────

  it('GET /api/v1/admin/org returns 404 when org not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/admin/org');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/admin/org returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'org_001',
      name: 'DemoCorp',
    });
    const res = await authGet(app, '/api/v1/admin/org');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('org_001');
  });

  it('PUT /api/v1/admin/org returns 200 on success', async () => {
    const res = await authPut(app, '/api/v1/admin/org', {
      name: 'Updated Org Name',
    });
    expect(res.statusCode).toBe(200);
  });
});
