import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/uniflo',
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

// Re-export all schema for consumers
export * from './schema';
