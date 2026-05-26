# Phase 07 — Third-party logger compliance + sink-level PII redaction

**Date:** 2026-05-26
**Branch:** `logger-compliance`
**Milestone:** v5 — Admin hardening + content authoring
**Scope:** Audit every PII-bearing log path in the codebase (our code + 3rd-party libs), apply sink-level redaction in `@/lib/logger` so any caller passing a sensitive field gets it masked before the line reaches stdout / DB / external webhook. Extract the inline `redactEmails` walker shipped for Better Auth in PR #221 (`8abaee9`) into a shared `src/lib/log-redact.ts` module and broaden the field list.

## 1. Goal

After this phase, the contract is: **no PII reaches any log sink, regardless of where it was passed in.** Callers don't need to remember to redact at every site; the logger itself enforces the boundary. Audit closes the loop opened by the Phase 05 smoke (which surfaced Better Auth's raw-email logging in PR #221).

Visible value: zero. Compliance posture: significantly higher. The next time a security audit asks "what user data is in your logs?", the answer is "by construction, nothing in the sensitive-field set."

## 2. Non-goals

- **No new database tables.** `error_logs` keeps its existing schema; only the `userEmail` column's stored value changes from raw to `[redacted-email]` going forward.
- **No retroactive sweep of historical log rows.** `DELETE FROM error_logs WHERE user_email IS NOT NULL` is a separate operational concern; out of scope.
- **No removal of `userEmail` column.** Schema migration is out of scope; the field stays addressable, just gets the redacted value.
- **No regex-based pattern detection of emails in free-form log messages.** Pattern detection is fragile (matches inside URLs, stack traces, etc). Field-name-based redaction is canonical, audit-friendly, and deterministic. Free-form messages stay as-is; if a caller writes `logger.error('Failed for foo@bar.com')` directly into the message, that's a caller-side bug to fix individually (none currently do).
- **No removal of the 3 `console.*` error boundary calls** (`src/app/(public)/error.tsx`, `src/app/global-error.tsx`, `src/app/(public)/blog/error.tsx`). The justification — `'use client'` error boundaries can't import the logger without pulling `db.ts` into the client bundle — is documented inline in each file. Refactoring those is a separate question (see Deferred section).
- **No change to Next.js access logging** (the `GET /admin/dashboard 200 in 868ms` lines that include URL paths with UUIDs). Built-in Next.js behavior; overriding requires a custom request logger.
- **No change to Drizzle / Resend / Neon configurations.** Audit confirmed those libs do not emit PII to stdout in normal operation; nothing to redact.

## 3. Audit findings

### Class A — PII at our call sites (real findings)

| File:Line | Field | Sink |
|---|---|---|
| `src/lib/notifications.ts:172` | `email: lead.email` | logger + Slack webhook |
| `src/lib/notifications.ts:320` | `email: lead.email` | logger + Discord webhook |
| `src/lib/notifications.ts:353` | `email: lead.email` | logger metadata |
| `src/lib/auth/index.ts:72-75` | `email: createdUser.email` (in `'First user promoted to admin'` log) | logger |
| `src/lib/auth/index.ts:82-91` | `email: createdUser.email` (in failed-hook error log) | logger |
| Any future caller that passes `email`, `recipientEmail`, `userEmail`, `password`, `secret`, `apiKey`, `token`, `bearerToken`, `refreshToken`, `accessToken`, `ipAddress`, or `ip` | varies | varies |

### Class B — 3rd-party log surfaces

| Library | Behavior | Action |
|---|---|---|
| Better Auth | Was logging raw emails on failed sign-in | Already piped through PR #221's `redactEmails` walker; this phase moves that walker to the shared module so the fix is uniform |
| Drizzle | No `logger:true` flag set in `src/lib/db.ts`; silent | None |
| @neondatabase/serverless | Errors propagate via thrown exceptions; no stdout writes | None |
| Resend SDK | Errors return as `{ error }` from `.send()`; no internal stdout | None |
| Next.js | Server access logs include URL paths (may contain UUIDs in admin routes); built-in, can't redact without a custom request logger | None this phase (deferred to potential Phase 11 if compliance audit demands) |
| @vercel/analytics, @vercel/speed-insights | Browser-side beacons; do not write to our log sinks | None |

### Class C — Confirmed exemptions (no change)

- `src/lib/logger.ts` (4 `console.*` sites) — IS the logger; the console calls are how it emits to stdout. JSDoc justifies them as final fallback "since we can't use the logger to log logger failures".
- 3 error boundary components (`error.tsx` files) — `'use client'` components that document inline why they can't import the logger (would pull `db.ts` into the client bundle and crash hydration).
- `src/components/utilities/WebVitalsReporting.tsx` — uses `logger.info|warn|error` per PR #221's rating-based mapping. Already compliant.

