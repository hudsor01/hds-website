# Phase 20 Research — correctness-bugs

**Researched:** 2026-06-03
**Method:** Verified in-code during the post-v7 review (two reviewer agents + my own confirmation). Each bug below was read at the cited line. Tags: VERIFIED (confirmed) / REPORTED (re-confirm at plan time).

## BUG-01 — scheduled-email duplicate-send race [VERIFIED]

`src/lib/scheduled-emails.tsx` `processPendingEmails()` (~line 138): `.select()…where(eq(status,'pending'))…limit(100)`, then iterates and only `.update().set({status:'sent'})` (~line 282) AFTER the Resend send. No atomic claim. The endpoint `src/app/api/process-emails/route.ts` exposes BOTH `GET` (line 36, Vercel cron) and `POST` (line 40, n8n/manual). Two overlapping invocations (or one run overrunning the next cron tick) both read the same pending rows → recipient gets the email twice.

**Fix direction:** claim rows atomically before sending. Either (a) `UPDATE scheduled_emails SET status='processing' WHERE id = ANY(<ids>) AND status='pending' RETURNING *` then send only the returned rows, or (b) a Postgres advisory lock around the select+claim, or (c) `SELECT … FOR UPDATE SKIP LOCKED` in a transaction. Option (a) is simplest with Drizzle (two statements; the conditional UPDATE…RETURNING is the claim). On send failure, the existing retry/`failed` logic still applies to claimed rows. Regression test: simulate two concurrent passes over the same pending row and assert one send.

## BUG-02 — rate-limiter outage memory leak + non-atomic Redis op

`src/lib/rate-limiter.ts`:
- [VERIFIED] line ~84: `if (!this.useRedis) { this.initializeInMemory() }` — the cleanup `setInterval` (line ~93) starts ONLY when not using Redis. But `checkLimit` falls through to `_checkLimitInMemory` (line ~137/143) when Redis is configured but fails at runtime, populating `this.store` with nothing ever pruning it → unbounded growth during a Redis outage on a long-lived instance.
- [REPORTED] lines ~54-58: `redis.incr(key)` then a separate `await redis.expire(key, windowSeconds)` — non-atomic; a failure/crash between them leaves a TTL-less key (permanent zombie count). Confirm exact lines at plan time.

**Fix direction:** (1) always run the cleanup mechanism — either start the interval regardless of `useRedis`, or lazily prune expired entries inside `_checkLimitInMemory`/`cleanup` on each call (lazy prune is serverless-friendlier; an interval can leak the timer). (2) make the Redis count+TTL atomic — `SET key 1 NX EX window` then `INCR`, or a pipeline, or `@upstash/ratelimit`'s sliding-window primitive. Keep the public `checkLimit` contract. Tests: a fallback-path test that asserts the store is bounded (expired entries evicted); a Redis-path test for atomic TTL.

## BUG-03 — testimonials/[id] wrong HTTP contract [VERIFIED]

`src/lib/testimonials.ts`: `updateTestimonialStatus` (line ~285) and `deleteTestimonial` (line ~314) `await db.update/delete(...).where(eq(testimonials.id, id))` then `return true` unconditionally — no rows-affected check. `src/app/api/testimonials/[id]/route.ts`: `PATCH` (line ~26) and `DELETE` (line ~73) `await params` → `id`, validate the BODY (line ~38 returns 400 on bad input) but NOT the `id` shape. So: a non-existent id → 200 "success"; a malformed (non-UUID) id → Postgres `22P02` → caught → 500. Contrast `deleteShowcase` (`showcase-queries.ts:282`) which correctly returns `result.length > 0`.

**Fix direction:** add `.returning({ id: testimonials.id })` to the update/delete and return `rows.length > 0`; in the route, validate `id` with `z.string().uuid()` (400 on garbage) and map `false` → 404. Apply the same to `deleteTestimonialRequest` + its route if it shares the shape. Tests: missing id → 404, malformed id → 400, happy path → 200.

## BUG-04 — calculators/submit unbounded JSON [VERIFIED]

`src/app/api/calculators/submit/route.tsx` line ~34: `inputs: z.record(z.string(), z.unknown())`, line ~35 `results: z.record(...).optional().default({})` — persisted verbatim into the `calculator_leads` JSON columns (line ~160). No size/key-count/depth cap. A same-origin/CSRF/rate-limit-passing client can write arbitrarily large/nested JSON → storage bloat / payload-DoS. The lead-scoring code only reads a few known keys.

**Fix direction:** cap before insert. Minimal: a `.refine()` on `JSON.stringify(inputs).length <= N` (e.g. 16KB) + a key-count/depth limit, returning 400 on violation. Better: per-calculator-type shapes, but that is larger scope — the size/key cap is the YAGNI-correct fix for "unbounded." Test: oversized payload → 400; normal payload → 200.

## Cross-cutting

- All four are independent files → can be separate tasks/waves in one plan, or parallel.
- Test infra: `bun:test`, the suite is order-independent now (Phase 17). Mock only real boundaries (`@/lib/db`, etc.) per the Phase-17 guard (`scripts/check-test-mock-leaks.sh` will reject partial mocks of shared pure modules). Use the real bun binary (`~/.bun/bin/bun`).
- No schema/DDL change needed (all fixes are query-shape / validation / logic).
- Code-only PR off origin/main; planning stays on local main.
