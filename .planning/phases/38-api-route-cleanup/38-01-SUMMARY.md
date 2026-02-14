---
phase: 38-api-route-cleanup
plan: 01
status: complete
---

# Summary: API Route Cleanup & Consolidation

## What Was Done

### 1. Deleted 14 orphaned API routes (zero frontend consumers)

- `/api/newsletter/route.ts` -- duplicate of /subscribe, used wrong table
- `/api/csrf/route.ts` -- no frontend fetches CSRF tokens from this endpoint
- `/api/health/route.ts` -- no monitoring configured to call it
- `/api/lead-magnet/route.ts` -- no frontend form calls it
- `/api/case-studies/route.ts` -- only in constants, no page/component calls it
- `/api/analytics/attribution/route.ts` -- no consumers
- `/api/analytics/route.ts` -- no consumers
- `/api/generate-pdf/contract/route.ts` -- tool pages use @react-pdf/renderer client-side
- `/api/generate-pdf/invoice/route.ts` -- same as above
- `/api/cron/analytics-processing/route.ts` -- no cron configured
- `/api/process-emails/route.ts` -- no cron configured
- `/api/paystub/route.ts` -- paystub uses client-side calculation

Cleaned up empty parent directories after deletion.

### 2. Deleted admin-auth.ts and stripped fake auth from testimonial routes

- Removed `src/lib/admin-auth.ts` entirely (validateAdminAuth always returned true)
- Removed `requireAdminAuth` import and auth check blocks from:
  - `src/app/api/testimonials/route.ts` (1 import, 1 auth block)
  - `src/app/api/testimonials/[id]/route.ts` (1 import, 2 auth blocks)
  - `src/app/api/testimonials/requests/route.ts` (1 import, 2 auth blocks)
  - `src/app/api/testimonials/requests/[id]/route.ts` (1 import, 1 auth block)

### 3. Deleted broken attribution hook

- Removed `src/hooks/use-attribution.ts` (fetched non-existent /api/analytics/processing endpoint)
- Removed `useAttribution`/`sendAttribution` usage from `src/components/calculators/CalculatorResults.tsx`

### 4. Cleaned up constants (api-endpoints.ts)

Stripped `API_ENDPOINTS` from 15 constants to 6 (only those with real consumers):
- Kept: CONTACT, NEWSLETTER_SUBSCRIBE, TESTIMONIALS, CALCULATORS_SUBMIT, PAGESPEED, WEB_VITALS
- Removed: TESTIMONIALS_SUBMIT, LEAD_MAGNET, PAYSTUB, CONTRACT, INVOICE, PROPOSAL, TTL_*, CASE_STUDIES, PORTFOLIO, BLOG_POSTS, RSS_FEED, ANALYTICS_PROCESSING

Removed entirely:
- `INTERNAL_API_ENDPOINTS` object (SCHEDULED_EMAILS_PROCESS had no route)
- `InternalApiEndpoint` type
- `buildApiUrl` helper (zero consumers)

### 5. Cleaned up dead env vars (env.ts)

Removed from server section and runtimeEnv:
- `ADMIN_API_TOKEN` (only consumer was deleted admin-auth.ts)
- `ADMIN_EMAILS` (only consumer was deleted admin-auth.ts)
- `JWT_SECRET` (zero consumers)
- `CRON_SECRET` (only consumers were deleted cron routes)
- `KV_REST_API_URL` (zero consumers outside env.ts)
- `KV_REST_API_TOKEN` (zero consumers outside env.ts)

### 6. Updated .env.example

- Removed: Admin & Authentication section, Rate Limiting (KV) section, Cron Secret
- Added: SLACK_WEBHOOK_URL (was in env.ts but missing from example)

### 7. Created paystub tool page

- New file: `src/app/tools/paystub-calculator/page.tsx`
- Uses existing `usePaystubGenerator` orchestrator hook (composes 6 sub-hooks)
- Uses existing `PaystubForm` and `PaystubNavigation` components
- Displays per-period breakdown and annual totals
- Wrapped in `CalculatorLayout` for consistent tool page styling
- Accessible at `/tools/paystub-calculator`

### 8. Cleaned up dead tests

- Deleted `tests/integration/admin-auth.test.ts` (tests deleted admin-auth.ts)
- Deleted `tests/api-paystub.test.ts` (tests deleted /api/paystub route)
- Removed health check and CSRF test blocks from `tests/unit/api-routes.test.ts`
- Removed admin auth test block from `tests/unit/security.test.ts`
- Removed dead KV env vars from `tests/setup.ts`

## Results

- **11 API routes remaining** (all verified with frontend consumers)
- Zero lint warnings, zero TypeScript errors
- 297 unit tests passing (down from 330 -- deleted tests for deleted routes)
- Every env var in env.ts has at least one consumer
- Every constant in api-endpoints.ts points to a real route with a real consumer
- Paystub calculator accessible at /tools/paystub-calculator

## Remaining API Routes (all verified)

| Route | Consumer |
|-------|----------|
| /api/contact | use-contact-form-submit.ts |
| /api/newsletter/subscribe | use-newsletter-subscription.ts |
| /api/calculators/submit | CalculatorResults.tsx |
| /api/pagespeed | performance-calculator page |
| /api/web-vitals | WebVitalsReporting.tsx |
| /api/csp-reports | security-headers.ts (CSP report-uri) |
| /api/testimonials | testimonial-collector page |
| /api/testimonials/[id] | testimonial-collector page |
| /api/testimonials/submit | TestimonialForm.tsx |
| /api/testimonials/requests | testimonial-collector page |
| /api/testimonials/requests/[id] | testimonial-collector page |

## Issues

None.
