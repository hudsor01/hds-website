/**
 * API Route: Individual Testimonial Request
 * DELETE /api/testimonials/requests/[id] - Delete testimonial request
 *
 * SECURITY: This endpoint requires admin authentication via Supabase session
 */

import { NextResponse } from 'next/server';
import { deleteTestimonialRequest } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    const success = await deleteTestimonialRequest(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 500 }
      );
    }

    logger.info('Testimonial request deleted', {
      component: 'TestimonialRequestAPI',
      action: 'delete',
      requestId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting testimonial request', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestAPI',
      action: 'delete',
    });

    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
