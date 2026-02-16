/**
 * Database Client
 * Drizzle ORM with Neon serverless driver for PostgreSQL
 * Works in both Bun and Node.js runtimes (Next.js build compatibility)
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/env';
import * as schema from './schemas/schema';

// Use mock DB when no database URL is available (CI, preview deploys without DB)
const hasNoDatabase = !env.POSTGRES_URL;

// Lazy initialization to avoid connection during build time
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    const url = env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    const sql = neon(url);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

/**
 * Mock database proxy for CI builds without database access.
 * Returns empty results for all queries to allow static page generation to succeed.
 */
function createMockDb() {
  /** Create a proxy that supports chaining (e.g. db.select().from().where()) and resolves to [] */
  function createChainable(): unknown {
    const chain: Record<string, unknown> = {};
    chain.then = (fn: (v: unknown[]) => unknown) => Promise.resolve([]).then(fn);
    chain.catch = (fn: (e: unknown) => unknown) => Promise.resolve([]).catch(fn);
    chain.finally = (fn: () => void) => Promise.resolve([]).finally(fn);
    return new Proxy(chain, {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return target[prop as keyof typeof target];
        }
        // Every other property returns a function that produces another chainable
        return (..._args: unknown[]) => createChainable();
      },
    });
  }

  return new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get() {
      // All db methods (select, insert, query, etc.) return a function
      // whose result is chainable and eventually resolves to []
      return (..._args: unknown[]) => createChainable();
    },
  });
}

// Proxy for lazy initialization - uses mock when no DB is configured
export const db = hasNoDatabase
  ? createMockDb()
  : new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
      get(_, prop) {
        return Reflect.get(getDb(), prop);
      },
    });

// Export schema for type inference
export { schema };
