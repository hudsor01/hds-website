/**
 * API Route: Individual Testimonial Request
 * DELETE /api/testimonials/requests/[id] - Delete testimonial request
 */

import { type NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { deleteTestimonialRequest } from '@/lib/testimonials';
import { logger } from '@/lib/logger';
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleTestimonialRequestDelete(_request: NextRequest, { params }: RouteParams) {
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

export const DELETE = withRateLimitParams(handleTestimonialRequestDelete, 'contactFormApi');
