import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { ZodError } from 'zod'
import superjson from 'superjson'
import { db, checkDatabaseConnection } from '@/lib/database'
import { logger } from '@/lib/logger'

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts

  return {
    req,
    headers: req.headers,
    db,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
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

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(databaseMiddleware)
export const publicProcedureUnsafe = t.procedure // For endpoints that don't need DB
