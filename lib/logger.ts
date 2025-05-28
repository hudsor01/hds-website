// Custom console logger with formatting for development and production
// Uses Next.js built-in logging capabilities

// Define log levels
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const

type LogLevel = keyof typeof LOG_LEVELS

// Determine environment and log level
const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'info')

// Color codes for console output
const colors = {
  fatal: '\x1b[41m', // Red background
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[35m', // Magenta
  trace: '\x1b[37m', // White
  reset: '\x1b[0m',  // Reset
} as const

// Format timestamp
function getTimestamp(): string {
  return new Date().toISOString()
}

// Check if log level should be output
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[logLevel]
}

// Base logger function
function log(level: LogLevel, message: string, data?: Record<string, any>): void {
  if (!shouldLog(level)) return

  const timestamp = getTimestamp()
  const color = colors[level]
  const reset = colors.reset
  
  const prefix = isDevelopment 
    ? `${color}[${level.toUpperCase()}]${reset} ${timestamp}`
    : `[${level.toUpperCase()}] ${timestamp}`

  if (data) {
    const dataStr = isDevelopment 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data)
    console.log(`${prefix} ${message}`, dataStr)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

// Create logger instance with different methods
export const logger = {
  fatal: (message: string, data?: Record<string, any>) => log('fatal', message, data),
  error: (message: string, data?: Record<string, any>) => log('error', message, data),
  warn: (message: string, data?: Record<string, any>) => log('warn', message, data),
  info: (message: string, data?: Record<string, any>) => log('info', message, data),
  debug: (message: string, data?: Record<string, any>) => log('debug', message, data),
  trace: (message: string, data?: Record<string, any>) => log('trace', message, data),
}

// Create child loggers for different components
function createChildLogger(component: string) {
  return {
    fatal: (message: string, data?: Record<string, any>) => 
      log('fatal', `[${component}] ${message}`, data),
    error: (message: string, data?: Record<string, any>) => 
      log('error', `[${component}] ${message}`, data),
    warn: (message: string, data?: Record<string, any>) => 
      log('warn', `[${component}] ${message}`, data),
    info: (message: string, data?: Record<string, any>) => 
      log('info', `[${component}] ${message}`, data),
    debug: (message: string, data?: Record<string, any>) => 
      log('debug', `[${component}] ${message}`, data),
    trace: (message: string, data?: Record<string, any>) => 
      log('trace', `[${component}] ${message}`, data),
  }
}

export const apiLogger = createChildLogger('api')
export const authLogger = createChildLogger('auth')
export const emailLogger = createChildLogger('email')
export const performanceLogger = createChildLogger('performance')

// Utility function for logging errors with context
export function logError(error: unknown, context?: Record<string, any>) {
  if (error instanceof Error) {
    logger.error('Error occurred', {
      type: error.constructor.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
      ...context,
    })
  } else {
    logger.error('Unknown error occurred', {
      type: 'Unknown',
      message: String(error),
      ...context,
    })
  }
}

// Utility function for logging API requests
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  error?: Error,
) {
  const logData = {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    category: 'http-request',
  }

  if (error) {
    apiLogger.error('API request failed', {
      ...logData,
      error: {
        type: error.constructor.name,
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
      },
    })
  } else if (statusCode >= 400) {
    apiLogger.warn('API request warning', logData)
  } else {
    apiLogger.info('API request completed', logData)
  }
}

// Performance logging utility
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>,
) {
  performanceLogger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    category: 'performance',
    ...metadata,
  })
}

// Async operation wrapper with automatic logging
export async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> {
  const start = Date.now()

  try {
    logger.debug(`Starting operation: ${operation}`, metadata)
    const result = await fn()
    const duration = Date.now() - start

    logger.info(`Operation completed: ${operation}`, {
      duration: `${duration}ms`,
      ...metadata,
    })

    return result
  } catch (error) {
    const duration = Date.now() - start

    logError(error, {
      operation,
      phase: 'error',
      duration: `${duration}ms`,
      ...metadata,
    })

    throw error
  }
}