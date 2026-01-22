/**
 * Database Client
 * Drizzle ORM with Bun.SQL for PostgreSQL
 */
import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import * as schema from './schema';

// Lazy initialization to avoid connection during build time
let _client: SQL | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient(): SQL {
  if (!_client) {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    _client = new SQL({
      url,
      max: 20,
      idleTimeout: 30,
      connectionTimeout: 10,
    });
  }
  return _client;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    _db = drizzle({ client: getClient(), schema });
  }
  return _db;
}

// Proxy for lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

// Export raw SQL client for direct queries
export const sql = new Proxy({} as SQL, {
  get(_, prop) {
    return Reflect.get(getClient(), prop);
  },
});

// Export schema for type inference
export { schema };
