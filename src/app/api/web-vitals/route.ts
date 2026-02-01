/**
 * Web Vitals API
 * Stores Core Web Vitals metrics for performance monitoring
 */

import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { db } from '@/lib/db';
import { webVitals } from '@/lib/schemas/analytics';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';


const WebVitalSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  navigation_type: z.string().optional(),
});

async function handleWebVitals(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = WebVitalSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const validatedData = validation.data;

    // Get user agent and URL
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || request.url;

    // Store web vitals data
    try {
      await db.insert(webVitals).values({
        name: validatedData.name,
        value: String(validatedData.value),
        rating: validatedData.rating || null,
        delta: String(validatedData.delta),
        navigationType: validatedData.navigation_type,
        url: referer,
        userAgent: userAgent || null,
      });
    } catch (dbError) {
      logger.error('Failed to store web vital:', dbError as Error);
      // Don't return error to client - fail silently
    }

    return successResponse();
  } catch (error) {
    logger.error('Web vitals error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const POST = withRateLimit(handleWebVitals, 'api');
