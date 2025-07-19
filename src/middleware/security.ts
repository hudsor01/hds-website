import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';
import crypto from 'crypto';

// Rate limiter instance
const rateLimiter = new RateLimiter();

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// CORS configuration
const corsOptions = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'https://hudsondigitalsolutions.com',
    'http://localhost:3000', // Development
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Input validation patterns
const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Validate email
export function validateEmail(email: string): boolean {
  return validationPatterns.email.test(email);
}

// Validate phone number
export function validatePhone(phone: string): boolean {
  return validationPatterns.phone.test(phone);
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
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
  Object.entries(securityHeaders).forEach(([key, value]) => {
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

// Validate request body
export function validateRequestBody<T>(
  body: unknown,
  schema: Record<string, {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    pattern?: RegExp;
    min?: number;
    max?: number;
    validator?: (value: unknown) => boolean;
  }>
): { valid: boolean; errors: string[]; data?: T } {
  const errors: string[] = [];
  const validatedData: Record<string, unknown> = {};
  
  const bodyObj = body as Record<string, unknown>;
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = bodyObj[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip optional empty fields
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be a ${rules.type}`);
      continue;
    }
    
    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(`${field} has invalid format`);
      continue;
    }
    
    // Min/max validation
    if (rules.min !== undefined) {
      if (typeof value === 'string' && value.length < rules.min) {
        errors.push(`${field} must be at least ${rules.min} characters`);
        continue;
      }
      if (typeof value === 'number' && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
        continue;
      }
    }
    
    if (rules.max !== undefined) {
      if (typeof value === 'string' && value.length > rules.max) {
        errors.push(`${field} must be at most ${rules.max} characters`);
        continue;
      }
      if (typeof value === 'number' && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
        continue;
      }
    }
    
    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      errors.push(`${field} is invalid`);
      continue;
    }
    
    // Sanitize string values
    if (typeof value === 'string') {
      validatedData[field] = sanitizeInput(value);
    } else {
      validatedData[field] = value;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData as T : undefined,
  };
}