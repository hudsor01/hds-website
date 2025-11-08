/**
 * Fetch utilities with timeout support
 * Per MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
 *
 * All fetch operations should have timeouts to prevent indefinite hanging
 * and resource exhaustion
 */

/**
 * Fetch with automatic timeout using AbortController
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise<Response>
 * @throws Error if timeout occurs or fetch fails
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Fetch JSON with timeout
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise<T>
 */
export async function fetchJSON<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const response = await fetchWithTimeout(url, options, timeoutMs);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
