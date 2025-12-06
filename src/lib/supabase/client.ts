import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publicKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createBrowserClient(
    supabaseUrl,
    publicKey
  )
}
