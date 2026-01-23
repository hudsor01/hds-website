/**
 * Admin Errors API - Detail and Resolve Endpoint
 * Returns all occurrences for a fingerprint and allows resolving errors
 */

import { type NextRequest, connection } from 'next/server'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses'
import { createServerLogger } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, validateAdminAuth } from '@/lib/admin-auth'
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper'
import { resolveErrorSchema } from '@/lib/schemas/error-logs'

const logger = createServerLogger('admin-errors-detail-api')

interface RouteContext {
  params: Promise<{
    fingerprint: string
  }>
}

async function handleErrorDetail(request: NextRequest, context: RouteContext) {
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

    const { data: errorOccurrences, error: fetchError } = await supabaseAdmin
      .from('error_logs')
      .select('*')
      .eq('fingerprint', fingerprint)
      .order('created_at', { ascending: false })

    if (fetchError) {
      logger.error('Failed to fetch error occurrences', fetchError)
      return errorResponse('Failed to fetch error occurrences', 500)
    }

    if (!errorOccurrences || errorOccurrences.length === 0) {
      return errorResponse('Error not found', 404)
    }

    const firstOccurrence = errorOccurrences[0]
    if (!firstOccurrence) {
      return errorResponse('Error not found', 404)
    }

    const totalCount = errorOccurrences.length
    const resolvedCount = errorOccurrences.filter((e) => e.resolved_at !== null).length

    logger.info('Error details fetched', {
      fingerprint,
      totalOccurrences: totalCount,
    })

    return successResponse({
      fingerprint,
      error_type: firstOccurrence.error_type,
      message: firstOccurrence.message,
      level: firstOccurrence.level,
      route: firstOccurrence.route,
      total_count: totalCount,
      resolved_count: resolvedCount,
      first_seen: errorOccurrences[errorOccurrences.length - 1]?.created_at,
      last_seen: firstOccurrence.created_at,
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
          resolved_at: new Date().toISOString(),
          resolved_by: auth.user.id,
        }
      : {
          resolved_at: null,
          resolved_by: null,
        }

    const { data, error: updateError } = await supabaseAdmin
      .from('error_logs')
      .update(updateData)
      .eq('fingerprint', fingerprint)
      .select()

    if (updateError) {
      logger.error('Failed to update error resolution status', updateError)
      return errorResponse('Failed to update error resolution status', 500)
    }

    if (!data || data.length === 0) {
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
      resolved_at: updateData.resolved_at,
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
