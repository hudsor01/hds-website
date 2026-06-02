# Phase 12: errorboundary-report-path - Research

**Researched:** 2026-06-02
**Domain:** Next.js 16 App Router public telemetry POST route + client-side ErrorBoundary wiring (React 19, Sonner toast)
**Confidence:** HIGH (every required API is demonstrated by working code already in this repo)

## Summary

The fix is fully de-risked. Every primitive this phase needs already exists and works in production code: a public, CSRF-free, rate-limited telemetry POST (`csp-reports`, `web-vitals`), the `reportError` Sentry seam (called from `blog.ts` server modules today), the `logger.error` DB-persisting sink, the Sonner `<Toaster />` mounted at root, and the unit-test harness for API routes. There is no novel infrastructure to invent. The work is: (1) a new `POST /api/error-report` route that mirrors `csp-reports` exactly on its guard, (2) a Zod schema in `src/lib/schemas/`, (3) rewiring `DefaultErrorFallback.reportError` to `await fetch` and show a Sonner toast, deleting the `alert()` and the lying `logger.warn('... prepared')`.

**The #1 risk is the guard, and it is already solved.** Both analog routes use `withMutationGuards(handler, { rateLimit: 'api', csrf: false })`. A crashed page's ErrorBoundary cannot supply a CSRF token (no React Query, no form, possibly no working `/api/csrf` round-trip), so `csrf: false` is mandatory and correct. The same-origin check (origin/referer must match `BASE_URL` host) still fires and is the right level of protection for a public telemetry endpoint — the browser will always send a same-origin `Origin`/`Referer` from the crashed page.

**Primary recommendation:** Copy the `csp-reports` route shape verbatim — `withMutationGuards(handler, { rateLimit: 'api', csrf: false })` — add a Zod `safeParse` body gate (like `web-vitals`), call `logger.error('[ErrorReport] client error', {...})` (always-on capture) then `reportError(errorObj, tags)` (env-gated Sentry forward), return `204` (or `200` via `successResponse()`), and never echo the body back. Client: `await fetch`, `res.ok ? toast.success : toast.error`, keep Copy-Details as the failure fallback.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Capturing the crash details (message/stack/url/ua) | Browser / Client (`ErrorBoundary.tsx`) | — | Only the client knows `window.location`, `navigator.userAgent`, the runtime stack |
| Transmitting the report | Browser / Client (`fetch`) | — | `'use client'` fallback issues the POST |
| Validating the report body | API / Backend (`route.ts` + Zod) | — | Never trust client input; validate at the boundary (CLAUDE.md) |
| Always-on persistence | API / Backend (`logger.error` -> `error_logs`) | — | The guaranteed record even with no Sentry DSN |
| External error aggregation | API / Backend (`reportError` -> Sentry) | — | Env-gated; no-op when `SENTRY_DSN` unset |
| User feedback (honest success/failure) | Browser / Client (Sonner `toast`) | Copy-Details (manual fallback) | Toast reflects the real POST result; copy is the escape hatch |

**Misassignment guard for the planner:** Sentry forwarding and logging are SERVER responsibilities (the route calls `reportError`/`logger.error`). The client must NOT import `@/lib/error-tracking` or call `reportError` — that would pull `@sentry/nextjs` into the client bundle and break the clean boundary the CONTEXT.md locks. Client fetches; server logs + Sentry.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Wire to a REAL report path** (do NOT remove the button). The button must actually transmit; user feedback must be honest.
- **Create `POST /api/error-report`** (`src/app/api/error-report/route.ts`) as the always-on real channel. Mirror `src/app/api/csp-reports/route.ts`: validate body with Zod, log server-side via `logger.error`/`logger.warn` (PII-redacting, DB-persisting sink), AND forward to Sentry via `reportError(error, tags)` from `src/lib/error-tracking.ts` (env-gated; logger capture is the always-on guarantee). Return a small success status (200/204); never expose internals.
- **The route must NOT depend on a client CSRF token** the crashed page may not have. Match the lightest guard that fits a public telemetry POST (study `csp-reports` / `web-vitals`). Do not block legitimate reports behind a token the ErrorBoundary cannot supply.
- **In `reportError` (`ErrorBoundary.tsx`):** replace the commented-out fetch + `alert()` with a real `await fetch('/api/error-report', { method: 'POST', headers, body: JSON.stringify(errorReport) })`.
- **Replace BOTH the `alert()` and the bare `logger.warn(... 'prepared')`** with honest behavior: on successful POST -> `toast.success(...)` (Sonner; Toaster mounted at root); on failure -> `toast.error(...)` AND keep "Copy Error Details" as fallback. Copy must NEVER claim a report was filed when the POST failed.
- **No `alert()` anywhere** (it is the only one in the codebase; remove it). Toast/copy strings must be em/en-dash free (CLAUDE.md).
- **`ErrorBoundary.tsx` is `'use client'`** and already imports `logger`; add the `sonner` import. Keep the client/server boundary clean (client fetches; server logs + Sentry). The client does NOT import `error-tracking`'s `reportError`.

