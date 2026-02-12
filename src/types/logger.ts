/**
 * Logger Type Definitions
 * Unified logging interface for Vercel Analytics integration
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type ErrorLevel = 'error' | 'fatal'

export interface ErrorContext {
  url?: string
  method?: string
  route?: string
  requestId?: string
  userId?: string
  userEmail?: string
  metadata?: Record<string, unknown>
}

export interface ErrorLogPayload {
  level: ErrorLevel
  error_type: string
  fingerprint: string
  message: string
  stack_trace?: string
  url?: string
  method?: string
  route?: string
  request_id?: string
  user_id?: string
  user_email?: string
  environment: string
  vercel_region?: string
  metadata: Record<string, unknown>
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment?: string;
  isServer?: boolean;
  url?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface LogMetadata {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: unknown;
}

export interface PerformanceMetrics {
  label: string;
  duration: number;
  timestamp: string;
}

export interface ErrorLogData {
  name?: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

export interface Logger {
  // Core logging methods
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: Error | unknown, context?: ErrorContext): void;
  fatal(message: string, error?: Error | unknown, context?: ErrorContext): void;

  // Context management
  setContext(context: LogContext): void;
  clearContext(): void;

  // Performance timing
  time(label: string): void;
  timeEnd(label: string): void;

  // Grouping (for development)
  group(label: string): void;
  groupEnd(): void;

  // Table display (for development)
  table(data: unknown): void;
}

export interface ServerLogger extends Logger {
  // Server-specific methods
  request(method: string, url: string, headers?: Record<string, string>): void;
  response(status: number, duration?: number): void;
  database(query: string, duration?: number): void;
  cache(operation: string, key: string, hit: boolean): void;
}

export interface ClientLogger extends Logger {
  // Client-specific methods
  click(element: string, location?: string): void;
  pageView(path: string, referrer?: string): void;
  conversion(event: string, value?: number): void;
  userAction(action: string, data?: Record<string, unknown>): void;
}

// Event types for analytics integration
export interface LogEvent {
  event: string;
  properties: {
    level: LogLevel;
    message: string;
    timestamp: string;
    url?: string;
    userAgent?: string;
    requestId?: string;
    data?: Record<string, unknown>;
  };
}

export interface ErrorEvent extends LogEvent {
  event: 'error_occurred' | 'log_error';
  properties: LogEvent['properties'] & {
    error: ErrorLogData;
  };
}

export interface PerformanceEvent extends LogEvent {
  event: 'performance_measure' | 'log_info';
  properties: LogEvent['properties'] & {
    duration: number;
    label: string;
  };
}

// Global logger instance type
declare global {
  interface Window {
    __logger?: Logger;
  }
}

export { };
