'use client'

/**
 * Per-mount client-generated defaults (random IDs, today's date, a fresh
 * invoice number) that stay hydration safe.
 *
 * The server renders `serverValue`; the client creates its value lazily on
 * the first snapshot read, so server HTML and the first client render
 * match. Each mount owns its own store, so navigating away and back
 * produces new defaults instead of reusing a module-level cache.
 * `regenerate()` replaces the value (used by "Clear Draft").
 */
import { useState, useSyncExternalStore } from 'react'

interface DefaultsStore<T> {
	subscribe: (onChange: () => void) => () => void
	getSnapshot: () => T
	regenerate: () => void
}

function createDefaultsStore<T>(create: () => T): DefaultsStore<T> {
	const listeners = new Set<() => void>()
	let current: { value: T } | null = null

	return {
		subscribe(onChange) {
			listeners.add(onChange)
			return () => {
				listeners.delete(onChange)
			}
		},
		getSnapshot() {
			if (current === null) {
				current = { value: create() }
			}
			return current.value
		},
		regenerate() {
			current = { value: create() }
			for (const listener of listeners) {
				listener()
			}
		}
	}
}

export function useClientDefaults<T>(
	create: () => T,
	serverValue: T
): [value: T, regenerate: () => void] {
	const [store] = useState(() => createDefaultsStore(create))
	const value = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		() => serverValue
	)
	return [value, store.regenerate]
}