## 4. File-level changes

### New files

- `src/lib/log-redact.ts` — `'server-only'`-free (must be isomorphic since logger is). Exports:
  - `SENSITIVE_FIELDS` — readonly tuple of field names treated as PII
  - `redactSensitive(value: unknown): unknown` — pure, recursive walker that returns a deep copy with sensitive-field values masked to `[redacted-{kind}]` (e.g. `[redacted-email]`, `[redacted-secret]`). Same structural pattern as the inline `redactEmails` in `src/lib/auth/index.ts` (which this phase replaces with an import). Bounded recursion on objects; no array-of-char expansion on strings.
- `tests/unit/log-redact.test.ts` — bun:test cases:
  1. `email` field gets `[redacted-email]`
  2. `recipientEmail`, `userEmail` aliases get same
  3. `password`, `secret`, `apiKey`, `token`, `bearerToken`, `refreshToken`, `accessToken` get `[redacted-secret]`
  4. `ipAddress`, `ip` get `[redacted-ip]`
  5. Nested objects: `{ user: { email, profile: { ... } } }` redacts the inner email
  6. Arrays of objects: each element walked independently
  7. Primitives pass through unchanged
  8. Null / undefined pass through
  9. Non-sensitive fields unchanged
  10. Original input is not mutated (deep copy)

### Modified files

- `src/lib/logger.ts` — `BaseLogger.log` private method runs `data` (and the `error()` overload's serialized `errorData`) through `redactSensitive` before assembling `logData`. The `pushToDatabase` path also runs the `metadata` field through redaction so the `error_logs.metadata` column never stores raw PII.
- `src/lib/auth/index.ts` — remove the inline `redactEmails` function (lines 37-61); import `redactSensitive` from `@/lib/log-redact`; replace the call sites in the `logger.log` config. JSDoc updated to reference the shared module.

### Deleted files

None. (`redactEmails` is inline-deleted from `auth/index.ts`; the module itself is new.)

## 5. Constraints (do not violate)

- Project conventions in `/CLAUDE.md`. Highlights: NO em/en-dashes in user-facing strings, NO emojis, server-first, Logger not `console.*` (the new code MUST go through `logger`), Zod `safeParse`, env via `@/env`.
- `src/lib/auth/admin.ts` (Bearer cron guard) byte-equal to `origin/main`.
- `proxy.ts` byte-equal to `origin/main`.
- `src/app/api/**` byte-equal to `origin/main` (no API surface change).
- All Phase 02-06 admin / auth / public files byte-equal except `src/lib/auth/index.ts` (intentional change replacing inline helper with shared module).
- `error_logs` table schema unchanged.
- The 3 error boundary `console.*` calls stay untouched (documented exemption).

## 6. Verification

- `bun run lint && bun run typecheck && bun run build` exit 0
- `bun run test:unit` — pass count is baseline 563 PLUS the 10 new redaction-helper cases → expect 573 pass / 0 fail
- After applying: `logger.info('Test', { email: 'foo@bar', userId: 'u1' })` produces a log line whose `data.email === '[redacted-email]'` and `data.userId === 'u1'` (passthrough)
- `src/lib/auth/index.ts` inline `redactEmails` function is removed; the file imports `redactSensitive` from `@/lib/log-redact` and uses it identically
- Em/en-dash sweep on changed files: zero
- `git diff origin/main -- src/lib/auth/admin.ts proxy.ts src/app/api/` empty
- Phase 02-06 protected files byte-equal to `origin/main`

## 7. Deferred (potential future phases)

- **Client-safe logger refactor.** Investigate whether the logger can be imported from `'use client'` error boundaries without pulling `db.ts` into the client bundle (likely yes via the dynamic-import pattern logger.ts already uses; the 3 documented exemptions could then be removed). Estimated ~half day. Bench against client-bundle size before/after.
- **Custom Next.js request logger.** Override the default `GET /admin/leads/<uuid>` access log with a UUID-masking variant if a compliance audit requires it. Trade-off: loses debugging value (you can't grep for "which lead got hit").
- **Historical log purge.** `DELETE FROM error_logs WHERE user_email IS NOT NULL AND created_at < now()`. One-time operational task post-merge.
- **Logger column rename.** `userEmail` → `userEmailRedacted` (semantic clarity). Schema migration; defer until the next batch.
