/**
 * Clerk + Supabase Integration Wrapper
 * 
 * Provides unified authentication using Clerk for auth UI/management 
 * and Supabase for database operations with proper JWT forwarding
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Supabase client with Clerk JWT integration
export function createClerkSupabaseClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL and Service Role Key are required for Clerk integration');
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// Server-side authenticated Supabase client
export async function createAuthenticatedSupabaseClient() {
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  
  if (!token) {
    throw new Error('No Clerk session found');
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  return supabase;
}

// Client-side Supabase client with Clerk integration
export function createClientSupabaseClient(supabaseAccessToken?: string) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: supabaseAccessToken
        ? {
            headers: {
              Authorization: `Bearer ${supabaseAccessToken}`,
            },
          }
        : undefined,
    },
  );
}

// Sync Clerk user to Supabase
export async function syncClerkUserToSupabase() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const supabase = createClerkSupabaseClient();

    // Upsert user data to Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        image_url: user.imageUrl,
        last_sign_in_at: new Date(user.lastSignInAt || Date.now()).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in syncClerkUserToSupabase:', error);
    return null;
  }
}

// Get current user from Supabase via Clerk
export async function getCurrentSupabaseUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentSupabaseUser:', error);
    return null;
  }
}

// Types for Clerk + Supabase user
export interface ClerkSupabaseUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  image_url: string | null
  last_sign_in_at: string
  created_at: string
  updated_at: string
  // Add any additional Supabase user fields here
}

// Hook for client-side Clerk + Supabase integration
export function useClerkSupabase() {
  return {
    createClientSupabaseClient,
    syncUser: syncClerkUserToSupabase,
    getCurrentUser: getCurrentSupabaseUser,
  };
}

// Middleware helper for protected routes
export async function requireAuth() {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error('Unauthorized - Please sign in');
  }

  return userId;
}

// Database operation helpers with Clerk auth
export async function executeWithAuth<T>(
  operation: (supabase: ReturnType<typeof createAuthenticatedSupabaseClient>) => Promise<T>,
): Promise<T> {
  await requireAuth();
  const supabase = await createAuthenticatedSupabaseClient();
  return operation(supabase);
}