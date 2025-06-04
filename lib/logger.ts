// Simple console logger wrapper
// Simple log function that accepts anything
function log(level: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString()
  const prefix = `[${level.toUpperCase()}] ${timestamp}`
  console.log(prefix, ...args)
}

// Export simple logger functions
export const logger = {
  fatal: (...args: unknown[]) => log('fatal', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  debug: (...args: unknown[]) => log('debug', ...args),
  trace: (...args: unknown[]) => log('trace', ...args),
}

// Child loggers
export const apiLogger = {
  fatal: (...args: unknown[]) => log('fatal', '[api]', ...args),
  error: (...args: unknown[]) => log('error', '[api]', ...args),
  warn: (...args: unknown[]) => log('warn', '[api]', ...args),
  info: (...args: unknown[]) => log('info', '[api]', ...args),
  debug: (...args: unknown[]) => log('debug', '[api]', ...args),
  trace: (...args: unknown[]) => log('trace', '[api]', ...args),
}

export const authLogger = {
  fatal: (...args: unknown[]) => log('fatal', '[auth]', ...args),
  error: (...args: unknown[]) => log('error', '[auth]', ...args),
  warn: (...args: unknown[]) => log('warn', '[auth]', ...args),
  info: (...args: unknown[]) => log('info', '[auth]', ...args),
  debug: (...args: unknown[]) => log('debug', '[auth]', ...args),
  trace: (...args: unknown[]) => log('trace', '[auth]', ...args),
}

export const emailLogger = {
  fatal: (...args: unknown[]) => log('fatal', '[email]', ...args),
  error: (...args: unknown[]) => log('error', '[email]', ...args),
  warn: (...args: unknown[]) => log('warn', '[email]', ...args),
  info: (...args: unknown[]) => log('info', '[email]', ...args),
  debug: (...args: unknown[]) => log('debug', '[email]', ...args),
  trace: (...args: unknown[]) => log('trace', '[email]', ...args),
}

export const performanceLogger = {
  fatal: (...args: unknown[]) => log('fatal', '[performance]', ...args),
  error: (...args: unknown[]) => log('error', '[performance]', ...args),
  warn: (...args: unknown[]) => log('warn', '[performance]', ...args),
  info: (...args: unknown[]) => log('info', '[performance]', ...args),
  debug: (...args: unknown[]) => log('debug', '[performance]', ...args),
  trace: (...args: unknown[]) => log('trace', '[performance]', ...args),
}

// Utility functions
export function logError(error: unknown, context?: unknown) {
  logger.error('Error occurred:', error, context)
}

export function logApiRequest(method: string, path: string, statusCode: number, duration: number, error?: unknown) {
  apiLogger.info(`${method} ${path} ${statusCode} ${duration}ms`, error)
}

export function logPerformance(operation: string, duration: number, metadata?: unknown) {
  performanceLogger.info(`${operation} ${duration}ms`, metadata)
}

export async function withLogging<T>(operation: string, fn: () => Promise<T>, metadata?: unknown): Promise<T> {
  const start = Date.now()
  try {
    logger.debug(`Starting operation: ${operation}`, metadata)
    const result = await fn()
    const duration = Date.now() - start
    logger.info(`Operation completed: ${operation} ${duration}ms`, metadata)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logError(error, { operation, duration: `${duration}ms`, ...(metadata as Record<string, unknown> || {}) })
    throw error
  }
}