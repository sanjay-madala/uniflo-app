import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@uniflo/db';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/uniflo',
});

export const db = drizzle(pool, { schema });

export { pool };

export type Database = typeof db;

/**
 * Set the RLS context for the current transaction.
 * Must be called inside a transaction or with SET LOCAL to scope to the current statement.
 */
export async function setOrgContext(client: Pool, orgId: string): Promise<void> {
  // Validate orgId is a UUID to prevent SQL injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orgId)) {
    throw new Error(`Invalid org_id format: ${orgId}`);
  }
  await client.query(`SET LOCAL app.current_org_id = '${orgId}'`);
}

// Re-export schema for convenience
export { schema };
