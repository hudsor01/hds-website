/**
 * Better Auth browser SDK.
 *
 * Imported by client components (sign-in form, sign-up form, account menu,
 * sign-out button). Points at the same origin the server is serving via the
 * client-side base URL exposed by T3 env.
 *
 * Do NOT add a server-only guard here; this file is intentionally
 * client-safe. Do NOT import from `./index` (the server config) - that
 * module is server-only and pulling it in would poison the client bundle.
 */
import { createAuthClient } from 'better-auth/react'
import { env } from '@/env'

const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_BASE_URL
})

export const { signIn, signUp, signOut } = authClient
