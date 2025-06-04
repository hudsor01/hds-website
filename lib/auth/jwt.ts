import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { env } from '@/lib/env';

// Next.js 15 JWT security patterns with proper configuration

// Validate JWT secret exists and meets minimum requirements
function validateJWTSecret(): Uint8Array {
  const secretValue = env.JWT_SECRET;
  
  if (!secretValue) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  if (secretValue.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
  
  // Ensure we're not using the default/fallback secret
  if (secretValue === 'your-secret-key' || secretValue === 'change-this-secret') {
    throw new Error('JWT_SECRET cannot use default/placeholder values in production');
  }
  
  return new TextEncoder().encode(secretValue);
}

// Secure JWT secret with validation
const secret = validateJWTSecret();

// JWT configuration following Next.js 15 security patterns
const JWT_CONFIG = {
  algorithm: 'HS256' as const,
  issuer: env.NEXT_PUBLIC_APP_URL || 'hudson-digital-solutions',
  audience: 'admin-panel',
  expirationTime: '2h', // Reduced from 7d to 2h for security
  clockTolerance: '30s', // Allow 30 seconds clock skew
};

export interface JWTPayload extends JoseJWTPayload {
  userId: string
  username: string
  role: 'admin' | 'user'
  sub: string // Standard JWT subject claim
  iss: string // Issuer
  aud: string // Audience
  iat: number // Issued at
  exp: number // Expires at
}

/**
 * Sign a JWT token with enhanced security (Next.js 15 pattern)
 */
export async function signJWT(payload: Omit<JWTPayload, 'sub' | 'iss' | 'aud' | 'iat' | 'exp'>): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    return await new SignJWT({
      ...payload,
      sub: payload.userId, // Standard JWT subject claim
    })
      .setProtectedHeader({ 
        alg: JWT_CONFIG.algorithm,
        typ: 'JWT',
      })
      .setIssuer(JWT_CONFIG.issuer)
      .setAudience(JWT_CONFIG.audience)
      .setIssuedAt(now)
      .setExpirationTime(JWT_CONFIG.expirationTime)
      .setNotBefore(now) // Token valid from now
      .sign(secret);
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify a JWT token with enhanced security validation (Next.js 15 pattern)
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_CONFIG.algorithm], // Restrict to specific algorithm
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      clockTolerance: JWT_CONFIG.clockTolerance,
    });
    
    // Validate payload structure and required claims
    if (
      !payload.sub ||
      !payload.userId ||
      !payload.username ||
      !payload.role ||
      !payload.iat ||
      !payload.exp
    ) {
      console.warn('JWT payload missing required claims');
      return null;
    }
    
    // Validate role is one of allowed values
    if (payload.role !== 'admin' && payload.role !== 'user') {
      console.warn('JWT payload contains invalid role');
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    // Log specific JWT errors for security monitoring
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        console.warn('JWT token expired');
      } else if (error.message.includes('invalid')) {
        console.warn('JWT token invalid');
      } else if (error.message.includes('audience')) {
        console.warn('JWT audience mismatch');
      } else if (error.message.includes('issuer')) {
        console.warn('JWT issuer mismatch');
      } else {
        console.warn('JWT verification failed:', error.message);
      }
    }
    return null;
  }
}

/**
 * Extract JWT token from Authorization header (Next.js 15 pattern)
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7).trim();
  
  // Basic token format validation
  if (!token || token.split('.').length !== 3) {
    return null;
  }
  
  return token;
}

/**
 * Extract JWT token from cookies with enhanced parsing (Next.js 15 pattern)
 */
export function extractTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }
  
  try {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
    
    // Support multiple cookie names for different auth tokens
    const token = cookies['admin-token'] || cookies['auth_token'] || cookies['session_token'];
    
    // Basic token format validation
    if (token && token.split('.').length === 3) {
      return token;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse auth cookie:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Validate JWT configuration at startup (Next.js 15 security pattern)
 */
export function validateJWTConfiguration(): boolean {
  try {
    validateJWTSecret();
    
    // Validate other configuration
    if (!JWT_CONFIG.issuer) {
      throw new Error('JWT issuer not configured');
    }
    
    if (!JWT_CONFIG.audience) {
      throw new Error('JWT audience not configured');
    }
    
    return true;
  } catch (error) {
    console.error('JWT configuration validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Get token expiration time for cookie setting
 */
export function getTokenExpirationTime(): Date {
  const expirationMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  return new Date(Date.now() + expirationMs);
}

/**
 * Create secure cookie options for token storage (Next.js 15 pattern)
 */
export function createSecureCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const,
    maxAge: 2 * 60 * 60, // 2 hours in seconds
    path: '/',
  };
}

// Export JWT configuration for other modules
export { JWT_CONFIG };