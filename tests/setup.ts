// Bun test setup file for React 19.2 compatibility
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, beforeEach, mock } from 'bun:test'

// CRITICAL: Mock @/env BEFORE any other imports that depend on it
// This prevents the real env module from validating environment variables
// which would fail in CI without proper secrets set
// Store the mock function so we can re-apply it after mock.restore()
// A single shared `env` object reference so any module that captured it via
// `import { env } from '@/env'` sees mutations made by per-test setup. The
// admin-auth tests rely on this to flip ADMIN_SECRET on and off between cases
// — re-registering `@/env` with a new env object would break already-resolved
// imports in CI where admin.ts loads before the describe-level beforeEach.
const TEST_ENV = {
	NODE_ENV: 'test',
	CSRF_SECRET: 'test-csrf-secret-for-testing-only-32chars',
	RESEND_API_KEY: 'test-resend-key',
	NEXT_PUBLIC_GA_MEASUREMENT_ID: 'test-ga-id',
	npm_package_version: '1.0.0',
	BASE_URL: 'http://localhost:3000',
	NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
	ADMIN_SECRET: 'test-admin-secret-that-is-32-chars!!',
	CRON_SECRET: 'test-cron-secret-that-is-32-chars!!'
} as Record<string, unknown>

function setupEnvMock() {
	mock.module('@/env', () => ({ env: TEST_ENV }))
}
// Exposed on globalThis so individual test files can mutate the live env
// without re-registering the module mock (which would unbind any prior
// captured `import { env }` references).
;(globalThis as { __TEST_ENV?: Record<string, unknown> }).__TEST_ENV = TEST_ENV

// Apply env mock immediately on setup
setupEnvMock()

// Force-load admin.ts at preload time so its ESM live binding to `env`
// captures TEST_ENV before any test file can re-register `@/env` with a
// fresh env object. Bun's mock.module() does not re-evaluate already-loaded
// consumers (oven-sh/bun#7823), so without this preload, admin.ts would
// bind to whichever test file happened to mock @/env first when a route
// transitively imported it — leading to flaky admin-auth tests in CI.
require('@/lib/auth/admin')

// Capture the genuine `@/lib/db` export (the createMockDb proxy, since TEST_ENV
// omits POSTGRES_URL) at preload time, before any test file registers
// `mock.module('@/lib/db', ...)`. Several suites (blog, showcase, api-*) stub
// `@/lib/db`, and Bun's mock.module() registrations persist for the whole run
// and are NOT cleared by mock.restore() (oven-sh/bun#7823) — so a later
// `import { db } from '@/lib/db'` can never reach the real module once a
// sibling has mocked it. Exposing the real reference here lets db.test.ts
// assert the genuine no-op contract regardless of suite ordering.
;(globalThis as { __REAL_DB__?: unknown }).__REAL_DB__ = require('@/lib/db').db

// `server-only` throws on any import — that's its whole purpose, to fail
// fast if a server module is reached from a client bundle. In tests we
// run server modules under bun:test (a Node-like context) so the package
// would block legitimate test imports of db, testimonials, scheduled-
// emails, contact-service, unsubscribe-token, etc. Mock it to a no-op
// before any module-under-test resolves.
mock.module('server-only', () => ({}))

// Mock next/cache — `cacheLife()` and `cacheTag()` throw outside the Next.js
// bundler context (they rely on __NEXT_USE_CACHE which only the bundler sets).
// In bun:test we just no-op them; the data layer functions still work.
function setupNextCacheMock() {
	mock.module('next/cache', () => ({
		cacheLife: () => {},
		cacheTag: () => {},
		updateTag: () => {},
		revalidateTag: () => {},
		revalidatePath: () => {}
	}))
}

setupNextCacheMock()

// Mock next/server's `after()` — needs a Next.js request context. In bun:test
// the route handlers are called directly without one, so after() throws and
// the outer catch returns 500. No-op the callback in tests; route handlers
// still test their critical-path logic.
function setupNextServerMock() {
	const actual = require('next/server')
	mock.module('next/server', () => ({
		...actual,
		after: () => {},
		// `connection()` opts a route into dynamic rendering — it throws
		// "outside a request scope" when called without a Next.js request
		// context. Tests instantiate routes by direct import, so resolve
		// to a no-op promise.
		connection: () => Promise.resolve()
	}))
}

setupNextServerMock()

