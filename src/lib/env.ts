/**
 * Environment Variable Validation with Zod
 *
 * This file validates all environment variables at startup to catch
 * configuration errors early. All env vars are type-safe and validated.
 */

import { z } from 'zod'

// Define the schema for all environment variables
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Email Service (Required)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for email functionality'),

  // Ghost CMS (Optional - for blog)
  GHOST_API_URL: z.string().url().optional().or(z.literal('')),
  GHOST_CONTENT_API_KEY: z.string().optional().or(z.literal('')),

  // Analytics (Optional)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional().or(z.literal('')),
  GA4_API_SECRET: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional().or(z.literal('')),

  // SEO (Optional)
  GOOGLE_SITE_VERIFICATION: z.string().optional().or(z.literal('')),

  // Security (Optional but recommended)
  CSRF_SECRET: z.string().optional().or(z.literal('')),
  CRON_SECRET: z.string().optional().or(z.literal('')),

  // Supabase (Optional)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal('')),

  // Notifications (Optional)
  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
})

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
      console.error('❌ Environment variable validation failed:')
      console.error(JSON.stringify(parsed.error.format(), null, 2))

      // In production, fail fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables')
      }

      // In development, warn but continue
      console.warn('⚠️  Continuing with invalid environment variables (development mode)')
      return process.env as z.infer<typeof envSchema>
    }

    return parsed.data
  } catch (error) {
    console.error('❌ Failed to validate environment variables:', error)
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Helper to check if a service is configured
export const isServiceConfigured = {
  email: () => !!env.RESEND_API_KEY,
  ghost: () => !!env.GHOST_API_URL && !!env.GHOST_CONTENT_API_KEY,
  analytics: {
    ga4: () => !!env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    posthog: () => !!env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  supabase: () => !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  discord: () => !!env.DISCORD_WEBHOOK_URL,
}

// Type exports for use in other files
export type Env = z.infer<typeof envSchema>
