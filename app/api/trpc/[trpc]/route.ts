import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@/app/api/trpc/lib/root'
import { createTRPCContext } from '@/app/api/trpc/lib/trpc-unified'
import { logger } from '@/lib/logger'

/**
 * Handle API requests to the tRPC endpoint
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            logger.error(`tRPC error on ${path ?? '<no-path>'}`, {
              error: error.message,
              stack: error.stack,
            })
          }
        : ({ path, error }) => {
            logger.error(`tRPC error on ${path ?? '<no-path>'}`, {
              error: error.message,
            })
          },
  })

export { handler as GET, handler as POST }