// Setup logger mock to ensure all methods are available
function setupLoggerMock() {
	const mockLoggerInstance = {
		debug: mock(),
		info: mock(),
		warn: mock(),
		error: mock(),
		setContext: mock()
	}

	// Real implementation of generateFingerprint for tests that need it
	function generateFingerprint(
		errorType: string,
		message: string,
		stack?: string
	): string {
		const firstFrame = stack?.split('\n')[1]?.trim() || 'unknown'
		const input = `${errorType}:${message}:${firstFrame}`
		let hash = 0
		for (let i = 0; i < input.length; i++) {
			const char = input.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash
		}
		return Math.abs(hash).toString(36).padStart(8, '0')
	}

	mock.module('@/lib/logger', () => ({
		logger: mockLoggerInstance,
		createServerLogger: () => mockLoggerInstance,
		generateFingerprint,
		castError: (error: unknown) => ({
			name: error instanceof Error ? error.name : 'Error',
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			cause: undefined
		}),
		handleError: mock(() => ({ name: 'Error', message: 'Test error' })),
		safeExecute: mock(async (fn: () => unknown) => {
			try {
				const data = await fn()
				return { success: true, data, error: null }
			} catch {
				return {
					success: false,
					data: null,
					error: { name: 'Error', message: 'Test error' }
				}
			}
		}),
		safeExecuteSync: mock((fn: () => unknown) => {
			try {
				const data = fn()
				return { success: true, data, error: null }
			} catch {
				return {
					success: false,
					data: null,
					error: { name: 'Error', message: 'Test error' }
				}
			}
		})
	}))
}

setupLoggerMock()

// Mock react-simple-maps wrapper — the library triggers async SVG path
// calculations that crash in JSDOM and cause act() warnings
mock.module('@/components/utilities/ServiceAreaMapWrapper', () => ({
	ServiceAreaMapWrapper: ({ className }: { className?: string }) => {
		const React = require('react')
		return React.createElement('div', {
			'data-testid': 'service-area-map',
			className
		})
	}
}))

// CRITICAL: Prevent Playwright globals from interfering with Bun test
// Playwright's @playwright/test package exports globals that conflict with bun:test
// We must ensure these are NOT loaded when running Bun tests
try {
	// Attempt to delete any Playwright globals if they exist
	if (typeof globalThis !== 'undefined') {
		delete (globalThis as { test?: unknown }).test
		delete (globalThis as { expect?: unknown }).expect
	}
} catch {
	// Silently continue if globals don't exist
}

// Register happy-dom globals
GlobalRegistrator.register()

// Set IS_REACT_ACT_ENVIRONMENT for React 19 Testing Library compatibility
;(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

// Prevent @testing-library/react from trying to use Jest fake timers
// RTL's jestFakeTimersAreEnabled() checks:
// 1. setTimeout._isMockFunction === true (legacy timers)
// 2. Object.prototype.hasOwnProperty.call(setTimeout, 'clock') (modern timers)
// We ensure these properties don't exist or are false on setTimeout
function disableJestFakeTimerDetection() {
	// Remove _isMockFunction property if it exists (legacy timer indicator)
	if ('_isMockFunction' in setTimeout) {
		delete (setTimeout as { _isMockFunction?: boolean })._isMockFunction
	}

	// Remove 'clock' property if it exists (modern timer indicator)
	if ('clock' in setTimeout) {
		delete (setTimeout as { clock?: unknown }).clock
	}
}

// Apply timer detection fix immediately on setup
disableJestFakeTimerDetection()

// Mock fetch globally to prevent network requests during tests
const mockResponse: Response = {
	ok: true,
	status: 200,
	statusText: 'OK',
	headers: new Headers(),
	redirected: false,
	type: 'basic' as ResponseType,
	url: '',
	clone: mock(),
	json: () => Promise.resolve({}),
	text: () => Promise.resolve(''),
	arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
	blob: () => Promise.resolve(new Blob()),
	formData: () => Promise.resolve(new FormData())
} as unknown as Response

;(
	globalThis as {
		fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
	}
).fetch = mock(() => Promise.resolve(mockResponse))

beforeAll(() => {
	// Increase max listeners to prevent EventEmitter memory leak warnings
	process.setMaxListeners(20)
})

beforeEach(() => {
	// Clear all mocks before each test for isolation
	mock.restore()
	// Re-apply critical mocks that must persist across tests
	setupEnvMock()
	setupLoggerMock()
	setupNextCacheMock()
	setupNextServerMock()
	// Ensure RTL doesn't detect fake timers (Bun doesn't have Jest's timer infrastructure)
	disableJestFakeTimerDetection()
})

afterEach(() => {
	// Clear all mocks after each test for isolation
	// Note: env mock will be re-applied in beforeEach
	mock.restore()
})

afterAll(() => {
	// Cleanup and unregister happy-dom
	GlobalRegistrator.unregister()
})
