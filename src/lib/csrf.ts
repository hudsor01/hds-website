import type { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_TOKEN_COOKIE_NAME = "csrf-token";
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function setCSRFTokenCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CSRF_TOKEN_MAX_AGE,
    path: "/",
  });
}

export function getCSRFTokenFromCookie(
  request: NextRequest
): string | undefined {
  return request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;
}

export function verifyCSRFToken(
  tokenFromHeader: string,
  request: NextRequest
): boolean {
  const tokenFromCookie = getCSRFTokenFromCookie(request);

  if (!tokenFromCookie || !tokenFromHeader) {
    return false;
  }

  // Normalize tokens to ensure they're valid hex strings
  const normalizedCookie = tokenFromCookie.trim();
  const normalizedHeader = tokenFromHeader.trim();

  // Check if both are valid hex strings and same length
  if (
    !/^[a-f0-9]+$/i.test(normalizedCookie) ||
    !/^[a-f0-9]+$/i.test(normalizedHeader)
  ) {
    return false;
  }

  if (normalizedCookie.length !== normalizedHeader.length) {
    return false;
  }

  try {
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(normalizedCookie, "hex"),
      Buffer.from(normalizedHeader, "hex")
    );
  } catch {
    // If buffer creation fails, tokens are invalid
    return false;
  }
}

export function clearCSRFTokenCookie(response: NextResponse): void {
  response.cookies.delete(CSRF_TOKEN_COOKIE_NAME);
}

// Client-side CSRF token handling is now managed by React Query (useCSRFToken hook)
