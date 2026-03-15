import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authGet, authPost, authPut } from '../test/helpers.js';
import { mockQueryTable } from '../test/setup.js';

describe('CSAT routes', () => {
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

  it('GET /api/v1/csat/surveys returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/csat/surveys' });
    expect(res.statusCode).toBe(401);
  });

  // ─── List surveys ──────────────────────────────────────────────────────────

  it('GET /api/v1/csat/surveys returns 200 with data and meta', async () => {
    const res = await authGet(app, '/api/v1/csat/surveys');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  // ─── Get single survey ──────────────────────────────────────────────────────

  it('GET /api/v1/csat/surveys/:id returns 404 when not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authGet(app, '/api/v1/csat/surveys/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/v1/csat/surveys/:id returns 200 when found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'survey-1',
      orgId: 'org_001',
      ticketId: 'ticket-1',
    });
    const res = await authGet(app, '/api/v1/csat/surveys/survey-1');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('survey-1');
  });

  // ─── Create survey ─────────────────────────────────────────────────────────

  it('POST /api/v1/csat/surveys returns 201', async () => {
    const res = await authPost(app, '/api/v1/csat/surveys', {
      ticketId: 'ticket-1',
      expiresAt: '2026-04-01T00:00:00Z',
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });

  // ─── Submit survey (PUT with token - public endpoint) ─────────────────────

  it('PUT /api/v1/csat/surveys/:id returns 404 when survey not found', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce(null);
    const res = await authPut(app, '/api/v1/csat/surveys/nonexistent', {
      token: 'fake-token',
      score: 5,
    });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/v1/csat/surveys/:id returns 200 on successful submission', async () => {
    mockQueryTable.findFirst.mockResolvedValueOnce({
      id: 'survey-1',
      orgId: 'org_001',
      token: 'valid-token',
      submittedAt: null,
      expiresAt: new Date('2099-01-01'),
    });
    const res = await authPut(app, '/api/v1/csat/surveys/survey-1', {
      token: 'valid-token',
      score: 4,
      comment: 'Great service!',
    });
    expect(res.statusCode).toBe(200);
  });

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  it('GET /api/v1/csat/dashboard returns 200 with data', async () => {
    const res = await authGet(app, '/api/v1/csat/dashboard');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('data');
  });
});