### Claude's Discretion
- Exact toast copy (dash-free, honest).
- The Zod schema shape for the error-report body (`message`/`stack`/`url`/`userAgent`/`timestamp`/`platform`/`language` are the current fields).
- Whether to debounce/limit repeat reports; the precise guard/rate-limit on the route (pick the lightest correct one).
- Status code (200 vs 204) and response shape.

### Deferred Ideas (OUT OF SCOPE)
- A richer error-reporting dashboard / triage surface (none today; out of scope).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ERR-01 | The "Report Error" action actually transmits the report; user feedback is honest; no `alert()`; Sonner toast. | Guard choice (this doc, "Standard Stack" + "Common Pitfalls"); server forward confirmation (Sentry + logger sections); client-wiring approach; Zod schema; unit-test plan; Validation Architecture. |

## Standard Stack

### Core (all already in `package.json` — nothing new to install)
| Library | Version (verified) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| `next` | `16.2.6` | Route handler (`route.ts`), `NextRequest`/`NextResponse`, `request.json()` | App Router is the project framework [VERIFIED: package.json] |
| `zod` | `4.4.3` | Body validation via `safeParse` | Project validation standard; `web-vitals` route uses identical pattern [VERIFIED: package.json + src/app/api/web-vitals/route.ts] |
| `sonner` | `2.0.7` | `toast.success` / `toast.error` from the fallback | Project toast standard; `<Toaster />` already mounted at root [VERIFIED: package.json + src/app/layout.tsx:215] |
| `@sentry/nextjs` | `^10.55.0` | `reportError` -> `Sentry.captureException` (server, env-gated) | Already wired in `instrumentation.ts`; `reportError` called from `blog.ts` server modules today [VERIFIED: package.json + src/lib/error-tracking.ts + instrumentation.ts] |
| `react` | `19.2.6` | `'use client'` fallback component, `useState` for disabled/sent state | Project framework [VERIFIED: package.json] |
| `react-error-boundary` | (installed) | `ReactErrorBoundary` wrapper (unchanged this phase) | Already in use in `ErrorBoundary.tsx` |

### Supporting (project-internal modules — reuse, do not rebuild)
| Module | Path | Purpose | When to Use |
|--------|------|---------|-------------|
| `withMutationGuards` | `src/lib/api/guards.ts` | Origin + (optional CSRF) + rate-limit wrapper | Wrap the route export with `{ rateLimit: 'api', csrf: false }` |
| `reportError` | `src/lib/error-tracking.ts` | Env-gated Sentry forward (no-op when `SENTRY_DSN` unset) | Call inside the server handler, NOT the client |
| `logger` | `src/lib/logger.ts` | PII-redacting sink; `logger.error` persists to `error_logs` in prod (server) | Always-on capture in the handler |
| `successResponse` / response helpers | `src/lib/api/responses.ts` | Consistent `{ success, data, message }` envelope | Optional — if you prefer 200 over a bare 204 |
| Zod schema | `src/lib/schemas/error-report.ts` (NEW) | Body shape + inferred type | `safeParse` in the handler |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `withMutationGuards({ csrf: false })` | `withMutationGuards({ csrf: true })` (default) | **WRONG.** The crashed-page ErrorBoundary cannot mint a CSRF token; `csrf: true` would 403 every legitimate report. This is the locked anti-requirement. |
| New `/api/error-report` route | Reuse `csp-reports` route | CONTEXT.md locks a dedicated route; CSP reports have a different body shape and semantics. Keep them separate. |
| `204 No Content` (csp-reports style) | `200` via `successResponse()` (web-vitals style) | Both are project-idiomatic. `204` is the closest analog (csp-reports) and the client only needs `res.ok`. Discretion item — recommend `204` for symmetry with csp-reports. |
| `rateLimit: 'api'` (60/min/IP) | A dedicated stricter tier | `'api'` (60/min) is what both telemetry routes use and is sufficient. A crash loop on one client is capped at 60/min/IP. No new tier needed (YAGNI). |

**Installation:**
```bash
# Nothing to install. All dependencies already present in package.json.
```

**Version verification:**
```
next     16.2.6   [VERIFIED: package.json]
zod      4.4.3    [VERIFIED: package.json]
sonner   2.0.7    [VERIFIED: package.json]
@sentry/nextjs ^10.55.0 [VERIFIED: package.json]
react    19.2.6   [VERIFIED: package.json]
```

## Package Legitimacy Audit

