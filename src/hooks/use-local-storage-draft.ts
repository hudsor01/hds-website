'use client'

/**
 * Reusable localStorage-backed draft hook used by the document-generator
 * tool pages (invoice, proposal, contract). All three follow the same
 * pattern: a typed draft is JSON-encoded into a single localStorage key,
 * the client component reads it via `useSyncExternalStore` to stay
 * SSR/hydration safe, parse failures are logged at the `debug`/`warn`
 * level without crashing the page, and a clear button removes the key.
 *
 * The `label` param is the human-readable name that ends up in the
 * `Failed to parse {label} draft from localStorage` log line — it does
 * NOT affect storage layout, so changing the label later is safe.
 */
import { useSyncExternalStore } from 'react'
import { logger } from '@/lib/logger'

const noopUnsubscribe = () => {}

function subscribeToStorage(callback: () => void): () => void {
	if (typeof window === 'undefined') {
		return noopUnsubscribe
	}
	window.addEventListener('storage', callback)
	return () => window.removeEventListener('storage', callback)
}

function readJsonAt<T>(key: string, label: string): T | null {
	if (typeof window === 'undefined') {
		return null
	}
	try {
		const raw = window.localStorage.getItem(key)
		if (raw) {
			return JSON.parse(raw) as T
		}
	} catch (error) {
		logger.debug(`Failed to parse ${label} draft from localStorage`, {
			error: error instanceof Error ? error.message : String(error)
		})
	}
	return null
}

/**
 * Subscribe to a localStorage-backed draft and re-render on cross-tab
 * `storage` events. Always returns `null` on the server snapshot so
 * useSyncExternalStore stays hydration-safe.
 */
export function useLocalStorageDraft<T>(key: string, label: string): T | null {
	return useSyncExternalStore(
		subscribeToStorage,
		() => readJsonAt<T>(key, label),
		() => null
	)
}

/**
 * Write a draft to localStorage. The caller is responsible for choosing
 * when to persist (usually a manual "Save draft" button); this helper
 * only owns the JSON-encode + null-window guard.
 */
export function writeLocalStorageDraft<T>(key: string, value: T): void {
	if (typeof window === 'undefined') {
		return
	}
	window.localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Remove a draft from localStorage. Returns silently when the key
 * does not exist; the underlying API is a no-op in that case.
 */
export function clearLocalStorageDraft(key: string): void {
	if (typeof window === 'undefined') {
		return
	}
	window.localStorage.removeItem(key)
}
