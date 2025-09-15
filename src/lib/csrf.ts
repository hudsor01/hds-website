import { createHmac, randomBytes } from 'crypto';

// CSRF token generation and validation
// Using built-in crypto module - no external dependencies needed

const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Store tokens in memory (for single instance)
// In production with multiple instances, use Redis or database
const tokenStore = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenStore.entries()) {
    if (value.expires < now) {
      tokenStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function generateCsrfToken(sessionId?: string): string {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  const expires = Date.now() + TOKEN_EXPIRY;

  // Create a signed token
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');

  const signedToken = `${token}.${signature}`;

  // Store token with session ID if provided
  if (sessionId) {
    tokenStore.set(sessionId, { token: signedToken, expires });
  }

  return signedToken;
}

export function validateCsrfToken(token: string, sessionId?: string): boolean {
  if (!token) {return false;}

  // Check token format
  const parts = token.split('.');
  if (parts.length !== 2) {return false;}

  const [tokenPart, signature] = parts;
  if (!tokenPart || !signature) {return false;}

  // Verify signature
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(tokenPart)
    .digest('hex');

  if (signature !== expectedSignature) {return false;}

  // If session ID provided, check stored token
  if (sessionId) {
    const stored = tokenStore.get(sessionId);
    if (!stored) {return false;}
    if (stored.token !== token) {return false;}
    if (stored.expires < Date.now()) {
      tokenStore.delete(sessionId);
      return false;
    }
  }

  return true;
}

// Get CSRF token from request headers or body
export function getCsrfTokenFromRequest(request: Request): string | null {
  // Check header first (preferred)
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {return headerToken;}

  // For form submissions, would need to parse body
  // This is handled in individual route handlers
  return null;
}

// Middleware helper to validate CSRF for mutations
export async function validateCsrfForMutation(request: Request): Promise<boolean> {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const token = getCsrfTokenFromRequest(request);
  if (!token) {return false;}

  return validateCsrfToken(token);
}