> Not applicable — this phase installs **zero** new packages. Every library used (`next`, `zod`, `sonner`, `@sentry/nextjs`, `react`, `react-error-boundary`) is already a declared, in-use dependency verified in `package.json` and exercised by existing production code. No registry resolution, slopcheck, or postinstall audit is required.

## Architecture Patterns

### System Architecture Diagram

```
  [User on a crashed page]
          │ clicks "Report Error"
          ▼
  ErrorBoundary.tsx  (DefaultErrorFallback.reportError)   ── 'use client' ──
          │ builds { message, stack, url, userAgent, timestamp, platform, language }
          │ await fetch('/api/error-report', POST, JSON)
          ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ POST /api/error-report  (src/app/api/error-report/route.ts)        │
  │                                                                    │
  │  withMutationGuards(handler, { rateLimit:'api', csrf:false })       │
  │     ├─ same-origin check (Origin/Referer host == BASE_URL host)    │  ── 403 if cross-origin
  │     └─ rate-limit 'api' (60/min/IP)                                │  ── 429 if exceeded
  │                                                                    │
  │  handler:                                                          │
  │     ├─ request.json()                       ── 400 on parse fail    │
  │     ├─ ErrorReportSchema.safeParse(body)    ── 400 on invalid shape │
  │     ├─ logger.error('[ErrorReport] ...', {...})  ◄── ALWAYS-ON       │──► error_logs table (prod, server)
  │     ├─ reportError(errorObj, tags)               ◄── ENV-GATED       │──► Sentry (only if SENTRY_DSN set)
  │     └─ return 204 (or 200) — body NEVER echoed                      │
  └─────────────────────────────────────────────────────────────────┘
          │ res.ok ?
          ▼
  ErrorBoundary.tsx
     ├─ true  -> toast.success('Report sent. Thanks ...')
     └─ false -> toast.error('Could not send. Copy the details and email us.')
                  + Copy-Error-Details path remains the fallback
```

File-to-implementation mapping is in the Component Responsibilities below; the diagram shows data flow only.

### Component Responsibilities
| File | Responsibility | Change |
|------|----------------|--------|
| `src/app/api/error-report/route.ts` | Validate, log, Sentry-forward, respond | NEW |
| `src/lib/schemas/error-report.ts` | Zod schema + inferred type for the body | NEW |
| `src/components/utilities/ErrorBoundary.tsx` | Build report, `await fetch`, toast on result | EDIT `reportError` (~65-94); add `sonner` import; delete `alert()` |

### Pattern 1: Public CSRF-free telemetry POST (THE canonical analog)
**What:** Wrap the handler with `withMutationGuards` passing `csrf: false`. Same-origin + rate-limit remain; CSRF is dropped because a browser beacon / crashed page cannot carry a token.
**When to use:** Any unauthenticated client-originated POST that the user's own page initiates (CSP reports, web vitals, error reports).
**Example:**
```typescript
// Source: src/app/api/csp-reports/route.ts:75-80 (verbatim project pattern) [VERIFIED: codebase]
// CSP reports come from the browser; no CSRF token possible. Origin check
// only — same-origin enforcement keeps cross-site report-floods at bay.
export const POST = withMutationGuards(handleCspReport, {
	rateLimit: 'api',
	csrf: false
})
```

### Pattern 2: Zod body gate with `safeParse` + 400 on failure
**What:** Parse JSON, `safeParse` against a schema, return `validationErrorResponse` / `400` on failure.
**When to use:** Every route accepting a client body (CLAUDE.md: "Always `safeParse`, never `parse`").
**Example:**
```typescript
// Source: src/app/api/web-vitals/route.ts:28-37 (project pattern) [VERIFIED: codebase]
const body = await request.json()
const validation = WebVitalSchema.safeParse(body)
if (!validation.success) {
	return validationErrorResponse(validation.error)  // 400
}
const validatedData = validation.data
```

### Pattern 3: Server-side dual-sink (always-on log + env-gated Sentry)
**What:** `logger.error` is the guaranteed record (persists to `error_logs` in prod, server-side). `reportError` forwards to Sentry only when `SENTRY_DSN` is set; otherwise it is a clean no-op.
**Example:**
```typescript
// logger.error -> always-on; reportError -> env-gated Sentry [VERIFIED: src/lib/logger.ts:228-240, src/lib/error-tracking.ts:14-22]
const errorObj = new Error(validated.message)
errorObj.stack = validated.stack
logger.error('[ErrorReport] client error boundary report', {
	url: validated.url,
	userAgent: validated.userAgent,
	platform: validated.platform,
	language: validated.language,
	timestamp: validated.timestamp,
	stack: validated.stack
})
reportError(errorObj, {
	source: 'error-boundary',
	url: validated.url
})
```

