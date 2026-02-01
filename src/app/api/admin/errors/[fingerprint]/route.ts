/**
 * Admin Errors API - Detail and Resolve Endpoint
 * Returns all occurrences for a fingerprint and allows resolving errors
 */

import { type NextRequest, connection } from 'next/server'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/schemas/system'
import { eq, desc } from 'drizzle-orm'
import { requireAdminAuth, validateAdminAuth } from '@/lib/admin-auth'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { resolveErrorSchema } from '@/lib/schemas/error-logs'

const logger = createServerLogger('admin-errors-detail-api')

interface RouteContext {
  params: Promise<{
    fingerprint: string
  }>
}

async function handleErrorDetail(_request: NextRequest, context: RouteContext) {
  await connection()

  const authError = await requireAdminAuth()
  if (authError) {
    return authError
  }

  try {
    const { fingerprint } = await context.params

    if (!fingerprint || typeof fingerprint !== 'string') {
      return errorResponse('Invalid fingerprint', 400)
    }

    const errorOccurrences = await db
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.fingerprint, fingerprint))
      .orderBy(desc(errorLogs.createdAt))

    if (errorOccurrences.length === 0) {
      return errorResponse('Error not found', 404)
    }

    const firstOccurrence = errorOccurrences[0]
    if (!firstOccurrence) {
      return errorResponse('Error not found', 404)
    }

    const totalCount = errorOccurrences.length
    const resolvedCount = errorOccurrences.filter((e) => e.resolvedAt !== null).length

    logger.info('Error details fetched', {
      fingerprint,
      totalOccurrences: totalCount,
    })

    return successResponse({
      fingerprint,
      error_type: firstOccurrence.errorType,
      message: firstOccurrence.message,
      level: firstOccurrence.level,
      route: firstOccurrence.route,
      total_count: totalCount,
      resolved_count: resolvedCount,
      first_seen: errorOccurrences[errorOccurrences.length - 1]?.createdAt?.toISOString(),
      last_seen: firstOccurrence.createdAt.toISOString(),
      occurrences: errorOccurrences.slice(0, 50),
    })
  } catch (error) {
    logger.error(
      'Errors detail API error',
      error instanceof Error ? error : new Error(String(error))
    )
    return errorResponse('Failed to fetch error details', 500)
  }
}

export const GET = withRateLimitParams(handleErrorDetail, 'api');

async function handleErrorResolve(request: NextRequest, context: RouteContext) {
  await connection()

  const auth = await validateAdminAuth()
  if (!auth.isAuthenticated || !auth.user) {
    return auth.error ?? errorResponse('Unauthorized', 401)
  }

  try {
    const { fingerprint } = await context.params

    if (!fingerprint || typeof fingerprint !== 'string') {
      return errorResponse('Invalid fingerprint', 400)
    }

    const body = await request.json()
    const parseResult = resolveErrorSchema.safeParse(body)

    if (!parseResult.success) {
      logger.warn('Invalid resolve error request', {
        errors: parseResult.error.flatten(),
      })
      return validationErrorResponse(parseResult.error)
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

    if (data.length === 0) {
      return errorResponse('Error not found', 404)
    }

    logger.info('Error resolution status updated', {
      fingerprint,
      resolved,
      updatedCount: data.length,
      resolvedBy: auth.user.email,
    })

    return successResponse({
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
    return errorResponse('Failed to update error status', 500)
  }
}

export const PATCH = withRateLimitParams(handleErrorResolve, 'api');
