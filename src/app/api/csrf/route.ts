import { type NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { applySecurityHeaders } from '@/lib/security-headers';
import { createServerLogger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors'
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const logger = createServerLogger('csrf-token');

  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('CSRF token rate limit exceeded', { ip: clientIp });
    return applySecurityHeaders(
      NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    );
  }

  try {
    logger.info('CSRF token generation requested');
    // Bug fix: generateCsrfToken() is async (uses Web Crypto API)
    // Must await the promise to get the actual token
    const token = await generateCsrfToken();

    const response = NextResponse.json({
      token,
      message: 'CSRF token generated successfully'
    });

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error('CSRF token generation failed', castError(error));

    const response = NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}
