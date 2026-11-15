/**
 * Every constant the Search Console weekly report uses. Single source: other
 * scripts/gsc modules and the tests import these, never redefine them.
 */

/** Env var (and repo secret) holding the service-account JSON key. */
export const SECRET_ENV = 'GSC_SERVICE_ACCOUNT_JSON'

/**
 * Search Console property and the origin inspected URLs are built on (D3).
 * The origin is the site's own SITE_URL from seo-config, so the two cannot
 * drift (IN-12). The property is named SC_PROPERTY, not SITE_URL, so it
 * cannot be confused with that https origin (IN-04).
 */
export const SC_PROPERTY = 'sc-domain:hudsondigitalsolutions.com'
export { SITE_URL as SITE_ORIGIN } from '@/lib/seo-config'

/** OAuth token endpoint: JWT `aud` and the only POST target (D1, D15 C3). */
export const TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

/** Search Console API endpoints. */
export const INSPECT_URL =
	'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'
export const ANALYTICS_URL = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SC_PROPERTY)}/searchAnalytics/query`

/** Quota and retry limits (D7). */
export const MAX_INSPECTIONS = 150
export const INSPECTION_SPACING_MS = 200
export const MAX_ATTEMPTS = 3
export const BASE_BACKOFF_MS = 1000
export const MAX_RETRY_AFTER_MS = 60_000

/**
 * Time limits: one request is aborted (and retried as a network error) after
 * REQUEST_TIMEOUT_MS; the whole run stops at RUN_BUDGET_MS, well inside the
 * workflow's timeout-minutes: 10, so a stall or a Retry-After storm still
 * ends with an authored line (WR-01).
 */
export const REQUEST_TIMEOUT_MS = 30_000
export const RUN_BUDGET_MS = 7 * 60_000

/** Recent-post window in days (D4). */
export const LOOKBACK_DAYS = 30

/** Search Analytics window, probe and striking-distance rules (D6, D15 C10). */
export const WINDOW_DAYS = 28
export const PROBE_DAYS = 10
export const PROBE_ROW_LIMIT = 25
export const ROW_LIMIT = 25_000
export const STRIKING_MIN = 5
export const STRIKING_MAX = 20
export const STRIKING_MAX_ROWS = 50
/**
 * True-brand query terms (04-brand.md). BRAND_RE matches them and the Brand
 * section names them, from this one list (IN-03). Plain words only: they
 * are joined into the regex unescaped.
 */
export const BRAND_TERMS = ['hudson digital', 'hudsondigital'] as const
export const BRAND_RE = new RegExp(BRAND_TERMS.join('|'), 'i')

/** Rendered issue body cap in UTF-8 bytes (D15 C9). */
export const BODY_BYTE_CAP = 60_000

export const DAY_MS = 86_400_000
