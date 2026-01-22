/**
 * Admin Errors API - List Endpoint
 * Returns grouped error logs with filtering and pagination
 */

import { type NextRequest, NextResponse, connection } from 'next/server'
import { createServerLogger } from '@/lib/logger'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/schema'
import { desc, eq, gte, isNull, isNotNull, or, ilike, and } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/admin-auth'
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter'
import { errorLogsQuerySchema } from '@/lib/schemas/error-logs'
import { safeParseSearchParams } from '@/lib/schemas/query-params'
import { getStartDateFromRange, sanitizePostgrestSearch } from '@/lib/utils'
import type { GroupedError, ErrorStats } from '@/types/error-logging'

const logger = createServerLogger('admin-errors-api')

export async function GET(request: NextRequest) {
  await connection()

  const clientIp = getClientIp(request)
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api')
  if (!isAllowed) {
    logger.warn('Errors API rate limit exceeded', { ip: clientIp })
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const authError = await requireAdminAuth()
  if (authError) {
    return authError
  }

  try {
    const { searchParams } = new URL(request.url)

    const parseResult = safeParseSearchParams(searchParams, errorLogsQuerySchema)
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', {
        errors: parseResult.errors.flatten(),
      })
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parseResult.errors.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { timeRange, errorType, route, level, search, resolved, limit, offset } =
      parseResult.data

    const startDate = getStartDateFromRange(timeRange)

    // Build conditions array
    const conditions = [gte(errorLogs.createdAt, startDate)]

    if (errorType) {
      conditions.push(eq(errorLogs.errorType, errorType))
    }

    if (route) {
      conditions.push(eq(errorLogs.route, route))
    }

    if (level) {
      conditions.push(eq(errorLogs.level, level))
    }

    if (search) {
      // Sanitize search term to prevent injection
      const sanitizedSearch = sanitizePostgrestSearch(search)
      if (sanitizedSearch.length >= 2) {
        conditions.push(
          or(
            ilike(errorLogs.message, `%${sanitizedSearch}%`),
            ilike(errorLogs.errorType, `%${sanitizedSearch}%`),
            ilike(errorLogs.route, `%${sanitizedSearch}%`)
          )!
        )
      }
    }

    if (resolved === 'true') {
      conditions.push(isNotNull(errorLogs.resolvedAt))
    } else if (resolved === 'false') {
      conditions.push(isNull(errorLogs.resolvedAt))
    }

    const errorLogsData = await db
      .select()
      .from(errorLogs)
      .where(and(...conditions))
      .orderBy(desc(errorLogs.createdAt))

    const groupedErrorsMap = new Map<string, GroupedError>()

    for (const errorLog of errorLogsData || []) {
      const existing = groupedErrorsMap.get(errorLog.fingerprint)

      if (existing) {
        existing.count += 1
        const logDate = new Date(errorLog.createdAt)
        const firstSeenDate = new Date(existing.first_seen)
        const lastSeenDate = new Date(existing.last_seen)

        if (logDate < firstSeenDate) {
          existing.first_seen = errorLog.createdAt.toISOString()
        }
        if (logDate > lastSeenDate) {
          existing.last_seen = errorLog.createdAt.toISOString()
        }

        if (errorLog.resolvedAt && !existing.resolved_at) {
          existing.resolved_at = errorLog.resolvedAt.toISOString()
        }
      } else {
        groupedErrorsMap.set(errorLog.fingerprint, {
          fingerprint: errorLog.fingerprint,
          error_type: errorLog.errorType,
          message: errorLog.message,
          level: errorLog.level as GroupedError['level'],
          count: 1,
          first_seen: errorLog.createdAt.toISOString(),
          last_seen: errorLog.createdAt.toISOString(),
          route: errorLog.route ?? undefined,
          resolved_at: errorLog.resolvedAt?.toISOString() ?? undefined,
        })
      }
    }

    const groupedErrors = Array.from(groupedErrorsMap.values())
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
      .slice(offset, offset + limit)

    const stats: ErrorStats = {
      total_errors: errorLogsData?.length || 0,
      unique_types: new Set(errorLogsData?.map((e) => e.errorType) || []).size,
      fatal_count: errorLogsData?.filter((e) => e.level === 'fatal').length || 0,
      resolved_count: errorLogsData?.filter((e) => e.resolvedAt !== null).length || 0,
      unresolved_count: errorLogsData?.filter((e) => e.resolvedAt === null).length || 0,
    }

    logger.info('Error logs fetched', {
      timeRange,
      totalErrors: stats.total_errors,
      groupedCount: groupedErrors.length,
    })

    return NextResponse.json({
      errors: groupedErrors,
      stats,
      pagination: {
        limit,
        offset,
        total: groupedErrorsMap.size,
        hasMore: offset + limit < groupedErrorsMap.size,
      },
    })
  } catch (error) {
    logger.error(
      'Errors API error',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 })
  }
}
