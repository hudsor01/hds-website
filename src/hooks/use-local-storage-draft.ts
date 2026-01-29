/**
 * useLocalStorageDraft Hook
 * Provides a type-safe way to persist and sync draft data in localStorage
 * Uses useSyncExternalStore for SSR-safe hydration
 */

import { useSyncExternalStore, useCallback } from 'react';
import { logger } from '@/lib/logger';

/**
 * Subscribe to localStorage changes for cross-tab sync
 */
function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

/**
 * Creates a snapshot getter for localStorage with type parsing
 */
function createDraftGetter<T>(key: string): () => T | null {
  return (): T | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch (error) {
      logger.debug(`Failed to parse ${key} from localStorage`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  };
}

/**
 * Server snapshot always returns null (no localStorage on server)
 */
function getServerSnapshot(): null {
  return null;
}

interface UseLocalStorageDraftReturn<T> {
  /** The current draft data from localStorage, or null if none */
  savedDraft: T | null;
  /** Whether a draft exists */
  hasDraft: boolean;
  /** Save data to localStorage */
  saveDraft: (data: T) => void;
  /** Clear the draft from localStorage */
  clearDraft: () => void;
}

/**
 * Hook for managing draft data in localStorage with SSR-safe hydration
 *
 * @param storageKey - The localStorage key to use
 * @returns Object with savedDraft, hasDraft, saveDraft, and clearDraft
 *
 * @example
 * const { savedDraft, hasDraft, saveDraft, clearDraft } = useLocalStorageDraft<InvoiceData>('invoice-draft');
 */
export function useLocalStorageDraft<T>(storageKey: string): UseLocalStorageDraftReturn<T> {
  const savedDraft = useSyncExternalStore(
    subscribeToStorage,
    createDraftGetter<T>(storageKey),
    getServerSnapshot
  );

  const saveDraft = useCallback((data: T) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    // Dispatch storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    // Dispatch storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
  }, [storageKey]);

  return {
    savedDraft,
    hasDraft: savedDraft !== null,
    saveDraft,
    clearDraft,
  };
}
