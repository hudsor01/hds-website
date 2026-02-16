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
    // Node environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Database - Neon/Drizzle (optional for CI builds)
    POSTGRES_URL: z.string().url().optional(),

    // Email - Optional (features degrade gracefully without it)
    RESEND_API_KEY: z.string().min(1).optional(),

    // Webhooks - Optional
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    SLACK_WEBHOOK_URL: z.string().url().optional(),

    // Security - CSRF_SECRET is required in production
    CSRF_SECRET: z
      .string()
      .min(32, 'CSRF_SECRET must be at least 32 characters')
      .optional()
      .refine(
        (val) => process.env.NODE_ENV !== 'production' || !!val,
        'CSRF_SECRET is required in production'
      ),

    // SEO
    GOOGLE_SITE_VERIFICATION: z.string().optional(),

    // Base URL
    BASE_URL: z.string().url().optional().default("http://localhost:3000"),

    // PDF Generation - Stirling PDF service
    STIRLING_PDF_URL: z.string().url().optional(),

    // Vercel deployment info
    VERCEL_REGION: z.string().optional(),

    // Package metadata (available at build time)
    npm_package_version: z.string().optional(),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
   */
  client: {
    // Base URL
    NEXT_PUBLIC_BASE_URL: z.string().url().optional().default("http://localhost:3000"),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  },

  /**
   * Runtime environment variables mapping
   * You need to destructure all env vars used in your app here
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    BASE_URL: process.env.BASE_URL,
    STIRLING_PDF_URL: process.env.STIRLING_PDF_URL,
    VERCEL_REGION: process.env.VERCEL_REGION,
    npm_package_version: process.env.npm_package_version,

    // Client
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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
