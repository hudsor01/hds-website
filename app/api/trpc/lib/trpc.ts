import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { ZodError } from 'zod'
import superjson from 'superjson'
import type { SuperJSONResult } from 'superjson/dist/types'
import { db, checkDatabaseConnection } from '../../../../lib/database'
import { logger } from '../../../../lib/logger'
import type { Dict } from '../../../../types/utility-types'

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts

  return {
    req,
    headers: req.headers,
    db,
  }
}

interface CustomDataTransformer {
  serialize: (object: unknown) => { json: unknown; meta?: { [key: string]: unknown } };
  deserialize: <T>(payload: { json: unknown; meta?: { [key: string]: unknown } }) => T;
}

const transformer: CustomDataTransformer = {
  serialize: superjson.serialize,
  deserialize: superjson.deserialize,
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    let zodError = null
    
    if (error.cause) {
      try {
        // Check if error.cause has ZodError's shape
        const cause = error.cause as unknown
        if (
          cause &&
          typeof cause === 'object' &&
          'issues' in cause
        ) {
          // First check if it's an array without using Array.isArray
          const issues = (cause as { issues: unknown }).issues
          if (issues && typeof issues === 'object' && 'length' in issues) {
            zodError = (cause as ZodError).flatten()
          }
        }
      } catch (_) {
        // If any error occurs during check, zodError remains null
      }
    }
    
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError,
      },
    }
  },
})

// Database health middleware
const databaseMiddleware = t.middleware(async ({ ctx, next }) => {
  // Skip database check for certain endpoints in development
  if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL?.includes('supabase')) {
    logger.warn('Skipping database connection check - using temporary URL')
    return next({ ctx })
  }

  try {
    const healthCheck = await checkDatabaseConnection()
    if (!healthCheck.connected) {
      logger.error('Database connection failed', { error: healthCheck.error })
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database connection unavailable',
      })
    }
    return next({ ctx })
  } catch (error) {
    logger.error('Database middleware error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
    })
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database connection error',
    })
  }
})

// Auth middleware (simplified for now)
const authMiddleware = t.middleware(async ({ ctx, next }) => 
  // In a real app, you'd validate JWT tokens or session here
  // For now, we'll just pass through
   next({ ctx }),
)

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(databaseMiddleware)
export const protectedProcedure = t.procedure.use(databaseMiddleware).use(authMiddleware)
export const publicProcedureUnsafe = t.procedure // For endpoints that don't need DB
