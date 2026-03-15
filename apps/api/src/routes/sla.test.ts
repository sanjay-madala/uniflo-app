import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('SLA routes', () => {
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

  it('GET /api/v1/sla/policies returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/sla/policies' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List policies ──────────────────────────────────────────────────────────

  it('GET /api/v1/sla/policies returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/sla/policies');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/sla/policies respects filters', async () => {
    const res = await authGet(app, '/api/v1/sla/policies?module=tickets&status=active');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single policy ──────────────────────────────────────────────────────

  it('GET /api/v1/sla/policies/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/sla/policies/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/sla/policies/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'policy-1',
      name: 'Ticket SLA',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/sla/policies/policy-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('policy-1');
  });

  // ─── Create policy ─────────────────────────────────────────────────────────

  it('POST /api/v1/sla/policies returns 201', async () => {
    const res = await authPost(app, '/api/v1/sla/policies', {
      name: 'New SLA Policy',
      module: 'tickets',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update policy ─────────────────────────────────────────────────────────

  it('PUT /api/v1/sla/policies/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/sla/policies/nonexistent', { name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/sla/policies/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'policy-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/sla/policies/policy-1', { name: 'Updated Policy' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete policy ─────────────────────────────────────────────────────────

  it('DELETE /api/v1/sla/policies/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/sla/policies/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/sla/policies/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'policy-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/sla/policies/policy-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Breaches ───────────────────────────────────────────────────────────────

  it('GET /api/v1/sla/breaches returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/sla/breaches');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  // ─── Compliance ─────────────────────────────────────────────────────────────

  it('GET /api/v1/sla/compliance returns 200 with data shape', async () => {
    const res = await authGet(app, '/api/v1/sla/compliance');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });
});
