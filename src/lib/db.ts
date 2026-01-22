/**
 * Database Client
 * Drizzle ORM with Neon serverless driver for PostgreSQL
 * Works in both Bun and Node.js runtimes (Next.js build compatibility)
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy initialization to avoid connection during build time
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    const sql = neon(url);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

// Proxy for lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

// Export schema for type inference
export { schema };
