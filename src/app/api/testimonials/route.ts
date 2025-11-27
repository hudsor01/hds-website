/**
 * API Route: Testimonials
 * GET /api/testimonials - List testimonials
 *   - Public: Returns only approved testimonials (no auth required)
 *   - Admin: Returns all testimonials including unapproved (requires Supabase session)
 *
 * Query params:
 *   - all=true: Request all testimonials (requires admin auth)
 *
 * SECURITY: Accessing unapproved testimonials requires admin authentication
 */

import { NextResponse } from 'next/server';
import { getAllTestimonials, getApprovedTestimonials } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestAll = url.searchParams.get('all') === 'true';

    // If requesting all testimonials (including unapproved), require admin auth
    if (requestAll) {
      const authError = await requireAdminAuth();
      if (authError) {
        return authError;
      }

      logger.info('Admin fetching all testimonials', {
        component: 'TestimonialsAPI',
        action: 'list-all',
      });

      const testimonials = await getAllTestimonials();
      return NextResponse.json({ testimonials });
    }

    // Public access: only approved testimonials
    logger.info('Public testimonials API accessed', {
      component: 'TestimonialsAPI',
      action: 'list-approved',
    });

    const testimonials = await getApprovedTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    logger.error('Error fetching testimonials', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialsAPI',
      action: 'list',
    });

    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}