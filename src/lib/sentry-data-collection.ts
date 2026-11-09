import type { init } from '@sentry/nextjs'

type DataCollection = NonNullable<Parameters<typeof init>[0]['dataCollection']>

// Header / query-param name fragments that identify the client or proxy chain
const CLIENT_IDENTITY_DENYLIST = ['forwarded', '-ip', 'remote-', 'via', '-user']

/**
 * Sentry v11 collects cookies, user info, request/response bodies and DB
 * query data when `dataCollection` is unset. This baseline keeps the v10
 * `sendDefaultPii: false` behavior so Better Auth session cookies and
 * contact/newsletter form bodies never leave the app. Shared by every
 * Sentry.init call (nodejs, edge, client).
 */
export const SENTRY_DATA_COLLECTION: DataCollection = {
	userInfo: false,
	cookies: false,
	httpHeaders: {
		request: { deny: CLIENT_IDENTITY_DENYLIST },
		response: { deny: CLIENT_IDENTITY_DENYLIST }
	},
	httpBodies: [],
	urlQueryParams: { deny: CLIENT_IDENTITY_DENYLIST },
	genAI: { inputs: false, outputs: false },
	databaseQueryData: false,
	queues: false,
	graphQL: { document: false, variables: false }
}
