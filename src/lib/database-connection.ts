/**
 * Database Connection Pool Management
 * Addresses race conditions in concurrent API route requests
 */

import type { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';

// Singleton pattern for database connections
class SupabaseConnectionPool {
  private static instance: SupabaseConnectionPool;
  private client: ReturnType<typeof createClient<Database>> | null = null;
  private clientPromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;

  private constructor() {}

  static getInstance(): SupabaseConnectionPool {
    if (!SupabaseConnectionPool.instance) {
      SupabaseConnectionPool.instance = new SupabaseConnectionPool();
    }
    return SupabaseConnectionPool.instance;
  }

  async getClient(): Promise<ReturnType<typeof createClient<Database>>> {
    // Return existing client if available
    if (this.client) {
      return this.client;
    }

    // Return pending promise if one exists (prevents multiple concurrent clients)
    if (this.clientPromise) {
      return this.clientPromise;
    }

    // Create new client with proper configuration
    this.clientPromise = this.createClient();
    this.client = await this.clientPromise;
    return this.client;
  }

  private async createClient(): Promise<ReturnType<typeof createClient<Database>>> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'hds-website/1.0'
        }
      }
    });
  }

  // Reset client for testing purposes
  reset(): void {
    this.client = null;
    this.clientPromise = null;
  }
}

// Export singleton instance
export const connectionPool = SupabaseConnectionPool.getInstance();

// Utility function for API routes
export async function getSupabaseClient() {
  return await connectionPool.getClient();
}

// Request context for tracking concurrent requests
interface RequestContext {
  id: string;
  startTime: number;
  userId?: string;
}

class RequestTracker {
  private requests = new Map<string, RequestContext>();

  startRequest(context: Omit<RequestContext, 'startTime'>): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.requests.set(id, {
      ...context,
      startTime: performance.now()
    });
    return id;
  }

  endRequest(id: string): RequestContext | undefined {
    const context = this.requests.get(id);
    if (context) {
      const duration = performance.now() - context.startTime;
      console.warn(`Request ${id} completed in ${duration.toFixed(2)}ms`);
      this.requests.delete(id);
    }
    return context;
  }

  // Get active request count (useful for monitoring)
  getActiveCount(): number {
    return this.requests.size;
  }
}

export const requestTracker = new RequestTracker();

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay.toFixed(0)}ms:`, lastError.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await getSupabaseClient();
    const { error } = await client.from('calculator_leads').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
