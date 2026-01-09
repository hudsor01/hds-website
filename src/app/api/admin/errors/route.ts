/**
 * Admin Errors API - List Endpoint
 * Returns grouped error logs with filtering and pagination
 */

import { type NextRequest, NextResponse, connection } from 'next/server'
import { createServerLogger } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter'
import { errorLogsQuerySchema } from '@/lib/schemas/error-logs'
import { safeParseSearchParams } from '@/lib/schemas/query-params'
import type { GroupedError, ErrorStats, ErrorLogRecord } from '@/types/error-logging'

const logger = createServerLogger('admin-errors-api')

/**
 * Sanitize search term for safe use in PostgREST filter queries.
 * Escapes special characters that could break out of ilike patterns.
 */
function sanitizePostgrestSearch(term: string): string {
  return term
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')    // Escape wildcard %
    .replace(/_/g, '\\_')    // Escape wildcard _
    .replace(/,/g, '')       // Remove commas (PostgREST filter separator)
    .replace(/\./g, '')      // Remove dots (PostgREST operator separator)
    .replace(/\(/g, '')      // Remove open parens (PostgREST grouping)
    .replace(/\)/g, '')      // Remove close parens (PostgREST grouping)
}

/**
 * Calculate the start date based on time range
 */
function getStartDate(timeRange: string): Date {
  const now = new Date()
  switch (timeRange) {
    case '1h':
      now.setHours(now.getHours() - 1)
      break
    case '24h':
      now.setHours(now.getHours() - 24)
      break
    case '7d':
      now.setDate(now.getDate() - 7)
      break
    case '30d':
      now.setDate(now.getDate() - 30)
      break
    default:
      now.setHours(now.getHours() - 24)
  }
  return now
}

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

    const startDate = getStartDate(timeRange)

    let query = supabaseAdmin
      .from('error_logs' as never)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (errorType) {
      query = query.eq('error_type', errorType)
    }

    if (route) {
      query = query.eq('route', route)
    }

    if (level) {
      query = query.eq('level', level)
    }

    if (search) {
      // Sanitize search term to prevent PostgREST filter injection
      const sanitizedSearch = sanitizePostgrestSearch(search)
      if (sanitizedSearch.length >= 2) {
        query = query.or(
          `message.ilike.%${sanitizedSearch}%,error_type.ilike.%${sanitizedSearch}%,route.ilike.%${sanitizedSearch}%`
        )
      }
    }

    if (resolved === 'true') {
      query = query.not('resolved_at', 'is', null)
    } else if (resolved === 'false') {
      query = query.is('resolved_at', null)
    }

    const { data: errorLogsRaw, error: fetchError } = await query
    const errorLogs = errorLogsRaw as unknown as ErrorLogRecord[] | null

    if (fetchError) {
      logger.error('Failed to fetch error logs', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch error logs' },
        { status: 500 }
      )
    }

    const groupedErrorsMap = new Map<string, GroupedError>()

    for (const errorLog of errorLogs || []) {
      const existing = groupedErrorsMap.get(errorLog.fingerprint)

      if (existing) {
        existing.count += 1
        const logDate = new Date(errorLog.created_at)
        const firstSeenDate = new Date(existing.first_seen)
        const lastSeenDate = new Date(existing.last_seen)

        if (logDate < firstSeenDate) {
          existing.first_seen = errorLog.created_at
        }
        if (logDate > lastSeenDate) {
          existing.last_seen = errorLog.created_at
        }

        if (errorLog.resolved_at && !existing.resolved_at) {
          existing.resolved_at = errorLog.resolved_at
        }
      } else {
        groupedErrorsMap.set(errorLog.fingerprint, {
          fingerprint: errorLog.fingerprint,
          error_type: errorLog.error_type,
          message: errorLog.message,
          level: errorLog.level,
          count: 1,
          first_seen: errorLog.created_at,
          last_seen: errorLog.created_at,
          route: errorLog.route,
          resolved_at: errorLog.resolved_at,
        })
      }
    }

    const groupedErrors = Array.from(groupedErrorsMap.values())
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
      .slice(offset, offset + limit)

    const stats: ErrorStats = {
      total_errors: errorLogs?.length || 0,
      unique_types: new Set(errorLogs?.map((e) => e.error_type) || []).size,
      fatal_count: errorLogs?.filter((e) => e.level === 'fatal').length || 0,
      resolved_count: errorLogs?.filter((e) => e.resolved_at !== null).length || 0,
      unresolved_count: errorLogs?.filter((e) => e.resolved_at === null).length || 0,
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
