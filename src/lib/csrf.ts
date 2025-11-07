
import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export function generateCsrfToken(): string {
  const expiry = Date.now() + TOKEN_EXPIRY;
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${token}.${expiry}`)
    .digest('hex');

  return `${token}.${expiry}.${signature}`;
}

export function validateCsrfToken(token: string): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [tokenPart, expiry, signature] = parts;
  if (!tokenPart || !expiry || !signature) {
    return false;
  }

  if (Date.now() > parseInt(expiry, 10)) {
    return false;
  }

  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(`${tokenPart}.${expiry}`)
    .digest('hex');

  return signature === expectedSignature;
}

export async function getCsrfTokenFromRequest(request: Request): Promise<string | null> {
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  try {
    const formData = await request.formData();
    const bodyToken = formData.get('csrf_token') as string | null;
    if (bodyToken) {
      return bodyToken;
    }
  } catch {
    // Ignore errors if the request body is not form data
  }

  return null;
}

export async function validateCsrfForMutation(request: Request): Promise<boolean> {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const token = await getCsrfTokenFromRequest(request);
  if (!token) {
    return false;
  }

  return validateCsrfToken(token);
}
