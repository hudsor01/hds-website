/**
 * Admin Errors API - List Endpoint
 * Returns grouped error logs with filtering and pagination
 */

import { type NextRequest, connection } from 'next/server'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/schemas/system'
import { eq, gte, desc, isNull, isNotNull, ilike, or, and, type SQL } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/admin-auth'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import { errorLogsQuerySchema } from '@/lib/schemas/error-logs'
import { safeParseSearchParams } from '@/lib/schemas/query-params'
import { getStartDateFromRange } from '@/lib/utils'
import type { GroupedError, ErrorStats } from '@/types/error-logging'

const logger = createServerLogger('admin-errors-api')

async function handleAdminErrors(request: NextRequest) {
  await connection()

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
      return validationErrorResponse(parseResult.errors)
    }

    const { timeRange, errorType, route, level, search, resolved, limit, offset } =
      parseResult.data

    const startDate = getStartDateFromRange(timeRange)

    // Build dynamic where conditions
    const conditions: SQL[] = [gte(errorLogs.createdAt, startDate)]

    if (errorType) {
      conditions.push(eq(errorLogs.errorType, errorType))
    }

    if (route) {
      conditions.push(eq(errorLogs.route, route))
    }

    if (level) {
      conditions.push(eq(errorLogs.level, level))
    }

    if (search && search.length >= 2) {
      conditions.push(
        or(
          ilike(errorLogs.message, `%${search}%`),
          ilike(errorLogs.errorType, `%${search}%`),
          ilike(errorLogs.route, `%${search}%`),
        )!
      )
    }

    if (resolved === 'true') {
      conditions.push(isNotNull(errorLogs.resolvedAt))
    } else if (resolved === 'false') {
      conditions.push(isNull(errorLogs.resolvedAt))
    }

    const errorLogRows = await db
      .select()
      .from(errorLogs)
      .where(and(...conditions))
      .orderBy(desc(errorLogs.createdAt))

    const groupedErrorsMap = new Map<string, GroupedError>()

    for (const errorLog of errorLogRows) {
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
      total_errors: errorLogRows.length,
      unique_types: new Set(errorLogRows.map((e) => e.errorType)).size,
      fatal_count: errorLogRows.filter((e) => e.level === 'fatal').length,
      resolved_count: errorLogRows.filter((e) => e.resolvedAt !== null).length,
      unresolved_count: errorLogRows.filter((e) => e.resolvedAt === null).length,
    }

    logger.info('Error logs fetched', {
      timeRange,
      totalErrors: stats.total_errors,
      groupedCount: groupedErrors.length,
    })

    return successResponse({
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
    return errorResponse('Failed to fetch errors', 500)
  }
}

export const GET = withRateLimit(handleAdminErrors, 'api')
