# Phase 20 Context — correctness-bugs

**Phase:** 20
**Milestone:** v8 Hardening
**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04
**Severity:** HIGH (real runtime defects; one user-visible = double emails)
**Depends on:** Phase 19 (merged); operates on current origin/main.

## Goal

Fix the four verified correctness defects with regression tests so they cannot silently recur: no double-sent emails, no rate-limiter memory leak / zombie keys, correct testimonials HTTP contract, no unbounded public JSON.

## Locked decisions (fix approach per bug; see 20-RESEARCH.md for line refs)

1. **BUG-01:** atomic claim before send — `UPDATE … SET status='processing' WHERE id = ANY(ids) AND status='pending' RETURNING *`, send only returned rows. Preserve existing retry/`failed` logic for claimed rows. Don't change the public function contract.
2. **BUG-02:** (a) bound the in-memory fallback regardless of `useRedis` — prefer LAZY prune inside the in-memory check/cleanup (serverless-safe) over an always-on interval; (b) make the Redis count+TTL atomic (SET NX EX + INCR, pipeline, or @upstash/ratelimit). Keep `checkLimit` behavior identical for callers.
3. **BUG-03:** `.returning()` + return rows-affected from `updateTestimonialStatus`/`deleteTestimonial` (and `deleteTestimonialRequest` if same shape); route validates `id` with `z.string().uuid()` (400) and maps not-found → 404. Mirror the correct `deleteShowcase` pattern.
4. **BUG-04:** cap `inputs`/`results` before insert via a serialized-size + key-count limit (e.g. 16KB / sane key cap) returning 400; do NOT build per-calculator shapes (larger scope, YAGNI). 

## Scope boundary

- IN: `scheduled-emails.tsx`, `rate-limiter.ts`, `testimonials.ts` + `api/testimonials/[id]/route.ts` (+ requests route if shared), `api/calculators/submit/route.tsx`, and their unit tests.
- OUT: no schema/DDL change; no new external deps unless `@upstash/ratelimit` is judged the cleanest BUG-02 fix (flag it, it's already an Upstash project); no refactor of the admin query complexity hotspots (deferred); no unrelated files.

## Verification (what proves done)

- BUG-01: test proves two overlapping passes over one pending row send it at most once (the claim is exercised).
- BUG-02: test proves the in-memory store evicts expired entries on the fallback path (bounded); a test for atomic Redis TTL.
- BUG-03: tests — missing id → 404, malformed non-UUID id → 400, happy path → 200/correct.
- BUG-04: test — oversized/over-key JSON → 400; normal → 200.
- Gate: `bun run lint` + `bun run typecheck` + full `bun test tests/` 0-fail (use real bun binary); the Phase-17 mock-leak guard stays green (no partial mocks of shared pure modules).

## Notes

- Behavior-changing phase → operator will review the green PR before merge (per this session's plan).
- Code-only PR off origin/main; planning stays on local main. Each commit `[hudsor01]`, no emojis, no user-facing dashes.