### Pattern 4: Honest client feedback via Sonner
**What:** Disable the button while in-flight, toast based on `res.ok`, keep Copy-Details as the failure escape hatch.
**Example:**
```typescript
// 'use client'; <Toaster /> mounted at root [VERIFIED: src/app/layout.tsx:215]
import { toast } from 'sonner'
// ...
const [sending, setSending] = useState(false)
const reportError = async () => {
	if (!error || sending) return
	setSending(true)
	try {
		const res = await fetch('/api/error-report', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(errorReport)
		})
		if (res.ok) {
			toast.success('Error report sent. Thanks for helping us fix this.')
		} else {
			toast.error('Could not send the report. Copy the details and email us.')
		}
	} catch (err) {
		logger.error('[ErrorBoundary] Failed to report error', err)
		toast.error('Could not send the report. Copy the details and email us.')
	} finally {
		setSending(false)
	}
}
```

### Anti-Patterns to Avoid
- **Importing `reportError`/`@sentry/nextjs` into the client `ErrorBoundary.tsx`.** Pulls Sentry into the client bundle and violates the locked client/server split. The SERVER route owns Sentry.
- **`csrf: true` (the default).** Guarantees a 403 for every legitimate report — the crashed page has no token. Must pass `csrf: false`.
- **Echoing the parsed body or internal error text in the response.** CONTEXT.md: "never expose internals." Return an empty `204` or a minimal `{ success: true }`.
- **`alert()`.** It is the only one in the codebase; removing it is a hard requirement.
- **Claiming success after a failed/skipped POST.** The copy must be conditioned on `res.ok`. The old `logger.warn('... prepared')` + `alert('... has been prepared')` is the exact lie this phase removes.
- **`try { ... } catch {}` that silently swallows the fetch error without a toast.** Failure must surface honestly.
- **Em/en-dashes in toast copy.** CLAUDE.md forbids them in user-facing strings; use commas/periods/hyphens.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Origin / CSRF / rate-limit on the route | Custom header checks | `withMutationGuards(h, { rateLimit:'api', csrf:false })` | Composes the three project defenses; tested in `api-guards.test.ts` |
| Sentry forwarding + DSN gating | Direct `Sentry.captureException` | `reportError(err, tags)` | Already env-gates and avoids the Cache-Components prerender hazard (see `error-tracking.ts` doc comment) |
| Persistent error capture | New DB table / insert | `logger.error(...)` | Persists to `error_logs` in prod, server-side, with PII redaction, fire-and-forget |
| Body validation | Manual `typeof` checks | Zod `safeParse` + `validationErrorResponse` | Project standard; field-level errors for free |
| Toast UI | Custom modal / `alert` | `toast.success` / `toast.error` (Sonner) | `<Toaster />` already mounted at root |
| Response envelope | Ad-hoc `Response.json` | `successResponse()` / bare `204` | Consistency with every other route |

**Key insight:** This phase is 100% assembly of existing, tested project primitives. The only genuinely new code is ~30 lines of route handler, a ~10-line Zod schema, and a ~20-line edit to one client function. Resist any urge to add infrastructure.

## Common Pitfalls

### Pitfall 1: Using the default CSRF guard
**What goes wrong:** Route returns 403 for every report; the toast always shows the failure path.
**Why it happens:** `withMutationGuards` defaults `csrf: true`. The ErrorBoundary fires on a crashed page that has no CSRF token (no `/api/csrf` round-trip, possibly no working React state).
**How to avoid:** Pass `{ rateLimit: 'api', csrf: false }` exactly like `csp-reports` and `web-vitals`.
**Warning signs:** Local test POST without a token returns 403; the success toast never appears in manual testing.

### Pitfall 2: Pulling Sentry into the client bundle
**What goes wrong:** Bundle bloat + a `'use client'` module importing server-oriented Sentry code; breaks the locked boundary.
**Why it happens:** Misreading the CONTEXT as "client calls `reportError`." It does not — the SERVER route calls `reportError`.
**How to avoid:** Client only does `fetch`. `@/lib/error-tracking` is imported by `route.ts` only.
**Warning signs:** `@sentry/nextjs` appears in a client chunk; `error-tracking` imported inside `ErrorBoundary.tsx`.

### Pitfall 3: Cache Components prerender crash from `Sentry.captureException`
**What goes wrong:** `Sentry.captureException` calls `crypto.randomUUID()` synchronously, which Next.js 16 Cache Components forbids inside cached server functions during prerender.
**Why it happens:** Calling Sentry unconditionally at module/prerender time.
**How to avoid:** This is **already handled** — `reportError` early-returns when `SENTRY_DSN` is unset (the doc comment in `error-tracking.ts:4-13` explains exactly this). A route handler runs at **request** time, not prerender time, so there is no prerender hazard for a POST handler regardless. [VERIFIED: src/lib/error-tracking.ts comment]
**Warning signs:** Build-time prerender error mentioning `randomUUID` / dynamic API in a cached scope. (Not expected here — route handlers are dynamic.)

