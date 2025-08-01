// Re-export from schemas for better organization
export { env, validateEnv, type Env, type ClientEnv } from '@/schemas/env';

// Helper to get client-safe environment variables
export function getClientEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://hudsondigitalsolutions.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'true',
    NEXT_PUBLIC_ENABLE_CONTACT_FORM: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM || 'true',
  };
}