/**
 * Web Vitals API
 * Stores Core Web Vitals metrics for performance monitoring
 */

import { logger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { supabaseAdmin } from "@/lib/supabase";
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

export async function POST(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Web vitals rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

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

    // Insert web vital
    const webVitalData = {
      metric_type: validatedData.name,
      value: validatedData.value,
      rating: validatedData.rating || null,
      page_path: referer,
      user_agent: userAgent || null,
      device_type: null,
      connection_type: null,
      session_id: null,
    };

    // Store web vitals data
    const { error } = await supabaseAdmin
      .from('web_vitals')
      .insert(webVitalData);

    if (error) {
      logger.error('Failed to store web vital:', error as Error);
      // Don't return error to client - fail silently
    }

    return successResponse();
  } catch (error) {
    logger.error('Web vitals error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}