### Pitfall 4: `logger.error` is a no-op for DB persistence outside production
**What goes wrong:** In dev/test the report is console-logged but NOT written to `error_logs` (the DB push is gated on `process.env.NODE_ENV === 'production' && !this.isBrowser`).
**Why it happens:** Intentional design (logger.ts:237). Manual local testing won't show a DB row.
**How to avoid:** Don't assert DB persistence in dev; the unit test mocks the logger and asserts it was *called*, not that a row exists. Document that the always-on guarantee is "logged" (console in dev, `error_logs` in prod).
**Warning signs:** Confusion that "nothing was saved" during `bun run dev` testing.

### Pitfall 5: Double-submit / crash-loop flooding
**What goes wrong:** A user mashes "Report Error", or a reset loop re-renders the fallback, sending many POSTs.
**Why it happens:** No in-flight guard.
**How to avoid:** A `sending` state that disables the button while the fetch is in flight (Discretion: a simple `useState` boolean is sufficient; full debounce is YAGNI). The `rateLimit: 'api'` (60/min/IP) is the server-side backstop.
**Warning signs:** Multiple identical `error_logs` rows from one click; 429s in manual testing.

### Pitfall 6: Request body size — large stack traces
**What goes wrong:** A very long stack/message could be large, though realistically well under any limit.
**Why it happens:** Stacks can be a few KB.
**How to avoid:** Cap `message`/`stack` length in the Zod schema (e.g., `.max(10_000)` on `stack`, `.max(2_000)` on `message`). Next.js route handlers accept JSON bodies well beyond this by default; the cap is a sanity bound, not a platform limit. [ASSUMED: default body limit is generous; the Zod `.max()` cap is the real control]
**Warning signs:** None expected; the cap is preventive.

### Pitfall 7: Leaking internals in the response
**What goes wrong:** Returning the parsed report or a stack trace to the client.
**How to avoid:** Return `204` (no body) or `{ success: true }`. On failure return a generic `400`/`500` with no internal detail. The client only reads `res.ok`.

## Code Examples

### Full route handler (assembled from verified project patterns)
```typescript
// src/app/api/error-report/route.ts  (NEW)
// Sources: csp-reports/route.ts (guard), web-vitals/route.ts (Zod gate),
// error-tracking.ts (reportError), logger.ts (sink) — all [VERIFIED: codebase]
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { withMutationGuards } from '@/lib/api/guards'
import { reportError } from '@/lib/error-tracking'
import { logger } from '@/lib/logger'
import { errorReportSchema } from '@/lib/schemas/error-report'

async function handleErrorReport(request: NextRequest) {
	try {
		const body = await request.json()
		const parsed = errorReportSchema.safeParse(body)
		if (!parsed.success) {
			return new NextResponse(null, { status: 400 })
		}
		const r = parsed.data

		// Always-on capture (console in dev, error_logs in prod, server-side).
		logger.error('[ErrorReport] client error boundary report', {
			url: r.url,
			userAgent: r.userAgent,
			platform: r.platform,
			language: r.language,
			timestamp: r.timestamp,
			stack: r.stack
		})

		// Env-gated Sentry forward (no-op when SENTRY_DSN unset).
		const errorObj = new Error(r.message)
		if (r.stack) {
			errorObj.stack = r.stack
		}
		reportError(errorObj, { source: 'error-boundary', url: r.url })

		return new NextResponse(null, { status: 204 })
	} catch (error) {
		logger.warn('Invalid error report received', {
			error: error instanceof Error ? error.message : String(error)
		})
		return new NextResponse(null, { status: 400 })
	}
}

// Crashed-page ErrorBoundary cannot mint a CSRF token; origin + rate-limit only.
export const POST = withMutationGuards(handleErrorReport, {
	rateLimit: 'api',
	csrf: false
})
```

### Zod schema
```typescript
// src/lib/schemas/error-report.ts  (NEW)
// Pattern: export schema + inferred type; consumed via safeParse [VERIFIED: project convention, web-vitals schema]
import { z } from 'zod'

export const errorReportSchema = z.object({
	message: z.string().min(1).max(2_000),
	stack: z.string().max(10_000).optional(),
	url: z.string().url().max(2_000),
	userAgent: z.string().max(1_000),
	timestamp: z.string().datetime(),
	platform: z.string().max(200).optional(),
	language: z.string().max(50).optional()
})

export type ErrorReport = z.infer<typeof errorReportSchema>
```
> Note: the schema lives in its own file under `src/lib/schemas/`. It is NOT added to `src/lib/schemas/schema.ts` — that barrel is Drizzle *table* definitions only [VERIFIED: schema.ts contents]. Zod feature schemas (e.g. `web-vitals` defines its schema inline; `contact.ts`, `paystub.ts` export theirs) are not re-exported through the table barrel.

