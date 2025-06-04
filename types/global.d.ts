/**
 * Global type declarations for browser APIs and third-party scripts
 */

/// <reference types="react" />

declare global {
  // Fix console interface to allow normal console.log usage
  var console: {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    debug(message?: any, ...optionalParams: any[]): void;
    trace(message?: any, ...optionalParams: any[]): void;
  }

  interface Window {
    // Google Analytics
    gtag: (
      command: 'config' | 'event' | 'consent' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: Record<string, unknown>[]

    // PostHog Analytics
    posthog: {
      identify: (userId: string, properties?: Record<string, unknown>) => void
      capture: (event: string, properties?: Record<string, unknown>) => void
      reset: () => void
      opt_out_capturing: () => void
      opt_in_capturing: () => void
      has_opted_out_capturing: () => boolean
      get_distinct_id: () => string
      alias: (alias: string) => void
      set_config: (config: Record<string, unknown>) => void
      get_config: (key: string) => any
      get_property: (key: string) => any
      register: (properties: Record<string, unknown>) => void
      register_once: (properties: Record<string, unknown>) => void
      unregister: (key: string) => void
      people: {
        set: (properties: Record<string, unknown>) => void
        set_once: (properties: Record<string, unknown>) => void
      }
    }

    // Sentry Error Tracking
    Sentry: {
      captureException: (error: Error, context?: Record<string, unknown>) => void
      captureMessage: (message: string, level?: string) => void
      addBreadcrumb: (breadcrumb: Record<string, unknown>) => void
      setUser: (user: { id?: string; email?: string; username?: string } | null) => void
      setContext: (name: string, context: Record<string, unknown>) => void
      setTag: (key: string, value: string) => void
      setExtra: (key: string, extra: Record<string, unknown>) => void
    }

    // Plausible Analytics
    plausible: (event: string, options?: { props?: Record<string, unknown> }) => void

    // Cal.com Embed (see cal-types.ts for detailed types)

    // Custom file system API for artifacts
    fs: {
      readFile: (
        path: string,
        options?: { encoding?: string }
      ) => Promise<string | Uint8Array>
    }
  }

  // Extend NodeJS global for server-side
  namespace NodeJS {
    interface ProcessEnv {
      // Node environment
      NODE_ENV: 'development' | 'production' | 'test'
      
      // Database
      DATABASE_URL: string
      
      // Authentication
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      
      // Admin authentication
      ADMIN_USERNAME: string
      ADMIN_PASSWORD?: string
      ADMIN_PASSWORD_HASH?: string
      
      // JWT Configuration
      JWT_SECRET: string
      JWT_EXPIRATION_TIME?: string
      
      // External services
      RESEND_API_KEY: string
      RESEND_FROM_EMAIL?: string
      
      // Cal.com integration
      CAL_COM_API_KEY?: string
      CAL_COM_EVENT_TYPE_ID?: string
      
      // Redis
      REDIS_URL?: string
      UPSTASH_REDIS_REST_URL?: string
      UPSTASH_REDIS_REST_TOKEN?: string
      
      // Analytics & Monitoring
      NEXT_PUBLIC_POSTHOG_KEY?: string
      NEXT_PUBLIC_POSTHOG_HOST?: string
      SENTRY_DSN?: string
      SENTRY_AUTH_TOKEN?: string
      
      // Google Analytics
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      
      // Security
      ENCRYPTION_KEY?: string
      CSRF_SECRET?: string
      CSP_REPORT_URI?: string
      
      // Feature flags
      ENABLE_ANALYTICS?: string
      ENABLE_RATE_LIMITING?: string
      ENABLE_ERROR_TRACKING?: string
      
      // Public URLs
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_API_URL?: string
      
      // Allowed origins for CORS
      ALLOWED_ORIGINS?: string
    }
  }
}

// Augment module types
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Make TypeScript treat this file as a module
export {}
