/**
 * Neon Auth API Handler
 * Handles all authentication API routes (sign-in, sign-up, sign-out, etc.)
 */
import { createNeonAuth } from '@neondatabase/auth/next/server';

const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