### Client wiring (the edit to `ErrorBoundary.tsx`)
```typescript
// Replace the body of reportError (lines ~65-94). Add `import { toast } from 'sonner'`
// and `useState` is already imported. window.location is the value built into errorReport.
const [sending, setSending] = useState(false)

const reportError = async () => {
	if (!error || sending) {
		return
	}
	setSending(true)
	const errorReport = {
		message: errorObj.message,
		stack: errorObj.stack,
		url: window.location.href,
		userAgent: navigator.userAgent,
		timestamp: new Date().toISOString(),
		platform: navigator.platform,
		language: navigator.language
	}
	try {
		const res = await fetch('/api/error-report', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(errorReport)
		})
		if (res.ok) {
			toast.success('Error report sent. Thanks for helping us fix this.')
		} else {
			toast.error('Could not send the report. Copy the details below and email us.')
		}
	} catch (err) {
		logger.error('[ErrorBoundary] Failed to report error', err)
		toast.error('Could not send the report. Copy the details below and email us.')
	} finally {
		setSending(false)
	}
}
```
Wire `disabled={sending}` onto the "Report Error" `<button>` (line ~150) to prevent double-submits.

## Runtime State Inventory

> Greenfield-ish change (new route + client edit). No rename/migration. One small note:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `error_logs` table already exists (`src/lib/schemas/system.ts`); `logger.error` writes there in prod. No new column or migration needed. | None |
| Live service config | Sentry already initialized in `instrumentation.ts`, gated on `SENTRY_DSN`. No new config. | None |
| OS-registered state | None | None |
| Secrets/env vars | `SENTRY_DSN` already in `src/env.ts` (optional, `.url()`); no new secret. | None |
| Build artifacts | None | None |

**Nothing requires a migration.** The route writes through the existing logger sink and existing `error_logs` table.

## Validation Architecture

> `workflow.nyquist_validation` not disabled -> section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `bun:test` (unit) + Playwright (e2e) [VERIFIED: package.json scripts, CLAUDE.md] |
| Config file | `tests/setup.ts` (auto-mocks `@/env`, `@/lib/logger`); `tests/test-utils.ts` (`setupApiMocks`) |
| Quick run command | `bun run test:unit` (alias `bun test tests/`) |
| Full suite command | `bun run test:all` (lint + typecheck + unit + e2e:fast) |

