import { type NextRequest } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { applySecurityHeaders } from '@/lib/security-headers';
import { createServerLogger, castError } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { errorResponse, successResponse } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  const logger = createServerLogger('csrf-token');

  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('CSRF token rate limit exceeded', { ip: clientIp });
    return applySecurityHeaders(
      errorResponse('Too many requests. Please try again later.', 429)
    );
  }

  try {
    logger.info('CSRF token generation requested');
    // Bug fix: generateCsrfToken() is async (uses Web Crypto API)
    // Must await the promise to get the actual token
    const token = await generateCsrfToken();

    const response = successResponse({ token }, 'CSRF token generated successfully');

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error('CSRF token generation failed', castError(error));

    const response = errorResponse('Failed to generate CSRF token', 500);

    return applySecurityHeaders(response);
  }
}