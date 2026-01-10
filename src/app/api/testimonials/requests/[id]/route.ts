/**
 * API Route: Individual Testimonial Request
 * DELETE /api/testimonials/requests/[id] - Delete testimonial request
 *
 * SECURITY: This endpoint requires admin authentication via Supabase session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { deleteTestimonialRequest } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Testimonial request DELETE rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    const success = await deleteTestimonialRequest(id);

    if (!success) {
      return errorResponse('Failed to delete request', 500);
    }

    logger.info('Testimonial request deleted', {
      component: 'TestimonialRequestAPI',
      action: 'delete',
      requestId: id,
    });

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Error deleting testimonial request', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestAPI',
      action: 'delete',
    });

    return errorResponse('Failed to delete request', 500);
  }
}
