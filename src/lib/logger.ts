/**
 * Production-safe logger that prevents sensitive information disclosure
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private sanitize(data: unknown): unknown {
    if (typeof data === 'string') {
      // Remove sensitive patterns from strings
      return data
        .replace(/api[_-]?key[=:]\s*['"]?[\w-]+/gi, '[API_KEY]')
        .replace(/password[=:]\s*['"]?[\w-]+/gi, '[PASSWORD]')
        .replace(/Bearer\s+[\w-]+/gi, 'Bearer [TOKEN]')
        .replace(/re_[\w]+/g, '[RESEND_KEY]')
        .replace(/cal_live_[\w]+/g, '[CAL_KEY]')
        .replace(/phc_[\w]+/g, '[POSTHOG_KEY]');
    }
    
    if (typeof data === 'object' && data !== null) {
      // Handle arrays
      if (Array.isArray(data)) {
        return data.map(item => this.sanitize(item));
      }
      
      // Handle objects
      const sanitized: Record<string, unknown> = {};
      const dataObj = data as Record<string, unknown>;
      
      for (const key in dataObj) {
        // Skip sensitive keys entirely
        if (/password|secret|token|key|auth/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(dataObj[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitize(context) : undefined;
    
    const logData: Record<string, unknown> = {
      timestamp,
      level,
      message: this.sanitize(message)
    };
    
    if (sanitizedContext) {
      logData.context = sanitizedContext;
    }

    // In production, you would send this to a logging service
    // For now, we'll use console methods based on level
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logData);
        }
        break;
      case 'info':
        console.info(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      case 'error':
        console.error(logData);
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name
      } : 'Unknown error'
    };
    
    this.log('error', message, errorContext);
  }
}

export const logger = new Logger();