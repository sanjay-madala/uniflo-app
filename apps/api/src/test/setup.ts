import { vi } from 'vitest';

// ─── Mock Firebase Admin ────────────────────────────────────────────────────

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getApps: () => [{}],
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'admin@democorp.com',
      org_id: 'org_001',
      role: 'admin',
      location_ids: [],
    }),
  }),
}));

// ─── Mock the Firebase lib ──────────────────────────────────────────────────

vi.mock('../lib/firebase.js', () => ({
  auth: {
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'admin@democorp.com',
      org_id: 'org_001',
      role: 'admin',
      location_ids: [],
    }),
  },
}));

// ─── Build a chainable query builder mock ───────────────────────────────────

function chainable(terminal?: Record<string, unknown>): Record<string, unknown> {
  const proxy: Record<string, unknown> = {};
  const methods = [
    'select', 'from', 'where', 'orderBy', 'limit', 'offset',
    'insert', 'values', 'returning', 'update', 'set', 'delete',
    'groupBy', 'leftJoin', 'innerJoin',
  ];

  for (const m of methods) {
    proxy[m] = vi.fn().mockReturnValue(proxy);
  }

  // Terminal methods that return data
  proxy.returning = vi.fn().mockResolvedValue([{ id: 'mock-id', title: 'mock' }]);

  // Make select() + from() + where() chain resolve to array when awaited
  const thenValue = terminal ?? [{ count: 0 }];
  proxy.then = (resolve: (v: unknown) => void) => resolve(thenValue);

  return proxy;
}

// ─── Mock the DB layer ──────────────────────────────────────────────────────

const mockQueryTable = {
  findFirst: vi.fn().mockResolvedValue(null),
  findMany: vi.fn().mockResolvedValue([]),
};

const mockSchema: Record<string, unknown> = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop === 'string') {
      // Return a mock table object with column references
      return new Proxy({}, {
        get(_t, col) {
          if (typeof col === 'string') {
            return { enumValues: [] };
          }
          return undefined;
        },
      });
    }
    return undefined;
  },
});

const mockDb = {
  select: vi.fn().mockReturnValue(chainable()),
  insert: vi.fn().mockReturnValue(chainable()),
  update: vi.fn().mockReturnValue(chainable()),
  delete: vi.fn().mockReturnValue(chainable()),
  query: new Proxy({}, {
    get() {
      return { ...mockQueryTable };
    },
  }),
};

vi.mock('../lib/db.js', () => ({
  db: mockDb,
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [] }),
  },
  schema: mockSchema,
  setOrgContext: vi.fn(),
}));

// ─── Mock drizzle-orm operators ─────────────────────────────────────────────

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq-condition'),
  and: vi.fn().mockReturnValue('and-condition'),
  desc: vi.fn().mockReturnValue('desc-order'),
  asc: vi.fn().mockReturnValue('asc-order'),
  ilike: vi.fn().mockReturnValue('ilike-condition'),
  inArray: vi.fn().mockReturnValue('in-array-condition'),
  gte: vi.fn().mockReturnValue('gte-condition'),
  lte: vi.fn().mockReturnValue('lte-condition'),
  isNotNull: vi.fn().mockReturnValue('is-not-null-condition'),
  sql: Object.assign(vi.fn().mockReturnValue('sql-expression'), {
    raw: vi.fn().mockReturnValue('raw-sql'),
  }),
  SQL: class SQL {},
}));

// ─── Mock the RBAC middleware ───────────────────────────────────────────────

vi.mock('../middleware/rbac.js', () => ({
  requirePermission: vi.fn().mockReturnValue(
    async (request: Record<string, unknown>) => {
      // Populate location scope on request for route handlers
      (request as Record<string, unknown>).locationScope = 'all';
      (request as Record<string, unknown>).userLocationIds = [];
    }
  ),
  getLocationFilter: vi.fn().mockReturnValue(null),
}));

// Export the mocks so tests can access and configure them
export { mockDb, mockQueryTable };
