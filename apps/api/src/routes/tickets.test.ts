import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authHeader, authGet, authPost, authPut, authDelete } from '../test/helpers.js';
import { mockDb, mockQueryTable } from '../test/setup.js';

describe('Ticket routes', () => {
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

  it('GET /api/v1/tickets returns 401 without token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/tickets',
    });
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('POST /api/v1/tickets returns 401 without token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/tickets',
      headers: { 'content-type': 'application/json' },
      payload: { title: 'test' },
    });
    expect(res.statusCode).toBe(401);
  });

  // ─── List ───────────────────────────────────────────────────────────────────

  it('GET /api/v1/tickets returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/tickets');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('page');
    expect(body.meta).toHaveProperty('limit');
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/v1/tickets respects pagination params', async () => {
    const res = await authGet(app, '/api/v1/tickets?page=2&limit=10');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.meta.page).toBe(2);
    expect(body.meta.limit).toBe(10);
  });

  it('GET /api/v1/tickets respects filter params', async () => {
    const res = await authGet(app, '/api/v1/tickets?status=open&priority=high');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('GET /api/v1/tickets respects sort params', async () => {
    const res = await authGet(app, '/api/v1/tickets?sortBy=priority&sortOrder=asc');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Get single ─────────────────────────────────────────────────────────────

  it('GET /api/v1/tickets/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/tickets/nonexistent-id');
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('error', 'Not Found');
  });

  it('GET /api/v1/tickets/:id returns 200 with data when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'ticket-1',
      title: 'Test Ticket',
      orgId: 'org_001',
    });
    const res = await authGet(app, '/api/v1/tickets/ticket-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', 'ticket-1');
  });

  // ─── Create ─────────────────────────────────────────────────────────────────

  it('POST /api/v1/tickets returns 201 on success', async () => {
    const res = await authPost(app, '/api/v1/tickets', {
      title: 'New ticket',
      locationId: 'loc-1',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/v1/tickets includes created resource in response', async () => {
    const res = await authPost(app, '/api/v1/tickets', {
      title: 'Priority ticket',
      locationId: 'loc-1',
      priority: 'high',
      description: 'Urgent issue',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data).toHaveProperty('id');
  });

  // ─── Update ─────────────────────────────────────────────────────────────────

  it('PUT /api/v1/tickets/:id returns 404 when ticket not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/tickets/nonexistent', {
      title: 'Updated',
    });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/tickets/:id returns 200 on successful update', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'ticket-1',
      orgId: 'org_001',
    });
    const res = await authPut(app, '/api/v1/tickets/ticket-1', {
      title: 'Updated title',
      status: 'in_progress',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  it('DELETE /api/v1/tickets/:id returns 404 when ticket not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authDelete(app, '/api/v1/tickets/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/v1/tickets/:id returns 204 on successful delete', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'ticket-1',
      orgId: 'org_001',
    });
    const res = await authDelete(app, '/api/v1/tickets/ticket-1');
    expect(res.statusCode).toBe(204);
  });

  // ─── Health check (not ticket-specific but shares the app) ────────────────

  it('GET /health returns 200 without auth', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
  });
});
