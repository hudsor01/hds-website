/**
 * Type-safe environment variables with validation
 * Using @t3-oss/env-nextjs for runtime and build-time validation
 *
 * @see https://env.t3.gg/docs/nextjs
 */

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
	/**
	 * Server-side environment variables
	 * These are only available on the server and never sent to the client
	 */
	server: {
		// Node environment
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),

		// Database - Neon/Drizzle (optional for CI/preview builds, required in production)
		POSTGRES_URL: z
			.string()
			.url()
			.optional()
			.refine(
				val => process.env.VERCEL_ENV !== 'production' || !!val,
				'POSTGRES_URL is required in production'
			),

		// Database - unpooled connection for migrations (optional)
		DATABASE_URL_UNPOOLED: z.string().url().optional(),

		// Email - Optional (features degrade gracefully without it)
		RESEND_API_KEY: z.string().min(1).optional(),

		// Webhooks - Optional
		DISCORD_WEBHOOK_URL: z.string().url().optional(),
		SLACK_WEBHOOK_URL: z.string().url().optional(),

		// Security - CSRF_SECRET is required in Vercel production
		CSRF_SECRET: z
			.string()
			.min(32, 'CSRF_SECRET must be at least 32 characters')
			.optional()
			.refine(
				val => process.env.VERCEL_ENV !== 'production' || !!val,
				'CSRF_SECRET is required in production'
			),

		// SEO
		GOOGLE_SITE_VERIFICATION: z.string().optional(),

		// Base URL
		BASE_URL: z.string().url().optional().default('http://localhost:3000'),

		// PDF Generation - Stirling PDF service
		STIRLING_PDF_URL: z.string().url().optional(),

		// Vercel deployment info
		VERCEL_REGION: z.string().optional(),

		// Package metadata (available at build time)
		npm_package_version: z.string().optional(),

		// Admin authentication (required in Vercel production)
		ADMIN_SECRET: z
			.string()
			.min(32, 'ADMIN_SECRET must be at least 32 characters')
			.optional()
			.refine(
				val => process.env.VERCEL_ENV !== 'production' || !!val,
				'ADMIN_SECRET is required in production'
			),

		// Cron job authentication (required in Vercel production)
		CRON_SECRET: z
			.string()
			.min(32, 'CRON_SECRET must be at least 32 characters')
			.optional()
			.refine(
				val => process.env.VERCEL_ENV !== 'production' || !!val,
				'CRON_SECRET is required in production'
			),

		// Better Auth - session-signing secret (required in Vercel production)
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
			.optional()
			.refine(
				val => process.env.VERCEL_ENV !== 'production' || !!val,
				'BETTER_AUTH_SECRET is required in production'
			),

		// Better Auth - canonical app URL (optional; falls back to BASE_URL at call site)
		BETTER_AUTH_URL: z.string().url().optional(),

		// Better Auth - extra trusted origins (optional; comma-separated, parsed at call site)
		BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),

		// Upstash Redis for distributed rate limiting (optional)
		// Set automatically when an Upstash Redis integration is attached via Vercel Marketplace.
		UPSTASH_REDIS_REST_URL: z.string().url().optional(),
		UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

		// Sentry error tracking (optional; no-op when unset)
		SENTRY_DSN: z.string().url().optional(),
		SENTRY_AUTH_TOKEN: z.string().optional(),

		// Vercel Blob — admin image uploads. Optional everywhere; the
		// /api/admin/images/upload route returns 503 when unset so the
		// client UI hides the Upload button and the paste-URL fallback
		// continues to work.
		BLOB_READ_WRITE_TOKEN: z.string().optional(),

		// Google PageSpeed Insights API key (optional). The `/api/pagespeed`
		// route falls back to unauthenticated requests when unset, but that
		// path is rate-limited to ~5 req/sec across all anonymous traffic
		// from a region — adding a key gets the project a per-project quota
		// (25k req/day on the free tier).
		PAGESPEED_API_KEY: z.string().optional()
	},

	/**
	 * Client-side environment variables
	 * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
	 */
	client: {
		// Base URL
		NEXT_PUBLIC_BASE_URL: z
			.string()
			.url()
			.optional()
			.default('http://localhost:3000'),
		NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

		// Sentry browser DSN (optional; no-op when unset)
		NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional()
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
		ADMIN_SECRET: process.env.ADMIN_SECRET,
		CRON_SECRET: process.env.CRON_SECRET,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
		DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
		SENTRY_DSN: process.env.SENTRY_DSN,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
		PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY,

		// Client
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
	},

	/**
	 * Skip validation during build on Vercel
	 * Vercel injects env vars at runtime, not build time
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,

	/**
	 * Make validation errors more readable
	 */
	emptyStringAsUndefined: true
})
