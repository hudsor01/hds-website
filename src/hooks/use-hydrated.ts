/**
 * useHydrated Hook
 * React 18+ compliant way to detect client-side hydration without setState in useEffect.
 * Uses useSyncExternalStore for proper SSR/hydration handling.
 */

import { useSyncExternalStore } from 'react';

// No-op subscribe function - we don't need to subscribe to anything
// The value never changes after initial hydration
const emptySubscribe = () => () => {};

/**
 * Returns true when running on the client after hydration, false during SSR.
 * This is the React 18+ recommended pattern for detecting client-side rendering.
 *
 * @example
 * const isHydrated = useHydrated();
 * if (isHydrated) {
 *   // Safe to access browser APIs like localStorage, crypto, etc.
 * }
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client snapshot - always true
    () => false // Server snapshot - always false
  );
}
