# Phase 63: Streaming + after() Adoption - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Move side-effecting work (analytics writes, audit logs, fire-and-forget notifications) off the response critical path using `after()` from `next/server`. Audit API routes and server actions for `logger.info` / `logger.error` calls and notification dispatches that don't need to complete before the client gets its response.

This is the "fastest path to faster responses" track of v4.1: no caching, no rendering changes — just deferred side effects.

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- Use `after()` from `next/server` (not `unstable_after` — it's stable in Next.js 16)
- Scope: API routes in `src/app/api/` and server actions in `src/app/actions/`. NOT React Server Components in this phase — those are smaller wins.
- Eligibility criteria for moving a call inside `after()`:
  - The call is fire-and-forget (return value not used in the response)
  - The call's failure does not change the response status
  - Examples: `logger.info` analytics events, Discord/Slack webhook notifications, audit-log writes, scheduled-email enqueue (where the enqueue is purely best-effort)
- Calls that MUST stay on the critical path:
  - Database writes whose result is reflected in the response (e.g., the actual contact-form insert)
  - `logger.error` for errors that gate the response status — keep those before the response
  - Idempotency-key writes that gate retry behaviour
- One plan covers the whole phase; surface is small (~10 routes)

### Claude's Discretion

- Whether to also restructure `try/catch` blocks for clarity when `after()` is added
- Whether to add a `// after: <reason>` comment at each call site or just rely on the `after(() => ...)` boundary being self-documenting
- Whether `process-emails` route is a `after()` candidate (likely NOT — it's the cron worker; its whole job is the side effects)

### Out of Scope

- Adding `connection()` calls (would only matter if a cached page also reads cookies — currently no such case)
- Suspense boundary refactors (defer until a real measurement shows blocking)
- Edge-runtime migrations
- Touching the cron handler (`/api/process-emails`) — its work IS the response

</decisions>

<specifics>
## Surfaces in Scope

API routes that contain `logger.info` / `logger.error` / notification calls (audited 2026-04-26):
- `src/app/api/web-vitals/route.ts` — accepts web vitals beacon; analytics write is a perfect after() candidate
- `src/app/api/testimonials/route.ts` — list endpoint; logger calls only
- `src/app/api/contact/route.ts` — contact form; admin notification email is after() candidate
- `src/app/api/testimonials/submit/route.ts` — admin notification email is after() candidate
- `src/app/api/testimonials/requests/route.ts` — audit log writes
- `src/app/api/testimonials/requests/[id]/route.ts` — audit log writes
- `src/app/api/testimonials/[id]/route.ts` — audit log writes
- `src/app/api/health/route.ts` — likely no work to defer (just a probe)
- `src/app/api/rss/feed/route.ts` — feed rendering; logger calls only
- `src/app/api/process-emails/route.ts` — OUT OF SCOPE (cron worker; deferred work IS the work)

Server actions in `src/app/actions/`:
- `src/app/actions/ttl-calculator.ts` — admin notification email + scheduled email enqueue are after() candidates

</specifics>

<verification>
## Phase-Level Verification

After the plan completes:
- `grep -rn "after(" src/app/api/ src/app/actions/` shows the new usages
- `bun run typecheck && bun run lint && bun run test:unit && bun run test:e2e:fast` all pass
- For one route (e.g., `/api/contact`), measure the before/after response time with a deliberately slow downstream (e.g., add a 500ms `sleep` to the email send) — confirm response returns immediately and the email arrives a beat later
- Logs still appear in production logs (Vercel) — `after()` callbacks run after response but still execute
</verification>
