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
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Webhooks
    DISCORD_WEBHOOK_URL: z.string().url().optional(),

    // Security
    CSRF_SECRET: z.string().min(16).optional(),
    CRON_SECRET: z.string().optional(),

    // Analytics
    GA4_API_SECRET: z.string().optional(),

    // SEO
    GOOGLE_SITE_VERIFICATION: z.string().optional(),

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
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
  },

  /**
   * Runtime environment variables mapping
   * You need to destructure all env vars used in your app here
   */
  runtimeEnv: {
    // Server
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    GA4_API_SECRET: process.env.GA4_API_SECRET,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    NODE_ENV: process.env.NODE_ENV,
    npm_package_version: process.env.npm_package_version,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
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