### Failure Modes (what must be observably tested)
| # | Failure mode | Observable signal | Test |
|---|--------------|-------------------|------|
| F1 | Route accepts a well-formed report | `204` (or `200`) | unit: POST valid body |
| F2 | Route rejects an invalid body | `400` | unit: POST `{}` / missing `message` / bad `url` |
| F3 | Route rejects non-JSON / malformed | `400` (catch branch) | unit: POST a raw string |
| F4 | Server logs the report (always-on) | `logger.error` called with the report fields | unit: assert `mockLogger.error` called |
| F5 | Sentry forward is safe & gated | `reportError` invoked; no throw when DSN unset | unit: mock `error-tracking`, assert called; (DSN-unset no-op is covered by `error-tracking`'s own contract) |
| F6 | Client shows success on `res.ok` | `toast.success` called | client unit OR e2e (see below) |
| F7 | Client shows failure on `!res.ok`/throw | `toast.error` called; Copy-Details still works | client unit OR e2e |
| F8 | No `alert()` remains | grep finds zero `alert(` in `src/` | static check / unit grep assertion |
| F9 | Honest copy: no "prepared/sent" claim on failure | copy is conditioned on `res.ok` | code review + F7 |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ERR-01 | Valid report -> 2xx | unit | `bun test tests/unit/api-error-report.test.ts` | ❌ Wave 0 |
| ERR-01 | Invalid body -> 400 | unit | same file | ❌ Wave 0 |
| ERR-01 | Malformed JSON -> 400 | unit | same file | ❌ Wave 0 |
| ERR-01 | logger.error called with report | unit | same file (assert `mockLogger.error`) | ❌ Wave 0 |
| ERR-01 | reportError forwarded (no throw) | unit | same file (mock `@/lib/error-tracking`) | ❌ Wave 0 |
| ERR-01 | No `alert(` in src/ | static | `! grep -rn "alert(" src/components/utilities/ErrorBoundary.tsx` | n/a (grep) |
| ERR-01 | Success toast on ok / error toast on fail | e2e (recommended) OR client unit | `bun run test:e2e` (new spec) | ❌ Wave 0 (optional) |

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck && bun test tests/unit/api-error-report.test.ts`
- **Per wave merge:** `bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (matches CONTEXT.md "Gates after"). Add `bun run test:e2e:fast` if an e2e spec is written.

### How to unit-test the route (concrete, follows `api-csp-reports.test.ts`)
- `beforeEach(setupApiMocks)` / `afterEach(cleanupMocks)`. `setupApiMocks` already installs a passthrough mock for `@/lib/api/guards` (guards bypassed — no CSRF/origin staging needed) and a mock `logger`.
- Additionally `mock.module('@/lib/error-tracking', () => ({ reportError: mock() }))` so the Sentry seam is a spy (it would otherwise be a real no-op when `SENTRY_DSN` is unset in `setupApiMocks`'s env — which is also fine, but a spy lets you assert F5).
- `makeRequest(body)` -> `new NextRequest('http://localhost/api/error-report', { method:'POST', body: JSON.stringify(body), headers })`.
- Dynamic-import the route inside each test: `const { POST } = await import('@/app/api/error-report/route')`.
- Cases: valid -> `expect(res.status).toBe(204)` and `expect(mockLogger.error).toHaveBeenCalled()`; missing `message` -> `400`; bad `url` -> `400`; raw string body -> `400`.

### Client test feasibility
- A `bun:test` + Testing Library render test of `DefaultErrorFallback` is feasible (the repo already does client component tests in `components.test.tsx`/`forms.test.tsx`). Mock `global.fetch` to resolve `{ ok: true }` then `{ ok: false }`, mock `sonner`'s `toast`, click "Report Error", assert `toast.success`/`toast.error`. This is the lighter-weight option and directly covers F6/F7.
- An e2e is **lower value here** — triggering a real React render crash on a route to surface the fallback is fragile. **Recommendation:** do the client unit test (mock fetch + sonner); skip e2e unless a trivially crashing fixture route already exists. F8 (no `alert`) is best as a cheap grep assertion in the route test file or a lint-style check.

### Wave 0 Gaps
- [ ] `tests/unit/api-error-report.test.ts` — covers ERR-01 route behavior (F1-F5)
- [ ] `tests/unit/error-boundary-report.test.tsx` (optional but recommended) — covers F6/F7/F8 (mock fetch + sonner)
- [ ] No framework install needed — `bun:test` + Testing Library already configured.

## Security Domain

> `security_enforcement` not disabled -> included.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Public telemetry endpoint by design (like csp-reports/web-vitals) |
| V3 Session Management | no | No session; stateless POST |
| V4 Access Control | no | Intentionally unauthenticated |
| V5 Input Validation | **yes** | Zod `safeParse` with `.max()` length bounds; reject on failure (400) |
| V6 Cryptography | no | None hand-rolled |
| V11 Business Logic / anti-automation | **yes** | `withMutationGuards` rate-limit `'api'` (60/min/IP) + same-origin check |

### Known Threat Patterns for a public client POST
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-site report flooding | Tampering / DoS | Same-origin (Origin/Referer host == BASE_URL) via `withMutationGuards` |
| Abuse / crash-loop flooding from one IP | Denial of Service | `rateLimit: 'api'` (60/min/IP) + client `sending` in-flight guard |
| PII leakage into logs (URLs/UA may contain tokens) | Information Disclosure | `logger` runs `redactSensitive` on metadata at the sink before console/DB/webhook |
| Malformed/oversized body | Tampering / DoS | Zod `.max()` caps + JSON `safeParse`; 400 on failure |
| Internal detail leakage in response | Information Disclosure | Return `204`/`{success:true}`; never echo body or stack |
| Stored XSS via logged content rendered later | (future dashboard) | Out of scope (no dashboard); note for the deferred triage surface — escape on render if ever built |

**Note on CSRF:** Dropping CSRF here is the correct, deliberate trade documented for exactly this class of route in `guards.ts:13-14`. The same-origin check is the substitute defense; a public telemetry POST has no user-authenticated state to protect.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `alert()` claiming a report was filed | Real POST + Sonner toast conditioned on `res.ok` | This phase | Honest UX; the only `alert()` in the codebase removed |
| Commented-out `fetch('/api/error-report')` to a non-existent route | Real `/api/error-report` route | This phase | The transmission path exists and is tested |
| `logger.warn('... prepared')` (a lie) | `logger.error` on the server route (real capture) | This phase | Report is actually recorded, not "prepared" |

**Deprecated/outdated:** Nothing external. `react-error-boundary` and the guard composition are current project conventions.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js 16 route handlers accept JSON bodies well above the ~10KB Zod cap by default (no tight platform body limit relevant here). The Zod `.max()` is the effective control. | Pitfall 6 / schema | LOW — even if a platform limit existed, the `.max()` cap keeps bodies small; oversized -> 400, never a crash. |

**All other claims are `[VERIFIED: codebase]` or `[CITED]` against files in this repo.** The guard choice, Sentry seam behavior, logger persistence gating, Sonner mount, Zod pattern, and test harness are all confirmed by reading the actual source.

## Open Questions

1. **Status code: 204 vs 200?**
   - What we know: `csp-reports` returns `204`; `web-vitals` returns `200` via `successResponse()`. Both are idiomatic.
   - What's unclear: pure stylistic choice (Discretion item).
   - Recommendation: `204` (no body) for symmetry with `csp-reports`, the closest analog. The client only reads `res.ok`.

2. **Client unit test vs e2e for the toast behavior?**
   - What we know: client component tests exist (`components.test.tsx`); triggering a real crash for e2e is fragile.
   - Recommendation: client unit test with mocked `fetch` + `sonner` (covers F6/F7/F8). Skip e2e.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@sentry/nextjs` | Server Sentry forward | ✓ (declared) | `^10.55.0` | `reportError` no-ops when `SENTRY_DSN` unset; logger is always-on |
| `SENTRY_DSN` env | Sentry forward to actually fire | optional | — | logger.error -> `error_logs` (prod) is the always-on guarantee |
| `sonner` + `<Toaster />` | Client toast | ✓ mounted at root | `2.0.7` | none needed |
| Neon Postgres (`error_logs`) | Prod persistence of `logger.error` | ✓ (table exists) | — | dev/test logs to console only (by design) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** `SENTRY_DSN` may be unset in some environments — covered: the logger is the always-on capture (this is explicitly the locked design).

## Sources

### Primary (HIGH confidence — read in this session)
- `src/app/api/csp-reports/route.ts` — guard pattern (`csrf: false`, `rateLimit: 'api'`), 204/400 responses
- `src/app/api/web-vitals/route.ts` — Zod `safeParse` gate + `validationErrorResponse`
- `src/lib/api/guards.ts` — `withMutationGuards` composition, the documented "browser beacons can't carry CSRF" rationale
- `src/lib/request.ts` — `isSameOriginRequest` (the substitute defense)
- `src/lib/error-tracking.ts` — `reportError` DSN gate + Cache-Components prerender rationale
- `src/lib/logger.ts` — `logger.error` -> `error_logs` (prod, server) persistence + PII redaction
- `src/app/layout.tsx` — `<Toaster />` mounted at root inside `ClientProviders`; `<ErrorBoundary>` wraps the tree
- `src/components/utilities/ErrorBoundary.tsx` — the `reportError`/`alert()`/Copy-Details code under change
- `tests/unit/api-csp-reports.test.ts`, `tests/unit/api-web-vitals.test.ts`, `tests/unit/api-guards.test.ts`, `tests/test-utils.ts` — the exact unit-test harness to copy
- `instrumentation.ts` — Sentry init gated on `SENTRY_DSN` / `NODE_ENV !== 'test'`
- `package.json` — verified versions (next 16.2.6, zod 4.4.3, sonner 2.0.7, @sentry/nextjs ^10.55.0, react 19.2.6)
- `src/env.ts` — `SENTRY_DSN` optional `.url()`
- `CLAUDE.md` — Zod `safeParse` convention, no em/en-dash rule, Sonner standard, logger-not-console, test layout

### Secondary / Tertiary
- None needed. Context7/ctx7 was unavailable; not required — the project's own working analog routes are the authoritative pattern source for every API used. The single non-codebase claim (A1) is flagged in the Assumptions Log.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libs present in package.json, exercised by existing routes
- Architecture / guard choice: HIGH — verbatim match to two production analog routes + documented rationale in `guards.ts`
- Pitfalls: HIGH — derived directly from source (CSRF default, logger gating, Sentry DSN gate, client/server split)
- Validation: HIGH — copies an existing, passing test harness

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable — internal patterns, no fast-moving external deps)

## Project Constraints (from CLAUDE.md)
- **NO em/en-dashes in user-facing text** — applies to toast copy. Use comma/period/hyphen.
- **NO emojis.**
- **Zod:** `safeParse` only, never `parse`; export schema + inferred type; schemas in `src/lib/schemas/`.
- **Logger:** use `@/lib/logger`, never `console.*`.
- **Server-first / clean boundary:** `'use client'` files cannot import server-only Sentry; route handler owns Sentry + logging.
- **Toasts:** Sonner only; `<Toaster />` already mounted — do not add a second.
- **Validate at boundaries; trust inside.** No `any`; TypeScript strict.
- **Search first / follow existing patterns:** `csp-reports` is the canonical analog — mirror it.
- **Tests:** API route handler must be unit-tested (success + invalid body) per project convention.
- **Gates before commit:** `bun run lint && bun run typecheck` must pass; phase gate adds `test:unit && build`.
