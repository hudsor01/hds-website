import { z } from 'zod';

// Environment variable validation schema
export const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // API Keys
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // SEO
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  NEXT_PUBLIC_ENABLE_CONTACT_FORM: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
});

// Client-side env schema (only NEXT_PUBLIC_ variables)
export const clientEnvSchema = envSchema.pick({
  NODE_ENV: true,
  NEXT_PUBLIC_SITE_URL: true,
  NEXT_PUBLIC_API_URL: true,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: true,
  NEXT_PUBLIC_POSTHOG_KEY: true,
  NEXT_PUBLIC_POSTHOG_HOST: true,
  NEXT_PUBLIC_ENABLE_ANALYTICS: true,
  NEXT_PUBLIC_ENABLE_CONTACT_FORM: true,
});

// Type inference
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Validation function
export function validateEnv(env: unknown): Env {
  const parsed = envSchema.safeParse(env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten());
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

// Export validated environment
export const env = validateEnv(process.env);