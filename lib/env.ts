/**
 * Next.js 15 Environment Variables Configuration
 * Production-ready environment validation with type safety and runtime checks
 */

import { z } from 'zod'

// Environment-specific validation schemas
const serverEnvSchema = z.object({
// Core Application Environment
NODE_ENV: z
.enum(['development', 'production', 'test'])
.default('development'),

// Required Server-side Variables
RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for email functionality'),
RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email').optional(),
CONTACT_EMAIL: z.string().email('CONTACT_EMAIL must be a valid email').optional(),

// Clerk Authentication (Server-side)
CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required for Clerk authentication'),
  
  // Security & Authentication (Next.js 15 security patterns)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'your-secret-key' && val !== 'change-this-secret',
      'JWT_SECRET cannot use default/placeholder values in production',
    ),
  ADMIN_USERNAME: z.string().min(3, 'ADMIN_USERNAME must be at least 3 characters')
    .max(50, 'ADMIN_USERNAME must be less than 50 characters')
    .refine(
      (val) => val !== 'admin' || process.env.NODE_ENV === 'development',
      'ADMIN_USERNAME cannot be "admin" in production for security',
    ),
  // Production should use ADMIN_PASSWORD_HASH instead of plain password
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'ADMIN_PASSWORD must contain uppercase, lowercase, number, and special character')
    .refine(
      (val) => val !== 'change-this-password' && val !== 'password123',
      'ADMIN_PASSWORD cannot use default/weak passwords',
    )
    .optional(),
  // Secure hashed password for production (Next.js 15 authentication pattern)
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required in production')
    .optional(),

  // Database Configuration
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid database connection string'),
  
  // Supabase Configuration (Optional)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required if using Supabase admin features').optional(),
  
  // Cal.com Integration
  CAL_COM_API_KEY: z.string().optional(),
  
  // Third-party Service Keys (Server-side only)
  STRIPE_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
})

const clientEnvSchema = z.object({
// Client-side Environment Variables (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').default('http://localhost:3000'),

// Supabase Client Configuration
NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required if using Supabase').optional(),

// Clerk Authentication (Client-side)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for Clerk'),
NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/auth/sign-in'),
NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/auth/sign-up'),
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/dashboard'),

  // Analytics Configuration
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().regex(/^G-[A-Z0-9]+$/, 'Invalid Google Analytics Measurement ID format').optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url('NEXT_PUBLIC_POSTHOG_HOST must be a valid URL').optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_MAINTENANCE_MODE: z.string().transform(val => val === 'true').default('false'),
})

// Combined schema for full validation
const envSchema = serverEnvSchema.merge(clientEnvSchema)

// Environment validation functions
const validateServerEnv = () => {
  try {
    return serverEnvSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n')

      throw new Error(
        `❌ Invalid server environment variables:\n${message}\n\n💡 Please check your .env files and ensure all required variables are set.`,
      )
    }
    throw error
  }
}

const validateClientEnv = () => {
  try {
    return clientEnvSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n')

      throw new Error(
        `❌ Invalid client environment variables:\n${message}\n\n💡 Remember: Client variables must be prefixed with NEXT_PUBLIC_`,
      )
    }
    throw error
  }
}

// Runtime environment variable access
export const getServerEnv = () => {
  if (typeof window !== 'undefined') {
    throw new Error('❌ Server environment variables cannot be accessed on the client side')
  }
  return validateServerEnv()
}

export const getClientEnv = () => validateClientEnv()

// Full environment validation (server-side only)
export const validateEnv = () => {
  if (typeof window !== 'undefined') {
    throw new Error('❌ Full environment validation must run on the server side')
  }
  
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n')

      throw new Error(
        `❌ Environment validation failed:\n${message}\n\n📋 Required environment variables:\n${getRequiredEnvVars().join('\n')}`,
      )
    }
    throw error
  }
}

