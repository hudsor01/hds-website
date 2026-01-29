/**
 * API Route: Individual Testimonial
 * PATCH /api/testimonials/[id] - Update testimonial (approve/feature)
 * DELETE /api/testimonials/[id] - Delete testimonial
 *
 * SECURITY: These endpoints require admin authentication via Neon Auth session
 */

import { type NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { updateTestimonialStatus, deleteTestimonial } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateBody {
  approved?: boolean;
  featured?: boolean;
}

async function handlePatchTestimonial(request: NextRequest, { params }: RouteParams) {
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

async function handleDeleteTestimonial(request: NextRequest, { params }: RouteParams) {
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

export const PATCH = withRateLimitParams(handlePatchTestimonial, 'contactFormApi');
export const DELETE = withRateLimitParams(handleDeleteTestimonial, 'contactFormApi');
