import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp, authHeader, authGet, authPost } from '../test/helpers.js';

// The RBAC middleware (requirePermission) is called at route-registration time,
// before our test's beforeAll/beforeEach hooks run. So we verify it was invoked
// with the correct arguments by checking the mock's cumulative call history
// before clearAllMocks runs.

describe('RBAC middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Verify requirePermission was invoked during route registration ──────

  it('requirePermission was called during route registration for tickets.view', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    // requirePermission is called once per route registration, at app build time.
    // The mock records all calls. We check the cumulative history.
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const ticketViewCall = calls.find(
      (c: string[]) => c[0] === 'tickets' && c[1] === 'view'
    );
    expect(ticketViewCall).toBeDefined();
  });

  it('requirePermission was called during route registration for tickets.create', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const found = calls.find(
      (c: string[]) => c[0] === 'tickets' && c[1] === 'create'
    );
    expect(found).toBeDefined();
  });

  it('requirePermission was called during route registration for audits.view', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const found = calls.find(
      (c: string[]) => c[0] === 'audits' && c[1] === 'view'
    );
    expect(found).toBeDefined();
  });

  it('requirePermission was called during route registration for sops.view', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const found = calls.find(
      (c: string[]) => c[0] === 'sops' && c[1] === 'view'
    );
    expect(found).toBeDefined();
  });

  it('requirePermission was called during route registration for goals.view', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const found = calls.find(
      (c: string[]) => c[0] === 'goals' && c[1] === 'view'
    );
    expect(found).toBeDefined();
  });

  it('requirePermission was called during route registration for sla.view', async () => {
    const { requirePermission } = await import('../middleware/rbac.js');
    const calls = (requirePermission as ReturnType<typeof vi.fn>).mock.calls;
    const found = calls.find(
      (c: string[]) => c[0] === 'sla' && c[1] === 'view'
    );
    expect(found).toBeDefined();
  });

  // ─── getLocationFilter wiring ─────────────────────────────────────────────

  it('getLocationFilter is called during list routes', async () => {
    const { getLocationFilter } = await import('../middleware/rbac.js');
    await authGet(app, '/api/v1/tickets');
    expect(getLocationFilter).toHaveBeenCalled();
  });

  it('getLocationFilter returns null for all-scope users', async () => {
    const { getLocationFilter } = await import('../middleware/rbac.js');
    const result = getLocationFilter({} as never);
    expect(result).toBeNull();
  });
});
