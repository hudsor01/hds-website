/**
 * Supabase Client Singletons
 *
 * This file provides centralized Supabase clients for server-side operations:
 * - supabase: Public client for reading public data (testimonials, case studies, etc.)
 * - supabaseAdmin: Admin client with service role for privileged operations
 *
 * IMPORTANT:
 * - supabase uses SUPABASE_PUBLISHABLE_KEY (subject to RLS policies)
 * - supabaseAdmin uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
 * - supabaseAdmin should ONLY be used in secure server contexts (API routes, Server Actions)
 *
 * For authenticated user operations, use:
 * - Server Components: import { createClient } from '@/lib/supabase/server'
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from '@/env'

let _supabase: ReturnType<typeof createSupabaseClient<Database>> | null = null
let _supabaseAdmin: ReturnType<typeof createSupabaseClient<Database>> | null = null

/**
 * Get public Supabase client for reading public data
 * Uses anon/publishable key - subject to Row Level Security policies
 *
 * Use cases:
 * - Fetching testimonials
 * - Reading case studies
 * - Public portfolio items
 * - Any data marked as publicly readable in Supabase
 */
function getSupabaseClient() {
  if (!_supabase) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL
    const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!url || !key) {
      throw new Error('Supabase URL and Publishable Key are required')
    }

    _supabase = createSupabaseClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabase
}

/**
 * Get admin Supabase client with service role privileges
 * Uses SERVICE_ROLE_KEY - bypasses Row Level Security policies
 *
 * SECURITY WARNING:
 * - This client has FULL DATABASE ACCESS
 * - NEVER expose this client to the browser
 * - ONLY use in secure server contexts (API routes, Server Actions, background jobs)
 *
 * Use cases:
 * - Admin operations (creating users, modifying protected data)
 * - Background jobs (analytics processing, scheduled emails)
 * - API routes that need to bypass RLS
 * - Webhook handlers
 */
function getSupabaseAdminClient() {
  if (!_supabaseAdmin) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL
    const key = env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Supabase URL and Service Role Key are required')
    }

    _supabaseAdmin = createSupabaseClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

/**
 * Public Supabase client for reading public data
 * Lazy-initialized on first access to avoid build-time errors
 */
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient<Database>>, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createSupabaseClient<Database>>]
  },
})

/**
 * Admin Supabase client with service role privileges
 * Lazy-initialized on first access to avoid build-time errors
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseClient<Database>>, {
  get(_, prop) {
    return getSupabaseAdminClient()[prop as keyof ReturnType<typeof createSupabaseClient<Database>>]
  },
})
