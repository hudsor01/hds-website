/**
 * Neon Auth API Handler
 * Handles all authentication API routes (sign-in, sign-up, sign-out, etc.)
 */
import { authApiHandler } from '@neondatabase/neon-js/auth/next/server';

export const { GET, POST } = authApiHandler();
