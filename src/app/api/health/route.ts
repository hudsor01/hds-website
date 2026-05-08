/**
 * Health Check API Route
 *
 * Admin-gated. Returns service status, DB connectivity, build version,
 * and DB latency. Anonymous callers are 401'd because the response
 * leaks both the deployed package version (useful for vuln scanning)
 * and a high-signal availability probe.
 */

import { sql } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { validateAdminAuth } from '@/lib/auth/admin'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
	const authError = validateAdminAuth(request)
	if (authError) {
		return authError
	}

	const start = Date.now()
	try {
		await db.execute(sql`SELECT 1`)
		const duration = Date.now() - start

		return NextResponse.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: 'ok',
			latency_ms: duration,
			version: env.npm_package_version ?? 'unknown'
		})
	} catch (error) {
		logger.error('Health check failed', error)
		return NextResponse.json(
			{
				status: 'error',
				timestamp: new Date().toISOString(),
				database: 'error'
			},
			{ status: 503 }
		)
	}
}
