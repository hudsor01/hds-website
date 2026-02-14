/**
 * Database Client
 * Drizzle ORM with Neon serverless driver for PostgreSQL
 * Works in both Bun and Node.js runtimes (Next.js build compatibility)
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/env';
import * as schema from './schemas/schema';

// Check if we're in a CI build environment without database
const isCIBuild = process.env.SKIP_ENV_VALIDATION === 'true' && !env.POSTGRES_URL;

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
  const mockQuery = () => Promise.resolve([]);
  const chainable = new Proxy({}, {
    get() {
      return (..._args: unknown[]) => {
        // Return a chainable object that eventually resolves to empty array
        const chain: Record<string, unknown> = {};
        chain.then = (fn: (v: unknown[]) => unknown) => Promise.resolve([]).then(fn);
        chain.catch = (fn: (e: unknown) => unknown) => Promise.resolve([]).catch(fn);
        chain.finally = (fn: () => void) => Promise.resolve([]).finally(fn);
        return new Proxy(chain, {
          get(target, prop) {
            if (prop === 'then' || prop === 'catch' || prop === 'finally') {
              return target[prop as keyof typeof target];
            }
            return () => new Proxy(chain, this);
          },
        });
      };
    },
  });

  return new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get(_, prop) {
      if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete' || prop === 'query') {
        return mockQuery;
      }
      return chainable;
    },
  });
}

// Proxy for lazy initialization - uses mock in CI builds
export const db = isCIBuild
  ? createMockDb()
  : new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
      get(_, prop) {
        return Reflect.get(getDb(), prop);
      },
    });

// Export schema for type inference
export { schema };
