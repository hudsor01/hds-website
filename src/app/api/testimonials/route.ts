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

import { type NextRequest } from 'next/server';
import { getAllTestimonials, getApprovedTestimonials } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { errorResponse, successResponse } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'readOnlyApi');
  if (!isAllowed) {
    logger.warn('Testimonials rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

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
      return successResponse({ testimonials });
    }

    // Public access: only approved testimonials
    logger.info('Public testimonials API accessed', {
      component: 'TestimonialsAPI',
      action: 'list-approved',
    });

    const testimonials = await getApprovedTestimonials();
    return successResponse({ testimonials });
  } catch (error) {
    logger.error('Error fetching testimonials', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialsAPI',
      action: 'list',
    });

    return errorResponse('Failed to fetch testimonials', 500);
  }
}