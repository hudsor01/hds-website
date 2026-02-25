/**
 * Health Check API Route
 * Returns service status and database connectivity check.
 */

import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { castError, logger } from '@/lib/logger'

export async function GET() {
	const start = Date.now()

	try {
		await db.execute(sql`SELECT 1`)
		const duration = Date.now() - start

		return NextResponse.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: 'ok',
			latency_ms: duration,
			version: process.env.npm_package_version ?? 'unknown'
		})
	} catch (error) {
		logger.error('Health check failed', castError(error))
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
