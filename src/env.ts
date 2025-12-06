/**
 * Type-safe environment variables with validation
 * Using @t3-oss/env-nextjs for runtime and build-time validation
 *
 * @see https://env.t3.gg/docs/nextjs
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and never sent to the client
   */
  server: {
    // Email
    RESEND_API_KEY: z.string().min(1).optional(),

    // Database
    SUPABASE_PUBLISHABLE_KEY: z.string().optional(),

    // Webhooks
    DISCORD_WEBHOOK_URL: z.string().url().optional(),

    // Security - CSRF_SECRET is required in production
    CSRF_SECRET: z
      .string()
      .min(32, 'CSRF_SECRET must be at least 32 characters')
      .optional()
      .refine(
        (val) => process.env.NODE_ENV !== 'production' || !!val,
        'CSRF_SECRET is required in production'
      ),
    CRON_SECRET: z.string().optional(),
    SUPABASE_WEBHOOK_SECRET: z.string().optional(),

    // Vercel KV for distributed rate limiting
    KV_REST_API_URL: z.string().url().optional(),
    KV_REST_API_TOKEN: z.string().optional(),

    // Analytics
    GA4_API_SECRET: z.string().optional(),

    // SEO
    GOOGLE_SITE_VERIFICATION: z.string().optional(),

    // Base URL
    BASE_URL: z.string().url().optional().default("http://localhost:3000"),

    // Admin API token
    ADMIN_API_TOKEN: z.string().min(16).optional(),

    // JWT Secret for authentication
    JWT_SECRET: z.string().min(16).optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Package metadata (available at build time)
    npm_package_version: z.string().optional(),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

    // Base URL
    NEXT_PUBLIC_BASE_URL: z.string().url().optional().default("http://localhost:3000"),
  },

  /**
   * Runtime environment variables mapping
   * You need to destructure all env vars used in your app here
   */
  runtimeEnv: {
    // Server
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    GA4_API_SECRET: process.env.GA4_API_SECRET,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    BASE_URL: process.env.BASE_URL,
    ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    npm_package_version: process.env.npm_package_version,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },

  /**
   * Skip validation during build on Vercel
   * Vercel injects env vars at runtime, not build time
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Make validation errors more readable
   */
  emptyStringAsUndefined: true,
});
