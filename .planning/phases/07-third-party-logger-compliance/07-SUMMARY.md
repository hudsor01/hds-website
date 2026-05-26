# Phase 07 — Third-party logger compliance + sink-level PII redaction (SUMMARY)

**Date:** 2026-05-26
**Branch:** `logger-compliance`
**Status:** complete

## What shipped

The project logger now redacts PII at the sink. Callers don't need to remember to redact at every site — `BaseLogger.log` passes every `data` payload, the logger's own `context`, and `pushToDatabase`'s `metadata` jsonb through a shared `redactSensitive` walker before serialization. The walker is field-name-based and covers three categories: emails (`email`, `recipientEmail`, `userEmail` → `[redacted-email]`), credentials (`password`, `secret`, `apiKey`, `token`, `bearerToken`, `refreshToken`, `accessToken` → `[redacted-secret]`), and IPs (`ip`, `ipAddress` → `[redacted-ip]`).

Better Auth's logger config in `src/lib/auth/index.ts` now imports the same `redactSensitive` from the new shared module, replacing the inline `redactEmails` walker that shipped in PR #221. One redaction implementation, applied uniformly across both entry points.

## Files

- **New:** `src/lib/log-redact.ts` — pure isomorphic redaction module
- **New:** `tests/unit/log-redact.test.ts` — 11 bun:test cases (574 → +11 from 563 baseline)
- **Modified:** `src/lib/logger.ts` — `BaseLogger.log` + `pushToDatabase` both run through redactor
- **Modified:** `src/lib/auth/index.ts` — inline `redactEmails` deleted, import + use shared module

## Audit findings (from CONTEXT.md §3)

### Class A — PII at our call sites (now masked by sink redaction)
- `src/lib/notifications.ts:172, 320, 353` — Slack/Discord notification logger calls passing `email: lead.email`. Sink redactor handles it; no call-site edit required.
- `src/lib/auth/index.ts:72-75 + 82-91` — first-signup hook + failed-hook error log. Same: sink redactor handles it.
- Any future `logger.x({ email, password, token, ... })` call is automatically masked.

### Class B — 3rd-party log surfaces
- Better Auth: already piped through PR #221 redactor; this phase moves to the shared module.
- Drizzle: no logger flag set; silent.
- Resend: errors propagate via thrown exceptions, no internal stdout.
- Neon serverless: no stdout writes.
- Next.js: built-in access logs include URL paths with UUIDs; custom request logger out of scope (deferred).

### Class C — Confirmed exemptions (untouched)
- `src/lib/logger.ts` 4 `console.*` sites: the logger IS the logger; documented final-fallback pattern.
- 3 error boundary `console.error` calls in `(public)/error.tsx`, `global-error.tsx`, `(public)/blog/error.tsx`: documented inline as `'use client'` boundaries that can't import the logger without pulling `db.ts` into the client bundle.

## Verification

| Gate | Result |
|---|---|
| `bun run lint` | PASS (Biome, 355 files, zero diagnostics) |
| `bun run typecheck` | PASS (`tsc --noEmit`) |
| `bun run test:unit` | PASS (574 / 574, +11 from baseline 563) |
| `bun run build` | PASS |
| Protected paths byte-equal to `origin/main` | PASS (`src/lib/auth/admin.ts`, `proxy.ts`, `src/app/api/**` all 0 lines diff) |
| Em-dash / en-dash sweep on changed files | PASS (zero matches) |
| `src/lib/auth/index.ts` removes inline `redactEmails`, uses shared module | PASS (verified; the only remaining `redactEmails` token in the file is the historical comment reference) |

## Test evidence

`tests/unit/log-redact.test.ts` — 11 cases:

1. `email` → `[redacted-email]`
2. `recipientEmail` / `userEmail` aliases → same
3. All 7 credential field names → `[redacted-secret]`
4. `ip` / `ipAddress` → `[redacted-ip]`
5. Nested objects walked recursively
6. Arrays walked element-wise
7. Primitives pass through
8. `null` / `undefined` pass through
9. Non-sensitive fields unchanged
10. Original input not mutated (deep copy)
11. Non-string values in sensitive fields pass through (only masks strings)

All 11 pass.

## Deferred (potential future phases)

- **Client-safe logger refactor.** Investigate whether the logger can be imported from `'use client'` error boundaries without pulling `db.ts` into the client bundle. If yes, remove the 3 documented `console.error` exemptions and unify on `logger.error`.
- **Custom Next.js request logger.** Override `GET /admin/leads/<uuid>` access log lines with UUID-masking if a compliance audit requires it. Trade-off: loses debugging value.
- **Historical log purge.** One-time `DELETE FROM error_logs WHERE user_email IS NOT NULL AND created_at < <today>` to retroactively scrub pre-Phase-07 rows that were inserted with raw emails.
- **`userEmail` column rename.** `userEmail` → `userEmailRedacted` for semantic clarity. Schema migration; batch with another change.

## Commit trail

| Commit | What |
|---|---|
| (this commit) | Phase 07 bootstrap (CONTEXT) + `src/lib/log-redact.ts` + 11 unit tests + `BaseLogger.log` + `pushToDatabase` redaction + `auth/index.ts` switch to shared module + STATE / ROADMAP sync + SUMMARY |

Single atomic commit because the work is small and tightly coupled (split would interleave the helper, its consumers, and the test).
