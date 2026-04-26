     [1mSTDIN[0m
[38;5;8m   1[0m [37m---[0m
[38;5;8m   2[0m [37mphase: 64-cache-components[0m
[38;5;8m   3[0m [37mstatus: deferred[0m
[38;5;8m   4[0m [37mdeferred_at: 2026-04-26[0m
[38;5;8m   5[0m [37mdeferred_to: v4.2[0m
[38;5;8m   6[0m [37m---[0m
[38;5;8m   7[0m 
[38;5;8m   8[0m [37m# Phase 64 — Cache Components Adoption — DEFERRED[0m
[38;5;8m   9[0m 
[38;5;8m  10[0m [37m## What was attempted[0m
[38;5;8m  11[0m 
[38;5;8m  12[0m [37mPlan 64-01 attempted to wrap the blog data layer (`src/lib/blog.ts`) with `'use cache'` + `cacheLife()` + `cacheTag()`. Required enabling `cacheComponents: true` at the top level of `next.config.ts` per Next.js 16 docs (https://nextjs.org/docs/canary/app/api-reference/directives/use-cache).[0m
[38;5;8m  13[0m 
[38;5;8m  14[0m [37m## Why deferred[0m
[38;5;8m  15[0m 
[38;5;8m  16[0m [37mCache Components (Next.js 16 stable) imposes constraints that ripple far beyond the blog data layer:[0m
[38;5;8m  17[0m 
[38;5;8m  18[0m [37m1. **All `generateStaticParams` must return at least one result.** Pages that rely on database content for dynamic routes need either (a) a `__placeholder__` fallback when the table is empty, or (b) DB seed data committed to source. The codebase has 3+ dynamic routes affected (portfolio, showcase, help).[0m
[38;5;8m  19[0m 
[38;5;8m  20[0m [37m2. **All dynamic data must be wrapped in `<Suspense>` boundaries.** Build-time error: "Uncached data was accessed outside of <Suspense>." Affected at minimum: `/testimonials/submit/[token]/page.tsx` and several other pages that query the database without Suspense.[0m
[38;5;8m  21[0m 
[38;5;8m  22[0m [37m3. **`export const revalidate` and `export const dynamic = 'force-dynamic'` become incompatible** with cacheComponents. Pages must migrate to function-level cache + Suspense boundaries.[0m
[38;5;8m  23[0m 
[38;5;8m  24[0m [37m4. **Build-time DB queries fail with cache components active.** Showcase/portfolio pages prerender via `generateStaticParams` over real DB rows; one query failure (e.g., `richard-hudson-jr` slug) crashes the build.[0m
[38;5;8m  25[0m 
[38;5;8m  26[0m [37mThis is not a one-data-layer migration — it's an app-wide architectural shift. Estimated scope: 8–15 plans across pages, data layer, and Suspense boundary refactor.[0m
[38;5;8m  27[0m 
[38;5;8m  28[0m [37m## Decision[0m
[38;5;8m  29[0m 
[38;5;8m  30[0m [37mDefer to v4.2 milestone "Cache Components Adoption" with dedicated planning, research, and phased execution. v4.1 ships the brand consistency + React Email v6 + after() tracks without it.[0m
[38;5;8m  31[0m 
[38;5;8m  32[0m [37m## Restoration steps if v4.2 picks this up[0m
[38;5;8m  33[0m 
[38;5;8m  34[0m [37m- `cacheComponents: true` in next.config.ts top level[0m
[38;5;8m  35[0m [37m- `'use cache'` + `cacheLife()` + `cacheTag()` in data layer functions (blog, showcase, help-articles)[0m
[38;5;8m  36[0m [37m- Wrap every dynamic data access in pages with `<Suspense>` boundaries[0m
[38;5;8m  37[0m [37m- Replace `export const revalidate` with function-level cache profiles[0m
[38;5;8m  38[0m [37m- Audit every `generateStaticParams` for empty-result guards[0m
[38;5;8m  39[0m [37m- Decision: keep build-time DB connectivity OR move to runtime-only data fetching[0m
[38;5;8m  40[0m 
[38;5;8m  41[0m [37mReferences:[0m
[38;5;8m  42[0m [37m- https://nextjs.org/docs/app/api-reference/directives/use-cache[0m
[38;5;8m  43[0m [37m- https://nextjs.org/docs/messages/empty-generate-static-params[0m
[38;5;8m  44[0m [37m- https://nextjs.org/docs/messages/blocking-route[0m
