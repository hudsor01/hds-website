import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';
import { PRODUCTION_SECURITY_HEADERS } from '@/lib/security-headers';

// Rate limiter instance
const rateLimiter = new RateLimiter();

// CORS configuration
const corsOptions = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'https://hudsondigitalsolutions.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};


// Comprehensive input sanitization to prevent code injection
export function sanitizeInput(input: string): string {
  return input
    // Remove HTML/XML tags
    .replace(/<[^>]*>/g, '')
    // Remove JavaScript protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove script-related keywords
    .replace(/script\b/gi, '')
    .replace(/iframe\b/gi, '')
    .replace(/object\b/gi, '')
    .replace(/embed\b/gi, '')
    .replace(/form\b/gi, '')
    // Remove SQL injection patterns
    .replace(/(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi, ' ')
    .replace(/(\s|^)(or|and)\s+[\d\w'"]+\s*[=<>]/gi, ' ')
    .replace(/['"]\s*(or|and)\s*['"]/gi, '')
    // Remove common XSS patterns
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/setTimeout\s*\(/gi, '')
    .replace(/setInterval\s*\(/gi, '')
    // Remove special characters that could be used for injection
    .replace(/[^\w\s@.\-,!?()'"]/g, '')
    .trim();
}


// Detect potential injection attempts for logging/blocking
export function detectInjectionAttempt(input: string): { 
  isInjection: boolean; 
  type: string[]; 
  confidence: number; 
} {
  const injectionPatterns = [
    { name: 'XSS', pattern: /<script|javascript:|on\w+\s*=|eval\s*\(|expression\s*\(/gi },
    { name: 'SQL', pattern: /(union|select|insert|update|delete|drop)\s/gi },
    { name: 'NoSQL', pattern: /\$where|\$ne|\$gt|\$lt|\$regex/gi },
    { name: 'Command', pattern: /[;&|`$(){}[\]\\]/g },
    { name: 'Path Traversal', pattern: /\.\.\/|\.\.\\|\.\.\%2f/gi },
    { name: 'LDAP', pattern: /[()&|!]/g },
    { name: 'XML', pattern: /<!entity|<!doctype|<!\[cdata/gi }
  ];

  const detectedTypes: string[] = [];
  let totalMatches = 0;

  injectionPatterns.forEach(({ name, pattern }) => {
    const matches = input.match(pattern);
    if (matches && matches.length > 0) {
      detectedTypes.push(name);
      totalMatches += matches.length;
    }
  });

  const confidence = Math.min(totalMatches * 0.2, 1.0);
  
  return {
    isInjection: detectedTypes.length > 0,
    type: detectedTypes,
    confidence
  };
}

// Check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return corsOptions.allowedOrigins.includes(origin);
}

// Apply CORS headers
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');
  
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  response.headers.set(
    'Access-Control-Allow-Methods',
    corsOptions.allowedMethods.join(', ')
  );
  
  response.headers.set(
    'Access-Control-Allow-Headers',
    corsOptions.allowedHeaders.join(', ')
  );
  
  response.headers.set(
    'Access-Control-Max-Age',
    corsOptions.maxAge.toString()
  );
  
  return response;
}

// Apply security headers
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(PRODUCTION_SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Rate limiting check
export async function checkRateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<boolean> {
  const identifier = 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  return rateLimiter.checkLimit(identifier, limit, windowMs);
}

// Main security middleware
export async function securityMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Check rate limiting
  const rateLimitOk = await checkRateLimit(request);
  if (!rateLimitOk) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    applyCORSHeaders(request, response);
    applySecurityHeaders(response);
    return response;
  }
  
  // Process the request
  const response = await handler(request);
  
  // Apply security headers
  applyCORSHeaders(request, response);
  applySecurityHeaders(response);
  
  return response;
}