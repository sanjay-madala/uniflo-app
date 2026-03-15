import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('Automation routes', () => {
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

  it('GET /api/v1/automation/rules returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/automation/rules' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List rules ─────────────────────────────────────────────────────────────

  it('GET /api/v1/automation/rules returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/automation/rules');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  it('GET /api/v1/automation/rules respects filters', async () => {
    const res = await authGet(app, '/api/v1/automation/rules?status=active&module=tickets');
    expect(res.statusCode).toBe(200);
  });

  // ─── Get single rule ─────────────────────────────────────────────────────

  it('GET /api/v1/automation/rules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/automation/rules/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/automation/rules/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'rule-1',
      name: 'Auto-assign',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/automation/rules/rule-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('rule-1');
  });

  // ─── Create rule ────────────────────────────────────────────────────────────

  it('POST /api/v1/automation/rules returns 201', async () => {
    const res = await authPost(app, '/api/v1/automation/rules', {
      name: 'New Rule',
      triggerEvent: 'ticket_created',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Update rule ────────────────────────────────────────────────────────────

  it('PUT /api/v1/automation/rules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/automation/rules/nonexistent', { name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/automation/rules/:id returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'rule-1', orgId: 'org_001' });
    const res = await authPut(app, '/api/v1/automation/rules/rule-1', { name: 'Updated Rule' });
    expect(res.statusCode).toBe(200);
  });

  // ─── Delete rule ────────────────────────────────────────────────────────────

  it('DELETE /api/v1/automation/rules/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/automation/rules/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/automation/rules/:id returns 204 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({ id: 'rule-1', orgId: 'org_001' });
    const res = await authDelete(app, '/api/v1/automation/rules/rule-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Toggle rule ────────────────────────────────────────────────────────────

  it('POST /api/v1/automation/rules/:id/toggle returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPost(app, '/api/v1/automation/rules/nonexistent/toggle', {});
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/automation/rules/:id/toggle returns 200 on success', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'rule-1',
      orgId: 'org_001',
      status: 'active',
    });
    const res = await authPost(app, '/api/v1/automation/rules/rule-1/toggle', {});
    expect(res.statusCode).toBe(200);
  });

  // ─── Executions ─────────────────────────────────────────────────────────────

  it('GET /api/v1/automation/executions returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/automation/executions');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });
});
