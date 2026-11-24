'use client'

/**
 * localStorage-backed drafts for the document generators (invoice,
 * proposal, contract).
 *
 * Each tool creates one store at module level with its storage key and a
 * Zod schema. The component reads it with `useLocalStorageDraft(store)`,
 * which wraps `useSyncExternalStore` for SSR/hydration safety.
 *
 * useSyncExternalStore requires getSnapshot to return the SAME value while
 * the store is unchanged; a fresh `JSON.parse` object on every call makes
 * React re-render forever ("Maximum update depth exceeded"). The store
 * therefore caches the parsed draft against the raw string and only parses
 * again when the string changes. The server snapshot is a constant null.
 *
 * Parsed drafts go through `schema.safeParse`: an invalid or outdated
 * draft reads as null (no draft) instead of being cast to the type.
 */
import { useSyncExternalStore } from 'react'
import type { z } from 'zod'
import { logger } from '@/lib/logger'

export interface LocalStorageDraftStore<T> {
	readonly key: string
	subscribe: (onChange: () => void) => () => void
	getSnapshot: () => T | null
	getServerSnapshot: () => T | null
	/** Persist a draft. Returns false when the browser refuses the write. */
	write: (value: T) => boolean
	/** Remove the draft. */
	clear: () => void
}

const getNullSnapshot = (): null => null

function readRaw(key: string, label: string): string | null {
	try {
		return window.localStorage.getItem(key)
	} catch (error) {
		logger.warn(`Could not read the ${label} draft from localStorage`, error)
		return null
	}
}

function parseDraft<T>(
	raw: string | null,
	schema: z.ZodType<T>,
	label: string
): T | null {
	if (!raw) {
		return null
	}
	let json: unknown
	try {
		json = JSON.parse(raw)
	} catch (error) {
		logger.debug(`Failed to parse ${label} draft from localStorage`, error)
		return null
	}
	const result = schema.safeParse(json)
	if (!result.success) {
		logger.debug(`Discarded an invalid ${label} draft from localStorage`, {
			issues: result.error.issues.length
		})
		return null
	}
	return result.data
}

/**
 * Create the draft store for one tool. Call once at module level so the
 * snapshot cache lives as long as the page.
 */
export function createLocalStorageDraft<T>(
	key: string,
	schema: z.ZodType<T>,
	label: string
): LocalStorageDraftStore<T> {
	const listeners = new Set<() => void>()
	let cache: { raw: string | null; value: T | null } | null = null

	const notify = () => {
		for (const listener of listeners) {
			listener()
		}
	}

	const onStorage = (event: StorageEvent) => {
		// key is null when another tab calls localStorage.clear().
		if (event.key === key || event.key === null) {
			notify()
		}
	}

	return {
		key,
		subscribe(onChange) {
			listeners.add(onChange)
			if (listeners.size === 1) {
				window.addEventListener('storage', onStorage)
			}
			return () => {
				listeners.delete(onChange)
				if (listeners.size === 0) {
					window.removeEventListener('storage', onStorage)
				}
			}
		},
		getSnapshot() {
			const raw = readRaw(key, label)
			if (cache && cache.raw === raw) {
				return cache.value
			}
			const value = parseDraft(raw, schema, label)
			cache = { raw, value }
			return value
		},
		getServerSnapshot: getNullSnapshot,
		write(value) {
			try {
				window.localStorage.setItem(key, JSON.stringify(value))
			} catch (error) {
				logger.warn(`Could not save the ${label} draft to localStorage`, error)
				return false
			}
			notify()
			return true
		},
		clear() {
			try {
				window.localStorage.removeItem(key)
			} catch (error) {
				logger.warn(
					`Could not clear the ${label} draft from localStorage`,
					error
				)
			}
			notify()
		}
	}
}

/**
 * Subscribe to a draft store. Returns null on the server, while no draft
 * exists or when the stored draft fails validation.
 */
export function useLocalStorageDraft<T>(
	store: LocalStorageDraftStore<T>
): T | null {
	return useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot
	)
}
