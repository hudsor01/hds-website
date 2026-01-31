/**
 * Neon Auth Client
 * Browser-side authentication client for client components
 */
'use client';

import { createAuthClient } from '@neondatabase/neon-js/auth/next';

export const authClient = createAuthClient();
