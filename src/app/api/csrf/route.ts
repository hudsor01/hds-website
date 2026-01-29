import { type NextRequest } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { applySecurityHeaders } from '@/lib/security-headers';
import { createServerLogger, castError } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { errorResponse, successResponse } from '@/lib/api/responses';

async function handleCsrfToken(_request: NextRequest) {
  const logger = createServerLogger('csrf-token');

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

export const GET = withRateLimit(handleCsrfToken, 'api');