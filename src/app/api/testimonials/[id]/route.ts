/**
 * API Route: Individual Testimonial
 * PATCH /api/testimonials/[id] - Update testimonial (approve/feature)
 * DELETE /api/testimonials/[id] - Delete testimonial
 *
 * SECURITY: These endpoints require admin authentication via Supabase session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { updateTestimonialStatus, deleteTestimonial } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateBody {
  approved?: boolean;
  featured?: boolean;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Testimonial PATCH rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;
    const body = await request.json() as UpdateBody;

    const success = await updateTestimonialStatus(id, {
      approved: body.approved,
      featured: body.featured,
    });

    if (!success) {
      return errorResponse('Failed to update testimonial', 500);
    }

    logger.info('Testimonial updated', {
      component: 'TestimonialAPI',
      action: 'update',
      testimonialId: id,
      updates: body,
    });

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Error updating testimonial', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialAPI',
      action: 'update',
    });

    return errorResponse('Failed to update testimonial', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Testimonial DELETE rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    const success = await deleteTestimonial(id);

    if (!success) {
      return errorResponse('Failed to delete testimonial', 500);
    }

    logger.info('Testimonial deleted', {
      component: 'TestimonialAPI',
      action: 'delete',
      testimonialId: id,
    });

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Error deleting testimonial', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialAPI',
      action: 'delete',
    });

    return errorResponse('Failed to delete testimonial', 500);
  }
}
