/**
 * Admin Errors API - Detail and Resolve Endpoint
 * Returns all occurrences for a fingerprint and allows resolving errors
 */

import { type NextRequest, NextResponse, connection } from 'next/server'
import { createServerLogger } from '@/lib/logger'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdminAuth, validateAdminAuth } from '@/lib/admin-auth'
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter'
import { resolveErrorSchema } from '@/lib/schemas/error-logs'

const logger = createServerLogger('admin-errors-detail-api')

interface RouteContext {
  params: Promise<{
    fingerprint: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  await connection()

  const clientIp = getClientIp(request)
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api')
  if (!isAllowed) {
    logger.warn('Errors detail API rate limit exceeded', { ip: clientIp })
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const authError = await requireAdminAuth()
  if (authError) {
    return authError
  }

  try {
    const { fingerprint } = await context.params

    if (!fingerprint || typeof fingerprint !== 'string') {
      return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 })
    }

    const errorOccurrences = await db
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.fingerprint, fingerprint))
      .orderBy(desc(errorLogs.createdAt))

    if (!errorOccurrences || errorOccurrences.length === 0) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    const firstOccurrence = errorOccurrences[0]
    if (!firstOccurrence) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    const totalCount = errorOccurrences.length
    const resolvedCount = errorOccurrences.filter((e) => e.resolvedAt !== null).length

    logger.info('Error details fetched', {
      fingerprint,
      totalOccurrences: totalCount,
    })

    return NextResponse.json({
      fingerprint,
      error_type: firstOccurrence.errorType,
      message: firstOccurrence.message,
      level: firstOccurrence.level,
      route: firstOccurrence.route,
      total_count: totalCount,
      resolved_count: resolvedCount,
      first_seen: errorOccurrences[errorOccurrences.length - 1]?.createdAt?.toISOString(),
      last_seen: firstOccurrence.createdAt?.toISOString(),
      occurrences: errorOccurrences.slice(0, 50),
    })
  } catch (error) {
    logger.error(
      'Errors detail API error',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json({ error: 'Failed to fetch error details' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  await connection()

  const clientIp = getClientIp(request)
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api')
  if (!isAllowed) {
    logger.warn('Errors resolve API rate limit exceeded', { ip: clientIp })
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const auth = await validateAdminAuth()
  if (!auth.isAuthenticated || !auth.user) {
    return auth.error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { fingerprint } = await context.params

    if (!fingerprint || typeof fingerprint !== 'string') {
      return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 })
    }

    const body = await request.json()
    const parseResult = resolveErrorSchema.safeParse(body)

    if (!parseResult.success) {
      logger.warn('Invalid resolve error request', {
        errors: parseResult.error.flatten(),
      })
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { resolved } = parseResult.data

    const updateData = resolved
      ? {
          resolvedAt: new Date(),
          resolvedBy: auth.user.id,
        }
      : {
          resolvedAt: null,
          resolvedBy: null,
        }

    const data = await db
      .update(errorLogs)
      .set(updateData)
      .where(eq(errorLogs.fingerprint, fingerprint))
      .returning()

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    logger.info('Error resolution status updated', {
      fingerprint,
      resolved,
      updatedCount: data.length,
      resolvedBy: auth.user.email,
    })

    return NextResponse.json({
      success: true,
      fingerprint,
      resolved,
      updated_count: data.length,
      resolved_at: updateData.resolvedAt?.toISOString() ?? null,
    })
  } catch (error) {
    logger.error(
      'Errors resolve API error',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json({ error: 'Failed to update error status' }, { status: 500 })
  }
}
