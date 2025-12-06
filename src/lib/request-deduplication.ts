/**
 * Request Deduplication System
 * Prevents race conditions in form submissions and API calls
 */

interface RequestEntry {
  id: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'error';
  result?: unknown;
  error?: Error;
  abortController?: AbortController;
}

// In-memory store for request deduplication
class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private requests = new Map<string, RequestEntry>();
  private maxAge = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  /**
   * Generate a unique key for a request
   */
  private generateKey(request: {
    method: string;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): string {
    const bodyHash = request.body ? JSON.stringify(request.body) : '';
    const headers = request.headers || {};
    const headersStr = Object.keys(headers)
      .filter(key => ['authorization', 'content-type'].includes(key.toLowerCase()))
      .sort()
      .map(key => `${key}:${headers[key]}`)
      .join('|');

    return `${request.method}:${request.url}:${bodyHash}:${headersStr}`;
  }

  /**
   * Check if a similar request is already pending
   */
  isDuplicate(request: {
    method: string;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): string | null {
    const key = this.generateKey(request);
    const entry = this.requests.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > this.maxAge;

    if (isExpired) {
      this.requests.delete(key);
      return null;
    }

    if (entry.status === 'pending') {
      return entry.id;
    }

    if (entry.status === 'completed') {
      this.requests.delete(key);
      return null;
    }

    // Error entries can be retried after expiration
    if (entry.status === 'error') {
      this.requests.delete(key);
      return null;
    }

    return null;
  }

  /**
   * Register a new request
   */
  register(request: {
    method: string;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): string {
    const id = `dup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const key = this.generateKey(request);

    const entry: RequestEntry = {
      id,
      timestamp: Date.now(),
      status: 'pending',
      abortController: new AbortController()
    };

    this.requests.set(key, entry);
    this.cleanup();
    return id;
  }

  /**
   * Mark a request as completed
   */
  complete(requestKey: string, result: unknown): void {
    const entry = this.requests.get(requestKey);
    if (entry) {
      entry.status = 'completed';
      entry.result = result;
    }
  }

  /**
   * Mark a request as error
   */
  error(requestKey: string, error: Error): void {
    const entry = this.requests.get(requestKey);
    if (entry) {
      entry.status = 'error';
      entry.error = error;
    }
  }

  /**
   * Get request status
   */
  getStatus(requestKey: string): 'pending' | 'completed' | 'error' | null {
    const entry = this.requests.get(requestKey);
    return entry?.status || null;
  }

  /**
   * Get request result
   */
  getResult(requestKey: string): unknown | undefined {
    const entry = this.requests.get(requestKey);
    return entry?.result;
  }

  /**
   * Get request error
   */
  getError(requestKey: string): Error | undefined {
    const entry = this.requests.get(requestKey);
    return entry?.error;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Clear all requests (useful for testing)
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    this.cleanup();
    let count = 0;
    for (const entry of this.requests.values()) {
      if (entry.status === 'pending') {
        count++;
      }
    }
    return count;
  }
}

export const requestDeduplicator = RequestDeduplicator.getInstance();

/**
 * Decorator for fetch requests to prevent duplicates
 */
export async function deduplicatedFetch(
  input: RequestInfo | URL,
  init: RequestInit & { body?: unknown } = {},
  options?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init.method || 'GET';
  const body = init.body;

  const request = {
    method,
    url,
    body: body ? JSON.parse(body as string) : undefined,
    headers: Object.fromEntries(new Headers(init.headers || {}).entries())
  };

  // Check for duplicate request
  const duplicateKey = requestDeduplicator.isDuplicate(request);
  if (duplicateKey) {
    console.warn('Duplicate request detected, waiting for result...');

    // Wait for the original request to complete
    const startTime = Date.now();
    const timeout = options?.timeout || 30000; // 30 second default timeout

    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const status = requestDeduplicator.getStatus(duplicateKey);

        if (status === 'completed') {
          const result = requestDeduplicator.getResult(duplicateKey);
          resolve(result as Response);
        } else if (status === 'error') {
          const error = requestDeduplicator.getError(duplicateKey);
          reject(error || new Error('Duplicate request failed'));
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Duplicate request timeout'));
        } else {
          setTimeout(checkStatus, 100); // Check every 100ms
        }
      };

      checkStatus();
    });
  }

  // Register new request
  const requestKey = requestDeduplicator.register(request);

  try {
    // Add timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 30000);

    const mergedInit: RequestInit = {
      ...init,
      signal: controller.signal,
      headers: {
        ...init.headers,
        'X-Request-ID': requestKey
      }
    };

    const response = await fetch(input, mergedInit);
    clearTimeout(timeoutId);

    if (response.ok) {
      requestDeduplicator.complete(requestKey, response);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    requestDeduplicator.error(requestKey, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Hook for client-side request deduplication
 */
export function useRequestDeduplication() {
  const deduplicator = requestDeduplicator;

  return {
    isRequestPending: (key: string) => {
      const entry = [...deduplicator['requests'].values()].find(e => e.id === key);
      return entry?.status === 'pending';
    },

    clearDuplicate: (key: string) => {
      // Find the entry by key and remove it
      for (const [k, v] of deduplicator['requests'].entries()) {
        if (v.id === key) {
          deduplicator['requests'].delete(k);
          break;
        }
      }
    },

    getActiveCount: () => deduplicator.getActiveCount()
  };
}

/**
 * Utility for generating unique request keys
 */
export function generateRequestKey(operation: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${operation}:${sortedParams}`;
}
