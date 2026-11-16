/**
 * Shared fakes for the gsc-*.test.ts files. Not a .test.ts, so bun does not
 * run it. Fetch and clock are injected as arguments (no mock.module), and
 * RSA keys are generated at runtime so no real key ever enters the repo.
 */
import { generateKeyPairSync } from 'node:crypto'
import { TOKEN_URL } from '../../scripts/gsc/config'
import type { FetchFn } from '../../scripts/gsc/types'

/** deadlineMs for tests that do not exercise the run budget. */
export const NO_DEADLINE = Number.POSITIVE_INFINITY

export interface FakeClock {
	now(): number
	sleep(ms: number): Promise<void>
	/** Moves time forward without recording a sleep (simulated latency). */
	advance(ms: number): void
	sleeps: number[]
}

export function fakeClock(
	start = Date.parse('2026-11-16T12:00:00Z')
): FakeClock {
	let t = start
	const sleeps: number[] = []
	return {
		sleeps,
		now: () => t,
		sleep: async (ms: number) => {
			sleeps.push(ms)
			t += ms
		},
		advance: (ms: number) => {
			t += ms
		}
	}
}

export interface FakeCall {
	url: string
	method: string
	headers: Headers
	body: string
}

/**
 * Records every call and delegates to handler. Handlers should throw
 * Error('unexpected fetch ' + url) for unknown URLs so no test can reach the
 * network.
 */
export function createFakeFetch(
	handler: (call: FakeCall) => Response | Promise<Response>
): { fetchFn: FetchFn; calls: FakeCall[] } {
	const calls: FakeCall[] = []
	const fetchFn: FetchFn = async (url, init) => {
		const call: FakeCall = {
			url,
			method: init.method ?? 'GET',
			headers: new Headers(init.headers),
			body: String(init.body ?? '')
		}
		calls.push(call)
		return handler(call)
	}
	return { fetchFn, calls }
}

export function jsonResponse(
	body: unknown,
	status = 200,
	headers: Record<string, string> = {}
): Response {
	return new Response(JSON.stringify(body), { status, headers })
}

export function makeKeyPair(): { privateKey: string; publicKey: string } {
	return generateKeyPairSync('rsa', {
		modulusLength: 2048,
		privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
		publicKeyEncoding: { type: 'spki', format: 'pem' }
	})
}

/** An override value of undefined drops that key from the JSON. */
export function serviceAccountJson(
	privateKey: string,
	overrides: Record<string, unknown> = {}
): string {
	return JSON.stringify({
		type: 'service_account',
		project_id: 'hds-test',
		private_key_id: 'kid-test-123',
		private_key: privateKey,
		client_email: 'gsc-report@hds-test.iam.gserviceaccount.com',
		token_uri: TOKEN_URL,
		...overrides
	})
}

/** The base64 body lines of a PEM, for no-leak assertions. */
export function collectPemBodyLines(pem: string): string[] {
	return pem
		.split('\n')
		.filter(line => line !== '' && !line.startsWith('-----'))
}