// Helper function to get required environment variables
export const getRequiredEnvVars = (): string[] => {
const required = [
'NODE_ENV (development|production|test)',
'RESEND_API_KEY (for email functionality)',
'JWT_SECRET (minimum 32 characters)',
'ADMIN_USERNAME (minimum 3 characters, not "admin" in production)',
'ADMIN_PASSWORD (8+ chars with complexity) OR ADMIN_PASSWORD_HASH (for production)',
'DATABASE_URL (database connection)',
'DIRECT_URL (direct database connection for Prisma)',
'NEXT_PUBLIC_APP_URL (application URL)',
'NEXT_PUBLIC_SUPABASE_URL (Supabase project URL)',
'NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase anonymous key)',
'SUPABASE_SERVICE_ROLE_KEY (Supabase service role key)',
'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (Clerk publishable key)',
'CLERK_SECRET_KEY (Clerk secret key)',
]
  return required
}

// Environment variable utilities
export const envUtils = {
  /**
   * Check if running in development
   */
  isDevelopment: () => process.env.NODE_ENV === 'development',
  
  /**
   * Check if running in production
   */
  isProduction: () => process.env.NODE_ENV === 'production',
  
  /**
   * Check if running in test environment
   */
  isTest: () => process.env.NODE_ENV === 'test',
  
  /**
   * Get current environment
   */
  getEnvironment: () => process.env.NODE_ENV || 'development',
  
  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled: (feature: string): boolean => {
    const value = process.env[`NEXT_PUBLIC_ENABLE_${feature.toUpperCase()}`]
    return value === 'true'
  },
  
  /**
   * Get app URL with fallback
   */
  getAppUrl: (): string => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  /**
  * Validate critical environment variables on startup (Next.js 15 security pattern)
  */
  validateCriticalEnvVars: (): boolean => {
  const critical = [
  'RESEND_API_KEY',
  'JWT_SECRET',
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  ]
    
    // Additional production security checks
    if (envUtils.isProduction()) {
      critical.push('ADMIN_PASSWORD_HASH')
      
      // Ensure production doesn't use weak defaults
      if (process.env.ADMIN_USERNAME === 'admin') {
        console.error('❌ ADMIN_USERNAME cannot be "admin" in production')
        return false
      }
      
      if (process.env.JWT_SECRET === 'your-secret-key' || process.env.JWT_SECRET === 'change-this-secret') {
        console.error('❌ JWT_SECRET cannot use default values in production')
        return false
      }
      
      if (!process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
        console.error('❌ Production must use ADMIN_PASSWORD_HASH instead of plain ADMIN_PASSWORD')
        return false
      }
    }
    
    const missing = critical.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      console.error(`❌ Missing critical environment variables: ${missing.join(', ')}`)
      return false
    }
    
    return true
  },
}

// Development environment helpers
export const devUtils = {
  /**
   * Log environment status in development
   */
  logEnvStatus: () => {
    if (process.env.NODE_ENV !== 'development') return
    
    console.log('🌍 Environment Status:')
    console.log(`  • NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`  • App URL: ${envUtils.getAppUrl()}`)
    console.log(`  • Analytics: ${envUtils.isFeatureEnabled('analytics') ? '✅' : '❌'}`)
    console.log(`  • Error Reporting: ${envUtils.isFeatureEnabled('error_reporting') ? '✅' : '❌'}`)
    console.log(`  • Maintenance Mode: ${envUtils.isFeatureEnabled('maintenance') ? '🚧' : '✅'}`)
  },
  
  /**
   * Validate all environment variables in development
   */
  validateDevEnv: () => {
    if (process.env.NODE_ENV !== 'development') return
    
    try {
      validateEnv()
      console.log('✅ All environment variables are valid')
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  },
}

// Export validated environment variables (server-side only)
let _env: z.infer<typeof envSchema> | null = null

export const env = (() => {
  if (typeof window !== 'undefined') {
    throw new Error('❌ Environment variables should not be imported on the client side. Use getClientEnv() instead.')
  }
  
  if (!_env) {
    _env = validateEnv()
  }
  
  return _env
})()

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
export type Env = z.infer<typeof envSchema>
