import { apiRouter } from '../routers/unified-router'

/**
 * Main API router that uses the unified router implementation
 */
export const appRouter = apiRouter

/**
 * Export type definition of API router
 */
export type AppRouter = typeof appRouter
