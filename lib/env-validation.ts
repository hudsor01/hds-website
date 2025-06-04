/**
 * Environment Variable Validation
 * 
 * Ensures all required environment variables are present and valid
 * at build/runtime. Uses Zod for type-safe validation.
 */

import { z } from 'zod'

// Define the schema for our environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // Admin authentication
  ADMIN_USERNAME: z.string().min(3),
  ADMIN_PASSWORD: z.string().min(8).optional(), // Only for development
  ADMIN_PASSWORD_HASH: z.string().optional(), // Required for production
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION_TIME: z.string().default('2h'),
  
  // External services
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_FROM_EMAIL: z.string().email(),
  
  // Cal.com integration
  CAL_COM_API_KEY: z.string().optional(),
  CAL_COM_EVENT_TYPE_ID: z.string().optional(),
  
  // Redis (for production)
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Analytics & Monitoring
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Google Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32).optional(),
  CSRF_SECRET: z.string().min(32).optional(),
  
  // Feature flags
  ENABLE_ANALYTICS: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  ENABLE_ERROR_TRACKING: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  
  // Public URLs
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
})

// Extend the schema for production-specific requirements
const productionEnvSchema = envSchema.extend({
  // These are required in production
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required in production'),
  REDIS_URL: z.string().url('Redis URL is required in production'),
  SENTRY_DSN: z.string().url('Sentry DSN is required in production'),
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key is required in production'),
  CSRF_SECRET: z.string().min(32, 'CSRF secret is required in production'),
}).omit({
  // Remove development-only variables
  ADMIN_PASSWORD: true,
})

// Type for our validated environment
export type Env = z.infer<typeof envSchema>
export type ProductionEnv = z.infer<typeof productionEnvSchema>

/**
 * Validates environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env | ProductionEnv {
  const isProduction = process.env.NODE_ENV === 'production'
  const schema = isProduction ? productionEnvSchema : envSchema
  
  try {
    const env = schema.parse(process.env)
    
    // Additional validation logic
    if (isProduction) {
      // Ensure we're not using default secrets in production
      if (env.NEXTAUTH_SECRET === 'development-secret') {
        throw new Error('Default NEXTAUTH_SECRET detected in production')
      }
      if (env.JWT_SECRET === 'development-secret') {
        throw new Error('Default JWT_SECRET detected in production')
      }
    }
    
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Environment validation failed:\n${error.errors
        .map(err => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n')}`
      
      console.error('❌ Environment Validation Error')
      console.error(errorMessage)
      console.error('\nPlease check your .env file and ensure all required variables are set.')
      
      // In development, provide helpful hints
      if (process.env.NODE_ENV !== 'production') {
        console.error('\n💡 Hint: Copy .env.example to .env.local and fill in the values')
      }
      
      throw new Error(errorMessage)
    }
    throw error
  }
}

/**
 * Get a typed, validated environment variable
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const env = validateEnv()
  return env[key]
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(feature: 'analytics' | 'rateLimiting' | 'errorTracking'): boolean {
  const env = validateEnv()
  switch (feature) {
    case 'analytics':
      return env.ENABLE_ANALYTICS
    case 'rateLimiting':
      return env.ENABLE_RATE_LIMITING
    case 'errorTracking':
      return env.ENABLE_ERROR_TRACKING
    default:
      return false
  }
}

// Export the validated environment (singleton pattern)
let cachedEnv: Env | ProductionEnv | undefined

export function env(): Env | ProductionEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnv()
  }
  return cachedEnv
}

// Validate on module load in production
if (process.env.NODE_ENV === 'production') {
  validateEnv()
}
