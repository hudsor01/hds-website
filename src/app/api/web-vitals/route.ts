/**
 * Web Vitals API
 * Stores Core Web Vitals metrics for performance monitoring
 */

import { logger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import type { Database } from '@/types/database-local';
// import type { WebVitalsInsert } from '@/types/supabase-helpers';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_LOCAL_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.error('Supabase environment variables are missing');
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = WebVitalSchema.parse(body);

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
    const { error } = await supabase
      .from('web_vitals')
      .insert(webVitalData);

    if (error) {
      logger.error('Failed to store web vital:', error as Error);
      // Don't return error to client - fail silently
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Web vitals error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
