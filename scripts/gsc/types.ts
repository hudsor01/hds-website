/**
 * Shared contracts for the Search Console weekly report. Types only, no
 * runtime code. ReportModel deliberately has no credential field so render
 * code can never reach key material (AUTO-06).
 */

/** Injected fetch so tests never touch the network. */
export type FetchFn = (url: string, init: RequestInit) => Promise<Response>

/** Injected clock so throttle and backoff tests run instantly. */
export interface Clock {
	now(): number
	sleep(ms: number): Promise<void>
}

/** What every network call needs: fetch, clock and the run deadline. */
export interface Transport {
	fetchFn: FetchFn
	clock: Clock
	/** clock.now() value past which no request starts and no wait begins. */
	deadlineMs: number
}

export interface GscContext extends Transport {
	accessToken: string
	clientEmail: string
}

export type ErrorKind =
	| 'retry'
	| 'quota'
	| 'disabled'
	| 'scope'
	| 'no_access'
	| 'auth'
	| 'budget'
	| 'other'

export interface IndexStatus {
	verdict?: string
	coverageState?: string
	lastCrawlTime?: string
	googleCanonical?: string
	userCanonical?: string
	pageFetchState?: string
	robotsTxtState?: string
	indexingState?: string
}

/**
 * httpStatus null means the request failed with a network error;
 * unexpectedResponse means a 2xx body that failed the schema.
 */
export type InspectionOutcome =
	| { ok: true; status: IndexStatus | undefined }
	| { ok: false; httpStatus: number | null }
	| { ok: false; unexpectedResponse: true }

export interface AnalyticsRow {
	keys: string[]
	clicks: number
	impressions: number
	ctr: number
	position: number
}

export interface AnalyticsQuery {
	startDate: string
	endDate: string
	dimensions: Array<'date' | 'query' | 'page'>
	rowLimit: number
}

export interface DateWindow {
	startDate: string
	endDate: string
}

export interface RecentPost {
	slug: string
	path: string
	url: string
	publishedAt: string
	daysSincePublish: number
}

export type FlagReason =
	| 'not_indexed'
	| 'canonical_mismatch'
	| 'inspection_failed'

export interface InspectedPost extends RecentPost {
	outcome: InspectionOutcome
	reasons: FlagReason[]
}

export interface StrikingRow {
	query: string
	pagePath: string
	impressions: number
	clicks: number
	ctr: number
	position: number
}

export interface ReportModel {
	runDate: string
	window: DateWindow | null
	totalRecent: number
	skippedByCap: number
	posts: InspectedPost[]
	striking: { shown: StrikingRow[]; total: number }
	/** The query,page rows hit ROW_LIMIT: striking distance may be cut. */
	rowLimitHit: boolean
	/** rowLimitHit: the query rows hit ROW_LIMIT, so the sums may undercount. */
	brand: { clicks: number; impressions: number; rowLimitHit: boolean } | null
}
