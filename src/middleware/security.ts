import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';
import type { ValidationSchema, ValidationResult } from '@/types/validation';

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
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// Validate email
export function validateEmail(email: string): boolean {
  return validationPatterns.email.test(email);
}

// Validate phone number
export function validatePhone(phone: string): boolean {
  return validationPatterns.phone.test(phone);
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
  schema: ValidationSchema
): ValidationResult<T> {
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