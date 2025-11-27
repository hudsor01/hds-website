import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server'

// Define expected CSP report fields for validation
const EXPECTED_CSP_FIELDS = [
  'csp-report',
  'blocked-uri',
  'violated-directive',
  'original-policy',
  'document-uri',
  'source-file',
  'line-number', "",
  'column-number',
  'effective-directive',
  'status-code',
  'script-sample'
];

export async function POST(request: Request) {
  try {
    // Rate limiting - cast Request to NextRequest for compatibility
    const clientIp = getClientIp(request as unknown as NextRequest);
    const identifier = `csp-report:${clientIp}`;

    const isAllowed = await unifiedRateLimiter.checkLimit(identifier, 'api');
    if (!isAllowed) {
      return new Response(null, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate that body is an object and contains expected CSP report structure
    if (!body || typeof body !== 'object') {
      return new NextResponse(null, { status: 400 });
    }

    // Check if it's a CSP report (contains csp-report key) or is a valid CSP report structure
    const isCspReport = 'csp-report' in body;
    if (!isCspReport) {
      // If not a CSP report, check if it has some expected fields
      const hasExpectedFields = Object.keys(body).some(key =>
        EXPECTED_CSP_FIELDS.some(expected => key.toLowerCase().includes(expected.replace('-', ''))
      ));

      if (!hasExpectedFields) {
        return new NextResponse(null, { status: 400 });
      }
    }

    // Sanitize and log only the needed fields
    const cspReport = isCspReport ? body['csp-report'] : body;
    const sanitizedReport = {
      blockedUri: cspReport['blocked-uri'],
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      originalPolicy: cspReport['original-policy'],
      documentUri: cspReport['document-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      statusCode: cspReport['status-code'],
      scriptSample: cspReport['script-sample'],
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    };

    // Log the sanitized CSP violation report
    logger.error('CSP Violation:', sanitizedReport);

    return new NextResponse(null, { status: 204 });
  } catch {
    // Return 400 for JSON parsing errors or other validation issues
    return new NextResponse(null, { status: 400 });
  }
}
