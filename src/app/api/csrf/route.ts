import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { applySecurityHeaders } from '@/lib/security-headers';
import { createServerLogger, castError } from '@/lib/logger';

export async function GET() {
  const logger = createServerLogger('csrf-token');

  try {
    logger.info('CSRF token generation requested');
    const token = generateCsrfToken();

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